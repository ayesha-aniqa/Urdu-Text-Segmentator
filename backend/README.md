# Urdu Text Segmentor — Backend

FastAPI server serving the BiLSTM+CRF word segmentation model.

## Quick Start

```bash
# 1. Create a virtual environment (recommended)
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS / Linux

# 2. Install dependencies
pip install -r requirements.txt

# 3. Start the server
uvicorn main:app --reload --port 8000
```

The server will be available at `http://localhost:8000`.

## API Endpoints

### `GET /api/health`
Health check — verify the backend is running and model is loaded.

```json
{ "status": "ok", "model_loaded": true, "model_type": "PlaceholderSegmenter" }
```

### `POST /api/segment`
Segment Urdu text using the BiLSTM+CRF model.

**Request:**
```json
{ "text": "اردو متن یہاں لکھیں" }
```

**Response:**
```json
{
  "tokens": ["ا", "ر", "د", "و", " ", "م", "ت", "ن", ...],
  "tags":   ["B", "I", "I", "E", "X", "B", "I", "E", ...],
  "segments": ["اردو", "متن", "یہاں", "لکھیں"],
  "input_length": 20,
  "model_type": "PlaceholderSegmenter"
}
```

## Using the Real Model

1. Place your trained `.pt` / `.pth` model file in this directory
2. Uncomment the `BiLSTMCRFSegmenter` class in `model.py`
3. Set the environment variable: `MODEL_PATH=./your_model.pt`
4. Restart the server

## Interactive Docs

Once running, visit `http://localhost:8000/docs` for the auto-generated Swagger UI.
