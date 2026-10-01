import uuid
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import check_password_hash, generate_password_hash

# Shared SQLAlchemy instance for the backend app

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    user_id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = db.Column(db.String(64), unique=True, nullable=False)
    name = db.Column(db.String(128), nullable=False)
    email = db.Column(db.String(128), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(32), nullable=False, default='patient')
    id_number = db.Column(db.String(64), unique=True, nullable=True)
    registration_number = db.Column(db.String(64), unique=True, nullable=True)
    specialization = db.Column(db.String(128), nullable=True)
    biometric_hash = db.Column(db.String(256), nullable=True)
    patient_id = db.Column(db.String(36), db.ForeignKey('patients.patient_id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def set_biometric(self, biometric_token):
        if biometric_token:
            self.biometric_hash = generate_password_hash(str(biometric_token))

    def check_biometric(self, biometric_token):
        if not self.biometric_hash or not biometric_token:
            return False
        return check_password_hash(self.biometric_hash, str(biometric_token))

    def to_dict(self):
        return {
            'user_id': self.user_id,
            'username': self.username,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'id_number': self.id_number,
            'registration_number': self.registration_number,
            'specialization': self.specialization,
            'patient_id': self.patient_id,
            'created_at': self.created_at.isoformat(),
        }

class Device(db.Model):
    __tablename__ = 'devices'
    device_id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(128), nullable=False)
    device_type = db.Column(db.String(64), default='diagnostic')
    location = db.Column(db.String(128), nullable=True)
    status = db.Column(db.String(64), default='online')
    last_seen = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'device_id': self.device_id,
            'name': self.name,
            'device_type': self.device_type,
            'location': self.location,
            'status': self.status,
            'last_seen': self.last_seen.isoformat(),
            'created_at': self.created_at.isoformat(),
        }

