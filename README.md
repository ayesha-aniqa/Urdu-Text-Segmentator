# Urdu Text Segmentor

> A Final Year Project implementing an end-to-end Urdu text word segmentation system using BiLSTM + CRF deep learning architecture, with a custom annotation tool, trained models, React frontend, and Supabase-powered history tracking.

**Department:** Computer Science
**University:** COMSATS University Islamabad, Attock Campus
**Completion:** 2026

---

## 📌 Table of Contents

- [Overview](#overview)
- [Project Pipeline](#project-pipeline)
- [Features](#features)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Dataset & Annotation](#dataset--annotation)
- [Model Architecture](#model-architecture)
- [Setup Instructions](#setup-instructions)
- [API Reference](#api-reference)
- [Model Files](#model-files)
- [Database](#database)
- [Documentation](#documentation)
- [Authors](#authors)

---

## 📖 Overview

Urdu is a right-to-left cursive script language with no standard whitespace-based word boundaries, making word segmentation a non-trivial NLP task. This project presents a complete pipeline — from raw text annotation to a deployed web application — for segmenting Urdu text at the character level using the **BIESX tagging scheme**.

The system uses a stacked **BiLSTM + CRF** architecture trained on a custom-labelled Urdu dataset, exposed via a **FastAPI** backend, and accessed through a **React** frontend with session history stored in **Supabase**.

---

## 🔄 Project Pipeline

```
Raw Urdu Text
      ↓
Custom Annotation Tool (BIESX tagging)
      ↓
Labelled Dataset (character-level)
      ↓
BiLSTM Model Training → BiLSTM+CRF Model Training
      ↓
FastAPI Backend (REST API)
      ↓
React Frontend (with Supabase history)
      ↓
Segmented Urdu Output
```

---

## ✨ Features

- **Custom Annotation Tool** — built an interactive tool to manually tag Urdu phrases with BIESX labels (`B`=Begin, `I`=Inside, `E`=End, `S`=Single, `X`=External), enabling creation of a high-quality training dataset
- **Full Dataset Labelling** — used the annotation tool to label an entire Urdu corpus at the character level
- **Dual Model Training** — trained and compared both a standalone BiLSTM and a BiLSTM+CRF model
- **Character-level Vocabulary** — custom `char_vocab.json` mapping every Urdu character to an index
- **FastAPI REST API** — real-time segmentation endpoint accepting raw Urdu text
- **React Frontend** — full multi-page web application with Urdu keyboard support
- **Segmentation History** — all segmented queries stored in Supabase database, viewable in the History page
- **BIESX Output** — returns tokens, tags, and assembled word segments per request

---

## 📁 Project Structure

```
Urdu-Text-Segmentor/
│
├── backend/                        # FastAPI REST API
│   ├── main.py                     # App entry point, routes, CORS
│   ├── model.py                    # BiLSTM+CRF loader & inference logic
│   ├── deep_inspect.py             # Model inspection utility
│   ├── extract_vocab.py            # Vocabulary extraction script
│   ├── inspect_models.py           # Model diagnostic tool
│   ├── requirements.txt            # Python dependencies
│   └── README.md                   # Backend-specific notes
│
├── frontend/                       # React (CRA) web application
│   ├── public/                     # Static assets
│   ├── src/
│   │   ├── MyComponents/           # All page components
│   │   │   ├── LandingPage.jsx     # Home / landing page
│   │   │   ├── SegmentPage.jsx     # Main segmentation interface
│   │   │   ├── OutputPage.jsx      # Segmentation results display
│   │   │   ├── HistoryPage.jsx     # Supabase-powered query history
│   │   │   ├── Header.jsx          # Navigation header
│   │   │   ├── Footer.jsx          # Site footer with links
│   │   │   ├── AboutPage.jsx       # About the project
│   │   │   ├── ContactPage.jsx     # Contact page
│   │   │   ├── FAQPage.jsx         # Frequently asked questions
│   │   │   ├── PrivacyPolicyPage.jsx
│   │   │   └── UrduKeyboard.jsx    # On-screen Urdu keyboard
│   │   ├── services/               # API service calls
│   │   ├── utils/                  # Helper utilities
│   │   ├── App.jsx                 # Root component & routing
│   │   └── setupProxy.js           # Dev proxy to backend
│   ├── package.json
│   └── supabase_history_schema.sql # Database schema
│
├── models/                         # Trained model files
│   ├── char_vocab.json
│   ├── urdu_segmentor_bilstm.pt
│   └── urdu_segmentor_crf.pkl
│
├── notebooks/                      # Jupyter training notebooks
│   └── urdu-text-segmentor.ipynb
│
├── dataset/                        # Labelled Urdu dataset
│   └── dataset_bies.txt
│
├── docs/                           # Project report & documentation
│   └── Urdu_Word_Segmentor_Report.pdf
│
├── .gitignore
└── README.md
```

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Annotation | Custom Python tool (BIESX tagging) |
| Model | PyTorch, BiLSTM, CRF (sklearn-crfsuite) |
| Backend | Python 3.10+, FastAPI, Uvicorn |
| Frontend | React (CRA), React Router, Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Dev Tools | Jupyter Notebook, VS Code |

---

## 📝 Dataset & Annotation

One of the core contributions of this project is the **custom annotation pipeline**:

1. **Annotation Tool** — A dedicated tool was built to label Urdu text using the **BIESX scheme**:
   - `B` — Beginning character of a multi-character word
   - `I` — Inside (middle) character of a word
   - `E` — End character of a word
   - `S` — Single-character word
   - `X` — External (space, punctuation)

2. **Dataset Creation** — The annotation tool was used to label every word in the Urdu corpus at the character level, producing a structured `(character, tag)` dataset saved in `dataset/dataset_bies.txt`

3. **Vocabulary Extraction** — All unique characters were extracted and mapped to integer indices in `char_vocab.json` (106 unique characters)

---

## 🧠 Model Architecture

### BiLSTM + CRF

```
Input (Urdu characters)
      ↓
Character Embedding (106 → 64)
      ↓
BiLSTM Layer 1 (hidden=128, bidirectional → output=256)
      ↓
BiLSTM Layer 2 (hidden=64, bidirectional → output=128)
      ↓
Linear Layer (128 → 5 tags)
      ↓
CRF Layer (Viterbi decoding)
      ↓
BIESX tag sequence
```

Two models were trained and saved:
- `urdu_segmentor_bilstm.pt` — Neural BiLSTM+CRF (PyTorch)
- `urdu_segmentor_crf.pkl` — Feature-based CRF (sklearn-crfsuite)

The backend loads both and uses the neural model as primary.

---

## ⚙️ Setup Instructions

### Prerequisites

- Python 3.10+
- Node.js 18+
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/ayesha-aniqa/Urdu-Text-Segmentator.git
cd Urdu-Text-Segmentator
```

### 2. Backend Setup

```bash
cd backend
pip install -r requirements.txt
python -m main
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

### 4. Supabase Setup (for History feature)

- Create a project at [supabase.com](https://supabase.com)
- Run the SQL in `frontend/supabase_history_schema.sql` in your Supabase SQL editor
- Add your Supabase URL and anon key to `frontend/src/services/`

---



## 📄 Documentation

Full project report is available in the `/docs` folder and accessible via the Documentation link in the app footer.

---

## 👩‍💻 Authors

**Ayesha Aniqa & Laraib Altaf**
BS Artificial Intelligence — COMSATS University Islamabad, Attock Campus
[GitHub](https://github.com/ayesha-aniqa)

