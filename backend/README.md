# NeuralScan Backend

Intelligent Chest X-Ray Analysis API powered by FastAPI and TensorFlow/Keras.

## Overview
The NeuralScan backend provides high-performance, in-memory inference on 4-class chest X-ray images using a fine-tuned ResNet50 deep learning model.

## Model Details
- **Architecture**: ResNet50
- **Input Dimensions**: 224 x 224 x 3 RGB
- **Input Preprocessing**: `tf.keras.applications.resnet50.preprocess_input()`
- **Output**: 4-class softmax probability distribution
- **Class Order (Fixed)**:
  - `0`: Covid
  - `1`: Tuberculosis
  - `2`: Normal
  - `3`: Pneumonia

## Setup & Running

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Model Placement**:
   Ensure `chest_xray_resnet50_final.keras` is placed inside `backend/models/`.

3. **Start the API server**:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

## API Endpoints

### 1. Health Check
`GET /api/health`
Response:
```json
{
  "status": "ok",
  "model": "ResNet50"
}
```

### 2. Predict Chest X-Ray
`POST /api/predict`
- **Content-Type**: `multipart/form-data`
- **Field**: `file`
- **Supported Formats**: `.jpg`, `.jpeg`, `.png`
- **Max File Size**: 10 MB

Response:
```json
{
  "success": true,
  "prediction": "Covid",
  "confidence": 0.9234,
  "probabilities": {
    "Covid": 0.9234,
    "Tuberculosis": 0.0211,
    "Normal": 0.0312,
    "Pneumonia": 0.0243
  },
  "model": "ResNet50",
  "input_size": "224x224",
  "processing_time_ms": 123.4
}
```

## Security & Privacy
- Uploaded medical images are processed entirely in-memory using `io.BytesIO`.
- No image files are saved to disk or logged.
- Error responses are sanitized to prevent exposing internal stack traces.
