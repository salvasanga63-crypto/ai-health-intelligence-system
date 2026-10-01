# AI Health Intelligence Platform - Full Stack Setup Guide

## Overview
This is a **Flask backend + Next.js frontend** platform with:
- ✅ CORS enabled for frontend-backend communication
- ✅ FormData file uploads (curl -F equivalent) support
- ✅ JWT authentication & role-based access control
- ✅ AI models for triage, diagnostics, and equipment maintenance
- ✅ Chart.js dashboards with real-time metrics

---

## Quick Start (2 Terminals)

### Terminal 1: Start Backend API Server
```bash
# From project root
python3 run.py
```

This will start the Flask server on **http://0.0.0.0:5000** with:
- CORS enabled (allows requests from http://localhost:3000)
- Debug mode enabled
- Auto-reload on code changes

Expected output:
```
======================================================================
AI Health Intelligence Platform - Backend API
======================================================================

Server starting on http://0.0.0.0:5000

CORS and FormData support enabled:
  - Accepts requests from http://localhost:3000
  - Supports FormData file uploads (curl -F equivalent)

Frontend: cd frontend-next && npm run dev
API Base: http://localhost:5000/api

Key endpoints:
  POST /api/diagnose  - FormData + file upload
  POST /api/triage    - JSON
  POST /api/patients  - JSON
  GET  /api/dashboard - JSON

Press CTRL+C to stop.
```

### Terminal 2: Start Frontend Next.js App
```bash
cd frontend-next
npm install  # Run once to install dependencies
npm run dev
```

This will start the Next.js frontend on **http://localhost:3000** with:
- Hot reload on code changes
- Automatic API routing to backend

Expected output:
```
> next dev
  ▲ Next.js 14.0.0
  - Ready in 2.5s
  - Local: http://localhost:3000
```

---

## Architecture

### Frontend → Backend Communication

#### 1. **JSON Requests** (default)
```javascript
// From frontend-next/lib/api.js
await authFetch('/triage', {
  method: 'POST',
  body: JSON.stringify({ symptoms: 'fever' })
});
```

Equivalent curl:
```bash
curl -X POST http://localhost:5000/api/triage \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"symptoms":"fever"}'
```

#### 2. **FormData File Uploads** (new!)
```javascript
// From frontend-next/pages/diagnose-formdata.js
const formData = new FormData();
formData.append('symptoms', 'fever');
formData.append('file', fileInput.files[0]);

await authFetch('/diagnose', {
  method: 'POST',
  body: formData
});
```

Equivalent curl:
```bash
curl -X POST http://localhost:5000/api/diagnose \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "symptoms=fever" \
  -F "file=@medical_report.pdf"
```

---

## CORS Configuration

### Backend: `backend/app.py`
```python
from flask_cors import CORS
from flask import Flask

app = Flask(__name__)
CORS(app)  # Enables CORS on ALL routes
```

This allows:
- ✅ Cross-origin requests from `http://localhost:3000`
- ✅ FormData file uploads
- ✅ All HTTP methods (GET, POST, PUT, DELETE, OPTIONS)
- ✅ All headers (Content-Type, Authorization, etc.)

### Frontend: `frontend-next/lib/api.js`
```javascript
export async function authFetch(path, options = {}) {
  const token = getToken();
  const headers = { ...options.headers };

  // Don't set Content-Type for FormData (let browser set it)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });
}
```

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Get JWT token
- `GET /api/auth/me` - Get current user profile

### AI Services (FormData)
- `POST /api/diagnose` - AI diagnosis with file upload
  - Fields: `symptoms`, `history`, `nutrition_data`, `file` (optional)

### AI Services (JSON)
- `POST /api/triage` - Patient triage scoring
- `POST /api/patients/<id>/comprehensive-diagnosis` - Full diagnosis

### Data Management
- `GET /api/patients` - List patients
- `POST /api/patients` - Create patient
- `GET /api/patients/<id>` - Get patient details
- `GET /api/dashboard` - Dashboard metrics & AI scores

### Devices & Equipment
- `GET /api/devices` - List registered devices
- `POST /api/devices/<id>/data` - Ingest sensor telemetry
- `POST /api/equipment/failure-prediction` - Predict maintenance

### Chat
- `POST /api/chat/rooms` - Create discussion room
- `GET /api/chat/rooms/<id>/messages` - Get messages
- `POST /api/chat/rooms/<id>/messages` - Post message with attachments

---

## Frontend Pages

### New Pages Created
| Page | URL | Purpose |
|------|-----|---------|
| **AI Diagnosis (FormData)** | `/diagnose-formdata` | Upload medical files with FormData |
| **Dashboard V2** | `/dashboard_v2` | Chart.js visualizations (Line + Bar) |
| **Triage** | `/triage` | Real-time triage scoring |
| **Schema** | `/schema` | View database schema |
| **Patients** | `/patients` | Patient registry with cluster filtering |

### Existing Pages
- Home (`/`) - Landing page with navigation cards
- Dashboard (`/dashboard`) - Platform metrics
- Diagnostics (`/diagnostics`) - AI diagnostics
- Devices (`/devices`) - Device management
- Chat (`/chat`) - Clinical collaboration
- Login (`/login`) - Authentication

---

## Database

### Default: SQLite
```bash
# Database file created automatically
app.db  # SQLite database (auto-created in project root)
```

### Optional: PostgreSQL
Set `DATABASE_URL` environment variable:
```bash
export DATABASE_URL="postgresql://user:password@localhost/health_platform"
python3 run.py
```

---

## Testing

### Run Unit Tests
```bash
# Test dashboard seeding and AI metrics
python3 -m unittest tests/test_dashboard_seed.py -v
```

### Manual Test: Seed Demo Data
```bash
python3 scripts/seed_demo.py
```

Creates:
- Admin user (`admin` / `AdminPass123`)
- 5 sample patients
- Prints dashboard JSON output

---

## Environment Variables

Create `.env` file in project root:
```bash
# Database (optional, defaults to SQLite)
DATABASE_URL=sqlite:///app.db

# JWT Secret (change in production!)
JWT_SECRET_KEY=your-super-secret-key-here

# Flask
FLASK_ENV=development

# Port (optional)
PORT=5000
```

---

## Troubleshooting

### Frontend can't reach backend
1. Check backend is running: `http://localhost:5000/api/platform/health`
2. Check `NEXT_PUBLIC_API_BASE` in `frontend-next/.env.local`:
   ```
   NEXT_PUBLIC_API_BASE=http://localhost:5000/api
   ```
3. Restart Next.js dev server

### CORS errors in browser console
- These should NOT appear if backend has `CORS(app)` enabled
- Check backend/app.py has: `from flask_cors import CORS; CORS(app)`
- Restart backend server

### FormData file upload fails
- Ensure `Content-Type` header is NOT set (let browser set it with boundary)
- `authFetch()` automatically removes it for FormData
- Check file size limits (Flask default: 16MB)

### Authentication token issues
- Token stored in `localStorage` as `health_platform_token`
- Check login success: Open DevTools → Application → Storage → Local Storage
- Token should be JWT format: `eyJ...`

---

## Development Workflow

### File Structure
```
project-root/
├── backend/
│   ├── app.py              (Flask app factory, CORS setup)
│   ├── api.py              (Route definitions)
│   ├── models.py           (AI models: Triage, Diagnostic, Maintenance)
│   ├── services.py         (DB business logic)
│   ├── database.py         (SQLAlchemy models)
│   └── uploads/            (File upload storage)
├── frontend-next/
│   ├── pages/
│   │   ├── index.js        (Home page)
│   │   ├── diagnose-formdata.js  (FormData upload)
│   │   ├── dashboard_v2.js       (Chart.js dashboard)
│   │   └── ... other pages
│   ├── lib/
│   │   └── api.js          (authFetch with FormData support)
│   ├── components/
│   │   └── Layout.js       (Navigation)
│   └── package.json        (Dependencies: chart.js, react-chartjs-2)
├── tests/
│   └── test_dashboard_seed.py
├── scripts/
│   └── seed_demo.py
├── run.py                  (Backend startup script)
└── README.md               (This file)
```

### Making Changes

**Backend Changes**
1. Edit `backend/api.py`, `backend/models.py`, or `backend/services.py`
2. Backend auto-reloads on save (debug mode enabled)
3. No restart needed

**Frontend Changes**
1. Edit files in `frontend-next/pages/` or `frontend-next/lib/`
2. Next.js auto-reloads on save
3. No restart needed

---

## Production Deployment

### Backend
```bash
# Install production server
pip install gunicorn

# Run with Gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 backend.app:app
```

### Frontend
```bash
# Build optimized bundle
cd frontend-next
npm run build

# Start production server
npm start
```

### Docker
Use `docker-compose.yml`:
```bash
docker-compose up -d
# Backend: http://localhost:5000
# Frontend: http://localhost:3000
```

---

## Support & Debugging

### Enable detailed logging
```bash
# Backend
export FLASK_DEBUG=1
export FLASK_ENV=development
python3 run.py
```

### Check API health
```bash
curl http://localhost:5000/api/platform/health
```

Expected response:
```json
{
  "status": "online",
  "message": "AIHealthIntelligencePlatform is running",
  "version": "1.0.0"
}
```

### Check CORS headers
```bash
curl -i -X OPTIONS http://localhost:5000/api/diagnose \
  -H "Origin: http://localhost:3000"
```

Should include:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
```

---

**Last Updated:** May 26, 2026  
**Platform:** AI Health Intelligence Platform v1.0.0