class DeviceData(db.Model):
    __tablename__ = 'device_data'
    data_id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    device_id = db.Column(db.String(36), db.ForeignKey('devices.device_id'), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    temperature = db.Column(db.Float, nullable=True)
    vibration = db.Column(db.Float, nullable=True)
    usage_hours = db.Column(db.Float, nullable=True)
    status_report = db.Column(db.Text, nullable=True)

    device = db.relationship('Device', backref=db.backref('data', lazy=True))

    def to_dict(self):
        return {
            'data_id': self.data_id,
            'device_id': self.device_id,
            'timestamp': self.timestamp.isoformat(),
            'temperature': self.temperature,
            'vibration': self.vibration,
            'usage_hours': self.usage_hours,
            'status_report': self.status_report,
        }

class Patient(db.Model):
    __tablename__ = 'patients'
    patient_id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    first_name = db.Column(db.String(64), nullable=False)
    middle_name = db.Column(db.String(64), nullable=True)
    last_name = db.Column(db.String(64), nullable=False)
    date_of_birth = db.Column(db.Date, nullable=True)
    gender = db.Column(db.String(16), nullable=True)
    contact_info = db.Column(db.JSON, nullable=True)
    emergency_contact = db.Column(db.JSON, nullable=True)
    cluster_group = db.Column(db.String(64), nullable=True)
    password_hash = db.Column(db.String(256), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Legacy fields for backward compatibility
    name = db.Column(db.String(128), nullable=True)
    age = db.Column(db.Integer, nullable=True)
    symptoms = db.Column(db.Text, nullable=True)
    history = db.Column(db.Text, nullable=True)
    vitals = db.Column(db.Text, nullable=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        if not self.password_hash or not password:
            return False
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'patient_id': self.patient_id,
            'first_name': self.first_name,
            'middle_name': self.middle_name,
            'last_name': self.last_name,
            'date_of_birth': self.date_of_birth.isoformat() if self.date_of_birth else None,
            'gender': self.gender,
            'contact_info': self.contact_info,
            'emergency_contact': self.emergency_contact,
            'cluster_group': self.cluster_group,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
        }

class MedicalHistory(db.Model):
    __tablename__ = 'medical_history'
    history_id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = db.Column(db.String(36), db.ForeignKey('patients.patient_id'), nullable=False)
    condition = db.Column(db.String(256), nullable=False)
    diagnosis_date = db.Column(db.Date, nullable=True)
    status = db.Column(db.String(32), default='active')
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    patient = db.relationship('Patient', backref=db.backref('medical_histories', lazy=True))

    def to_dict(self):
        return {
            'history_id': self.history_id,
            'patient_id': self.patient_id,
            'condition': self.condition,
            'diagnosis_date': self.diagnosis_date.isoformat() if self.diagnosis_date else None,
            'status': self.status,
            'notes': self.notes,
            'created_at': self.created_at.isoformat(),
        }

class Visit(db.Model):
    __tablename__ = 'visits'
    visit_id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = db.Column(db.String(36), db.ForeignKey('patients.patient_id'), nullable=False)
    visit_date = db.Column(db.DateTime, default=datetime.utcnow)
    reason = db.Column(db.Text, nullable=False)
    triage_score = db.Column(db.Integer, nullable=True)
    doctor_id = db.Column(db.String(36), db.ForeignKey('users.user_id'), nullable=True)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    patient = db.relationship('Patient', backref=db.backref('visits', lazy=True))
    doctor = db.relationship('User', backref=db.backref('visits', lazy=True))

    def to_dict(self):
        return {
            'visit_id': self.visit_id,
            'patient_id': self.patient_id,
            'visit_date': self.visit_date.isoformat(),
            'reason': self.reason,
            'triage_score': self.triage_score,
            'doctor_id': self.doctor_id,
            'notes': self.notes,
            'created_at': self.created_at.isoformat(),
        }

class LabResult(db.Model):
    __tablename__ = 'lab_results'
    lab_id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = db.Column(db.String(36), db.ForeignKey('patients.patient_id'), nullable=False)
    test_type = db.Column(db.String(128), nullable=False)
    result = db.Column(db.JSON, nullable=True)
    uploaded_by = db.Column(db.String(36), db.ForeignKey('users.user_id'), nullable=True)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)

    patient = db.relationship('Patient', backref=db.backref('lab_results', lazy=True))
    uploader = db.relationship('User', backref=db.backref('lab_results', lazy=True))

    def to_dict(self):
        return {
            'lab_id': self.lab_id,
            'patient_id': self.patient_id,
            'test_type': self.test_type,
            'result': self.result,
            'uploaded_by': self.uploaded_by,
            'uploaded_at': self.uploaded_at.isoformat(),
        }

class Prescription(db.Model):
    __tablename__ = 'prescriptions'
    prescription_id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = db.Column(db.String(36), db.ForeignKey('patients.patient_id'), nullable=False)
    drug_name = db.Column(db.String(256), nullable=False)
    dosage = db.Column(db.String(128), nullable=False)
    frequency = db.Column(db.String(128), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=True)
    prescribed_by = db.Column(db.String(36), db.ForeignKey('users.user_id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    patient = db.relationship('Patient', backref=db.backref('prescriptions', lazy=True))
    prescriber = db.relationship('User', backref=db.backref('prescriptions', lazy=True))

    def to_dict(self):
        return {
            'prescription_id': self.prescription_id,
            'patient_id': self.patient_id,
            'drug_name': self.drug_name,
            'dosage': self.dosage,
            'frequency': self.frequency,
            'start_date': self.start_date.isoformat(),
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'prescribed_by': self.prescribed_by,
            'created_at': self.created_at.isoformat(),
        }

class NutritionAssessment(db.Model):
    __tablename__ = 'nutrition_assessments'
    assessment_id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = db.Column(db.String(36), db.ForeignKey('patients.patient_id'), nullable=False)
    assessment_date = db.Column(db.DateTime, default=datetime.utcnow)
    diet_summary = db.Column(db.Text, nullable=True)
    risk_score = db.Column(db.Integer, nullable=True)
    recommendations = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    patient = db.relationship('Patient', backref=db.backref('nutrition_assessments', lazy=True))

    def to_dict(self):
        return {
            'assessment_id': self.assessment_id,
            'patient_id': self.patient_id,
            'assessment_date': self.assessment_date.isoformat(),
            'diet_summary': self.diet_summary,
            'risk_score': self.risk_score,
            'recommendations': self.recommendations,
            'created_at': self.created_at.isoformat(),
        }

class PregnancyRisk(db.Model):
    __tablename__ = 'pregnancy_risk'
    risk_id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = db.Column(db.String(36), db.ForeignKey('patients.patient_id'), nullable=False)
    assessment_date = db.Column(db.DateTime, default=datetime.utcnow)
    risk_level = db.Column(db.String(32), nullable=False)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    patient = db.relationship('Patient', backref=db.backref('pregnancy_risks', lazy=True))

    def to_dict(self):
        return {
            'risk_id': self.risk_id,
            'patient_id': self.patient_id,
            'assessment_date': self.assessment_date.isoformat(),
            'risk_level': self.risk_level,
            'notes': self.notes,
            'created_at': self.created_at.isoformat(),
        }

class ChatRoom(db.Model):
    __tablename__ = 'chat_rooms'
    room_id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = db.Column(db.String(256), nullable=False)
    created_by = db.Column(db.String(36), db.ForeignKey('users.user_id'), nullable=False)
    participants = db.Column(db.JSON, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    creator = db.relationship('User', backref=db.backref('chat_rooms', lazy=True))

    def to_dict(self):
        return {
            'room_id': self.room_id,
            'title': self.title,
            'created_by': self.created_by,
            'participants': self.participants,
            'created_at': self.created_at.isoformat(),
        }

class ChatMessage(db.Model):
    __tablename__ = 'chat_messages'
    message_id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    room_id = db.Column(db.String(36), db.ForeignKey('chat_rooms.room_id'), nullable=False)
    sender_id = db.Column(db.String(36), db.ForeignKey('users.user_id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    sent_at = db.Column(db.DateTime, default=datetime.utcnow)
    attachments = db.Column(db.JSON, nullable=True)

    room = db.relationship('ChatRoom', backref=db.backref('messages', lazy=True, cascade='all, delete-orphan'))
    sender = db.relationship('User', backref=db.backref('chat_messages', lazy=True))

    def to_dict(self):
        return {
            'message_id': self.message_id,
            'room_id': self.room_id,
            'sender_id': self.sender_id,
            'content': self.content,
            'sent_at': self.sent_at.isoformat(),
            'attachments': self.attachments or [],
        }

class ChatAttachment(db.Model):
    __tablename__ = 'chat_attachments'
    attachment_id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    message_id = db.Column(db.String(36), db.ForeignKey('chat_messages.message_id'), nullable=False)
    filename = db.Column(db.String(256), nullable=False)
    mimetype = db.Column(db.String(128), nullable=True)
    file_path = db.Column(db.String(512), nullable=False)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)

    message = db.relationship('ChatMessage', backref=db.backref('attachments_meta', lazy=True, cascade='all, delete-orphan'))

    def to_dict(self):
        return {
            'attachment_id': self.attachment_id,
            'message_id': self.message_id,
            'filename': self.filename,
            'mimetype': self.mimetype,
            'file_path': self.file_path,
            'uploaded_at': self.uploaded_at.isoformat(),
        }
