from dataclasses import dataclass
from typing import Dict, List
import math
import re
from collections import Counter


@dataclass
class TextAnalysisResult:
    category: str
    similarity_score: float
    per_category_scores: Dict[str, float]


def _tokenize(text: str) -> List[str]:
    text = (text or "").lower()
    # keep words and numbers; remove emojis/punct
    return re.findall(r"[a-z0-9]+", text)


def _tf(tokens: List[str]) -> Dict[str, float]:
    if not tokens:
        return {}
    counts = Counter(tokens)
    total = float(len(tokens))
    return {t: c / total for t, c in counts.items()}


def _idf(docs: List[List[str]]) -> Dict[str, float]:
    """
    Smooth IDF:
      idf(t) = log((N+1)/(df+1)) + 1
    """
    N = len(docs)
    df = Counter()
    for tokens in docs:
        for t in set(tokens):
            df[t] += 1
    return {t: (math.log((N + 1.0) / (df_t + 1.0)) + 1.0) for t, df_t in df.items()}


def _tfidf(tokens: List[str], idf: Dict[str, float]) -> Dict[str, float]:
    tf = _tf(tokens)
    return {t: tf[t] * idf.get(t, 0.0) for t in tf.keys()}


def _dot(a: Dict[str, float], b: Dict[str, float]) -> float:
    # iterate smaller dict for speed
    if len(a) > len(b):
        a, b = b, a
    return sum(v * b.get(k, 0.0) for k, v in a.items())


def _norm(a: Dict[str, float]) -> float:
    return math.sqrt(sum(v * v for v in a.values()))


def cosine_similarity(a: Dict[str, float], b: Dict[str, float]) -> float:
    na = _norm(a)
    nb = _norm(b)
    if na == 0.0 or nb == 0.0:
        return 0.0
    return _dot(a, b) / (na * nb)


# Simple keyword “documents” per category 
CATEGORY_KEYWORDS: Dict[str, List[str]] = {
    "Politics": [
        "government", "minister", "president", "election", "parliament", "policy",
        "law", "senate", "congress", "vote", "party", "campaign", "diplomacy",
    ],
    "Business": [
        "market", "stock", "company", "ceo", "profit", "loss", "revenue", "shares",
        "invest", "economy", "inflation", "bank", "crypto",
    ],
    "Technology": [
        "ai", "model", "software", "hardware", "chip", "device", "security",
        "internet", "app", "startup", "cloud", "database",
    ],
    "Health": [
        "health", "hospital", "doctor", "disease", "virus", "vaccine", "medicine",
        "patient", "mental", "fitness",
    ],
    "Sports": [
        "match", "goal", "team", "player", "coach", "league", "tournament",
        "win", "lose", "score", "barcelona", "football",
    ],
    "Entertainment": [
        "movie", "music", "actor", "actress", "show", "celebrity", "fashion",
        "award", "concert", "festival",
    ],
}


def categorize_news_text(text: str) -> TextAnalysisResult:
    text_tokens = _tokenize(text)

    category_docs = {cat: _tokenize(" ".join(words)) for cat, words in CATEGORY_KEYWORDS.items()}

    # Build IDF over: [user_text] + [each category doc]
    all_docs = [text_tokens] + list(category_docs.values())
    idf = _idf(all_docs)

    text_vec = _tfidf(text_tokens, idf)

    scores: Dict[str, float] = {}
    for cat, tokens in category_docs.items():
        cat_vec = _tfidf(tokens, idf)
        scores[cat] = float(cosine_similarity(text_vec, cat_vec))

    best_cat, best_score = max(scores.items(), key=lambda kv: kv[1])
    best_score = float(best_score)

    # If nothing matches meaningfully, avoid random category labels
    if best_score < 0.01:
        return TextAnalysisResult(
            category="Other",
            similarity_score=round(best_score, 4),
            per_category_scores={k: round(v, 4) for k, v in scores.items()},
        )

    return TextAnalysisResult(
        category=best_cat,
        similarity_score=round(best_score, 4),
        per_category_scores={k: round(v, 4) for k, v in scores.items()},
    )