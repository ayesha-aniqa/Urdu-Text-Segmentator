# Urdu Word Segmentor

A Final Year Project (FYP) implementing an Urdu text word segmentation system using a BiLSTM + CRF deep learning architecture, with a React frontend and Python backend API.

**Department:** Computer Science — Artificial Intelligence  
**University:** COMSATS University Islamabad, Attock Campus  
**Completion:** 2026

---

## Project Structure
```text
urdu-word-segmentor/
├── backend/       # Python Flask/FastAPI REST API
├── frontend/      # React (Vite + Tailwind CSS) web app
├── models/        # Trained BiLSTM and CRF model files
├── notebooks/     # Jupyter notebook for model training
├── dataset/       # Dataset used for training/testing
└── docs/          # Project documentation and report
```

---

## Features

- Urdu text word segmentation using BiLSTM + CRF
- Character-level vocabulary encoding
- REST API for real-time segmentation
- Interactive React frontend interface
- Supabase integration for query history

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Model | PyTorch, BiLSTM, CRF |
| Backend | Python, Flask/FastAPI |
| Frontend | React, Vite, Tailwind CSS |
| Database | Supabase |
| Deployment | Docker (optional) |

---

## Setup Instructions

### Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Model Files

| File | Description |
|------|-------------|
| `char_vocab.json` | Character-level vocabulary mapping |
| `urdu_segmentor_bilstm.pt` | Trained BiLSTM model weights |
| `urdu_segmentor_crf.pkl` | Trained CRF model |

---

## Documentation

Full project report is available in the `/docs` folder.

---

## Author

**Ayesha Aniqa /Laraib Altaf**  
BS Artificial Intelligence — COMSATS University Attock  
