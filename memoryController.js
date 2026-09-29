const memoryService = require('../services/hindsight/memoryService');

class MemoryController {
  async getMetrics(req, res, next) {
    try {
      const metrics = memoryService.getMetrics();
      res.json({
        success: true,
        ...metrics,
        metrics
      });
    } catch (err) {
      next(err);
    }
  }

  async getAllMemories(req, res, next) {
    try {
      const { search, type, page, limit } = req.query;
      const result = await memoryService.getAllMemories({
        search,
        type,
        page: Number(page) || 1,
        limit: Number(limit) || 50
      });
      res.json({
        success: true,
        ...result
      });
    } catch (err) {
      next(err);
    }
  }

  async getCandidateMemories(req, res, next) {
    try {
      const candidateId = req.params.candidateId || req.params.id;
      const recallRes = await memoryService.recall(candidateId, 'candidate interview feedback observations strengths weaknesses world facts', { limit: 50 });
      res.json({
        success: true,
        count: recallRes.evidence.length,
        memories: recallRes.evidence
      });
    } catch (err) {
      next(err);
    }
  }

  async recallCandidateMemory(req, res, next) {
    try {
      const { id: candidateId } = req.params;
      const { query, limit } = req.body;

      const recallResults = await memoryService.recall(candidateId, query || '', {
        limit: Number(limit) || 10
      });

      res.json({
        success: true,
        ...recallResults
      });
    } catch (err) {
      next(err);
    }
  }

  async reflectCandidate(req, res, next) {
    try {
      const { id: candidateId } = req.params;
      const reflection = await memoryService.reflect(candidateId);
      res.json({
        success: true,
        reflection
      });
    } catch (err) {
      next(err);
    }
  }

  async getHindsightHealth(req, res, next) {
    try {
      const health = await memoryService.getHindsightHealth();
      res.json({
        success: true,
        ...health
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new MemoryController();
