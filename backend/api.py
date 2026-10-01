import os
from flask import Blueprint, jsonify, request
from flask_jwt_extended import (
    create_access_token,
    get_jwt_identity,
    jwt_required,
)
from werkzeug.utils import secure_filename
from backend.models import (
    TriageModel,
    InventoryModel,
    PregnancyRiskModel,
    NutritionModel,
    DiagnosticModel,
    ReferralEngine,
    EquipmentMaintenanceModel,
)
from backend.database import db
from backend.services import (
    PatientService,
    PlatformService,
    UserService,
    DeviceService,
    MedicalHistoryService,
    VisitService,
    LabResultService,
    PrescriptionService,
    NutritionService,
    PregnancyRiskService,
    ChatService,
)

api = Blueprint('api', __name__, url_prefix='/api')

triage_model = TriageModel()
inventory_model = InventoryModel()
pregnancy_model = PregnancyRiskModel()
nutrition_model = NutritionModel()
diag_model = DiagnosticModel()
referral_engine = ReferralEngine()
maintenance_model = EquipmentMaintenanceModel()

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def current_user():
    identity = get_jwt_identity()
    return UserService.get_user(identity['user_id'])


def admin_required(user):
    if user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    return None


def staff_required(user):
    if user.role not in ['admin', 'doctor', 'nurse']:
        return jsonify({'error': 'Staff access required'}), 403
    return None


def authorize_patient_access(patient_id):
    user = current_user()
    if user.role == 'patient' and user.patient_id != patient_id:
        return jsonify({'error': 'Access denied'}), 403
    if user.role not in ['admin', 'doctor', 'nurse', 'patient']:
        return jsonify({'error': 'Access denied'}), 403
    return None


@api.route('/auth/register', methods=['POST'])
def register():
    payload = request.json or {}
    required = ['email', 'password', 'role']
    if not all(key in payload for key in required):
        return jsonify({'error': 'email, password, and role are required'}), 400
    if payload['role'] in ['doctor', 'nurse']:
        staff_required_fields = ['id_number', 'registration_number', 'specialization', 'biometric_token']
        if not all(field in payload for field in staff_required_fields):
            return jsonify({'error': 'doctor/nurse registration requires id_number, registration_number, specialization, and biometric_token'}), 400
    if payload['role'] == 'patient':
        if not payload.get('patient_id'):
            if not payload.get('first_name') or not payload.get('last_name'):
                return jsonify({'error': 'patient registration requires first_name, last_name, and cluster_group'}), 400
            patient = PatientService.create_patient({
                'first_name': payload.get('first_name'),
                'middle_name': payload.get('middle_name'),
                'last_name': payload.get('last_name'),
                'date_of_birth': payload.get('date_of_birth'),
                'gender': payload.get('gender'),
                'cluster_group': payload.get('cluster_group'),
                'contact_info': payload.get('contact_info'),
                'emergency_contact': payload.get('emergency_contact'),
                'password': payload.get('password'),
            })
            payload['patient_id'] = patient.patient_id
    user = UserService.create_user(payload)
    return jsonify(user.to_dict()), 201

@api.route('/auth/login', methods=['POST'])
def login():
    payload = request.json or {}
    identifier = payload.get('username') or payload.get('email') or payload.get('id_number')
    password = payload.get('password')
    biometric_token = payload.get('biometric_token')
    user = UserService.authenticate(identifier, password, biometric_token)
    if not user:
        return jsonify({'error': 'Invalid credentials or biometric verification failed'}), 401
    access_token = create_access_token(identity={'user_id': user.user_id, 'role': user.role})
    return jsonify({'access_token': access_token, 'user': user.to_dict()})

@api.route('/patients/login', methods=['POST'])
def patient_login():
    payload = request.json or {}
    full_name = payload.get('full_name')
    first_name = payload.get('first_name')
    last_name = payload.get('last_name')
    cluster_group = payload.get('cluster_group')
    password = payload.get('password')

    if not password or not cluster_group or not (full_name or (first_name and last_name)):
        return jsonify({'error': 'full_name or first_name+last_name, cluster_group, and password are required'}), 400

    patient = PatientService.authenticate_patient(
        full_name=full_name,
        first_name=first_name,
        last_name=last_name,
        cluster_group=cluster_group,
        password=password,
    )
    if not patient:
        return jsonify({'error': 'Invalid patient login credentials'}), 401
    return jsonify({'patient_id': patient.patient_id, 'patient': patient.to_dict()})

