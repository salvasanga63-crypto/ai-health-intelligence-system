import unittest
import datetime
import json
from unittest.mock import patch

from backend.app import create_app
from backend.ai_providers import AIProviderService
from backend.database import db
from backend.services import PatientService


class ChartbotTest(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()
        with self.app.app_context():
            db.create_all()

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    def test_suggestions_endpoint(self):
        resp = self.client.get('/api/chartbot/suggestions')
        self.assertEqual(resp.status_code, 200)
        data = resp.get_json()
        self.assertIn('suggestions', data)
        self.assertGreater(len(data['suggestions']), 0)

    def test_provider_status_does_not_expose_api_keys(self):
        with patch.dict('os.environ', {
            'OPENAI_API_KEY': 'secret',
            'AI_PROVIDER_ORDER': 'openai,gemini,deepseek',
        }, clear=True):
            resp = self.client.get('/api/chartbot/providers')

        self.assertEqual(resp.status_code, 200)
        data = resp.get_json()
        self.assertEqual(data['order'], ['openai'])
        self.assertNotIn('secret', json.dumps(data))

    def test_provider_order_supports_legacy_single_provider_setting(self):
        with patch.dict('os.environ', {
            'AI_PROVIDER': 'deepseek',
            'DEEPSEEK_API_KEY': 'secret',
        }, clear=True):
            self.assertEqual(
                AIProviderService().configured_providers(),
                ['deepseek'],
            )

    def test_query_returns_chart_for_triage(self):
        with self.app.app_context():
            PatientService.create_patient({
                'first_name': 'Chart',
                'last_name': 'Test',
                'gender': 'Female',
                'date_of_birth': datetime.date(1990, 5, 5),
                'cluster_group': 'women',
                'vitals': json.dumps({'heart_rate': 95, 'oxygen_saturation': 92}),
            })

        resp = self.client.post(
            '/api/chartbot/query',
            json={'message': 'show triage mix'},
            content_type='application/json',
        )
        self.assertEqual(resp.status_code, 200)
        data = resp.get_json()
        self.assertIn('reply', data)
        self.assertIn('chart', data)
        self.assertIsNotNone(data['chart'])
        self.assertIn('data', data['chart'])
        self.assertEqual(data['chart']['type'], 'pie')

    def test_empty_query_returns_help(self):
        resp = self.client.post(
            '/api/chartbot/query',
            json={'message': ''},
            content_type='application/json',
        )
        self.assertEqual(resp.status_code, 200)
        data = resp.get_json()
        self.assertIn('reply', data)
        self.assertIsNone(data['chart'])

    def test_greeting_returns_conversation_without_chart(self):
        resp = self.client.post('/api/chartbot/query', json={'message': 'hello'})
        self.assertEqual(resp.status_code, 200)
        data = resp.get_json()
        self.assertIn('Hello', data['reply'])
        self.assertIsNone(data['chart'])

    def test_unknown_request_does_not_default_to_triage(self):
        resp = self.client.post('/api/chartbot/query', json={'message': 'Tell me a joke'})
        self.assertEqual(resp.status_code, 200)
        data = resp.get_json()
        self.assertIn("don’t have a matching metric", data['reply'])
        self.assertIsNone(data['chart'])


if __name__ == '__main__':
    unittest.main()
