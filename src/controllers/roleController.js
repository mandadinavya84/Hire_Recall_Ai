const { v4: uuidv4 } = require('uuid');
const db = require('../data/dbAdapter');

class RoleController {
  async listRoles(req, res, next) {
    try {
      const roles = db.find('roles', {});
      res.json({
        success: true,
        count: roles.length,
        roles
      });
    } catch (err) {
      next(err);
    }
  }

  async getRoleById(req, res, next) {
    try {
      const { id } = req.params;
      const role = db.findById('roles', id) || db.findOne('roles', { title: id });
      if (!role) {
        return res.status(404).json({ success: false, message: 'Role not found.' });
      }
      res.json({
        success: true,
        role
      });
    } catch (err) {
      next(err);
    }
  }

  async createRole(req, res, next) {
    try {
      const { title, department, level, requiredSkills, preferredSkills, description, evaluationRubric } = req.body;
      if (!title) {
        return res.status(400).json({ success: false, message: 'Role title is required.' });
      }

      const newRole = {
        id: `role_${uuidv4().slice(0, 8)}`,
        title,
        department: department || 'Engineering',
        level: level || 'Senior',
        requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : (requiredSkills ? requiredSkills.split(',').map(s => s.trim()) : []),
        preferredSkills: Array.isArray(preferredSkills) ? preferredSkills : (preferredSkills ? preferredSkills.split(',').map(s => s.trim()) : []),
        description: description || '',
        evaluationRubric: evaluationRubric || {},
        createdAt: new Date().toISOString()
      };

      const saved = db.insert('roles', newRole);
      res.status(201).json({
        success: true,
        message: 'Role created successfully',
        role: saved
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new RoleController();
