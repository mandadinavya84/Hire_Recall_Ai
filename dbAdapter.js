const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class DbAdapter {
  constructor() {
    this.dbFile = DB_FILE;
    this.memoryDb = null;
    this.init();
  }

  init() {
    if (!fs.existsSync(this.dbFile)) {
      const initialSchema = {
        recruiters: [],
        candidates: [],
        roles: [],
        interviews: [],
        memories: [],
        metrics: {
          retentionEvents: 0,
          recallQueries: 0,
          memoryUpdates: 0,
          activeBanks: 1
        },
        settings: {
          recruiter: {
            name: 'Priya Sharma',
            email: 'priya.sharma@hirerecall.ai',
            role: 'Senior Tech Recruiter & Bar Raiser',
            focus: 'Practical coding, System Design, Communication',
            style: 'Scenario-based, Real-world architecture problems'
          },
          hindsightMode: 'embedded',
          aiProvider: 'embedded'
        }
      };
      fs.writeFileSync(this.dbFile, JSON.stringify(initialSchema, null, 2), 'utf-8');
      this.memoryDb = initialSchema;
    } else {
      try {
        const raw = fs.readFileSync(this.dbFile, 'utf-8');
        this.memoryDb = JSON.parse(raw);
      } catch (err) {
        console.error('Error reading db.json, re-initializing:', err.message);
        this.memoryDb = {
          recruiters: [],
          candidates: [],
          roles: [],
          interviews: [],
          memories: [],
          metrics: { retentionEvents: 0, recallQueries: 0, memoryUpdates: 0, activeBanks: 1 },
          settings: {}
        };
      }
    }
  }

  save() {
    try {
      fs.writeFileSync(this.dbFile, JSON.stringify(this.memoryDb, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving db.json:', err.message);
    }
  }

  getDb() {
    return this.memoryDb;
  }

  find(collectionName, filter = {}) {
    const coll = this.memoryDb[collectionName] || [];
    return coll.filter(item => {
      for (const [key, val] of Object.entries(filter)) {
        if (item[key] !== val) return false;
      }
      return true;
    });
  }

  findOne(collectionName, filter = {}) {
    const items = this.find(collectionName, filter);
    return items.length > 0 ? items[0] : null;
  }

  findById(collectionName, id) {
    const coll = this.memoryDb[collectionName] || [];
    return coll.find(item => item.id === id || item._id === id) || null;
  }

  insert(collectionName, document) {
    if (!this.memoryDb[collectionName]) {
      this.memoryDb[collectionName] = [];
    }
    const record = {
      id: document.id || uuidv4(),
      createdAt: document.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...document
    };
    this.memoryDb[collectionName].push(record);
    this.save();
    return record;
  }

  updateById(collectionName, id, updates) {
    const coll = this.memoryDb[collectionName] || [];
    const index = coll.findIndex(item => item.id === id || item._id === id);
    if (index === -1) return null;

    this.memoryDb[collectionName][index] = {
      ...this.memoryDb[collectionName][index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.memoryDb[collectionName][index];
  }

  deleteById(collectionName, id) {
    const coll = this.memoryDb[collectionName] || [];
    const index = coll.findIndex(item => item.id === id || item._id === id);
    if (index === -1) return false;

    this.memoryDb[collectionName].splice(index, 1);
    this.save();
    return true;
  }

  count(collectionName, filter = {}) {
    return this.find(collectionName, filter).length;
  }

  incrementMetric(metricKey, amount = 1) {
    if (!this.memoryDb.metrics) {
      this.memoryDb.metrics = { retentionEvents: 0, recallQueries: 0, memoryUpdates: 0, activeBanks: 1 };
    }
    this.memoryDb.metrics[metricKey] = (this.memoryDb.metrics[metricKey] || 0) + amount;
    this.save();
    return this.memoryDb.metrics[metricKey];
  }

  getMetrics() {
    return {
      candidatesCount: (this.memoryDb.candidates || []).length,
      interviewsCount: (this.memoryDb.interviews || []).length,
      memoriesCount: (this.memoryDb.memories || []).length,
      activeInterviews: (this.memoryDb.candidates || []).filter(c => c.status === 'Interviewing').length,
      retentionEvents: this.memoryDb.metrics?.retentionEvents || (this.memoryDb.memories || []).length,
      recallQueries: this.memoryDb.metrics?.recallQueries || 28,
      memoryUpdates: this.memoryDb.metrics?.memoryUpdates || 14,
      activeBanks: this.memoryDb.metrics?.activeBanks || 1
    };
  }

  reset(fullData) {
    this.memoryDb = fullData;
    this.save();
    return this.memoryDb;
  }
}

module.exports = new DbAdapter();
