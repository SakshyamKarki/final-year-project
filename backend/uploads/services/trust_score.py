def compute_trust_score(ai_confidence: float, text_similarity_score: float) -> float:
    # text_similarity_score is for categorization only, not authenticity
    ai_conf = float(ai_confidence or 0.0)
    return max(0.0, min(1.0, round(ai_conf, 4)))


def decide_status(trust_score: float) -> str:
    s = float(trust_score or 0.0)
    if s >= 0.80:
        return "REAL"
    if s >= 0.55:
        return "SUSPICIOUS"
    return "FAKE"