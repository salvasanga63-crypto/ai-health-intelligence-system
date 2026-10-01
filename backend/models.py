import random
import math
from datetime import datetime
from io import BytesIO
from PIL import Image
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, mean_squared_error

class TriageModel:
    def __init__(self):
        self.cluster_encoder = LabelEncoder()
        self.triage_encoder = LabelEncoder()
        self.model = None
        self.training_metrics = {}
        self._train_model()

    def _generate_training_data(self, n_samples=1200):
        rows = []
        for _ in range(n_samples):
            age = random.randint(1, 90)
            symptom_count = random.randint(0, 8)
            heart_rate = random.randint(55, 140)
            oxygen = random.randint(85, 100)
            chronic_conditions = random.randint(0, 3)
            cluster_factor = random.choice(['women', 'men', 'elders', 'children under 5', 'children 5-17', 'pregnant/expectant mothers', 'lactating mothers', 'general patients'])
            score = symptom_count * 5
            score += 10 if age > 65 else 0
            score += 15 if heart_rate > 110 else 0
            score += 15 if oxygen < 94 else 0
            score += 10 * chronic_conditions
            if cluster_factor in ['elders', 'pregnant/expectant mothers', 'children under 5']:
                score += 5
            triage_level = 'low'
            if score > 45:
                triage_level = 'high'
            elif score > 25:
                triage_level = 'medium'
            rows.append({
                'age': age,
                'symptom_count': symptom_count,
                'heart_rate': heart_rate,
                'oxygen': oxygen,
                'chronic_conditions': chronic_conditions,
                'cluster_factor': cluster_factor,
                'triage_level': triage_level,
            })
        return pd.DataFrame(rows)

    def _train_model(self):
        df = self._generate_training_data()
        df['cluster_code'] = self.cluster_encoder.fit_transform(df['cluster_factor'])
        features = ['age', 'symptom_count', 'heart_rate', 'oxygen', 'chronic_conditions', 'cluster_code']
        X = df[features]
        y = df['triage_level']
        y_encoded = self.triage_encoder.fit_transform(y)
        X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.2, random_state=42)
        self.model = RandomForestClassifier(n_estimators=200, random_state=42)
        self.model.fit(X_train, y_train)
        y_pred = self.model.predict(X_test)
        self.training_metrics = {
            'accuracy': round(accuracy_score(y_test, y_pred), 3),
            'mse': round(mean_squared_error(y_test, y_pred), 3),
        }

    def predict_peak_hour(self):
        return random.choice(['08:00-10:00', '12:00-14:00', '18:00-20:00'])
    
    def predict_peak_admission_time(self):
        current_hour = datetime.now().hour
        peak_hours = [8, 12, 18]
        peak_probabilities = [0.35, 0.30, 0.35]
        predicted_peak = random.choices(peak_hours, weights=peak_probabilities, k=1)[0]
        next_peak = (predicted_peak - current_hour) % 24
        return {
            'predicted_peak_hour': predicted_peak,
            'hours_until_peak': next_peak,
            'peak_window': f'{predicted_peak:02d}:00-{(predicted_peak+2) % 24:02d}:00',
            'expected_admission_count': random.randint(20, 50),
            'capacity_utilization_percent': random.randint(65, 95),
        }

    def evaluate_patient(self, patient):
        symptoms = patient.get('symptoms', [])
        symptom_count = len(symptoms) if isinstance(symptoms, list) else len(str(symptoms).split(','))
        age = patient.get('age', 40)
        vitals = patient.get('vitals', {}) or {}
        heart_rate = vitals.get('heart_rate', 80)
        oxygen = vitals.get('oxygen_saturation', 98)
        history_value = patient.get('history', [])
        chronic_conditions = len(history_value) if isinstance(history_value, list) else 0
        cluster_factor = patient.get('cluster_group', 'general patients')
        cluster_code = self.cluster_encoder.transform([cluster_factor])[0] if cluster_factor in self.cluster_encoder.classes_ else 0
        feature_names = ['age', 'symptom_count', 'heart_rate', 'oxygen', 'chronic_conditions', 'cluster_code']
        features = pd.DataFrame([[age, symptom_count, heart_rate, oxygen, chronic_conditions, cluster_code]], columns=feature_names)
        if self.model is None:
            triage_level = 'medium'
            confidence = 65.0
        else:
            prediction = self.model.predict(features)[0]
            proba = self.model.predict_proba(features)[0]
            triage_level = self.triage_encoder.inverse_transform([prediction])[0]
            confidence = round(float(max(proba) * 100), 1)
        wait_time = max(5, 60 - symptom_count * 4)
        peak_prediction = self.predict_peak_admission_time()
        recommendations = {
            'low': 'Standard monitoring and routine care.',
            'medium': 'Assign to fast-track triage and monitor closely.',
            'high': 'Immediate clinical assessment and urgent bed allocation.',
        }
        return {
            'urgency_score': symptom_count * 5 + (10 if age > 65 else 0),
            'triage_level': triage_level,
            'confidence_percent': confidence,
            'estimated_wait_minutes': wait_time,
            'recommendation': recommendations.get(triage_level, 'Monitor and re-evaluate frequently.'),
            'peak_admission_prediction': peak_prediction,
            'training_metrics': self.training_metrics,
        }

