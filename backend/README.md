# AI-driven Health Intelligence System

A comprehensive hospital intelligence platform with AI-powered diagnostics, equipment maintenance prediction, patient management, and role-based access control for doctors, nurses, admin staff, and patients.

## Features

- **Comprehensive Patient Database** — Full medical history, visits, lab results, prescriptions, nutrition assessments, and pregnancy risk tracking
- **AI Diagnostics** — Photo analysis, symptom evaluation, nutrition assessment, and integrated diagnosis scoring
- **Peak Admission Forecasting** — ML-driven prediction of hospital admission surges
- **Equipment Maintenance Prediction** — Predictive analytics on device telemetry to prevent failures
- **Role-based Dashboard** — Customized UI for doctors, nurses, admins, and patients
- **Authentication & Security** — JWT-based API with password hashing, legal ID and simulated biometric support for doctors/nurses, and patient-private record access
- **Clinical Chat & Attachments** — Secure staff chat rooms for nurse-doctor, doctor-doctor, and nurse-nurse coordination with document/photo upload
- **Device Telemetry Integration** — Real-time monitoring of medical equipment

## Core Components

| Component | Description |
|-----------|-------------|
| **Patients** | Demographics, contact info, medical history, visits |
| **Users** | Admin, doctor, nurse, patient roles |
| **Medical Records** | Conditions, visits, lab results, prescriptions |
| **Assessments** | Nutrition risk, pregnancy risk scores |
| **Devices** | IoT sensors, imaging equipment, telemetry streams |
| **Diagnostics** | AI-powered symptom + image + nutrition analysis |

See [SCHEMA.md](./SCHEMA.md) for complete database documentation.

## Setup

### 1. Backend Environment

```bash
cd 'AI-driven Health Intelligence System/backend'
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Database Initialization

```bash
cd ..
python3 backend/db_init.py
```

This seeds sample patients, users, devices, and medical history.

### 3. Start Backend Server

```bash
python3 run.py
```

Backend will be available at `http://localhost:5000/api`

### 4. Start Next.js Frontend

```bash
cd frontend-next
npm install
npm run dev
```

Frontend will be available at `http://localhost:3000`

### 5. Optional: Run with Docker Compose

If you want to run the full stack in containers, use the included compose setup.

```bash
cd 'AI-driven Health Intelligence System'
docker compose up --build -d
```

Then access:
- Frontend Next.js: `http://localhost:3000`
- Backend API: `http://localhost:5000/api`

Stop containers:

```bash
docker compose down
```

## API Overview

### Authentication
- `POST /api/auth/register` — Create account (doctor/nurse requires id_number, registration_number, specialization, biometric_token; patient requires patient_id)
- `POST /api/auth/login` — Get JWT token (nurse/doctor login supports biometric_token)
- `GET /api/auth/me` — Current user profile
- `GET /api/auth/staff` — Admin-only staff inspection
- `GET /api/auth/staff/<id>` — Admin inspection of clinical staff

### Clinical Chat
- `POST /api/chat/rooms` — Create a chat room (staff only)
- `GET /api/chat/rooms` — List rooms for current staff user
- `GET /api/chat/rooms/<room_id>` — Room details
- `GET /api/chat/rooms/<room_id>/messages` — List messages
- `POST /api/chat/rooms/<room_id>/messages` — Send message and optional attachments

### Patient Management
- `GET /api/patients` — List all patients (staff) or return the current patient record
- `POST /api/patients` — Create patient (staff only)
- `GET /api/patients/<id>` — Fetch patient details
- `POST /api/patients/<id>/submit-record` — Nurse mandatory hospital record submission with optional doctor chat notification

### Medical Records
- `GET/POST /api/patients/<id>/medical-history`
- `GET/POST /api/patients/<id>/visits`
- `GET/POST /api/patients/<id>/lab-results`
- `GET/POST /api/patients/<id>/prescriptions`
- `GET/POST /api/patients/<id>/nutrition-assessments`
- `GET/POST /api/patients/<id>/pregnancy-risks`

