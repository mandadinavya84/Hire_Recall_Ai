const db = require('./dbAdapter');
const { getSeedData } = require('./seedData');

function runSeed() {
  console.log('Seeding HireRecall AI database...');
  const seedData = getSeedData();
  db.reset(seedData);
  console.log('✅ Seed completed successfully:');
  console.log(`   - Candidates: ${seedData.candidates.length}`);
  console.log(`   - Job Roles: ${seedData.roles.length}`);
  console.log(`   - Interviews: ${seedData.interviews.length}`);
  console.log(`   - Hindsight Memories: ${seedData.memories.length}`);
  console.log(`   - Recruiter Persona: ${seedData.recruiters[0].name}`);
}

if (require.main === module) {
  runSeed();
}

module.exports = runSeed;
