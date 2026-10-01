# AIHealthIntelligencePlatform - Database Schema

## Overview
This document describes the comprehensive database schema for the AI-driven Health Intelligence System, incorporating patient management, medical records, device monitoring, and ML-powered diagnostics.

## Core Tables

### Users
**Purpose:** User authentication and role-based access control

| Field | Type | Description |
|-------|------|-------------|
| user_id | UUID (PK) | Unique identifier |
| username | String(64) | Unique username |
| name | String(128) | Full name |
| email | String(128) | Unique email |
| password_hash | String(256) | Hashed password |
| role | Enum | doctor, nurse, admin, patient |
| id_number | String(64) | Legal staff ID / national ID |
| registration_number | String(64) | Hospital registration ID |
| specialization | String(128) | Clinical specialization |
| biometric_hash | String(256) | Hashed biometric token for doctor/nurse login |
| patient_id | UUID (FK) | Linked patient record for patient accounts |
| created_at | DateTime | Account creation timestamp |

**Sample Roles:**
- `admin`: Full platform access, user management
- `doctor`: Patient diagnostics, referral authority
- `nurse`: Ward monitoring, patient care coordination
- `patient`: Personal health records access

### Patients
**Purpose:** Core patient demographic and contact information

| Field | Type | Description |
|-------|------|-------------|
| patient_id | UUID (PK) | Unique identifier |
| first_name | String(64) | First name |
| middle_name | String(64) | Second / middle name |
| last_name | String(64) | Last name |
| date_of_birth | Date | DOB for age calculations |
| gender | String(16) | Male, Female, Other |
| contact_info | JSON | {phone, email, address} |
| emergency_contact | JSON | {name, relation, phone} |
| cluster_group | String(64) | Patient cluster for cohort grouping and triage |
| password_hash | String(256) | Hashed patient login password |
| created_at | DateTime | Record creation |
| updated_at | DateTime | Last update |

### Medical_History
**Purpose:** Track chronic conditions and diagnoses

| Field | Type | Description |
|-------|------|-------------|
| history_id | UUID (PK) | Unique identifier |
| patient_id | UUID (FK) | Reference to patient |
| condition | String(256) | Diagnosis (e.g., diabetes) |
| diagnosis_date | Date | When diagnosed |
| status | Enum | active, resolved, dormant |
| notes | Text | Clinical notes |
| created_at | DateTime | Record creation |

**AI Enhancement:** Used in risk prediction and triage scoring

### Visits
**Purpose:** Record patient clinic/hospital visits

| Field | Type | Description |
|-------|------|-------------|
| visit_id | UUID (PK) | Unique identifier |
| patient_id | UUID (FK) | Reference to patient |
| visit_date | DateTime | Visit timestamp |
| reason | Text | Chief complaint |
| triage_score | Integer | AI-calculated urgency (0-100) |
| doctor_id | UUID (FK) | Attending physician |
| notes | Text | Clinical assessment |
| created_at | DateTime | Record creation |

**AI Integration:** `triage_score` populated by TriageModel

### Lab_Results
**Purpose:** Store medical test results (blood work, imaging, etc.)

| Field | Type | Description |
|-------|------|-------------|
| lab_id | UUID (PK) | Unique identifier |
| patient_id | UUID (FK) | Reference to patient |
| test_type | String(128) | blood test, CT scan, etc. |
| result | JSON | Structured test values |
| uploaded_by | UUID (FK) | User who uploaded |
| uploaded_at | DateTime | Upload timestamp |

**AI Enhancement:** Results fed to diagnostic model for integrated analysis

### Prescriptions
**Purpose:** Track active and historical medications

| Field | Type | Description |
|-------|------|-------------|
| prescription_id | UUID (PK) | Unique identifier |
| patient_id | UUID (FK) | Reference to patient |
| drug_name | String(256) | Medication name |
| dosage | String(128) | Dose (e.g., 500mg) |
| frequency | String(128) | Schedule (e.g., 2x daily) |
| start_date | Date | Prescription start |
| end_date | Date | Prescription end |
| prescribed_by | UUID (FK) | Prescribing doctor |
| created_at | DateTime | Record creation |

