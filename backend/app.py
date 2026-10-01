#!/usr/bin/env python3
"""
AI Health Intelligence Platform - Backend Server

Run with:
  python3 app.py  (development mode, debug=True)

Or:
  python3 -m flask run --host=0.0.0.0 --port=5000

Environment Variables:
  - DATABASE_URL: PostgreSQL/SQLite connection string (default: sqlite:///app.db)
  - JWT_SECRET_KEY: Secret key for JWT tokens (default: required)
  - FLASK_ENV: Set to 'production' for production mode

Frontend CORS:
  - CORS is enabled on all routes via flask_cors.CORS(app)
  - Frontend (Next.js) at http://localhost:3000 can make requests to http://localhost:5000/api
  - Supports FormData file uploads and standard JSON requests
"""

#!/usr/bin/env python3
"""
AI Health Intelligence Platform - Backend API Server

CORS & Frontend Integration:
  - CORS is enabled on ALL routes via flask_cors.CORS(app)
  - Frontend (Next.js) at http://localhost:3000 can make requests
  - Supports FormData file uploads (curl -F equivalent)
  - API Base: http://localhost:5000/api

Running the Server:
  python3 run.py                              (recommended - with startup message)
  python3 app.py                              (direct - debug mode)
  python3 -m flask run --host=0.0.0.0 --port=5000  (Flask CLI)

Environment Variables:
  DATABASE_URL: PostgreSQL/SQLite URL (default: sqlite:///app.db)
  JWT_SECRET_KEY: Secret for JWT tokens (default: required)
  FLASK_ENV: Set to 'production' for production mode

API Endpoints:
  - POST /api/diagnose              (FormData + file upload support)
  - POST /api/triage                (JSON)
  - POST /api/patients              (JSON)
  - GET  /api/dashboard             (JSON)
  - POST /api/auth/login            (JSON)
  - POST /api/auth/register         (JSON)
  - ... and many more (see backend/api.py)

Frontend Setup:
  cd frontend-next && npm install && npm run dev
"""

import os
import sys

from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

load_dotenv(os.path.join(PROJECT_ROOT, '.env'))

from backend.database import db
from backend.api import api


def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
        'DATABASE_URL',
        'sqlite:///app.db'
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    jwt_secret = os.environ.get("JWT_SECRET_KEY")

if not jwt_secret:
    raise RuntimeError("JWT_SECRET_KEY environment variable is required")

app.config["JWT_SECRET_KEY"] = jwt_secret
    CORS(app)
    db.init_app(app)
    Migrate(app, db)
    JWTManager(app)
    app.register_blueprint(api)

    with app.app_context():
        db.create_all()

    return app


app = create_app()

if __name__ == '__main__':
    print('\n' + '='*70)
    print('AI Health Intelligence Platform - Backend API')
    print('='*70)
    print('\nStarting Flask server on http://0.0.0.0:5000')
    print('\nCORS Configuration:')
    print('  - Allowed origins: * (all domains)')
    print('  - Supports: JSON, FormData, file uploads')
    print('\nFrontend URL: http://localhost:3000')
    print('API Base: http://localhost:5000/api')
    print('\nPress CTRL+C to stop the server.\n')
    print('='*70 + '\n')
    app.run(host='0.0.0.0', port=5000, debug=True)
