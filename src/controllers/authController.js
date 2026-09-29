const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../data/dbAdapter');

class AuthController {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required.' });
      }

      const recruiter = db.findOne('recruiters', { email });
      if (!recruiter) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      const isValid = bcrypt.compareSync(password, recruiter.password);
      if (!isValid) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      const token = jwt.sign(
        { id: recruiter.id, email: recruiter.email, name: recruiter.name, role: recruiter.role },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }
      );

      const { password: _, ...recruiterData } = recruiter;

      res.json({
        success: true,
        message: 'Login successful',
        token,
        recruiter: recruiterData
      });
    } catch (err) {
      next(err);
    }
  }

  async demoLogin(req, res, next) {
    try {
      const recruiter = db.findOne('recruiters', { email: 'priya.sharma@hirerecall.ai' });
      if (!recruiter) {
        return res.status(404).json({ success: false, message: 'Demo recruiter not found.' });
      }

      const token = jwt.sign(
        { id: recruiter.id, email: recruiter.email, name: recruiter.name, role: recruiter.role },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }
      );

      const { password: _, ...recruiterData } = recruiter;

      res.json({
        success: true,
        message: 'Demo session active as Priya Sharma',
        token,
        recruiter: recruiterData
      });
    } catch (err) {
      next(err);
    }
  }

  async getMe(req, res, next) {
    try {
      const recruiter = req.recruiter;
      res.json({
        success: true,
        recruiter
      });
    } catch (err) {
      next(err);
    }
  }

  async updatePreferences(req, res, next) {
    try {
      const { focus, style, note } = req.body;
      const recruiter = req.recruiter;

      const updated = db.updateById('recruiters', recruiter.id, {
        preferences: {
          ...recruiter.preferences,
          focus: focus || recruiter.preferences?.focus,
          style: style || recruiter.preferences?.style,
          note: note || recruiter.preferences?.note
        }
      });

      // Also update system settings
      const dbData = db.getDb();
      if (dbData.settings?.recruiter) {
        dbData.settings.recruiter.focus = focus || dbData.settings.recruiter.focus;
        dbData.settings.recruiter.style = style || dbData.settings.recruiter.style;
        db.save();
      }

      res.json({
        success: true,
        message: 'Recruiter preferences updated',
        recruiter: updated
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