@api.route('/auth/me', methods=['GET'])
@jwt_required()
def profile():
    identity = get_jwt_identity()
    user = UserService.get_user(identity['user_id'])
    return jsonify(user.to_dict())

@api.route('/platform/health', methods=['GET'])
def platform_health():
    return jsonify(PlatformService.health_status())

@api.route('/platform', methods=['GET'])
def platform_info():
    return jsonify(PlatformService.health_status())

@api.route('/dashboard', methods=['GET'])
@jwt_required()
def dashboard():
    user = current_user()
    patients = PatientService.list_patients()
    recent_patients = patients[:5]
    recent_triage = []
    for p in recent_patients:
        try:
            eval_out = triage_model.evaluate_patient(p.to_dict())
            recent_triage.append({
                'patient_id': p.patient_id,
                'name': f"{p.first_name} {p.last_name}",
                'triage_level': eval_out.get('triage_level'),
                'confidence_percent': eval_out.get('confidence_percent'),
            })
        except Exception:
            continue

    common_metrics = {
        'predicted_peak_hour': triage_model.predict_peak_hour(),
        'inventory_risk': inventory_model.predict_inventory_risk(),
        'urgent_referrals': referral_engine.urgent_referral_count(),
        'pregnancy_risk_cases': pregnancy_model.sample_risk_summary(),
        'ai_metrics': {
            'triage_training': triage_model.training_metrics,
            'diagnostic_training': diag_model.training_metrics,
            'maintenance_training': maintenance_model.training_metrics,
        },
        'recent_triage_confidences': recent_triage,
    }

    if user.role == 'patient':
        patient = PatientService.get_patient(user.patient_id) if user.patient_id else None
        return jsonify({
            'role': user.role,
            'patient_summary': patient.to_dict() if patient else None,
            'active_care_clusters': patient.cluster_group if patient else None,
            'recommendation': 'Review your personalized health record and upcoming assessments.',
            **common_metrics,
        })

    return jsonify({
        'role': user.role,
        'current_waiting_patients': len(patients),
        'show_patient_clusters': sorted({p.cluster_group for p in patients if p.cluster_group}),
        **common_metrics,
    })

@api.route('/triage', methods=['POST'])
def triage():
    data = request.json or {}
    return jsonify(triage_model.evaluate_patient(data))

@api.route('/diagnose', methods=['POST'])
def diagnose():
    """Handle diagnosis with FormData file uploads (curl -F compatible)."""
    symptoms = request.form.get('symptoms', '')
    history = request.form.get('history', '')
    nutrition_data_str = request.form.get('nutrition_data', '{}')
    
    # Handle file upload
    uploaded_file = None
    if 'file' in request.files:
        file = request.files['file']
        if file and file.filename:
            filename = secure_filename(file.filename)
            file_path = os.path.join(UPLOAD_FOLDER, f"diagnosis_{filename}")
            file.save(file_path)
            uploaded_file = file_path
    
    try:
        import json
        nutrition_data = json.loads(nutrition_data_str) if nutrition_data_str else {}
    except:
        nutrition_data = {}
    
    diagnosis = diag_model.analyze(symptoms, history, uploaded_file, nutrition_data)
    return jsonify(diagnosis)

@api.route('/diagnostics', methods=['GET'])
def diagnostics_info():
    return jsonify({
        'message': 'Send symptoms, history, and optional diagnostic images to /api/diagnose for AI-powered evaluations.',
        'image_analysis': 'Enabled via file upload on /api/diagnose',
    })

@api.route('/diagnostics', methods=['POST'])
def diagnostics():
    return diagnose()

@api.route('/peak-admission-times', methods=['GET'])
def peak_admission_times():
    prediction = triage_model.predict_peak_admission_time()
    return jsonify(prediction)

@api.route('/referral', methods=['POST'])
def referral():
    data = request.json or {}
    location = data.get('location', {'lat': 0.0, 'lng': 0.0})
    severity = data.get('severity', 'moderate')
    return jsonify({
        'nearest_hospital': referral_engine.find_nearest_hospital(location),
        'alert': referral_engine.generate_emergency_alert(severity),
    })

@api.route('/pregnancy-risk', methods=['POST'])
def pregnancy_risk():
    data = request.json or {}
    return jsonify(pregnancy_model.predict_risk(data))

@api.route('/nutrition', methods=['POST'])
def nutrition():
    data = request.json or {}
    return jsonify(nutrition_model.assess_nutrition(data))

