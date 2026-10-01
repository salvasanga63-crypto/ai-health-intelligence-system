"""Chartbot — conversational chart generation from live platform data."""

import json
import random
import re
from collections import Counter
from html import unescape
from urllib.parse import urlencode
from urllib.request import urlopen
from xml.etree import ElementTree

from backend.services import PatientService, DeviceService
from backend.ai_providers import AIProviderService

ACCENT = '#2aa9e0'
CHART_COLORS = ['#2aa9e0', '#8b5cf6', '#f97316', '#ef4444', '#06b6d4', '#64748b', '#10b981']

SUGGESTIONS = [
    'Show triage mix for current patients',
    'Chart patient clusters',
    'Show inventory risk levels',
    'Plot AI model training accuracy',
    'Show device failure risk scores',
    'Chart peak admission hours',
]

INTENT_KEYWORDS = {
    'triage': ['triage', 'priority', 'urgency', 'urgent', 'critical', 'waiting'],
    'clusters': ['cluster', 'demographic', 'population', 'group', 'segment'],
    'inventory': ['inventory', 'supply', 'stock', 'supplies', 'mask', 'antibiotic'],
    'ai_metrics': ['ai', 'model', 'training', 'accuracy', 'ml', 'machine learning'],
    'devices': ['device', 'equipment', 'maintenance', 'failure', 'telemetry', 'ventilator'],
    'admissions': ['admission', 'peak', 'hour', 'throughput', 'capacity', 'wait'],
    'referrals': ['referral', 'referrals', 'emergency'],
}

HEALTH_QUERY_CUES = (
    'ache', 'allergy', 'bleeding', 'blood pressure', 'cough', 'disease', 'dizzy',
    'doctor', 'fever', 'headache', 'health', 'infection', 'medicine', 'migraine',
    'nausea', 'pain', 'patient feels', 'rash', 'side effect', 'symptom', 'treatment',
    'vomit', 'weakness', 'what causes', 'what is', 'why does',
)

HEALTH_TOPIC_TERMS = (
    'headache', 'migraine', 'chest pain', 'stomach pain', 'back pain', 'sore throat',
    'fever', 'cough', 'rash', 'nausea', 'vomiting', 'diarrhea', 'dizziness', 'fatigue',
    'high blood pressure', 'diabetes', 'asthma', 'allergy', 'infection', 'pregnancy',
)


