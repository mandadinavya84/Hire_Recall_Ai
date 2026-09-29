const { generateNextInterviewPlan } = require('../services/ai/interviewPlanner');
const { answerCandidateQuestion } = require('../services/ai/candidateChat');
const { generateBeforeAfterComparison } = require('../services/ai/beforeAfterService');

class AIController {
  async prepareNextInterview(req, res, next) {
    try {
      const { candidateId, notes } = req.body;
      if (!candidateId) {
        return res.status(400).json({ success: false, message: 'candidateId is required.' });
      }

      const plan = await generateNextInterviewPlan(candidateId, notes);
      res.json({
        success: true,
        plan
      });
    } catch (err) {
      next(err);
    }
  }

  async askCandidateQuestion(req, res, next) {
    try {
      const { candidateId, question } = req.body;
      if (!candidateId || !question) {
        return res.status(400).json({ success: false, message: 'candidateId and question are required.' });
      }

      const response = await answerCandidateQuestion(candidateId, question);
      res.json({
        success: true,
        ...response
      });
    } catch (err) {
      next(err);
    }
  }

  async getBeforeAfterComparison(req, res, next) {
    try {
      const { candidateId } = req.params;
      const comparison = await generateBeforeAfterComparison(candidateId);
      res.json({
        success: true,
        comparison
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AIController();
