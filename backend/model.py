"""
model.py — BiLSTM+CRF Model Loader & Prediction Interface

This module encapsulates all ML model logic. It provides:
  - PlaceholderSegmenter: a rule-based segmenter for testing the pipeline
  - BiLSTMCRFSegmenter:   loads BOTH trained models and runs real inference
      • urdu_segmentor_bilstm.pt  — BiLSTM neural network with built-in CRF
      • urdu_segmentor_crf.pkl    — sklearn-crfsuite CRF (feature-based)

BIESX Tag Scheme:
  B = Begin    — first character of a multi-char word
  I = Inside   — middle character(s) of a multi-char word
  E = End      — last character of a multi-char word
  S = Single   — a word consisting of a single character
  X = External — space, punctuation, or non-word tokens
"""

import os
import re
import json
import pickle
import logging
import unicodedata

import torch
import torch.nn as nn
import numpy as np

logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────
# BIESX Assembly Logic
# ──────────────────────────────────────────────

def assemble_segments(tokens: list[str], tags: list[str]) -> list[str]:
    """
    Merge tokens into word segments based on their BIESX tags.

    Rules:
      B  → start a new word buffer
      I  → append to current word buffer
      E  → append to current word buffer, flush as one word
      S  → flush as a standalone word immediately
      X  → ignored (spaces, punctuation)

    Returns a list of assembled word strings.
    """
    segments = []
    current_word = []

    for token, tag in zip(tokens, tags):
        tag = tag.upper()

        if tag == "B":
            # Start of a new multi-character word
            if current_word:
                # Flush anything dangling (shouldn't happen with clean tags)
                segments.append("".join(current_word))
            current_word = [token]

        elif tag == "I":
            # Middle of a word
            current_word.append(token)

        elif tag == "E":
            # End of a word — flush
            current_word.append(token)
            segments.append("".join(current_word))
            current_word = []

        elif tag == "S":
            # Single-character word
            if current_word:
                segments.append("".join(current_word))
                current_word = []
            segments.append(token)

        elif tag == "X":
            # External — skip (space/punctuation)
            if current_word:
                segments.append("".join(current_word))
                current_word = []

    # Flush any remaining buffer
    if current_word:
        segments.append("".join(current_word))

    return segments


# ──────────────────────────────────────────────
# Placeholder Segmenter (for pipeline testing)
# ──────────────────────────────────────────────

class PlaceholderSegmenter:
    """
    Rule-based placeholder that mimics BiLSTM+CRF output format.

    Strategy:
      - Splits text on whitespace
      - Each whitespace-delimited token gets character-level BIESX tags:
          * 1 char  → S
          * 2 chars → B, E
          * 3+ chars → B, I..., E
      - Spaces between words get tag X

    This produces realistic-looking BIESX output so the full
    frontend ↔ backend pipeline can be tested before the real model is ready.
    """

    def predict(self, text: str) -> tuple[list[str], list[str], list[str]]:
        """
        Args:
            text: Raw Urdu input string

        Returns:
            (tokens, tags, segments) where:
              tokens  — individual characters (including spaces)
              tags    — BIESX tag for each character
              segments — assembled word list
        """
        text = text.strip()
        if not text:
            return [], [], []

        tokens = []
        tags = []

        # Split into whitespace-separated words
        words = re.split(r'(\s+)', text)

        for word in words:
            if not word:
                continue

            # Whitespace → X tags
            if word.isspace():
                for ch in word:
                    tokens.append(ch)
                    tags.append("X")
                continue

            # Actual word → character-level BIESX
            chars = list(word)
            length = len(chars)

            if length == 1:
                tokens.append(chars[0])
                tags.append("S")
            elif length == 2:
                tokens.append(chars[0])
                tags.append("B")
                tokens.append(chars[1])
                tags.append("E")
            else:
                for i, ch in enumerate(chars):
                    tokens.append(ch)
                    if i == 0:
                        tags.append("B")
                    elif i == length - 1:
                        tags.append("E")
                    else:
                        tags.append("I")

        segments = assemble_segments(tokens, tags)

        return tokens, tags, segments


# ──────────────────────────────────────────────
# CRF Layer (matching the saved .pt weights)
# ──────────────────────────────────────────────