### Nutrition_Assessments
**Purpose:** AI-driven nutrition risk and guidance

| Field | Type | Description |
|-------|------|-------------|
| assessment_id | UUID (PK) | Unique identifier |
| patient_id | UUID (FK) | Reference to patient |
| assessment_date | DateTime | Assessment timestamp |
| diet_summary | Text | Food/hydration logs |
| risk_score | Integer | Nutrition risk (0-100) |
| recommendations | Text | AI-generated advice |
| created_at | DateTime | Record creation |

**AI Model:** NutritionModel calculates risk from BMI, calorie, hydration data

### Pregnancy_Risk
**Purpose:** Specialized risk assessment for pregnant patients

| Field | Type | Description |
|-------|------|-------------|
| risk_id | UUID (PK) | Unique identifier |
| patient_id | UUID (FK) | Reference to patient |
| assessment_date | DateTime | Assessment timestamp |
| risk_level | Enum | low, medium, high |
| notes | Text | Clinical observations |
| created_at | DateTime | Record creation |

**AI Model:** PregnancyRiskModel factors age, BMI, comorbidities

### Devices
**Purpose:** Manage medical equipment and IoT sensors

| Field | Type | Description |
|-------|------|-------------|
| device_id | UUID (PK) | Unique identifier |
| name | String(128) | Device name |
| device_type | String(64) | MRI, X-Ray, Monitor, etc. |
| location | String(128) | Ward or facility location |
| status | String(64) | online, maintenance, offline |
| last_seen | DateTime | Last data received |
| created_at | DateTime | Device registration |

### Device_Data
**Purpose:** Store telemetry from medical devices

| Field | Type | Description |
|-------|------|-------------|
| data_id | UUID (PK) | Unique identifier |
| device_id | UUID (FK) | Reference to device |
| timestamp | DateTime | Measurement time |
| temperature | Float | Device temperature (°C) |
| vibration | Float | Vibration level (mm/s) |
| usage_hours | Float | Cumulative usage |
| status_report | Text | Device status message |

**AI Enhancement:** Used by EquipmentMaintenanceModel to predict failures

### Chat_Rooms
**Purpose:** Secure clinical staff collaboration across doctors and nurses

| Field | Type | Description |
|-------|------|-------------|
| room_id | UUID (PK) | Unique identifier |
| title | String(256) | Room title |
| created_by | UUID (FK) | Creator user ID |
| participants | JSON | List of participant user IDs |
| created_at | DateTime | Room creation timestamp |

### Chat_Messages
**Purpose:** Store messages and clinician coordination context

| Field | Type | Description |
|-------|------|-------------|
| message_id | UUID (PK) | Unique identifier |
| room_id | UUID (FK) | Reference to chat room |
| sender_id | UUID (FK) | User who sent the message |
| content | Text | Message text |
| sent_at | DateTime | Timestamp |
| attachments | JSON | List of attachment metadata |

### Chat_Attachments
**Purpose:** Track uploaded documents, photos, and files associated with chats

| Field | Type | Description |
|-------|------|-------------|
| attachment_id | UUID (PK) | Unique identifier |
| message_id | UUID (FK) | Reference to chat message |
| filename | String(256) | Original filename |
| mimetype | String(128) | MIME type |
| file_path | String(512) | Stored file path |
| uploaded_at | DateTime | Timestamp |

## AI/ML Integration

### 1. Comprehensive Diagnostics (`/api/patients/<id>/comprehensive-diagnosis`)
Combines multiple data sources:
- Patient symptoms and medical history
- Medical imaging analysis (photo processing)
- Nutrition records
- Lab results
- Historical patterns

