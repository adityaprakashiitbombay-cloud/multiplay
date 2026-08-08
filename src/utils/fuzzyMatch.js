/**
 * fuzzyMatch.js – Fuzzy name matching for player/star names.
 * When someone types "virat" or "Cristiano Ranaldo" it suggests the closest real name.
 */

// Levenshtein distance between two strings
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

// Similarity score 0–1 (1 = identical)
function similarity(a, b) {
  const na = a.toLowerCase().trim();
  const nb = b.toLowerCase().trim();
  if (na === nb) return 1;
  if (!na || !nb) return 0;
  const dist = levenshtein(na, nb);
  return 1 - dist / Math.max(na.length, nb.length);
}

// Check if query is a substring match (e.g. "messi" in "Lionel Messi")
function substringScore(query, candidate) {
  const q = query.toLowerCase().trim();
  const c = candidate.toLowerCase();
  if (c.includes(q)) return 0.9; // strong bonus for substring match
  // word-level partial
  const words = c.split(/\s+/);
  for (const w of words) {
    if (w.startsWith(q) && q.length >= 3) return 0.85;
  }
  return 0;
}

/**
 * Find the best matching name from the candidates list.
 * Returns { match, score } or null if below threshold.
 * @param {string} query – what the user typed
 * @param {string[]} candidates – list of known names
 * @param {number} threshold – minimum score to suggest (0–1, default 0.6)
 */
export function findBestMatch(query, candidates, threshold = 0.58) {
  if (!query || query.trim().length < 2) return null;

  let best = null;
  let bestScore = -1;

  for (const candidate of candidates) {
    const simScore = similarity(query, candidate);
    const subScore = substringScore(query, candidate);
    const score = Math.max(simScore, subScore);
    if (score > bestScore) {
      bestScore = score;
      best = candidate;
    }
  }

  // Don't suggest if query is already perfect or very close
  if (bestScore >= 0.99) return null; // exact match, no suggestion needed
  if (bestScore >= threshold) {
    return { match: best, score: bestScore };
  }
  return null;
}

/**
 * Get top N fuzzy matches from candidates.
 */
export function getTopMatches(query, candidates, n = 4, threshold = 0.45) {
  if (!query || query.trim().length < 2) return [];

  return candidates
    .map(candidate => ({
      name: candidate,
      score: Math.max(similarity(query, candidate), substringScore(query, candidate)),
    }))
    .filter(r => r.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, n);
}