@api.route('/patients', methods=['GET'])
@jwt_required()
def list_patients():
    user = current_user()
    if user.role == 'patient':
        if not user.patient_id:
            return jsonify({'error': 'Patient account not linked to a record'}), 403
        patient = PatientService.get_patient(user.patient_id)
        return jsonify([patient.to_dict()])
    cluster_group = request.args.get('cluster_group')
    return jsonify([patient.to_dict() for patient in PatientService.list_patients(cluster_group)])

@api.route('/patients', methods=['POST'])
@jwt_required()
def create_patient():
    user = current_user()
    if user.role not in ['admin', 'doctor', 'nurse']:
        return jsonify({'error': 'Only clinical staff may create patient records'}), 403
    payload = request.json or {}
    if not payload.get('first_name') or not payload.get('last_name'):
        return jsonify({'error': 'Missing required patient fields: first_name and last_name'}), 400
    patient = PatientService.create_patient(payload)
    return jsonify(patient.to_dict()), 201

@api.route('/patients/<patient_id>', methods=['GET'])
@jwt_required()
def get_patient(patient_id):
    user = current_user()
    if user.role == 'patient' and user.patient_id != patient_id:
        return jsonify({'error': 'Access denied'}), 403
    patient = PatientService.get_patient(patient_id)
    return jsonify(patient.to_dict())

@api.route('/auth/staff', methods=['GET'])
@jwt_required()
def list_staff():
    user = current_user()
    err = admin_required(user)
    if err:
        return err
    staff = UserService.get_staff_users()
    return jsonify([member.to_dict() for member in staff])

@api.route('/auth/staff/<user_id>', methods=['GET'])
@jwt_required()
def inspect_staff(user_id):
    user = current_user()
    err = admin_required(user)
    if err:
        return err
    member = UserService.get_user(user_id)
    if member.role not in ['doctor', 'nurse']:
        return jsonify({'error': 'Requested user is not clinical staff'}), 404
    return jsonify(member.to_dict())

@api.route('/chat/rooms', methods=['POST'])
@jwt_required()
def create_chat_room():
    user = current_user()
    err = staff_required(user)
    if err:
        return err
    payload = request.json or {}
    participants = payload.get('participants', [])
    if user.user_id not in participants:
        participants.append(user.user_id)
    room = ChatService.create_room({
        'title': payload.get('title', 'Clinical Collaboration Room'),
        'created_by': user.user_id,
        'participants': participants,
    })
    return jsonify(room.to_dict()), 201

@api.route('/chat/rooms', methods=['GET'])
@jwt_required()
def list_chat_rooms():
    user = current_user()
    err = staff_required(user)
    if err:
        return err
    rooms = ChatService.list_rooms(user.user_id)
    return jsonify([room.to_dict() for room in rooms])

@api.route('/chat', methods=['GET'])
@jwt_required()
def chat_overview():
    return jsonify({
        'rooms': '/api/chat/rooms',
        'messages': '/api/chat/rooms/<room_id>/messages',
        'attachments': 'Supported via multipart/form-data upload to /api/chat/rooms/<room_id>/messages',
    })

@api.route('/chat/rooms/<room_id>', methods=['GET'])
@jwt_required()
def get_chat_room(room_id):
    user = current_user()
    err = staff_required(user)
    if err:
        return err
    room = ChatService.get_room(room_id)
    if user.user_id not in room.participants:
        return jsonify({'error': 'Access denied'}), 403
    return jsonify(room.to_dict())

@api.route('/chat/rooms/<room_id>/messages', methods=['GET'])
@jwt_required()
def get_chat_messages(room_id):
    user = current_user()
    err = staff_required(user)
    if err:
        return err
    room = ChatService.get_room(room_id)
    if user.user_id not in room.participants:
        return jsonify({'error': 'Access denied'}), 403
    messages = ChatService.get_room_messages(room_id)
    return jsonify([message.to_dict() for message in messages])

@api.route('/chat/rooms/<room_id>/messages', methods=['POST'])
@jwt_required()
def post_chat_message(room_id):
    user = current_user()
    err = staff_required(user)
    if err:
        return err
    room = ChatService.get_room(room_id)
    if user.user_id not in room.participants:
        return jsonify({'error': 'Access denied'}), 403
    content = request.form.get('content') or (request.json or {}).get('content')
    if not content:
        return jsonify({'error': 'Message content is required'}), 400
    attachments_meta = []
    files = request.files.getlist('attachments')
    message = ChatService.post_message(room_id, user.user_id, content, [])
    for upload in files:
        filename = secure_filename(upload.filename)
        file_path = os.path.join(UPLOAD_FOLDER, f"{message.message_id}_{filename}")
        upload.save(file_path)
        attachment = ChatService.add_attachment(message.message_id, filename, upload.mimetype, file_path)
        attachments_meta.append(attachment.to_dict())
    if attachments_meta:
        message.attachments = attachments_meta
        db.session.commit()
    return jsonify(message.to_dict()), 201

