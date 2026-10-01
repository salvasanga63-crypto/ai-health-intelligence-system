from sqlalchemy import or_
from backend.database import (
    db, Patient, User, Device, DeviceData, 
    MedicalHistory, Visit, LabResult, Prescription, 
    NutritionAssessment, PregnancyRisk,
    ChatRoom, ChatMessage, ChatAttachment
)

class PatientService:
    @staticmethod
    def list_patients(cluster_group=None):
        query = Patient.query
        if cluster_group:
            query = query.filter_by(cluster_group=cluster_group)
        return query.order_by(Patient.created_at.desc()).all()

    @staticmethod
    def get_patient(patient_id):
        return Patient.query.get_or_404(patient_id)

    @staticmethod
    def create_patient(data):
        # Support both new schema and legacy fields
        patient = Patient(
            first_name=data.get('first_name', data.get('name', 'Unknown')),
            middle_name=data.get('middle_name'),
            last_name=data.get('last_name', ''),
            date_of_birth=data.get('date_of_birth'),
            gender=data.get('gender'),
            contact_info=data.get('contact_info'),
            emergency_contact=data.get('emergency_contact'),
            cluster_group=data.get('cluster_group'),
            # Legacy fields
            name=data.get('name', f"{data.get('first_name', 'Unknown')} {data.get('last_name', '')}"),
            age=data.get('age'),
            symptoms=','.join(data.get('symptoms', [])) if isinstance(data.get('symptoms'), list) else data.get('symptoms', ''),
            history=','.join(data.get('history', [])) if isinstance(data.get('history'), list) else data.get('history', ''),
            vitals=data.get('vitals', ''),
        )
        if data.get('password'):
            patient.set_password(data['password'])
        db.session.add(patient)
        db.session.commit()
        return patient

    @staticmethod
    def authenticate_patient(full_name=None, first_name=None, last_name=None, cluster_group=None, password=None):
        if not cluster_group or not password:
            return None
        query = Patient.query.filter_by(cluster_group=cluster_group)
        candidates = query.all()
        normalized_full_name = None
        if full_name:
            normalized_full_name = ' '.join(full_name.split()).strip().lower()
        for patient in candidates:
            if not patient.check_password(password):
                continue
            if normalized_full_name:
                candidate_full_name = ' '.join(filter(None, [patient.first_name, patient.middle_name, patient.last_name]))
                if candidate_full_name.strip().lower() != normalized_full_name:
                    continue
            elif first_name and last_name:
                if patient.first_name.lower() != first_name.strip().lower() or patient.last_name.lower() != last_name.strip().lower():
                    continue
            return patient
        return None

    @staticmethod
    def update_patient(patient_id, data):
        patient = Patient.query.get_or_404(patient_id)
        patient.first_name = data.get('first_name', patient.first_name)
        patient.middle_name = data.get('middle_name', patient.middle_name)
        patient.last_name = data.get('last_name', patient.last_name)
        patient.date_of_birth = data.get('date_of_birth', patient.date_of_birth)
        patient.gender = data.get('gender', patient.gender)
        patient.contact_info = data.get('contact_info', patient.contact_info)
        patient.emergency_contact = data.get('emergency_contact', patient.emergency_contact)
        patient.cluster_group = data.get('cluster_group', patient.cluster_group)
        if data.get('password'):
            patient.set_password(data['password'])
        db.session.commit()
        return patient

class MedicalHistoryService:
    @staticmethod
    def add_history(patient_id, data):
        history = MedicalHistory(
            patient_id=patient_id,
            condition=data['condition'],
            diagnosis_date=data.get('diagnosis_date'),
            status=data.get('status', 'active'),
            notes=data.get('notes', ''),
        )
        db.session.add(history)
        db.session.commit()
        return history

    @staticmethod
    def get_patient_history(patient_id):
        return MedicalHistory.query.filter_by(patient_id=patient_id).all()

class VisitService:
    @staticmethod
    def create_visit(patient_id, data):
        visit = Visit(
            patient_id=patient_id,
            visit_date=data.get('visit_date'),
            reason=data['reason'],
            triage_score=data.get('triage_score'),
            doctor_id=data.get('doctor_id'),
            notes=data.get('notes', ''),
        )
        db.session.add(visit)
        db.session.commit()
        return visit

    @staticmethod
    def get_patient_visits(patient_id):
        return Visit.query.filter_by(patient_id=patient_id).order_by(Visit.visit_date.desc()).all()

class LabResultService:
    @staticmethod
    def upload_lab_result(patient_id, data):
        lab = LabResult(
            patient_id=patient_id,
            test_type=data['test_type'],
            result=data.get('result'),
            uploaded_by=data.get('uploaded_by'),
        )
        db.session.add(lab)
        db.session.commit()
        return lab

    @staticmethod
    def get_patient_labs(patient_id):
        return LabResult.query.filter_by(patient_id=patient_id).order_by(LabResult.uploaded_at.desc()).all()

class PrescriptionService:
    @staticmethod
    def create_prescription(patient_id, data):
        prescription = Prescription(
            patient_id=patient_id,
            drug_name=data['drug_name'],
            dosage=data['dosage'],
            frequency=data['frequency'],
            start_date=data['start_date'],
            end_date=data.get('end_date'),
            prescribed_by=data.get('prescribed_by'),
        )
        db.session.add(prescription)
        db.session.commit()
        return prescription

    @staticmethod
    def get_patient_prescriptions(patient_id):
        return Prescription.query.filter_by(patient_id=patient_id).all()

