import os
import sys
from datetime import datetime, timedelta

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.app import app
from backend.database import (
    db, Patient, User, Device, DeviceData,
    MedicalHistory, Visit, LabResult, Prescription,
    NutritionAssessment, PregnancyRisk, ChatRoom, ChatMessage
)

sample_patients = [
    {
        'first_name': 'Jane',
        'last_name': 'Doe',
        'date_of_birth': '1982-03-15',
        'gender': 'Female',
        'contact_info': {'phone': '+1-555-0101', 'email': 'jane@example.com', 'address': '123 Main St'},
        'emergency_contact': {'name': 'John Doe', 'relation': 'Spouse', 'phone': '+1-555-0102'},
        'age': 42,
        'symptoms': 'fever,cough,shortness of breath',
        'history': 'hypertension',
        'vitals': 'heart_rate:110;oxygen_saturation:92',
        'cluster_group': 'women',
    },
    {
        'first_name': 'Maria',
        'last_name': 'Johnson',
        'date_of_birth': '1994-07-22',
        'gender': 'Female',
        'contact_info': {'phone': '+1-555-0201', 'email': 'maria@example.com'},
        'emergency_contact': {'name': 'Rosa Johnson', 'relation': 'Mother', 'phone': '+1-555-0202'},
        'age': 30,
        'symptoms': 'abdominal pain,nausea',
        'history': 'gestational diabetes',
        'vitals': 'heart_rate:88;blood_pressure:130/85',
        'cluster_group': 'pregnant/expectant mothers',
    },
    {
        'first_name': 'Robert',
        'last_name': 'Kim',
        'date_of_birth': '1957-11-05',
        'gender': 'Male',
        'contact_info': {'phone': '+1-555-0301', 'email': 'robert@example.com'},
        'emergency_contact': {'name': 'Sophia Kim', 'relation': 'Daughter', 'phone': '+1-555-0302'},
        'age': 67,
        'symptoms': 'chest pain,dizziness',
        'history': 'diabetes,smoker',
        'vitals': 'heart_rate:102;oxygen_saturation:94',
        'cluster_group': 'elders',
    },
]

sample_users = [
    {
        'username': 'admin',
        'name': 'Admin User',
        'email': 'admin@health.ai',
        'password': 'AdminPass123',
        'role': 'admin',
    },
    {
        'username': 'drsmith',
        'name': 'Dr. Smith',
        'email': 'drsmith@health.ai',
        'password': 'DoctorPass123',
        'role': 'doctor',
        'id_number': 'DOC-1001',
        'registration_number': 'REG-DRS-01',
        'specialization': 'Cardiology',
        'biometric_token': 'fingerprint-drsmith',
    },
    {
        'username': 'nursejoy',
        'name': 'Joy Nurse',
        'email': 'nursejoy@health.ai',
        'password': 'NursePass123',
        'role': 'nurse',
        'id_number': 'NUR-2001',
        'registration_number': 'REG-NRJ-01',
        'specialization': 'General Nursing',
        'biometric_token': 'fingerprint-nursejoy',
    },
    {
        'username': 'patient1',
        'name': 'Patient One',
        'email': 'patient1@health.ai',
        'password': 'PatientPass123',
        'role': 'patient',
        'patient_link_first_name': 'Jane',
        'patient_link_last_name': 'Doe',
    },
]

sample_devices = [
    {'name': 'MRI Scanner A', 'device_type': 'MRI', 'location': 'Radiology Wing', 'status': 'online'},
    {'name': 'X-Ray Unit 2', 'device_type': 'X-Ray', 'location': 'Imaging Center', 'status': 'online'},
]

device_data = [
    {'device_name': 'MRI Scanner A', 'temperature': 72.5, 'vibration': 0.25, 'usage_hours': 2400, 'status_report': 'normal'},
    {'device_name': 'X-Ray Unit 2', 'temperature': 78.1, 'vibration': 0.45, 'usage_hours': 4800, 'status_report': 'high vibration detected'},
]

with app.app_context():
    db.create_all()

    for sample in sample_patients:
        existing = Patient.query.filter_by(first_name=sample['first_name'], last_name=sample['last_name']).first()
        if not existing:
            patient = Patient(
                first_name=sample['first_name'],
                last_name=sample['last_name'],
                date_of_birth=datetime.strptime(sample['date_of_birth'], '%Y-%m-%d').date() if sample.get('date_of_birth') else None,
                gender=sample.get('gender'),
                contact_info=sample.get('contact_info'),
                emergency_contact=sample.get('emergency_contact'),
                name=f"{sample['first_name']} {sample['last_name']}",
                age=sample.get('age'),
                symptoms=sample.get('symptoms'),
                history=sample.get('history'),
                vitals=sample.get('vitals'),
            )
            db.session.add(patient)

    db.session.commit()

    for user in sample_users:
        existing = User.query.filter_by(username=user['username']).first()
        if not existing:
            account = User(
                username=user['username'],
                name=user['name'],
                email=user['email'],
                role=user['role'],
                id_number=user.get('id_number'),
                registration_number=user.get('registration_number'),
                specialization=user.get('specialization'),
            )
            if user.get('role') == 'patient':
                patient = Patient.query.filter_by(
                    first_name=user.get('patient_link_first_name'),
                    last_name=user.get('patient_link_last_name')
                ).first()
                if patient:
                    account.patient_id = patient.patient_id
            account.set_password(user['password'])
            if user.get('biometric_token'):
                account.set_biometric(user['biometric_token'])
            db.session.add(account)

    for sample in sample_devices:
        existing = Device.query.filter_by(name=sample['name']).first()
        if not existing:
            device = Device(
                name=sample['name'],
                device_type=sample['device_type'],
                location=sample['location'],
                status=sample['status'],
            )
            db.session.add(device)
    
    db.session.commit()

    # Add medical history to patients
    patients = Patient.query.all()
    if patients:
        jane = next((p for p in patients if p.first_name == 'Jane'), None)
        if jane:
            hist = MedicalHistory.query.filter_by(patient_id=jane.patient_id).first()
            if not hist:
                history = MedicalHistory(
                    patient_id=jane.patient_id,
                    condition='Hypertension',
                    diagnosis_date=datetime(2015, 5, 10).date(),
                    status='active',
                    notes='Controlled with medication'
                )
                db.session.add(history)

    # Add device data
    for entry in device_data:
        device = Device.query.filter_by(name=entry['device_name']).first()
        if device:
            record = DeviceData(
                device_id=device.device_id,
                temperature=entry['temperature'],
                vibration=entry['vibration'],
                usage_hours=entry['usage_hours'],
                status_report=entry['status_report'],
            )
            db.session.add(record)
    
    db.session.commit()

    # Seed a default clinical chat between nurse and doctor
    nurse = User.query.filter_by(username='nursejoy').first()
    doctor = User.query.filter_by(username='drsmith').first()
    if nurse and doctor:
        existing_room = ChatRoom.query.filter_by(title='Nurse-Doctor Collaboration').first()
        if not existing_room:
            room = ChatRoom(
                title='Nurse-Doctor Collaboration',
                created_by=nurse.user_id,
                participants=[nurse.user_id, doctor.user_id],
            )
            db.session.add(room)
            db.session.commit()
            message = ChatMessage(
                room_id=room.room_id,
                sender_id=nurse.user_id,
                content='Initial patient summary created. Please review the latest triage note.',
            )
            db.session.add(message)
            db.session.commit()

    print('Database initialized with comprehensive patient, user, medical history, and device data.')
