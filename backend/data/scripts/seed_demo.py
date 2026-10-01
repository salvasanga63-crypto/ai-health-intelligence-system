"""
Seed demo script: creates an admin user (if missing), creates sample patients,
and exercises the `/api/dashboard` endpoint using the Flask test client.

Run:
python3 scripts/seed_demo.py
"""
import os
from backend.app import create_app
from backend.database import db, User, Patient
from backend.services import PatientService, UserService

app = create_app()

SAMPLE_PATIENTS = [
    {'first_name': 'Alice', 'last_name': 'Miller', 'gender': 'Female', 'date_of_birth': '1980-04-12', 'cluster_group': 'women', 'history': 'hypertension', 'vitals': {'heart_rate': 90, 'oxygen_saturation': 95}},
    {'first_name': 'Bob', 'last_name': 'Okoro', 'gender': 'Male', 'date_of_birth': '1975-09-02', 'cluster_group': 'men', 'history': 'diabetes', 'vitals': {'heart_rate': 85, 'oxygen_saturation': 97}},
    {'first_name': 'Chloe', 'last_name': 'Njeri', 'gender': 'Female', 'date_of_birth': '1995-11-20', 'cluster_group': 'pregnant/expectant mothers', 'history': '', 'vitals': {'heart_rate': 78, 'oxygen_saturation': 98}},
    {'first_name': 'David', 'last_name': 'Smith', 'gender': 'Male', 'date_of_birth': '1968-01-30', 'cluster_group': 'elders', 'history': 'asthma', 'vitals': {'heart_rate': 110, 'oxygen_saturation': 92}},
    {'first_name': 'Eve', 'last_name': 'Wangari', 'gender': 'Female', 'date_of_birth': '2019-06-15', 'cluster_group': 'children under 5', 'history': '', 'vitals': {'heart_rate': 120, 'oxygen_saturation': 99}},
]

with app.app_context():
    db.create_all()
    # create admin user if missing
    admin = User.query.filter_by(username='admin').first()
    if not admin:
        print('Creating admin user with username `admin` and password `AdminPass123`')
        admin = User(username='admin', name='Administrator', email='admin@example.com', role='admin')
        admin.set_password('AdminPass123')
        db.session.add(admin)
        db.session.commit()
    # add sample patients
    for p in SAMPLE_PATIENTS:
        existing = Patient.query.filter_by(first_name=p['first_name'], last_name=p['last_name']).first()
        if not existing:
            print('Creating patient', p['first_name'], p['last_name'])
            PatientService.create_patient(p)

    # exercise dashboard via test client
    client = app.test_client()
    resp = client.get('/api/dashboard')
    print('\nDASHBOARD RESPONSE:')
    print(resp.get_json())
    print('\nDone.')
