"""Extract character vocabulary from CRF state features."""
import pickle, os, json, sys
sys.stdout.reconfigure(encoding='utf-8')

models_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'models')
pkl_path = os.path.join(models_dir, 'urdu_segmentor_crf.pkl')

with open(pkl_path, 'rb') as f:
    crf = pickle.load(f)

# Extract unique characters from CRF features
chars = set()
feature_types = set()
for (feat_name, label), weight in crf.state_features_.items():
    if feat_name.startswith('char:'):
        ch = feat_name[5:]  # after "char:"
        chars.add(ch)
    # Also check context features like +1:char:X, -1:char:X
    if ':char:' in feat_name:
        parts = feat_name.split(':char:')
        if len(parts) == 2:
            chars.add(parts[1])
    # Track feature types
    if ':' in feat_name:
        prefix = feat_name.split(':')[0]
        feature_types.add(prefix)
    else:
        feature_types.add(feat_name)

print(f"Unique characters found: {len(chars)}")
print(f"Feature types: {sorted(feature_types)}")
print(f"\nCharacters (sorted by unicode):")
sorted_chars = sorted(chars)
for i, ch in enumerate(sorted_chars):
    print(f"  {i}: '{ch}' (U+{ord(ch):04X})")

# Build char_to_idx mapping
# Reserve 0 for PAD, 1 for UNK
char_to_idx = {'<PAD>': 0, '<UNK>': 1}
for i, ch in enumerate(sorted_chars):
    char_to_idx[ch] = i + 2

print(f"\nTotal vocab with PAD+UNK: {len(char_to_idx)}")
print(f"Model expects vocab_size=106, we have {len(char_to_idx)}")

# Save vocab
vocab_path = os.path.join(models_dir, 'char_vocab.json')
with open(vocab_path, 'w', encoding='utf-8') as f:
    json.dump(char_to_idx, f, ensure_ascii=False, indent=2)
print(f"\nSaved vocabulary to {vocab_path}")

# Also figure out tag mapping
# BiLSTM outputs 5 tags, CRF has classes ['B', 'E', 'I', 'S']
# The 5th tag might be X or padding
print(f"\nCRF classes: {crf.classes_}")
print("BiLSTM has 5 output tags - likely B, I, E, S, X or B, E, I, S, <PAD>")

# Check if the ordering matters - CRF classes are alphabetical: B, E, I, S
# Common BIESX ordering: B=0, I=1, E=2, S=3, X=4
idx_to_tag = {0: 'B', 1: 'I', 2: 'E', 3: 'S', 4: 'X'}
print(f"Assumed idx_to_tag: {idx_to_tag}")
