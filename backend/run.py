#!/usr/bin/env python3
"""
Quick-start backend server for AI Health Intelligence Platform.

Usage:
  python3 run.py

The server starts on http://0.0.0.0:5000 with Flask debug mode.
Frontend (Next.js) should run separately on http://localhost:3000

To run both:
  Terminal 1: python3 run.py
  Terminal 2: cd frontend-next && npm run dev

CORS: All routes have CORS enabled. FormData file uploads supported.
"""

import os
import sys
from backend.app import app

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print('\n' + '='*70)
    print('AI Health Intelligence Platform - Backend API')
    print('='*70)
    print('\nServer starting on http://0.0.0.0:5000')
    print('\nCORS and FormData support enabled:')
    print('  - Accepts requests from http://localhost:3000')
    print('  - Supports FormData file uploads (curl -F equivalent)')
    print('\nFrontend: cd frontend-next && npm run dev')
    print('API Base: http://localhost:5000/api')
    print('\nKey endpoints:')
    print('  POST /api/diagnose  - FormData + file upload')
    print('  POST /api/triage    - JSON')
    print('  POST /api/patients  - JSON')
    print('  GET  /api/dashboard - JSON')
    print('\nPress CTRL+C to stop.\n')
    print('='*70 + '\n')
    app.run(debug=True, host='0.0.0.0', port=port)
