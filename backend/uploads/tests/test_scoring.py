from django.test import TestCase
from uploads.services.trust_score import decide_status, compute_trust_score


class TrustScoreTests(TestCase):
    def test_thresholds(self):
        self.assertEqual(decide_status(0.80), "REAL")
        self.assertEqual(decide_status(0.7999), "UNCERTAIN")
        self.assertEqual(decide_status(0.55), "UNCERTAIN")
        self.assertEqual(decide_status(0.5499), "AI_GEN")

    def test_compute_trust_score_ignores_text_similarity(self):
        self.assertEqual(compute_trust_score(0.6, 0.0), 0.6)
        self.assertEqual(compute_trust_score(0.6, 1.0), 0.6)

    def test_boundary_exact(self):
        self.assertEqual(decide_status(0.0), "AI_GEN")
        self.assertEqual(decide_status(1.0), "REAL")
