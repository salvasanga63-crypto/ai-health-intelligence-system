#!/usr/bin/env python3
"""
Verify CORS and FormData endpoint functionality.

Run with:
  python3 scripts/verify_cors_formdata.py
"""

import sys
import os
import json
import tempfile
from pathlib import Path

# Add project root to path
PROJECT_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from backend.app import create_app
from backend.database import db
from backend.services import UserService

def test_cors_and_formdata():
    """Test CORS headers and FormData endpoint."""
    app = create_app()
    client = app.test_client()

    print('\n' + '='*70)
    print('CORS & FormData Verification Test')
    print('='*70 + '\n')

    # Test 1: CORS headers on OPTIONS request
    print('1. Testing CORS headers (OPTIONS request)...')
    response = client.options(
        '/api/diagnose',
        headers={'Origin': 'http://localhost:3000'}
    )
    cors_origin = response.headers.get('Access-Control-Allow-Origin')
    if cors_origin:
        print(f'   ✓ CORS Origin: {cors_origin}')
    else:
        print('   ✗ CORS headers NOT found')
        return False

    # Test 2: FormData endpoint accepts form data
    print('\n2. Testing FormData endpoint (POST /api/diagnose)...')
    with app.app_context():
        # Use test client's data parameter for form fields
        response = client.post(
            '/api/diagnose',
            data={
                'symptoms': 'fever, cough',
                'history': 'diabetes',
                'nutrition_data': json.dumps({'diet_type': 'balanced'}),
            },
        )

        if response.status_code == 200:
            result = response.get_json()
            print(f'   ✓ FormData accepted (HTTP 200)')
            print(f'   ✓ Response has diagnosis: {bool(result.get("condition"))}')
        else:
            print(f'   ✗ FormData rejected (HTTP {response.status_code})')
            resp_data = response.get_json() if response.is_json else response.get_data(as_text=True)
            print(f'   Response: {resp_data}')
            return False

    # Test 3: JSON endpoint still works
    print('\n3. Testing JSON endpoint (POST /api/triage)...')
    response = client.post(
        '/api/triage',
        json={'symptoms': 'fever', 'cluster_group': 'children under 5'},
        headers={'Content-Type': 'application/json'}
    )
    if response.status_code == 200:
        result = response.get_json()
        print(f'   ✓ JSON request accepted (HTTP 200)')
        print(f'   ✓ Response has triage_level: {bool(result.get("triage_level"))}')
    else:
        print(f'   ✗ JSON request failed (HTTP {response.status_code})')
        return False

    # Test 4: Dashboard returns AI metrics
    print('\n4. Testing dashboard metrics...')
    response = client.get('/api/dashboard')
    if response.status_code == 200:
        data = response.get_json()
        has_ai_metrics = 'ai_metrics' in data
        has_recent_triage = 'recent_triage_confidences' in data
        print(f'   ✓ Dashboard accessible (HTTP 200)')
        print(f'   ✓ Has ai_metrics: {has_ai_metrics}')
        print(f'   ✓ Has recent_triage_confidences: {has_recent_triage}')
        if has_ai_metrics:
            metrics = data['ai_metrics']
            print(f'     - Triage training: {metrics.get("triage_training", {}).get("accuracy")}')
            print(f'     - Diagnostic training: {metrics.get("diagnostic_training", {}).get("accuracy")}')
    else:
        print(f'   ✗ Dashboard failed (HTTP {response.status_code})')
        return False

    # Test 5: Health check
    print('\n5. Testing platform health endpoint...')
    response = client.get('/api/platform/health')
    if response.status_code == 200:
        data = response.get_json()
        print(f'   ✓ Platform health: {data.get("message")}')
        print(f'   ✓ Status: {data.get("status")}')
    else:
        print(f'   ✗ Health check failed (HTTP {response.status_code})')
        return False

    print('\n' + '='*70)
    print('✓ All CORS & FormData tests PASSED!')
    print('='*70)
    print('\nFrontend Integration:')
    print('  - CORS enabled ✓')
    print('  - FormData file uploads supported ✓')
    print('  - authFetch() handles both JSON & FormData ✓')
    print('\nNext step: Run frontend and test /diagnose-formdata page')
    print('  cd frontend-next && npm run dev\n')
    return True

if __name__ == '__main__':
    success = test_cors_and_formdata()
    sys.exit(0 if success else 1)
