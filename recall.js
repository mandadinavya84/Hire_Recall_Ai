const { recallResponseToPromptString } = require('@vectorize-io/hindsight-client');
const db = require('../../data/dbAdapter');
const client = require('./client');

/**
 * Recalls memories for a candidate from REAL Hindsight persistent memory.
 * Strictly scopes retrieval using candidate isolation tags: `tags: ['candidate_' + candidateId]`.
 * 
 * Returns:
 * - evidence: structured evidence cards citing exact rounds and quotes from Hindsight
 * - promptString: prompt text formatted by official recallResponseToPromptString
 * - rawResults: raw Hindsight memory objects
 */
async function recallCandidateMemory({
  candidateId,
  query = '',
  types = ['world', 'experience', 'observation'],
  limit = 10
}) {
  db.incrementMetric('recallQueries', 1);

  const searchQuery = query && query.trim().length > 0
    ? query.trim()
    : 'candidate technical evaluation strengths weaknesses interview questions and progression';

  try {
    // Call official Hindsight recall with candidate isolation tags
    const recallResponse = await client.client.recall(client.bankId, searchQuery, {
      tags: [`candidate_${candidateId}`],
      tagsMatch: 'any_strict',
      types,
      includeSourceFacts: true
    });

    const results = recallResponse.results || [];
    console.log(`[Hindsight Recall] Official Hindsight recalled ${results.length} memories for candidate ${candidateId}`);

    // Format with official Hindsight prompt serializer
    let promptString = '';
    try {
      promptString = recallResponseToPromptString(recallResponse);
    } catch (err) {
      promptString = results.map(r => r.text).join('\n---\n');
    }

    const evidence = results.map((r, idx) => {
      const text = r.text || '';
      const lower = text.toLowerCase();
      const isWeak = lower.includes('weak') || lower.includes('struggled') || lower.includes('difficulty');
      const isStrong = lower.includes('strong') || lower.includes('solid') || lower.includes('explained clearly') || lower.includes('good') || lower.includes('improved');
      
      let roundMatch = text.match(/Round\s*(\d+)/i) || (r.context && r.context.match(/Round\s*(\d+)/i));
      const roundNum = roundMatch ? parseInt(roundMatch[1], 10) : 0;

      return {
        memoryId: r.id || `hindsight_mem_${idx + 1}`,
        round: roundNum,
        roundLabel: roundNum > 0 ? `Round ${roundNum}` : 'Resume Baseline',
        title: r.context || `Hindsight Recalled Memory #${idx + 1}`,
        text,
        quote: text,
        content: text,
        sentiment: isWeak ? 'negative' : (isStrong ? 'positive' : 'neutral'),
        type: r.type || 'observation',
        metadata: r.metadata || {},
        tags: r.tags || [],
        relevanceScore: r.scores?.final != null ? Math.round(r.scores.final * 100) / 100 : Math.round((1.0 - idx * 0.05) * 10) / 10
      };
    });

    return {
      candidateId,
      query: searchQuery,
      count: evidence.length,
      evidence,
      promptString,
      rawResults: results,
      hindsightBank: client.bankId,
      mode: 'remote'
    };
  } catch (err) {
    console.error(`[Hindsight RECALL failed]: ${err.message}`);
    throw new Error(`Hindsight RECALL failed: ${err.message}. Please verify Hindsight connection.`);
  }
}

module.exports = {
  recallCandidateMemory
};