### AI & Diagnostics
- `POST /api/patients/<id>/comprehensive-diagnosis` — Full analysis (symptoms, nutrition, image)
- `GET /api/peak-admission-times` — Forecast next peak admission window
- `POST /api/equipment/failure-prediction` — Device maintenance risk

### Platform
- `GET /api/platform/health` — System status and endpoints
- `GET /api/dashboard` — Metrics (patients, peak times, referrals)

## Docker Deployment

Build and run all services:

```bash
docker compose up --build -d
```

The compose stack uses the included backend and frontend Dockerfiles, with the Next.js app configured to call the backend by service name inside Docker.

Services:
- **Backend**: http://localhost:5000 (Gunicorn)
- **Database**: PostgreSQL on port 5432
- **Frontend**: http://localhost:3000 (Next.js)
- **Legacy Frontend**: http://localhost:5500 (nginx)

Stop services:

```bash
docker compose down
```

## Cloud Deployment

Kubernetes manifests are available under `k8s/health-platform.yaml`.

1. Build and publish your container images to a registry.

```bash
docker build -t your-dockerhub-username/health-backend:latest backend
docker build --build-arg NEXT_PUBLIC_API_BASE=https://health-platform.example.com/api -t your-dockerhub-username/health-frontend-next:latest frontend-next
docker push your-dockerhub-username/health-backend:latest
docker push your-dockerhub-username/health-frontend-next:latest
```

2. Update `k8s/health-platform.yaml` image names from `your-dockerhub-username/...` to your published images.

3. Apply the Kubernetes resources:

```bash
kubectl apply -f k8s/health-platform.yaml
```

4. If using an ingress controller, you can access the app via the ingress IP or via the frontend LoadBalancer IP. A DNS host is optional.

In the cloud deployment, `frontend-next` is exposed through `frontend-next-service` and the `/api` path is forwarded to `backend-service`.

## Default Test Credentials

| Role | Username / ID Number | Password | Notes |
|------|----------------------|----------|-------|
| Admin | admin | AdminPass123 | Admin access |
| Doctor | drsmith / DOC-1001 | DoctorPass123 | Requires biometric_token: fingerprint-drsmith |
| Nurse | nursejoy / NUR-2001 | NursePass123 | Requires biometric_token: fingerprint-nursejoy |
| Patient | patient1 | PatientPass123 | Patient can only access their own record |

## Frontend Pages

- `/` — Home / platform overview
- `/login` — Authentication
- `/register` — New account creation
- `/dashboard` — Role-based metrics and actions
- `/patients` — Patient list and management
- `/devices` — Device inventory
- `/device-telemetry` — Equipment telemetry viewer
- `/failure-prediction` — ML maintenance risk assessment
- `/diagnostics` — AI symptom analyzer
- `/chat` — Secure staff chat and file/photo/document upload
- `/platform` — System health and endpoints

## Project Structure

```
.
├── backend/
│   ├── app.py              # Flask app factory
│   ├── api.py              # API blueprints and routes
│   ├── database.py         # SQLAlchemy models
│   ├── models.py           # ML models (Triage, Diagnostics, etc.)
│   ├── services.py         # Business logic services
│   ├── db_init.py          # Database initialization
│   ├── requirements.txt    # Python dependencies
│   └── manage.py           # Flask-Migrate CLI
├── frontend-next/          # Next.js React app
│   ├── pages/              # Page components
│   ├── components/         # Reusable components
│   ├── lib/api.js          # API helper functions
│   └── styles/             # Global styles
├── docker-compose.yml      # Docker orchestration
├── README.md               # This file
└── SCHEMA.md               # Database schema documentation
```

## Security Notes

- All passwords are hashed with Werkzeug
- API requires JWT authentication (Bearer token)
- Role-based access control on all endpoints
- CORS enabled for frontend integration

## Future Enhancements

- Cloud deployment manifests (AWS/GCP/Azure)
- Advanced ML for predictive analytics
- Real-time WebSocket updates
- Integration with electronic health records (EHR)
- Mobile app for patient self-monitoring
- Enhanced image analysis with computer vision

 The backend uses `DATABASE_URL` to connect to PostgreSQL. An example `.env` file is provided as `.env.example`.
 
 To stop and remove the containers:
 
 ```bash
docker compose down
