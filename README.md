# NEURALSCAN
> **Intelligent Chest X-Ray Analysis**  
> *Academic/Research Prototype for 4-Class Chest X-Ray Classification*

---

## 1. Project Overview
**NeuralScan** is a research prototype engineered for AI-assisted classification of chest radiographs. Utilizing a fine-tuned **ResNet50** deep convolutional neural network, the platform processes posteroanterior (PA) and anteroposterior (AP) chest X-rays to output calibrated softmax probability distributions across four mutually exclusive thoracic categories:
- **COVID-19**
- **Tuberculosis**
- **Normal** (unremarkable lung fields)
- **Pneumonia** (bacterial / non-COVID viral lobar consolidation)

> **Important Academic & Medical Disclaimer**: NeuralScan is an academic/research prototype and is not a medical diagnostic device. Model predictions should not be used as a substitute for evaluation by a qualified healthcare professional. No treatment recommendations or clinical claims are made.

---

## 2. Architecture

```
NeuralScan/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py             # Settings, paths, allowed origins, constants
│   │   ├── schemas.py            # Pydantic request/response schemas
│   │   ├── preprocessing.py      # ResNet50 exact 224x224 RGB preprocessing
│   │   ├── model.py              # Singleton model loader with lifespan startup
│   │   ├── prediction.py         # Prediction orchestrator & ms timing
│   │   └── main.py               # FastAPI app, /api/predict, /api/health, CORS
│   ├── models/
│   │   └── chest_xray_resnet50_final.keras   # Trained ResNet50 model (227 MB)
│   ├── requirements.txt
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── components/           # Reusable UI cards, gauges, charts, disclaimers
│   │   ├── pages/                # HomePage, AnalyzePage, ResearchPage, AboutPage
│   │   ├── services/             # API client connecting to backend
│   │   ├── types/                # Strict TypeScript interfaces
│   │   ├── hooks/                # useEngineHealth live polling hook
│   │   ├── utils/                # Percentage & confidence tier formatters
│   │   ├── App.tsx               # Root app layout & routing
│   │   ├── main.tsx              # React entrypoint
│   │   └── index.css             # Tailwind v4 + dark medical-tech styling
│   ├── public/
│   │   └── sample_xrays/         # Research sample X-rays for instant testing
│   ├── package.json
│   ├── vite.config.ts
│   └── .env
│
├── README.md
└── .gitignore
```

---

## 3. Installation

Ensure you have installed:
- **Python 3.10+** (Tested on Python 3.11)
- **Node.js 18+** and **npm 9+** (Tested on Node 22)

Clone or navigate to the project directory:
```bash
cd NeuralScan
```

---

## 4. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. (Recommended) Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # Windows:
   .\venv\Scripts\activate
   # Linux / macOS:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

---

## 5. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Verify environment configuration in `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:8000
   ```

---

## 6. Model Placement

Place the trained TensorFlow/Keras model file in the `backend/models/` directory:
```
backend/models/chest_xray_resnet50_final.keras
```
*(The backend also automatically checks the repository root directory as a fallback).*

---

## 7. Running the Application

### Start the Backend
In a terminal from the `backend/` directory:
```bash
uvicorn app.main:app --reload --port 8000
```
- API will be accessible at: `http://localhost:8000`
- Interactive Swagger docs at: `http://localhost:8000/docs`

### Start the Frontend
In a second terminal from the `frontend/` directory:
```bash
npm run dev
```
- Frontend application will open at: `http://localhost:5173`

---

## 8. API Documentation

### `GET /api/health`
Checks backend engine status and loaded model availability.
- **Response (200 OK)**:
  ```json
  {
    "status": "ok",
    "model": "ResNet50"
  }
  ```

### `POST /api/predict`
Executes classification inference on an uploaded chest X-ray.
- **Content-Type**: `multipart/form-data`
- **Field**: `file`
- **Accepted Formats**: `.jpg`, `.jpeg`, `.png`
- **Maximum File Size**: 10 MB
- **Response (200 OK)**:
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
- **Error Response (400 / 413 / 503)**:
  ```json
  {
    "success": false,
    "error": "Please upload a valid JPG, JPEG, or PNG image."
  }
  ```

---

## 9. Model Information

- **Architecture**: ResNet50 (Residual Network 50-layer deep)
- **Input Dimension**: `224 × 224 × 3` RGB
- **Input Preprocessing Pipeline**:
  1. Open via Pillow (`PIL.Image`)
  2. Convert to RGB mode
  3. Resize to `(224, 224)` with bilinear interpolation
  4. Cast to float32 NumPy array
  5. Add batch dimension `(1, 224, 224, 3)`
  6. Apply `tf.keras.applications.resnet50.preprocess_input()`
- **Output**: 4-class softmax probability vector
- **Fixed Class Mapping**:
  - `0`: `Covid`
  - `1`: `Tuberculosis`
  - `2`: `Normal`
  - `3`: `Pneumonia`
- **Dataset Scale**:
  - Cleaned dataset: 65,240 images (curated from 72,000+ raw radiographs with duplicate and ambiguous filter passes)
  - Train split: 52,192 (80%)
  - Validation split: 6,524 (10%)
  - Test split: 6,524 (10%)
- **Experimental Test Accuracy**: **96.52%** test-set classification accuracy (Cross-entropy test loss: `0.0998`)
- **Per-Class F1 Scores**:
  - COVID-19: 97.99%
  - Tuberculosis: 98.60%
  - Normal: 94.33%
  - Pneumonia: 94.62%

---

## 10. Limitations
1. **Academic Boundary**: Evaluated on specific public benchmark repositories; real-world multi-institutional domain shifts (varying sensor calibrations, patient positioning, pediatric anatomy) may degrade accuracy.
2. **Binary Pathology Assumption**: The classifier enforces mutually exclusive multi-class softmax. Co-infections or secondary effusions are not isolated separately.
3. **No Clinical Context**: Model operates strictly on 2D pixel intensities without patient history, laboratory markers, or physical vitals.

---

## 11. Planned Future AI Modules
The architecture is structured to support future extensions without rewriting core endpoints:
1. **Explainable AI (Grad-CAM)**: Gradient-weighted class activation mapping for thoracic localization.
2. **Multi-Model Consensus**: Ensemble voting across ResNet50, DenseNet121, and EfficientNet.
3. **Lung Segmentation**: Automated U-Net isolation of the lung parenchyma.
4. **Uncertainty Engine**: Epistemic/aleatoric uncertainty quantification via Monte Carlo Dropout.
5. **Robustness Testing**: Automated stress testing under noise, rotation, and brightness variations.
6. **Counterfactual Analysis**: Saliency perturbation testing.
7. **Longitudinal Analysis**: Multi-temporal scan comparison for disease progression tracking.
8. **AI Research Assistant**: Natural-language explanation and findings synthesis layer.