class CRFLayer(nn.Module):
    """
    Custom CRF layer that matches the saved model's parameter names:
      crf.trans_matrix  — (num_tags, num_tags) transition scores
      crf.start_trans   — (num_tags,) start transition scores
      crf.end_trans     — (num_tags,) end transition scores
    """

    def __init__(self, num_tags: int):
        super().__init__()
        self.num_tags = num_tags
        self.trans_matrix = nn.Parameter(torch.randn(num_tags, num_tags))
        self.start_trans = nn.Parameter(torch.randn(num_tags))
        self.end_trans = nn.Parameter(torch.randn(num_tags))

    def decode(self, emissions: torch.Tensor) -> list[list[int]]:
        """
        Viterbi decoding to find the best tag sequence.

        Args:
            emissions: (batch_size, seq_len, num_tags) emission scores from BiLSTM

        Returns:
            List of tag index sequences, one per batch item
        """
        batch_size, seq_len, _ = emissions.shape
        results = []

        for b in range(batch_size):
            # Initialize with start transitions + first emission
            score = self.start_trans + emissions[b, 0]  # (num_tags,)
            history = []

            # Forward pass (Viterbi)
            for t in range(1, seq_len):
                # score[i] + trans[i][j] + emit[j] for all i→j
                broadcast_score = score.unsqueeze(1)  # (num_tags, 1)
                broadcast_emit = emissions[b, t].unsqueeze(0)  # (1, num_tags)
                next_score = broadcast_score + self.trans_matrix + broadcast_emit  # (num_tags, num_tags)

                best_score, best_idx = next_score.max(dim=0)  # (num_tags,)
                history.append(best_idx)
                score = best_score

            # Add end transitions
            score = score + self.end_trans
            _, best_last = score.max(dim=0)

            # Backtrack
            best_path = [best_last.item()]
            for hist in reversed(history):
                best_path.append(hist[best_path[-1]].item())
            best_path.reverse()

            results.append(best_path)

        return results


# ──────────────────────────────────────────────
# BiLSTM+CRF Neural Network
# ──────────────────────────────────────────────

