from django.test import TestCase
from uploads.services.trust_score import decide_status, compute_trust_score


class TrustScoreTests(TestCase):
    def test_thresholds(self):
        self.assertEqual(decide_status(0.80), "REAL")
        self.assertEqual(decide_status(0.7999), "SUSPICIOUS")
        self.assertEqual(decide_status(0.55), "SUSPICIOUS")
        self.assertEqual(decide_status(0.5499), "FAKE")

    def test_compute_trust_score_ignores_text_similarity(self):
        self.assertEqual(compute_trust_score(0.6, 0.0), 0.6)
        self.assertEqual(compute_trust_score(0.6, 1.0), 0.6)