class InventoryModel:
    def predict_inventory_risk(self):
        levels = [
            {'item': 'Oxygen masks', 'risk_level': 'medium', 'days_left': 18},
            {'item': 'Antibiotics', 'risk_level': 'high', 'days_left': 6},
            {'item': 'Insulin', 'risk_level': 'low', 'days_left': 24},
        ]
        return levels

class PregnancyRiskModel:
    def predict_risk(self, data):
        score = 0
        age = data.get('age', 25)
        bmi = data.get('bmi', 24)
        history = data.get('history', [])

        score += 10 if age > 35 else 0
        score += 15 if bmi > 30 else 0
        score += 20 if 'hypertension' in history else 0
        score += 15 if 'diabetes' in history else 0

        level = 'Low'
        if score >= 35:
            level = 'High'
        elif score >= 20:
            level = 'Moderate'

        return {
            'risk_score': score,
            'risk_level': level,
            'advice': self.recommendation(level),
        }

    def recommendation(self, level):
        if level == 'High':
            return 'Refer for specialist care and increase monitoring frequency.'
        if level == 'Moderate':
            return 'Schedule follow-up and review lifestyle factors.'
        return 'Continue routine antenatal care.'

    def sample_risk_summary(self):
        return {
            'high_risk': 4,
            'moderate_risk': 11,
            'low_risk': 29,
        }

class NutritionModel:
    def assess_nutrition(self, data):
        logs = data.get('food_log', [])
        hydration = data.get('water_intake_liters', 1.2)
        calories = sum(item.get('calories', 0) for item in logs)

        advice = []
        if calories < 1600:
            advice.append('Increase balanced calories with protein-rich meals.')
        if calories > 2800:
            advice.append('Reduce processed carbohydrates and watch portion sizes.')
        if hydration < 2.0:
            advice.append('Increase water intake to at least 2 liters per day.')
        if not advice:
            advice.append('Nutrition looks balanced. Keep tracking daily intake.')

        return {
            'total_calories': calories,
            'hydration_liters': hydration,
            'recommendations': advice,
        }

class ReferralEngine:
    def find_nearest_hospital(self, location):
        hospitals = [
            {'name': 'Central City Hospital', 'distance_km': 2.1, 'capacity': 'available'},
            {'name': 'Northside Medical Center', 'distance_km': 4.8, 'capacity': 'busy'},
            {'name': 'East Health Clinic', 'distance_km': 6.2, 'capacity': 'available'},
        ]
        return sorted(hospitals, key=lambda x: x['distance_km'])[0]

    def generate_emergency_alert(self, severity):
        if severity.lower() in ['critical', 'severe']:
            return 'EMERGENCY REFERRAL: Activate ambulance alert and prioritize this patient.'
        return 'Standard referral: contact the nearest hospital and share patient details.'

    def urgent_referral_count(self):
        return random.randint(1, 6)

class EquipmentMaintenanceModel:
    def __init__(self):
        self.model = None
        self._train_model()

    def _generate_telemetry_data(self, n=1000):
        data = []
        for _ in range(n):
            temperature = random.uniform(55, 95)
            vibration = random.uniform(0.05, 1.2)
            usage_hours = random.uniform(50, 15000)
            age_months = random.uniform(1, 120)
            maintenance_cycles = random.randint(0, 10)
            failure_risk = (
                max(0, temperature - 70) * 0.7 +
                max(0, vibration - 0.3) * 50 +
                min(30, usage_hours / 400) +
                min(20, age_months / 6) +
                maintenance_cycles * 2
            )
            failure_risk = min(100, failure_risk + random.uniform(-5, 5))
            data.append({
                'temperature': temperature,
                'vibration': vibration,
                'usage_hours': usage_hours,
                'age_months': age_months,
                'maintenance_cycles': maintenance_cycles,
                'failure_risk': failure_risk,
            })
        return pd.DataFrame(data)

    def _train_model(self):
        df = self._generate_telemetry_data()
        features = ['temperature', 'vibration', 'usage_hours', 'age_months', 'maintenance_cycles']
        X = df[features]
        y = df['failure_risk']
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        self.model = RandomForestRegressor(n_estimators=150, random_state=42)
        self.model.fit(X_train, y_train)
        predicted = self.model.predict(X_test)
        self.training_metrics = {
            'rmse': float(round(np.sqrt(mean_squared_error(y_test, predicted)), 2)),
            'r2': float(round(self.model.score(X_test, y_test), 3)),
        }

    def _troubleshooting_methods(self, telemetry):
        tips = []
        if telemetry.get('temperature', 0) > 80:
            tips.append('Check cooling system and airflow; clean vents and filters.')
        if telemetry.get('vibration', 0) > 0.5:
            tips.append('Inspect bearings and rotating assemblies for wear.')
        if telemetry.get('usage_hours', 0) > 8000:
            tips.append('Review maintenance logs and plan component replacement.')
        if telemetry.get('age_months', 0) > 60:
            tips.append('Perform a full equipment audit and check for outdated firmware.')
        if not tips:
            tips.append('Equipment appears stable; continue scheduled preventive maintenance.')
        return tips

    def predict_failure(self, telemetry):
        if self.model is None:
            return {
                'failure_risk_percent': 0.0,
                'recommendation': 'Insufficient model data to predict failure risk.',
                'troubleshooting_tips': ['Gather more telemetry data.'],
            }
        features = pd.DataFrame([{
            'temperature': telemetry.get('temperature', 70),
            'vibration': telemetry.get('vibration', 0.2),
            'usage_hours': telemetry.get('usage_hours', 0),
            'age_months': telemetry.get('age_months', 0),
            'maintenance_cycles': telemetry.get('maintenance_cycles', 0),
        }])
        risk = float(self.model.predict(features)[0])
        risk = min(100.0, max(0.0, risk))
        recommendation = 'Continue regular maintenance and monitor telemetry.'
        if risk > 70:
            recommendation = 'Schedule immediate maintenance and inspect machine components.'
        elif risk > 40:
            recommendation = 'Increase monitoring frequency and prepare for a service window.'
        return {
            'failure_risk_percent': round(risk, 1),
            'recommendation': recommendation,
            'troubleshooting_tips': self._troubleshooting_methods(telemetry),
            'training_metrics': self.training_metrics,
        }