class BiLSTMCRFModel(nn.Module):
    """
    Neural network architecture matching the saved checkpoint:
      Embedding(106, 64)
      → BiLSTM(input=64, hidden=128, bidirectional=True → output=256)
      → BiLSTM(input=256, hidden=64, bidirectional=True → output=128)
      → Linear(128 → 5)
      → CRF(5)
    """

    def __init__(self, vocab_size=106, embedding_dim=64,
                 lstm1_hidden=128, lstm2_hidden=64, num_tags=5):
        super().__init__()

        self.embedding = nn.Embedding(vocab_size, embedding_dim)

        self.bilstm1 = nn.LSTM(
            input_size=embedding_dim,
            hidden_size=lstm1_hidden,
            batch_first=True,
            bidirectional=True,
        )

        self.bilstm2 = nn.LSTM(
            input_size=lstm1_hidden * 2,  # bidirectional output = 256
            hidden_size=lstm2_hidden,
            batch_first=True,
            bidirectional=True,
        )

        self.hidden2tag = nn.Linear(lstm2_hidden * 2, num_tags)  # 128 → 5

        self.crf = CRFLayer(num_tags)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Forward pass: input indices → emission scores.

        Args:
            x: (batch_size, seq_len) character index tensor

        Returns:
            emissions: (batch_size, seq_len, num_tags)
        """
        embeds = self.embedding(x)              # (B, L, 64)
        lstm1_out, _ = self.bilstm1(embeds)     # (B, L, 256)
        lstm2_out, _ = self.bilstm2(lstm1_out)  # (B, L, 128)
        emissions = self.hidden2tag(lstm2_out)   # (B, L, 5)
        return emissions

    def predict(self, x: torch.Tensor) -> list[list[int]]:
        """Run forward pass then CRF Viterbi decode."""
        emissions = self.forward(x)
        return self.crf.decode(emissions)


# ──────────────────────────────────────────────
# CRF Feature Extraction (for sklearn CRF)
# ──────────────────────────────────────────────

def _is_urdu_alpha(ch: str) -> bool:
    """Check if character is an Urdu/Arabic letter."""
    cat = unicodedata.category(ch)
    return cat.startswith('L') or cat == 'Mn'  # Letter or nonspacing mark


def _is_non_joiner(ch: str) -> bool:
    """Check if character is a non-joining character (doesn't connect in cursive)."""
    # These Urdu characters don't join to the next letter
    non_joiners = set('اآأإدذرزژڑوؤ')
    return ch in non_joiners


def _char_features(chars: list[str], i: int) -> dict:
    """
    Extract features for character at position i.
    Matches the CRF training feature extraction pattern found in the model:
      bias, char, char.is_alpha, char.is_digit, char.is_non_joiner,
      char.is_punctuation, BOS, EOS, +1/+2/-1/-2 context features
    """
    ch = chars[i]
    features = {
        'bias': 1.0,
        f'char:{ch}': 1.0,
        'char.is_alpha': _is_urdu_alpha(ch),
        'char.is_digit': ch.isdigit(),
        'char.is_non_joiner': _is_non_joiner(ch),
        'char.is_punctuation': unicodedata.category(ch).startswith('P'),
    }

    # Previous characters
    if i == 0:
        features['BOS'] = True  # Beginning of sequence
    else:
        features[f'-1:char:{chars[i-1]}'] = 1.0
        features['-1:char.is_alpha'] = _is_urdu_alpha(chars[i-1])
        if i >= 2:
            features[f'-2:char:{chars[i-2]}'] = 1.0

    # Next characters
    if i == len(chars) - 1:
        features['EOS'] = True  # End of sequence
    else:
        features[f'+1:char:{chars[i+1]}'] = 1.0
        features['+1:char.is_alpha'] = _is_urdu_alpha(chars[i+1])
        if i + 2 < len(chars):
            features[f'+2:char:{chars[i+2]}'] = 1.0

    return features


def extract_crf_features(chars: list[str]) -> list[dict]:
    """Extract CRF features for a sequence of characters."""
    return [_char_features(chars, i) for i in range(len(chars))]


# ──────────────────────────────────────────────
# Real BiLSTM+CRF Segmenter
# ──────────────────────────────────────────────

class BiLSTMCRFSegmenter:
    """
    Loads BOTH trained models and runs real inference:
      1. BiLSTM+CRF (.pt) — neural model with built-in CRF layer
      2. sklearn CRF (.pkl) — feature-based CRF model

    Both models produce BIES tags (B, I, E, S).
    Spaces/punctuation are tagged as X externally.
    """

    # Tag index mapping (BiLSTM outputs 5 classes)
    IDX_TO_TAG = {0: 'B', 1: 'I', 2: 'E', 3: 'S', 4: 'X'}
    TAG_TO_IDX = {v: k for k, v in IDX_TO_TAG.items()}

    def __init__(self):
        self.bilstm_model = None
        self.crf_model = None
        self.char_to_idx = {}
        self.use_bilstm = False
        self.use_crf = False

    def load(self, bilstm_path: str = None, crf_path: str = None,
             vocab_path: str = None):
        """
        Load one or both models.

        Args:
            bilstm_path: path to .pt file (BiLSTM+CRF state_dict)
            crf_path:    path to .pkl file (sklearn CRF)
            vocab_path:  path to char_vocab.json
        """
        # ── Load vocabulary ──
        if vocab_path and os.path.exists(vocab_path):
            with open(vocab_path, 'r', encoding='utf-8') as f:
                self.char_to_idx = json.load(f)
            logger.info(f"Loaded vocabulary: {len(self.char_to_idx)} chars")
        else:
            logger.warning("No vocabulary file found — BiLSTM will not work")

        # ── Load BiLSTM+CRF neural model ──
        if bilstm_path and os.path.exists(bilstm_path):
            try:
                state_dict = torch.load(bilstm_path, map_location='cpu',
                                        weights_only=False)

                # Infer architecture from saved weights
                vocab_size = state_dict['embedding.weight'].shape[0]
                emb_dim = state_dict['embedding.weight'].shape[1]
                lstm1_hidden = state_dict['bilstm1.weight_ih_l0'].shape[0] // 4
                lstm2_hidden = state_dict['bilstm2.weight_ih_l0'].shape[0] // 4
                num_tags = state_dict['hidden2tag.weight'].shape[0]

                self.bilstm_model = BiLSTMCRFModel(
                    vocab_size=vocab_size,
                    embedding_dim=emb_dim,
                    lstm1_hidden=lstm1_hidden,
                    lstm2_hidden=lstm2_hidden,
                    num_tags=num_tags,
                )
                self.bilstm_model.load_state_dict(state_dict)
                self.bilstm_model.eval()
                self.use_bilstm = True

                logger.info(f"✅ BiLSTM+CRF loaded from {bilstm_path}")
                logger.info(f"   Architecture: Emb({vocab_size},{emb_dim}) → "
                            f"BiLSTM({lstm1_hidden}) → BiLSTM({lstm2_hidden}) → "
                            f"Linear({num_tags}) → CRF({num_tags})")
            except Exception as e:
                logger.error(f"❌ Failed to load BiLSTM: {e}")
                self.use_bilstm = False

        # ── Load sklearn CRF model ──
        if crf_path and os.path.exists(crf_path):
            try:
                with open(crf_path, 'rb') as f:
                    self.crf_model = pickle.load(f)
                self.use_crf = True
                logger.info(f"✅ CRF loaded from {crf_path}")
                logger.info(f"   Classes: {self.crf_model.classes_}")
            except Exception as e:
                logger.error(f"❌ Failed to load CRF: {e}")
                self.use_crf = False

        if not self.use_bilstm and not self.use_crf:
            raise RuntimeError("Neither BiLSTM nor CRF model could be loaded!")

    def _is_space_or_external(self, ch: str) -> bool:
        """Check if a character should be tagged as X (external)."""
        return ch.isspace()

    def _predict_bilstm(self, chars: list[str]) -> list[str]:
        """Run BiLSTM+CRF inference on non-space characters."""
        unk_idx = self.char_to_idx.get('<UNK>', 1)

        indices = [self.char_to_idx.get(ch, unk_idx) for ch in chars]
        input_tensor = torch.tensor([indices], dtype=torch.long)

        with torch.no_grad():
            tag_indices = self.bilstm_model.predict(input_tensor)

        return [self.IDX_TO_TAG.get(idx, 'S') for idx in tag_indices[0]]

    def _predict_crf(self, chars: list[str]) -> list[str]:
        """Run sklearn CRF inference on non-space characters."""
        features = extract_crf_features(chars)
        predictions = self.crf_model.predict([features])
        return list(predictions[0])

    def predict(self, text: str) -> tuple[list[str], list[str], list[str]]:
        """
        Segment Urdu text using both BiLSTM+CRF and sklearn CRF models.

        Strategy:
          1. Split text into characters
          2. Separate space/external chars (tagged as X)
          3. Run non-space chars through the model(s)
          4. Merge results back with X tags for spaces
          5. If both models are available, use BiLSTM as primary

        Returns:
            (tokens, tags, segments)
        """
        text = text.strip()
        if not text:
            return [], [], []

        all_chars = list(text)
        tokens = []
        tags = []

        # Find contiguous runs of non-space characters
        i = 0
        while i < len(all_chars):
            ch = all_chars[i]

            if self._is_space_or_external(ch):
                # Space → X tag
                tokens.append(ch)
                tags.append('X')
                i += 1
                continue

            # Collect contiguous non-space run
            run_start = i
            while i < len(all_chars) and not self._is_space_or_external(all_chars[i]):
                i += 1
            run_chars = all_chars[run_start:i]

            # Run through model(s)
            if self.use_bilstm and self.char_to_idx:
                run_tags = self._predict_bilstm(run_chars)
            elif self.use_crf:
                run_tags = self._predict_crf(run_chars)
            else:
                # Fallback: tag everything as S
                run_tags = ['S'] * len(run_chars)

            tokens.extend(run_chars)
            tags.extend(run_tags)

        # Assemble segments from tokens + tags
        segments = assemble_segments(tokens, tags)

        return tokens, tags, segments


# ──────────────────────────────────────────────
# Factory: pick the active segmenter
# ──────────────────────────────────────────────

def create_segmenter(model_path: str = None):
    """
    Factory function to create the appropriate segmenter.

    Auto-detects model files in the standard location (../models/).
    Falls back to PlaceholderSegmenter if no models are found.

    Args:
        model_path: optional explicit path (unused, kept for API compat)

    Returns:
        A segmenter instance with a .predict(text) method.
    """
    # Auto-detect model files
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    models_dir = os.path.join(backend_dir, '..', 'models')

    bilstm_path = os.path.join(models_dir, 'urdu_segmentor_bilstm.pt')
    crf_path = os.path.join(models_dir, 'urdu_segmentor_crf.pkl')
    vocab_path = os.path.join(models_dir, 'char_vocab.json')

    bilstm_exists = os.path.exists(bilstm_path)
    crf_exists = os.path.exists(crf_path)

    logger.info(f"Model search path: {os.path.abspath(models_dir)}")
    logger.info(f"  BiLSTM (.pt):  {'✅ Found' if bilstm_exists else '❌ Not found'}")
    logger.info(f"  CRF (.pkl):    {'✅ Found' if crf_exists else '❌ Not found'}")
    logger.info(f"  Vocab (.json): {'✅ Found' if os.path.exists(vocab_path) else '❌ Not found'}")

    if bilstm_exists or crf_exists:
        try:
            segmenter = BiLSTMCRFSegmenter()
            segmenter.load(
                bilstm_path=bilstm_path if bilstm_exists else None,
                crf_path=crf_path if crf_exists else None,
                vocab_path=vocab_path if os.path.exists(vocab_path) else None,
            )
            logger.info("🎯 Using REAL BiLSTM+CRF segmenter")
            return segmenter
        except Exception as e:
            logger.error(f"Failed to load real models: {e}")
            logger.info("Falling back to PlaceholderSegmenter")

    logger.info("Using PlaceholderSegmenter (rule-based)")
    return PlaceholderSegmenter()
