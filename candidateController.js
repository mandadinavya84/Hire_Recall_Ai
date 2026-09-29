const { v4: uuidv4 } = require('uuid');
const db = require('../data/dbAdapter');
const memoryService = require('../services/hindsight/memoryService');
const { parseResumeText } = require('../services/ai/resumeParser');

class CandidateController {
  async listCandidates(req, res, next) {
    try {
      const { search, role, status } = req.query;
      let candidates = db.find('candidates', {});

      if (search) {
        const q = search.toLowerCase();
        candidates = candidates.filter(c =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.role.toLowerCase().includes(q) ||
          (c.tags || []).some(t => t.toLowerCase().includes(q))
        );
      }

      if (role && role !== 'All') {
        candidates = candidates.filter(c => c.role === role);
      }

      if (status && status !== 'All') {
        candidates = candidates.filter(c => c.status === status);
      }

      // Enrich with live counts from interviews and memories
      const enriched = candidates.map(c => {
        const candidateInterviews = db.find('interviews', { candidateId: c.id });
        const candidateMemories = db.find('memories', { candidateId: c.id });
        
        return {
          ...c,
          interviewCount: candidateInterviews.length,
          memoryCount: candidateMemories.length,
          latestRound: candidateInterviews.length > 0 
            ? `Round ${candidateInterviews.length} Completed` 
            : 'Screening'
        };
      });

      res.json({
        success: true,
        count: enriched.length,
        candidates: enriched
      });
    } catch (err) {
      next(err);
    }
  }

  async getCandidateById(req, res, next) {
    try {
      const { id } = req.params;
      const candidate = db.findById('candidates', id);
      if (!candidate) {
        return res.status(404).json({ success: false, message: 'Candidate not found.' });
      }

      const interviews = db.find('interviews', { candidateId: id }).sort((a, b) => a.roundNumber - b.roundNumber);
      const memories = db.find('memories', { candidateId: id });
      const role = db.findOne('roles', { title: candidate.role });

      res.json({
        success: true,
        candidate: {
          ...candidate,
          interviews,
          memoriesCount: memories.length,
          roleDefinition: role
        }
      });
    } catch (err) {
      next(err);
    }
  }

  async createCandidate(req, res, next) {
    try {
      const { name, email, phone, role, experience, resumeText, status } = req.body;
      if (!name || !email || !role) {
        return res.status(400).json({ success: false, message: 'Name, email, and role are required.' });
      }

      const parsed = parseResumeText(resumeText || `${name} applying for ${role} with ${experience || '2 years'} experience.`);

      const newCandidate = {
        id: `cand_${uuidv4().slice(0, 8)}`,
        name,
        email,
        phone: phone || parsed.phone,
        role,
        experience: experience || parsed.experience,
        status: status || 'New',
        currentRound: 'Screening',
        matchScore: 85,
        resume: {
          summary: parsed.summary,
          skills: parsed.skills,
          education: parsed.education,
          experienceYears: experience || parsed.experience,
          projects: parsed.projects
        },
        tags: parsed.skills.slice(0, 4),
        lastActivity: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      const saved = db.insert('candidates', newCandidate);

      // Automatically retain baseline qualifications into Hindsight World Facts!
      await memoryService.retainResume(saved.id, {
        skills: parsed.skills,
        experience: newCandidate.experience,
        role: newCandidate.role,
        education: parsed.education,
        projects: parsed.projects
      });

      res.status(201).json({
        success: true,
        message: 'Candidate created and baseline facts retained in Hindsight',
        candidate: saved
      });
    } catch (err) {
      next(err);
    }
  }

  async updateCandidate(req, res, next) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const updated = db.updateById('candidates', id, {
        ...updates,
        lastActivity: new Date().toISOString()
      });

      if (!updated) {
        return res.status(404).json({ success: false, message: 'Candidate not found.' });
      }

      res.json({
        success: true,
        message: 'Candidate updated successfully',
        candidate: updated
      });
    } catch (err) {
      next(err);
    }
  }

  async uploadResume(req, res, next) {
    try {
      const { candidateId, rawText } = req.body;
      const parsed = parseResumeText(rawText);

      if (candidateId) {
        // Update existing candidate
        const candidate = db.findById('candidates', candidateId);
        if (!candidate) return res.status(404).json({ success: false, message: 'Candidate not found.' });

        const updated = db.updateById('candidates', candidateId, {
          resume: {
            ...candidate.resume,
            summary: parsed.summary,
            skills: parsed.skills,
            education: parsed.education,
            experienceYears: parsed.experience,
            projects: parsed.projects
          },
          experience: parsed.experience,
          tags: Array.from(new Set([...(candidate.tags || []), ...parsed.skills.slice(0, 4)])),
          lastActivity: new Date().toISOString()
        });

        // Retain to Hindsight
        await memoryService.retainResume(candidateId, parsed);

        return res.json({
          success: true,
          message: 'Resume parsed and retained in Hindsight for candidate',
          parsed,
          candidate: updated
        });
      }

      res.json({
        success: true,
        message: 'Resume parsed successfully',
        parsed
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CandidateController();