**Confidence Scoring:** Total analysis score weighted by:
- Symptom analysis (5 points per symptom)
- History analysis (3 points per condition)
- Image analysis (5-18 points based on brightness analysis)
- Nutrition analysis (0-20 points based on risk factors)

### 2. Triage & Peak Admission Prediction
**TriageModel endpoints:**
- `POST /api/triage` — Real-time patient urgency scoring
- `GET /api/peak-admission-times` — Predict admission surges

**Peak Time Prediction Algorithm:**
- Historical pattern: 35% probability 8am peak, 30% noon, 35% 6pm
- Current utilization factor
- Expected admission count within peak window

### 3. Equipment Failure Prediction (`/api/equipment/failure-prediction`)
**EquipmentMaintenanceModel scoring:**
- Temperature delta from baseline (0.8 weight)
- Vibration exceeding threshold (40 weight)
- Usage hours (normalized to 0-20)
- Equipment age in months (0-20 weight)

**Risk Output:**
- Failure risk percentage (0-100%)
- Actionable recommendation (routine, monitor, immediate maintenance)

### 4. Nutrition Risk Assessment (`/api/patients/<id>/nutrition-assessments`)
**NutritionModel factors:**
- BMI > 30 (+5 risk)
- Daily calories > 2800 (+4 risk)
- Water intake < 2L (+3 risk)
- AI personalized recommendations

### 5. Pregnancy Risk Scoring (`/api/patients/<id>/pregnancy-risks`)
**PregnancyRiskModel factors:**
- Age > 35 (+10 risk)
- BMI > 30 (+15 risk)
- Hypertension history (+20 risk)
- Diabetes history (+15 risk)

---

## Key API Endpoints

### Authentication
- `POST /api/auth/register` — Create user account
- `POST /api/auth/login` — Issue JWT token
- `GET /api/auth/me` — Fetch current user profile

### Patient Records
- `GET /api/patients` — List all patients
- `POST /api/patients` — Create patient
- `GET /api/patients/<id>` — Fetch patient details
- `PUT /api/patients/<id>` — Update patient

### Medical History
- `GET /api/patients/<id>/medical-history` — View conditions
- `POST /api/patients/<id>/medical-history` — Add condition

### Visits
- `GET /api/patients/<id>/visits` — View visit history
- `POST /api/patients/<id>/visits` — Record visit

### Lab Results
- `GET /api/patients/<id>/lab-results` — View results
- `POST /api/patients/<id>/lab-results` — Upload results

### Prescriptions
- `GET /api/patients/<id>/prescriptions` — View medications
- `POST /api/patients/<id>/prescriptions` — Issue prescription

### Nutrition & Pregnancy
- `GET/POST /api/patients/<id>/nutrition-assessments`
- `GET/POST /api/patients/<id>/pregnancy-risks`

### Diagnostics & ML
- `POST /api/patients/<id>/comprehensive-diagnosis` — Full AI analysis
- `POST /api/diagnose` — Legacy diagnostic endpoint
- `GET /api/peak-admission-times` — Predict surge times
- `POST /api/equipment/failure-prediction` — Device maintenance

---

## Data Relationships

```
Users
├── Prescriptions (prescribed_by)
├── LabResults (uploaded_by)
└── Visits (doctor_id)

Patients
├── MedicalHistory (1:N)
├── Visits (1:N)
├── LabResults (1:N)
├── Prescriptions (1:N)
├── NutritionAssessments (1:N)
└── PregnancyRisks (1:N)

Devices
└── DeviceData (1:N)
```

---

## Sample Initialization

The `backend/db_init.py` script populates:
- 3 sample patients with full medical histories
- 4 user accounts (admin, doctor, nurse, patient)
- 2 medical devices with telemetry data

**To initialize:**
```bash
python3 backend/db_init.py
```

---

## Security & Privacy

- All passwords hashed with Werkzeug
- JWT tokens for API authentication
- Role-based access control on all endpoints
- HIPAA-compliant data structure (email, phone, address encrypted in transit)