class NutritionService:
    @staticmethod
    def create_assessment(patient_id, data):
        assessment = NutritionAssessment(
            patient_id=patient_id,
            diet_summary=data.get('diet_summary'),
            risk_score=data.get('risk_score'),
            recommendations=data.get('recommendations'),
        )
        db.session.add(assessment)
        db.session.commit()
        return assessment

    @staticmethod
    def get_patient_assessments(patient_id):
        return NutritionAssessment.query.filter_by(patient_id=patient_id).order_by(NutritionAssessment.assessment_date.desc()).all()

class PregnancyRiskService:
    @staticmethod
    def create_risk_assessment(patient_id, data):
        risk = PregnancyRisk(
            patient_id=patient_id,
            risk_level=data['risk_level'],
            notes=data.get('notes', ''),
        )
        db.session.add(risk)
        db.session.commit()
        return risk

    @staticmethod
    def get_patient_pregnancy_risks(patient_id):
        return PregnancyRisk.query.filter_by(patient_id=patient_id).order_by(PregnancyRisk.assessment_date.desc()).all()

class UserService:
    @staticmethod
    def create_user(data):
        username = data.get('username') or data.get('email')
        user = User(
            username=username,
            name=data.get('name', username),
            email=data['email'],
            role=data.get('role', 'patient'),
            id_number=data.get('id_number'),
            registration_number=data.get('registration_number'),
            specialization=data.get('specialization'),
            patient_id=data.get('patient_id'),
        )
        user.set_password(data['password'])
        if data.get('biometric_token'):
            user.set_biometric(data['biometric_token'])
        db.session.add(user)
        db.session.commit()
        return user

    @staticmethod
    def authenticate(identifier, password, biometric_token=None):
        user = User.query.filter(
            or_(User.username == identifier, User.email == identifier, User.id_number == identifier)
        ).first()
        if user and user.check_password(password):
            if user.role in ['doctor', 'nurse']:
                if not biometric_token or not user.check_biometric(biometric_token):
                    return None
            return user
        return None

    @staticmethod
    def get_user(user_id):
        return User.query.get_or_404(user_id)

    @staticmethod
    def get_staff_users():
        return User.query.filter(User.role.in_(['doctor', 'nurse'])).order_by(User.name).all()

class ChatService:
    @staticmethod
    def create_room(data):
        room = ChatRoom(
            title=data.get('title', 'Clinical Chat Room'),
            created_by=data['created_by'],
            participants=data.get('participants', []),
        )
        db.session.add(room)
        db.session.commit()
        return room

    @staticmethod
    def get_room(room_id):
        return ChatRoom.query.get_or_404(room_id)

    @staticmethod
    def list_rooms(user_id=None):
        rooms = ChatRoom.query.order_by(ChatRoom.created_at.desc()).all()
        if user_id:
            return [room for room in rooms if user_id in (room.participants or [])]
        return rooms

    @staticmethod
    def post_message(room_id, sender_id, content, attachments=None):
        message = ChatMessage(
            room_id=room_id,
            sender_id=sender_id,
            content=content,
            attachments=attachments or [],
        )
        db.session.add(message)
        db.session.commit()
        return message

    @staticmethod
    def get_room_messages(room_id):
        return ChatMessage.query.filter_by(room_id=room_id).order_by(ChatMessage.sent_at.asc()).all()

    @staticmethod
    def add_attachment(message_id, filename, mimetype, file_path):
        attachment = ChatAttachment(
            message_id=message_id,
            filename=filename,
            mimetype=mimetype,
            file_path=file_path,
        )
        db.session.add(attachment)
        db.session.commit()
        return attachment

class DeviceService:
    @staticmethod
    def list_devices():
        return Device.query.order_by(Device.created_at.desc()).all()

    @staticmethod
    def get_device(device_id):
        return Device.query.get_or_404(device_id)

    @staticmethod
    def register_device(data):
        device = Device(
            name=data['name'],
            device_type=data.get('device_type', 'diagnostic'),
            location=data.get('location', ''),
            status=data.get('status', 'online'),
        )
        db.session.add(device)
        db.session.commit()
        return device

    @staticmethod
    def add_device_data(device_id, payload):
        device = Device.query.get_or_404(device_id)
        record = DeviceData(
            device_id=device.device_id,
            temperature=payload.get('temperature'),
            vibration=payload.get('vibration'),
            usage_hours=payload.get('usage_hours'),
            status_report=payload.get('status_report', ''),
        )
        db.session.add(record)
        device.last_seen = record.timestamp
        db.session.commit()
        return record

    @staticmethod
    def list_device_data(device_id):
        return DeviceData.query.filter_by(device_id=device_id).order_by(DeviceData.timestamp.desc()).all()

class PlatformService:
    @staticmethod
    def health_status():
        return {
            'status': 'online',
            'message': 'AIHealthIntelligencePlatform is running',
            'version': '1.0.0',
            'roles': ['admin', 'doctor', 'nurse', 'patient'],
            'endpoints': [
                '/api/auth/login',
                '/api/auth/register',
                '/api/platform/health',
                '/api/dashboard',
                '/api/triage',
                '/api/referral',
                '/api/pregnancy-risk',
                '/api/nutrition',
                '/api/diagnose',
                '/api/patients',
                '/api/devices',
                '/api/equipment/failure-prediction',
            ],
        }