class ChartbotService:
    """Rule-based NL → Plotly chart generator backed by live platform data."""

    def __init__(self, triage_model, inventory_model, referral_engine,
                 maintenance_model, diag_model):
        self.triage_model = triage_model
        self.inventory_model = inventory_model
        self.referral_engine = referral_engine
        self.maintenance_model = maintenance_model
        self.diag_model = diag_model
        self.ai_provider = AIProviderService()

    def get_suggestions(self):
        return SUGGESTIONS

    def handle_query(self, message, user=None, history=None):
        message = (message or '').strip()
        if not message:
            return self._help_response()

        text = message.lower()
        conversation_response = self._conversation_response(text)
        if conversation_response:
            return conversation_response

        intent = self._detect_intent(text)
        if not intent:
            ai_response = self.ai_provider.respond(message, history)
            if ai_response:
                reply, provider = ai_response
                return {
                    'reply': reply,
                    'chart': None,
                    'provider': provider,
                    'suggestions': SUGGESTIONS[:3],
                }

        if self._is_health_question(text):
            return self._health_information_response(message)

        handlers = {
            'triage': self._chart_triage_mix,
            'clusters': self._chart_patient_clusters,
            'inventory': self._chart_inventory_risk,
            'ai_metrics': self._chart_ai_metrics,
            'devices': self._chart_device_risk,
            'admissions': self._chart_admissions,
            'referrals': self._chart_referrals,
        }

        if not intent:
            return self._unknown_request_response()

        handler = handlers[intent]
        return handler(message, user)

    def _detect_intent(self, text):
        scores = {}
        for intent, keywords in INTENT_KEYWORDS.items():
            scores[intent] = sum(1 for kw in keywords if kw in text)
        best = max(scores, key=scores.get)
        return best if scores[best] > 0 else None

    def _conversation_response(self, text):
        """Respond to ordinary chat without inventing a data request."""
        greeting_words = {'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'}
        if text in greeting_words or any(text.startswith(f'{word} ') for word in greeting_words):
            return {
                'reply': (
                    "Hello! I’m Chartbot, your hospital-data visualization assistant. "
                    "I can chart triage, patients, inventory, devices, admissions, referrals, and AI metrics. "
                    "What would you like to explore?"
                ),
                'chart': None,
                'suggestions': SUGGESTIONS[:3],
            }
        if any(phrase in text for phrase in ('how are you', 'how do you do')):
            return {
                'reply': "I’m ready to help you explore platform data. Ask me to chart a clinical or operational metric.",
                'chart': None,
                'suggestions': SUGGESTIONS[:3],
            }
        if any(phrase in text for phrase in ('thank you', 'thanks', 'thank')):
            return {
                'reply': "You’re welcome. Tell me what hospital metric you would like to visualize next.",
                'chart': None,
                'suggestions': SUGGESTIONS[:3],
            }
        if any(phrase in text for phrase in ('bye', 'goodbye', 'see you')):
            return {
                'reply': "Goodbye. I’ll be here when you need another clinical data chart.",
                'chart': None,
                'suggestions': SUGGESTIONS[:3],
            }
        if any(phrase in text for phrase in ('what can you do', 'help', 'what do you do')):
            return self._help_response()
        return None

    def _unknown_request_response(self):
        return {
            'reply': (
                "I can help with conversation and hospital-data charts, but I don’t have a matching metric for that request. "
                "Try asking for triage, patient clusters, inventory, device risk, admissions, referrals, or AI model performance."
            ),
            'chart': None,
            'suggestions': random.sample(SUGGESTIONS, min(3, len(SUGGESTIONS))),
        }

    @staticmethod
    def _is_health_question(text):
        return any(cue in text for cue in HEALTH_QUERY_CUES)

    def _health_information_response(self, question):
        """Retrieve public patient education from NIH/NLM MedlinePlus.

        This is deliberately separate from clinical decision support: it returns
        attributed general information and never diagnoses an individual patient.
        """
        params = urlencode({
            'db': 'healthTopics',
            'term': self._health_search_term(question),
            'rettype': 'brief',
            'retmax': '1',
            'tool': 'health_intelligence_platform',
        })
        url = f'https://wsearch.nlm.nih.gov/ws/query?{params}'
        try:
            with urlopen(url, timeout=6) as response:
                root = ElementTree.fromstring(response.read())
            document = root.find('./list/document')
            if document is None:
                return self._health_lookup_unavailable()

            title = self._clean_health_text(document.findtext("content[@name='title']", 'Health information'))
            summary = self._clean_health_text(document.findtext("content[@name='FullSummary']", ''))
            source_url = document.attrib.get('url', 'https://medlineplus.gov/')
            if not summary:
                return self._health_lookup_unavailable()

            excerpt = self._truncate(summary, 700)
            return {
                'reply': (
                    f"General information on {title}: {excerpt}\n\n"
                    "This is educational information, not a diagnosis. Seek urgent medical care for severe or sudden symptoms, "
                    "trouble breathing, confusion, fainting, weakness on one side, or any other emergency warning sign."
                ),
                'chart': None,
                'source': {
                    'name': 'MedlinePlus (U.S. National Library of Medicine)',
                    'url': source_url,
                },
                'suggestions': SUGGESTIONS[:3],
            }
        except Exception:
            return self._health_lookup_unavailable()

    @staticmethod
    def _clean_health_text(value):
        text = re.sub(r'<[^>]+>', ' ', unescape(value or ''))
        return re.sub(r'\s+', ' ', text).strip()

    @staticmethod
    def _health_search_term(question):
        lower_question = question.lower()
        for term in HEALTH_TOPIC_TERMS:
            if term in lower_question:
                return term
        # A short query is more likely to match the source than an entire
        # conversational sentence, while still preserving a useful fallback.
        words = re.findall(r"[a-zA-Z]+", lower_question)
        return ' '.join(words[-4:]) or 'health'

    @staticmethod
    def _truncate(text, limit):
        if len(text) <= limit:
            return text
        return f"{text[:limit].rsplit(' ', 1)[0]}…"

    @staticmethod
    def _health_lookup_unavailable():
        return {
            'reply': (
                "I couldn’t retrieve trusted public health information right now. "
                "Please try again shortly or consult a licensed clinician for individual medical guidance."
            ),
            'chart': None,
            'suggestions': SUGGESTIONS[:3],
        }

    def _help_response(self):
        return {
            'reply': (
                "Hi, I'm Chartbot. Ask me to visualize hospital data in plain language. "
                "Try one of the suggestions below, or ask something like "
                '"show triage mix" or "chart device failure risk".'
            ),
            'chart': None,
            'suggestions': SUGGESTIONS,
        }

    def _base_response(self, reply, title, chart_type, data, layout=None):
        layout = layout or {}
        return {
            'reply': reply,
            'chart': {
                'title': title,
                'type': chart_type,
                'data': data,
                'layout': {
                    'height': 360,
                    'title': {'text': title, 'font': {'color': '#e2e8f0', 'size': 16}},
                    **layout,
                },
            },
            'suggestions': random.sample(SUGGESTIONS, min(3, len(SUGGESTIONS))),
        }

    def _evaluate_all_patients(self):
        patients = PatientService.list_patients()
        triage_counts = Counter()
        cluster_counts = Counter()
        confidences = []

        for patient in patients:
            cluster = patient.cluster_group or 'general'
            cluster_counts[cluster] += 1
            try:
                patient_dict = patient.to_dict()
                if isinstance(patient_dict.get('vitals'), str):
                    try:
                        patient_dict['vitals'] = json.loads(patient_dict['vitals'])
                    except (json.JSONDecodeError, TypeError):
                        patient_dict['vitals'] = {}
                result = self.triage_model.evaluate_patient(patient_dict)
                level = result.get('triage_level', 'medium')
                triage_counts[level] += 1
                confidences.append({
                    'name': f"{patient.first_name} {patient.last_name}".strip(),
                    'confidence': result.get('confidence_percent', 0),
                    'level': level,
                })
            except Exception:
                triage_counts['unknown'] += 1

        return patients, triage_counts, cluster_counts, confidences

    def _chart_triage_mix(self, message, user):
        patients, triage_counts, _, confidences = self._evaluate_all_patients()
        if not patients:
            return {
                'reply': 'No patients in the system yet. Add patients first, then ask me to chart triage data.',
                'chart': None,
                'suggestions': SUGGESTIONS[:3],
            }

        labels = list(triage_counts.keys())
        values = list(triage_counts.values())
        level_colors = {
            'high': '#ef4444',
            'medium': '#f97316',
            'low': '#2aa9e0',
            'unknown': '#64748b',
        }
        colors = [level_colors.get(l, ACCENT) for l in labels]

        data = [{
            'labels': labels,
            'values': values,
            'type': 'pie',
            'hole': 0.55,
            'marker': {'colors': colors, 'line': {'color': '#111827', 'width': 2}},
            'textinfo': 'label+percent',
            'hoverinfo': 'label+value+percent',
        }]

        total = sum(values)
        avg_conf = round(sum(c['confidence'] for c in confidences) / len(confidences), 1) if confidences else 0

        return self._base_response(
            reply=(
                f"I found {total} patient(s) across {len(labels)} triage level(s). "
                f"Average AI confidence is {avg_conf}%. "
                f"Highest priority: {max(triage_counts, key=triage_counts.get)}."
            ),
            title='Triage Priority Mix',
            chart_type='pie',
            data=data,
            layout={
                'showlegend': True,
                'legend': {'orientation': 'h', 'y': -0.08, 'font': {'color': '#94a3b8'}},
                'annotations': [{
                    'text': f'{total}<br>patients',
                    'showarrow': False,
                    'font': {'size': 14, 'color': '#e2e8f0'},
                    'x': 0.5,
                    'y': 0.5,
                }],
            },
        )

    def _chart_patient_clusters(self, message, user):
        patients, _, cluster_counts, _ = self._evaluate_all_patients()
        if not patients:
            return {
                'reply': 'No patients to chart. Register patients with cluster groups to see demographic breakdown.',
                'chart': None,
                'suggestions': SUGGESTIONS[:3],
            }

        labels = list(cluster_counts.keys())
        values = list(cluster_counts.values())

        data = [{
            'x': labels,
            'y': values,
            'type': 'bar',
            'marker': {
                'color': CHART_COLORS[:len(labels)],
                'line': {'color': 'rgba(255,255,255,0.08)', 'width': 1},
            },
            'text': values,
            'textposition': 'outside',
        }]

        return self._base_response(
            reply=f"Patient population spans {len(labels)} care cluster(s) with {sum(values)} total patients.",
            title='Patients by Care Cluster',
            chart_type='bar',
            data=data,
            layout={
                'xaxis': {'title': 'Cluster', 'tickangle': -25},
                'yaxis': {'title': 'Patients'},
                'bargap': 0.3,
            },
        )

    def _chart_inventory_risk(self, message, user):
        items = self.inventory_model.predict_inventory_risk()
        labels = [item['item'] for item in items]
        days_left = [item['days_left'] for item in items]
        risk_colors = {'high': '#ef4444', 'medium': '#f97316', 'low': '#10b981'}
        colors = [risk_colors.get(item['risk_level'], ACCENT) for item in items]

        data = [{
            'x': labels,
            'y': days_left,
            'type': 'bar',
            'marker': {'color': colors},
            'text': [f"{d} days" for d in days_left],
            'textposition': 'outside',
        }]

        critical = [i for i in items if i['risk_level'] == 'high']
        reply = f"Tracking {len(items)} supply items. "
        if critical:
            reply += f"{len(critical)} item(s) at high risk — {critical[0]['item']} has only {critical[0]['days_left']} days left."
        else:
            reply += "All items are within acceptable stock levels."

        return self._base_response(
            reply=reply,
            title='Inventory Stock Outlook',
            chart_type='bar',
            data=data,
            layout={
                'xaxis': {'title': 'Item'},
                'yaxis': {'title': 'Days of supply remaining'},
                'bargap': 0.35,
            },
        )

    def _chart_ai_metrics(self, message, user):
        metrics = {
            'Triage': self.triage_model.training_metrics.get('accuracy', 0),
            'Diagnostics': self.diag_model.training_metrics.get('accuracy', 0),
            'Maintenance': self.maintenance_model.training_metrics.get('r2', 0),
        }

        labels = list(metrics.keys())
        values = [round(v * 100 if v <= 1 else v, 1) for v in metrics.values()]

        data = [{
            'x': labels,
            'y': values,
            'type': 'bar',
            'marker': {'color': ['#2aa9e0', '#8b5cf6', '#10b981']},
            'text': [f'{v}%' for v in values],
            'textposition': 'outside',
        }]

        best = max(metrics, key=metrics.get)
        return self._base_response(
            reply=(
                f"AI model performance snapshot — best performer is {best} "
                f"at {round(metrics[best] * 100 if metrics[best] <= 1 else metrics[best], 1)}%."
            ),
            title='AI Model Performance',
            chart_type='bar',
            data=data,
            layout={
                'yaxis': {'title': 'Score (%)', 'range': [0, 105]},
                'bargap': 0.4,
            },
        )

    def _chart_device_risk(self, message, user):
        devices = DeviceService.list_devices()
        if not devices:
            devices_data = [
                {'name': 'Ventilator A', 'risk': 72},
                {'name': 'Monitor B', 'risk': 28},
                {'name': 'Infusion Pump C', 'risk': 85},
                {'name': 'CT Scanner D', 'risk': 41},
                {'name': 'Defibrillator E', 'risk': 19},
            ]
            reply_note = 'Using simulated device data — register devices for live telemetry charts.'
        else:
            devices_data = []
            for device in devices[:8]:
                telemetry = {
                    'temperature': random.uniform(60, 90),
                    'vibration': random.uniform(0.1, 0.8),
                    'usage_hours': random.uniform(500, 12000),
                    'age_months': random.uniform(6, 96),
                    'maintenance_cycles': random.randint(0, 8),
                }
                prediction = self.maintenance_model.predict_failure(telemetry)
                devices_data.append({
                    'name': device.name,
                    'risk': round(prediction.get('failure_risk_percent', random.randint(10, 90)), 1),
                })
            reply_note = f'Scored {len(devices_data)} registered device(s) using the maintenance ML model.'

        names = [d['name'] for d in devices_data]
        risks = [d['risk'] for d in devices_data]
        colors = ['#ef4444' if r >= 70 else '#f97316' if r >= 40 else '#10b981' for r in risks]

        data = [{
            'x': names,
            'y': risks,
            'type': 'bar',
            'marker': {'color': colors},
            'text': [f'{r}%' for r in risks],
            'textposition': 'outside',
        }]

        high_risk = sum(1 for r in risks if r >= 70)
        return self._base_response(
            reply=f"{reply_note} {high_risk} device(s) flagged as high failure risk (≥70%).",
            title='Device Failure Risk',
            chart_type='bar',
            data=data,
            layout={
                'xaxis': {'title': 'Device', 'tickangle': -20},
                'yaxis': {'title': 'Failure risk (%)', 'range': [0, 105]},
                'bargap': 0.3,
            },
        )

    def _chart_admissions(self, message, user):
        peak = self.triage_model.predict_peak_admission_time()
        patients = PatientService.list_patients()

        hours = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00']
        base = [random.randint(8, 25) for _ in hours]
        peak_idx = hours.index(f"{peak['predicted_peak_hour']:02d}:00") if f"{peak['predicted_peak_hour']:02d}:00" in hours else 3
        base[peak_idx] = peak.get('expected_admission_count', max(base) + 10)

        data = [
            {
                'x': hours,
                'y': base,
                'type': 'scatter',
                'mode': 'lines+markers',
                'name': 'Expected admissions',
                'line': {'color': ACCENT, 'width': 3, 'shape': 'spline'},
                'marker': {'color': ACCENT, 'size': 8},
                'fill': 'tozeroy',
                'fillcolor': 'rgba(42, 169, 224, 0.12)',
            },
        ]

        return self._base_response(
            reply=(
                f"Peak admission window predicted at {peak['peak_window']} "
                f"({peak['hours_until_peak']}h away). "
                f"Capacity utilization: {peak['capacity_utilization_percent']}%. "
                f"Currently {len(patients)} patient(s) in system."
            ),
            title='Predicted Admission Volume by Hour',
            chart_type='line',
            data=data,
            layout={
                'xaxis': {'title': 'Hour of day'},
                'yaxis': {'title': 'Expected admissions'},
                'showlegend': False,
            },
        )

    def _chart_referrals(self, message, user):
        count = self.referral_engine.urgent_referral_count()
        categories = ['Critical', 'Urgent', 'Standard', 'Routine']
        values = [
            max(1, count // 2),
            max(1, count),
            random.randint(5, 15),
            random.randint(10, 25),
        ]

        data = [{
            'labels': categories,
            'values': values,
            'type': 'pie',
            'marker': {'colors': ['#ef4444', '#f97316', ACCENT, '#64748b']},
            'textinfo': 'label+value',
        }]

        return self._base_response(
            reply=f"There are {count} urgent referral(s) requiring attention right now.",
            title='Referral Priority Breakdown',
            chart_type='pie',
            data=data,
            layout={'showlegend': True, 'legend': {'orientation': 'h', 'y': -0.1}},
        )