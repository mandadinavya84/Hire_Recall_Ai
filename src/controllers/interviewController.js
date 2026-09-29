const { v4: uuidv4 } = require('uuid');
const db = require('../data/dbAdapter');
const memoryService = require('../services/hindsight/memoryService');

class InterviewController {
  async addInterview(req, res, next) {
    try {
      const { id: candidateId } = req.params;
      const {
        roundNumber,
        roundName,
        interviewer,
        date,
        feedback,
        strengths,
        weaknesses,
        questions,
        outcome,
        notes
      } = req.body;

      const candidate = db.findById('candidates', candidateId);
      if (!candidate) {
        return res.status(404).json({ success: false, message: 'Candidate not found.' });
      }

      // 1. Calculate next round number if not provided
      const existingInterviews = db.find('interviews', { candidateId });
      const nextRound = roundNumber || (existingInterviews.length + 1);

      // 2. Parse arrays if strings were passed
      const parsedStrengths = Array.isArray(strengths) 
        ? strengths 
        : (strengths ? strengths.split('\n').filter(Boolean) : []);
      const parsedWeaknesses = Array.isArray(weaknesses) 
        ? weaknesses 
        : (weaknesses ? weaknesses.split('\n').filter(Boolean) : []);
      const parsedQuestions = Array.isArray(questions) 
        ? questions 
        : (questions ? questions.split('\n').filter(Boolean) : []);

      const newInterview = {
        id: `int_${uuidv4().slice(0, 8)}`,
        candidateId,
        candidateName: candidate.name,
        roundNumber: Number(nextRound),
        roundName: roundName || `Round ${nextRound} Technical Evaluation`,
        interviewer: interviewer || req.recruiter?.name || 'Technical Interviewer',
        date: date || new Date().toISOString(),
        outcome: outcome || 'Evaluation in progress',
        feedback: feedback || '',
        strengths: parsedStrengths,
        weaknesses: parsedWeaknesses,
        questions: parsedQuestions,
        notes: notes || ''
      };

      const savedInterview = db.insert('interviews', newInterview);

      // 3. Retain directly into Hindsight persistent memory!
      const retainedMemories = await memoryService.retainInteraction(candidateId, {
        roundNumber: Number(nextRound),
        interviewer: newInterview.interviewer,
        role: candidate.role,
        feedback: newInterview.feedback,
        strengths: parsedStrengths,
        weaknesses: parsedWeaknesses,
        questions: parsedQuestions,
        outcome: newInterview.outcome,
        date: newInterview.date
      });

      // 4. Update Candidate Current Status & Round
      const nextRoundText = `Round ${Number(nextRound) + 1} Upcoming`;
      db.updateById('candidates', candidateId, {
        currentRound: nextRoundText,
        status: outcome?.toLowerCase().includes('reject') ? 'Completed' : 'Interviewing',
        lastActivity: new Date().toISOString()
      });

      // 5. Reflect Candidate Evolution Matrix
      const updatedReflection = await memoryService.reflect(candidateId);

      res.status(201).json({
        success: true,
        message: `Round ${nextRound} feedback retained in Hindsight persistent memory!`,
        interview: savedInterview,
        retainedMemoryCount: retainedMemories.length,
        retainedMemories,
        evolutionSummary: updatedReflection.narrative,
        matrix: updatedReflection.matrix
      });
    } catch (err) {
      next(err);
    }
  }

  async getInterviews(req, res, next) {
    try {
      const { id: candidateId } = req.params;
      const interviews = db.find('interviews', { candidateId }).sort((a, b) => a.roundNumber - b.roundNumber);
      res.json({
        success: true,
        count: interviews.length,
        interviews
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new InterviewController();
