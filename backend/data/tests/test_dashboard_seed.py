import unittest
import datetime
import json

from backend.app import create_app
from backend.database import db
from backend.services import PatientService


class DashboardSeedTest(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()
        with self.app.app_context():
            db.create_all()

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    def test_dashboard_includes_ai_metrics(self):
        samples = [
            {'first_name': 'TestA', 'last_name': 'One', 'gender': 'Female', 'date_of_birth': datetime.date(1985, 1, 1), 'cluster_group': 'women', 'vitals': json.dumps({'heart_rate': 88, 'oxygen_saturation': 96})},
            {'first_name': 'TestB', 'last_name': 'Two', 'gender': 'Male', 'date_of_birth': datetime.date(1970, 2, 2), 'cluster_group': 'men', 'vitals': json.dumps({'heart_rate': 102, 'oxygen_saturation': 94})},
        ]

        with self.app.app_context():
            for p in samples:
                PatientService.create_patient(p)

            resp = self.client.get('/api/dashboard')
            self.assertEqual(resp.status_code, 200)
            data = resp.get_json()
            self.assertIsInstance(data, dict)
            self.assertIn('ai_metrics', data)
            self.assertIn('recent_triage_confidences', data)


if __name__ == '__main__':
    unittest.main()
