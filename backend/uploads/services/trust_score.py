def compute_trust_score(ai_confidence: float, text_similarity_score: float) -> float:
    """
    Trust score = model's confidence that the image is a real photograph.
    Clamped to [0, 1] and rounded to 4 decimal places.
    text_similarity_score is used only for categorisation; it does not affect authenticity.
    """
    raw = float(ai_confidence or 0.0)
    if ai_confidence < 0.5:
    # fake leaning
        return round(1.0 - ai_confidence, 4)

    return round(ai_confidence, 4)

def decide_status(trust_score: float) -> str:
    """
    Map confidence to a verdict label:
      >= 0.90  → REAL      (high confidence: genuine photograph)
      >= 0.65  → UNCERTAIN (borderline: route to human moderation)
      <  0.65  → AI_GEN    (high confidence: AI-generated / synthetic)
    """
    s = round(float(trust_score or 0.0), 4)
    if s >= 0.90:
        return "REAL"

    if s >= 0.65:
        return "UNCERTAIN"

    return "AI_GEN"