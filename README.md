# Media Authenticity & News Verification

A full‑stack project that evaluates uploaded news images and text to produce an authenticity decision and routes borderline cases to moderation.

## Features

- Upload: **title + news text + image**
- Image authenticity model (DenseNet121) → decision score + status (**REAL / SUSPICIOUS / FAKE**)
- Text categorization using **TF‑IDF + cosine similarity** → **Politics / Business / Technology / Health / Sports / Entertainment / Other**
- Moderation workflow for suspicious uploads
- Admin panel for user management (with guardrails)

## Tech Stack

- Backend: Django + Django REST Framework + SimpleJWT
- Frontend: React (Vite) + Axios + Tailwind CSS
- ML: PyTorch (DenseNet121)

## Local Setup

### 1) Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

# Create .env (see .env.example)
python manage.py migrate
python manage.py runserver
```

Backend runs at: `http://localhost:8000`  
API base: `http://localhost:8000/api`

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

## Environment Variables (Backend)

Create `backend/.env` (example keys):

- `DJANGO_SECRET_KEY=...`
- `DEBUG=True`
- `ALLOWED_HOSTS=127.0.0.1,localhost`
- `DB_ENGINE=django.db.backends.postgresql`
- `DB_NAME=final_year_project`
- `DB_USER=postgres`
- `DB_PASSWORD=...`
- `DB_HOST=127.0.0.1`
- `DB_PORT=5432`
- `ML_MODELS_DIR=ml_models`

## Model Weights

Place the model file here:

- `backend/ml_models/DenseNet121.pth`

Or set `ML_MODELS_DIR` to a different folder.

## Pages

- `/feed` Feed
- `/upload` Upload
- `/dashboard` My uploads
- `/uploads/:id` Upload detail
- `/moderation` Moderation (admin)
- `/admin` Admin (admin)
- `/about` About

## License

For academic/demo use.