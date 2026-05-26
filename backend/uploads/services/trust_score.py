def compute_trust_score(ai_confidence: float, text_similarity_score: float) -> float:
    """
    The trust score is the raw model confidence that the image is a real photograph.
    text_similarity_score is used only for categorisation and has no effect here.
    """
    ai_conf = float(ai_confidence or 0.0)
    return max(0.0, min(1.0, round(ai_conf, 4)))


def decide_status(trust_score: float) -> str:
    """
    Map a confidence score to a status label.
      REAL     — model is ≥80% confident the image is a real photograph
      UNCERTAIN — 55–80%; sent to human moderation
      AI_GEN   — <55%; model is confident the image is AI-generated / synthetic
    """
    s = float(trust_score or 0.0)
    if s >= 0.80:
        return "REAL"
    if s >= 0.55:
        return "UNCERTAIN"
    return "AI_GEN"
