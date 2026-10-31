/**
 * TF-IDF and Cosine Similarity Engine (TypeScript).
 * Implements smooth IDF identical to Scikit-learn:
 * idf(t) = ln((1 + N) / (1 + df(t))) + 1
 * L2 normalization and cosine similarity calculation.
 */

import { ConditionPattern } from "./knowledgeBase";

const STOP_WORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
  "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being",
  "below", "between", "both", "but", "by", "can't", "cannot", "could", "did",
  "do", "does", "doing", "don't", "down", "during", "each", "few", "for", "from",
  "further", "had", "has", "have", "having", "he", "her", "here", "hers", "herself",
  "him", "himself", "his", "how", "i", "if", "in", "into", "is", "isn't", "it",
  "its", "itself", "let's", "me", "more", "most", "my", "myself", "no", "nor",
  "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours",
  "ourselves", "out", "over", "own", "same", "she", "should", "so", "some", "such",
  "than", "that", "the", "their", "theirs", "them", "themselves", "then", "there",
  "these", "they", "this", "those", "through", "to", "too", "under", "until", "up",
  "very", "was", "wasn't", "we", "were", "what", "when", "where", "which", "while",
  "who", "whom", "why", "with", "won't", "would", "you", "your", "yours", "yourself"
]);

export function tokenize(text: string): string[] {
  if (!text) return [];
  const words = text.toLowerCase().match(/\b[a-zA-Z]{2,}\b/g) || [];
  return words.filter((w) => !STOP_WORDS.has(w));
}

export class TfidfSimilarityEngine {
  private idfWeights: Map<string, number> = new Map();
  private corpusSize: number = 0;

  fit(documents: string[]): this {
    this.corpusSize = documents.length;
    const docFreq = new Map<string, number>();

    for (const doc of documents) {
      const tokens = new Set(tokenize(doc));
      for (const t of tokens) {
        docFreq.set(t, (docFreq.get(t) || 0) + 1);
      }
    }

    this.idfWeights.clear();
    for (const [token, df] of docFreq.entries()) {
      // Scikit-Learn smooth IDF formula
      const idf = Math.log((1.0 + this.corpusSize) / (1.0 + df)) + 1.0;
      this.idfWeights.set(token, idf);
    }

    return this;
  }

  transform(text: string): Map<string, number> {
    const tokens = tokenize(text);
    if (tokens.length === 0) return new Map();

    const tfCounts = new Map<string, number>();
    for (const token of tokens) {
      if (this.idfWeights.has(token)) {
        tfCounts.set(token, (tfCounts.get(token) || 0) + 1);
      }
    }

    const vec = new Map<string, number>();
    let sumSq = 0;

    for (const [token, count] of tfCounts.entries()) {
      const tf = count / tokens.length;
      const idf = this.idfWeights.get(token) || 1.0;
      const score = tf * idf;
      vec.set(token, score);
      sumSq += score * score;
    }

    const norm = Math.sqrt(sumSq);
    if (norm > 0) {
      for (const [token, val] of vec.entries()) {
        vec.set(token, val / norm);
      }
    }

    return vec;
  }

  static cosineSimilarity(vecA: Map<string, number>, vecB: Map<string, number>): number {
    if (vecA.size === 0 || vecB.size === 0) return 0;
    let dot = 0;
    for (const [token, valA] of vecA.entries()) {
      const valB = vecB.get(token);
      if (valB !== undefined) {
        dot += valA * valB;
      }
    }
    return Math.max(0, Math.min(1, dot));
  }
}

export function calculateSimilarityToPatterns(
  userText: string,
  patterns: ConditionPattern[]
): Record<string, number> {
  const result: Record<string, number> = {};
  if (!userText || patterns.length === 0) {
    patterns.forEach((p) => {
      result[p.condition_id] = 0;
    });
    return result;
  }

  const patternTexts = patterns.map((p) => {
    const symNames = p.symptoms.map((s) => s.symptom_name).join(" ");
    return `${p.pattern_name} ${p.description} ${symNames}`;
  });

  const engine = new TfidfSimilarityEngine();
  engine.fit(patternTexts);

  const userVec = engine.transform(userText);

  patterns.forEach((p, idx) => {
    const pVec = engine.transform(patternTexts[idx]);
    const sim = TfidfSimilarityEngine.cosineSimilarity(userVec, pVec);
    result[p.condition_id] = Number(sim.toFixed(4));
  });

  return result;
}
