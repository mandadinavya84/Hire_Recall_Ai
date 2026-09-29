const runSeed = require('../data/seed');

class SeedController {
  async resetData(req, res, next) {
    try {
      runSeed();
      res.json({
        success: true,
        message: 'Database reset to initial demo state (Rahul Sharma R1 & R2 ready).'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new SeedController();