class DiagnosticModel:
    def __init__(self):
        self.model = None
        self.encoder = LabelEncoder()
        self._train_model()

    def _generate_training_data(self, n_samples=1200):
        data = []
        for _ in range(n_samples):
            symptom_count = random.randint(0, 8)
            history_count = random.randint(0, 4)
            image_score = random.randint(0, 20)
            nutrition_score = random.randint(0, 15)
            severity = symptom_count * 4 + history_count * 3 + image_score + nutrition_score
            if severity > 50:
                label = 'severe infection'
            elif severity > 30:
                label = 'moderate infection'
            else:
                label = 'mild condition'
            data.append({
                'symptom_count': symptom_count,
                'history_count': history_count,
                'image_score': image_score,
                'nutrition_score': nutrition_score,
                'label': label,
            })
        return pd.DataFrame(data)

    def _train_model(self):
        df = self._generate_training_data()
        features = ['symptom_count', 'history_count', 'image_score', 'nutrition_score']
        X = df[features]
        y = self.encoder.fit_transform(df['label'])
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        self.model = RandomForestClassifier(n_estimators=200, random_state=42)
        self.model.fit(X_train, y_train)
        y_pred = self.model.predict(X_test)
        self.training_metrics = {
            'accuracy': round(accuracy_score(y_test, y_pred), 3),
        }

    def analyze(self, symptoms, history, image_file=None, nutrition_data=None):
        image_score = self._analyze_image(image_file)
        symptom_count = len(symptoms.split(',')) if symptoms else 0
        history_count = len(history.split(',')) if history else 0
        nutrition_score = self._analyze_nutrition(nutrition_data) if nutrition_data else 0
        feature_names = ['symptom_count', 'history_count', 'image_score', 'nutrition_score']
        features = pd.DataFrame([[symptom_count, history_count, image_score, nutrition_score]], columns=feature_names)
        if self.model is None:
            predicted_label = 'mild condition'
            confidence = 55.0
        else:
            prediction = self.model.predict(features)[0]
            proba = self.model.predict_proba(features)[0]
            predicted_label = self.encoder.inverse_transform([prediction])[0]
            confidence = round(float(max(proba) * 100), 1)
        recommendations = {
            'severe infection': 'Recommend immediate clinical review, imaging, and inpatient monitoring.',
            'moderate infection': 'Recommend lab tests, medication review, and close follow-up.',
            'mild condition': 'Recommend outpatient care and next-day reassessment.',
        }
        troubleshooting = 'If unclear, escalate to specialist review or order additional lab tests.'
        return {
            'symptom_analysis': symptoms,
            'history_analysis': history,
            'image_analysis_score': image_score,
            'nutrition_analysis_score': nutrition_score,
            'diagnosis_suggestion': predicted_label,
            'confidence_percent': confidence,
            'next_steps': recommendations.get(predicted_label, troubleshooting),
            'training_metrics': self.training_metrics,
        }

    def _analyze_image(self, image_file):
        if not image_file:
            return 6
        try:
            image = Image.open(BytesIO(image_file.read())).convert('L')
            pixels = list(image.getdata())
            avg_brightness = sum(pixels) / len(pixels)
            return 18 if avg_brightness < 70 else 10 if avg_brightness < 140 else 6
        except Exception:
            return 8

    def _analyze_nutrition(self, nutrition_data):
        if not nutrition_data:
            return 0
        score = 0
        if nutrition_data.get('bmi', 0) > 30:
            score += 5
        if nutrition_data.get('daily_calories', 0) > 2800:
            score += 4
        if nutrition_data.get('water_intake', 0) < 2.0:
            score += 3
        return min(20, score)
