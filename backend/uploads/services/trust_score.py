def compute_trust_score(ai_confidence: float, text_similarity_score: float) -> float:
    """
    Trust score = probability that image is REAL.
    Must remain consistent (no inversion).
    """
    score = float(ai_confidence or 0.0)
    return round(max(0.0, min(1.0, score)), 4)

def decide_status(trust_score: float) -> str:
    s = float(trust_score or 0.0)

    if s >= 0.90:
        return "REAL"
    elif s >= 0.65:
        return "UNCERTAIN"
    else:
        return "AI_GEN"