@api.route('/patients/<patient_id>/submit-record', methods=['POST'])
@jwt_required()
def submit_patient_record(patient_id):
    user = current_user()
    if user.role != 'nurse':
        return jsonify({'error': 'Only nurses may submit mandatory hospital record updates'}), 403
    patient = PatientService.get_patient(patient_id)
    payload = request.json or {}
    if 'reason' not in payload:
        return jsonify({'error': 'reason is required'}), 400
    visit = VisitService.create_visit(patient_id, {
        'reason': payload['reason'],
        'triage_score': payload.get('triage_score'),
        'doctor_id': payload.get('doctor_id'),
        'notes': payload.get('notes', ''),
    })
    result = {'hospital_database': visit.to_dict()}
    if payload.get('send_to_doctor') and payload.get('doctor_id'):
        doctor = UserService.get_user(payload['doctor_id'])
        room = ChatService.create_room({
            'title': f"Nurse {user.name} to Dr. {doctor.name}",
            'created_by': user.user_id,
            'participants': [user.user_id, doctor.user_id],
        })
        message_content = payload.get('doctor_message', f"Patient {patient.first_name} {patient.last_name} requires review. Reason: {payload['reason']}")
        message = ChatService.post_message(room.room_id, user.user_id, message_content, [])
        result['sent_to_doctor'] = {
            'room': room.to_dict(),
            'message': message.to_dict(),
        }
    return jsonify(result), 201

@api.route('/devices', methods=['GET'])
@jwt_required()
def list_devices():
    devices = DeviceService.list_devices()
    return jsonify([device.to_dict() for device in devices])

@api.route('/devices', methods=['POST'])
@jwt_required()
def register_device():
    payload = request.json or {}
    device = DeviceService.register_device(payload)
    return jsonify(device.to_dict()), 201

@api.route('/devices/<device_id>/data', methods=['GET'])
@jwt_required()
def device_data(device_id):
    records = DeviceService.list_device_data(device_id)
    return jsonify([record.to_dict() for record in records])

@api.route('/device-telemetry', methods=['GET'])
@jwt_required()
def list_device_telemetry():
    device_id = request.args.get('device_id')
    if device_id:
        records = DeviceService.list_device_data(device_id)
    else:
        from backend.database import DeviceData
        records = DeviceData.query.order_by(DeviceData.timestamp.desc()).all()
    return jsonify([record.to_dict() for record in records])

@api.route('/devices/<device_id>/data', methods=['POST'])
@jwt_required()
def ingest_device_data(device_id):
    payload = request.json or {}
    record = DeviceService.add_device_data(device_id, payload)
    return jsonify(record.to_dict()), 201

@api.route('/equipment/failure-prediction', methods=['POST'])
@jwt_required()
def equipment_failure():
    telemetry = request.json or {}
    prediction = maintenance_model.predict_failure(telemetry)
    return jsonify(prediction)

@api.route('/failure-prediction', methods=['POST'])
@jwt_required()
def failure_prediction():
    return equipment_failure()

@api.route('/upload-patient', methods=['POST'])
@jwt_required()
def upload_patient():
    payload = request.json or {}
    if not payload:
        return jsonify({'error': 'No patient data provided'}), 400
    patient = PatientService.create_patient(payload)
    return jsonify({
        'received': True,
        'patient_name': patient.first_name if hasattr(patient, 'first_name') else patient.name,
        'patient_id': patient.patient_id,
        'recommended_action': 'Patient record saved and queued for review',
    })

@api.route('/patients/<patient_id>/medical-history', methods=['GET'])
@jwt_required()
def get_medical_history(patient_id):
    err = authorize_patient_access(patient_id)
    if err:
        return err
    history = MedicalHistoryService.get_patient_history(patient_id)
    return jsonify([h.to_dict() for h in history])

@api.route('/patients/<patient_id>/medical-history', methods=['POST'])
@jwt_required()
def add_medical_history(patient_id):
    err = authorize_patient_access(patient_id)
    if err:
        return err
    data = request.json or {}
    if 'condition' not in data:
        return jsonify({'error': 'condition is required'}), 400
    history = MedicalHistoryService.add_history(patient_id, data)
    return jsonify(history.to_dict()), 201

