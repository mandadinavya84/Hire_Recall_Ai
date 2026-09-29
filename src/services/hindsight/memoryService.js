const db = require('../../data/dbAdapter');
const client = require('./client');
const { retainCandidateInteraction, retainResumeWorldFacts } = require('./retain');
const { recallCandidateMemory } = require('./recall');
const { reflectCandidateEvolution } = require('./reflect');

class MemoryService {
  /**
   * Retain an interview interaction into Hindsight persistent memory
   */
  /**
   * Retain an interview interaction into Hindsight persistent memory
   */
  async retainInterviewFeedback(candidateId, interactionData) {
    return await retainCandidateInteraction({
      candidateId,
      ...interactionData
    });
  }

  // Alias for compatibility
  async retainInteraction(candidateId, interactionData) {
    return this.retainInterviewFeedback(candidateId, interactionData);
  }

  /**
   * Retain resume extraction into Hindsight World Facts
   */
  async retainResume(candidateId, parsedResume) {
    return await retainResumeWorldFacts(candidateId, parsedResume);
  }

  /**
   * Recall memories relevant to a query or candidate context
   */
  async recallCandidateMemory(candidateId, query = '', options = {}) {
    return await recallCandidateMemory({
      candidateId,
      query,
      ...options
    });
  }

  // Alias for compatibility
  async recall(candidateId, query = '', options = {}) {
    return this.recallCandidateMemory(candidateId, query, options);
  }

  /**
   * Reflect across candidate memory banks to synthesize evolution
   */
  async reflectCandidateProgress(candidateId) {
    return await reflectCandidateEvolution(candidateId);
  }

  // Alias for compatibility
  async reflect(candidateId) {
    return this.reflectCandidateProgress(candidateId);
  }

  /**
   * Get memory items for a specific candidate from Real Hindsight
   */
  async getCandidateMemories(candidateId) {
    const recallResult = await this.recallCandidateMemory(candidateId, 'interview feedback observations strengths weaknesses world facts');
    return recallResult.evidence || [];
  }

  /**
   * Get memories by recalling from real Hindsight (for Memory Explorer)
   */
  async getAllMemories(options = {}) {
    const query = options.search && options.search.trim().length > 0
      ? options.search.trim()
      : 'candidate technical evaluation strengths weaknesses interview observations world facts';

    try {
      const recallResponse = await client.client.recall(client.bankId, query, {
        maxTokens: 4096,
        includeSourceFacts: true
      });

      const results = recallResponse.results || [];
      const mapped = results.map((r, idx) => {
        const text = r.text || '';
        const meta = r.metadata || {};
        const lower = text.toLowerCase();
        const isWeak = lower.includes('weak') || lower.includes('struggled');
        const isStrong = lower.includes('strong') || lower.includes('solid') || lower.includes('explained clearly') || lower.includes('improved');
        
        let roundMatch = text.match(/Round\s*(\d+)/i) || (r.context && r.context.match(/Round\s*(\d+)/i));
        const roundNumber = meta.roundNumber ? parseInt(meta.roundNumber, 10) : (roundMatch ? parseInt(roundMatch[1], 10) : 0);

        return {
          id: r.id || `hindsight_mem_${idx + 1}`,
          candidateId: meta.candidateId || null,
          candidateName: meta.candidateName || (text.match(/Candidate:\s*([^\n|]+)/i)?.[1]?.trim()) || 'Candidate',
          type: r.type || meta.type || 'observation',
          subType: isWeak ? 'weakness' : (isStrong ? 'strength' : 'fact'),
          bankId: client.bankId,
          roundNumber,
          title: r.context || `Hindsight Recalled Memory #${idx + 1}`,
          content: text,
          skillTag: meta.topic || null,
          sentiment: isWeak ? 'negative' : (isStrong ? 'positive' : 'neutral'),
          relevanceScore: r.scores?.final != null ? Math.round(r.scores.final * 100) / 100 : Math.round((1.0 - idx * 0.05) * 10) / 10,
          metadata: meta,
          tags: r.tags || [],
          timestamp: r.occurred_start || new Date().toISOString()
        };
      });

      const filtered = options.type ? mapped.filter(m => m.type === options.type) : mapped;

      return {
        total: filtered.length,
        page: options.page || 1,
        limit: options.limit || 50,
        memories: filtered,
        source: 'hindsight'
      };
    } catch (err) {
      console.warn('[MemoryService getAllMemories] Real Hindsight recall failed:', err.message);
      return {
        total: 0,
        page: options.page || 1,
        limit: options.limit || 50,
        memories: [],
        error: `Real Hindsight memory recall failed: ${err.message || 'Service offline'}`,
        status: 'offline',
        source: 'hindsight'
      };
    }
  }

  /**
   * Get system-wide Hindsight memory metrics
   */
  getMetrics() {
    const rawMetrics = db.getMetrics();
    return {
      totalCandidates: rawMetrics.candidatesCount,
      activeInterviews: rawMetrics.activeInterviews,
      totalInterviews: rawMetrics.interviewsCount,
      totalMemories: 0,
      retentionEvents: rawMetrics.retentionEvents,
      recallQueries: rawMetrics.recallQueries,
      memoryUpdates: rawMetrics.memoryUpdates,
      activeBanks: rawMetrics.activeBanks,
      breakdown: {
        worldFacts: 0,
        experiences: 0,
        observations: 0,
        strengths: 0,
        weaknesses: 0
      },
      clientStatus: client.getStatus()
    };
  }

  /**
   * Check connection status to Hindsight memory subsystem
   */
  async getHindsightHealth() {
    return await client.checkHealth();
  }
}

module.exports = new MemoryService();