@api.route('/patients/<patient_id>/visits', methods=['GET'])
@jwt_required()
def get_visits(patient_id):
    err = authorize_patient_access(patient_id)
    if err:
        return err
    visits = VisitService.get_patient_visits(patient_id)
    return jsonify([v.to_dict() for v in visits])

@api.route('/patients/<patient_id>/visits', methods=['POST'])
@jwt_required()
def create_visit(patient_id):
    err = authorize_patient_access(patient_id)
    if err:
        return err
    data = request.json or {}
    if 'reason' not in data:
        return jsonify({'error': 'reason is required'}), 400
    visit = VisitService.create_visit(patient_id, data)
    return jsonify(visit.to_dict()), 201

@api.route('/patients/<patient_id>/lab-results', methods=['GET'])
@jwt_required()
def get_lab_results(patient_id):
    err = authorize_patient_access(patient_id)
    if err:
        return err
    labs = LabResultService.get_patient_labs(patient_id)
    return jsonify([l.to_dict() for l in labs])

@api.route('/patients/<patient_id>/lab-results', methods=['POST'])
@jwt_required()
def upload_lab_result(patient_id):
    err = authorize_patient_access(patient_id)
    if err:
        return err
    data = request.json or {}
    if 'test_type' not in data:
        return jsonify({'error': 'test_type is required'}), 400
    lab = LabResultService.upload_lab_result(patient_id, data)
    return jsonify(lab.to_dict()), 201

@api.route('/patients/<patient_id>/prescriptions', methods=['GET'])
@jwt_required()
def get_prescriptions(patient_id):
    err = authorize_patient_access(patient_id)
    if err:
        return err
    prescriptions = PrescriptionService.get_patient_prescriptions(patient_id)
    return jsonify([p.to_dict() for p in prescriptions])

@api.route('/patients/<patient_id>/prescriptions', methods=['POST'])
@jwt_required()
def create_prescription(patient_id):
    err = authorize_patient_access(patient_id)
    if err:
        return err
    data = request.json or {}
    required = ['drug_name', 'dosage', 'frequency', 'start_date']
    if not all(k in data for k in required):
        return jsonify({'error': f'Required fields: {", ".join(required)}'}), 400
    prescription = PrescriptionService.create_prescription(patient_id, data)
    return jsonify(prescription.to_dict()), 201

@api.route('/patients/<patient_id>/nutrition-assessments', methods=['GET'])
@jwt_required()
def get_nutrition_assessments(patient_id):
    err = authorize_patient_access(patient_id)
    if err:
        return err
    assessments = NutritionService.get_patient_assessments(patient_id)
    return jsonify([a.to_dict() for a in assessments])

@api.route('/patients/<patient_id>/nutrition-assessments', methods=['POST'])
@jwt_required()
def create_nutrition_assessment(patient_id):
    err = authorize_patient_access(patient_id)
    if err:
        return err
    data = request.json or {}
    assessment = NutritionService.create_assessment(patient_id, data)
    return jsonify(assessment.to_dict()), 201

@api.route('/patients/<patient_id>/pregnancy-risks', methods=['GET'])
@jwt_required()
def get_pregnancy_risks(patient_id):
    err = authorize_patient_access(patient_id)
    if err:
        return err
    risks = PregnancyRiskService.get_patient_pregnancy_risks(patient_id)
    return jsonify([r.to_dict() for r in risks])

@api.route('/patients/<patient_id>/pregnancy-risks', methods=['POST'])
@jwt_required()
def create_pregnancy_risk(patient_id):
    err = authorize_patient_access(patient_id)
    if err:
        return err
    data = request.json or {}
    if 'risk_level' not in data:
        return jsonify({'error': 'risk_level is required'}), 400
    risk = PregnancyRiskService.create_risk_assessment(patient_id, data)
    return jsonify(risk.to_dict()), 201

@api.route('/patients/<patient_id>/comprehensive-diagnosis', methods=['POST'])
@jwt_required()
def comprehensive_diagnosis(patient_id):
    err = authorize_patient_access(patient_id)
    if err:
        return err
    data = request.json or {}
    symptoms = data.get('symptoms', '')
    history = data.get('history', '')
    nutrition_data = data.get('nutrition_data')
    
    diagnosis = diag_model.analyze(symptoms, history, None, nutrition_data)
    return jsonify(diagnosis)
