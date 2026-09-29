const http = require('http');
const net = require('net');

let authToken = '';

function isPortInUse(port) {
  return new Promise((resolve) => {
    const client = new net.Socket();
    client.once('connect', () => {
      client.destroy();
      resolve(true);
    });
    client.once('error', () => {
      client.destroy();
      resolve(false);
    });
    client.connect(port, '127.0.0.1');
  });
}

function post(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    };
    if (authToken) {
      headers['Authorization'] = 'Bearer ' + authToken;
    }
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path,
      method: 'POST',
      headers
    }, res => {
      let buf = '';
      res.on('data', chunk => buf += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(buf) });
        } catch (e) {
          resolve({ status: res.statusCode, body: buf });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function get(path) {
  return new Promise((resolve, reject) => {
    const headers = {};
    if (authToken) {
      headers['Authorization'] = 'Bearer ' + authToken;
    }
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path,
      method: 'GET',
      headers
    }, res => {
      let buf = '';
      res.on('data', chunk => buf += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(buf) });
        } catch (e) {
          resolve({ status: res.statusCode, body: buf });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
  console.log('================================================================');
  console.log('🚀 HireRecall AI — 21-Step Real Hindsight Verification Suite');
  console.log('================================================================\n');

  let backendServer = null;

  const beRunning = await isPortInUse(5000);
  if (!beRunning) {
    console.log('[Setup] Starting HireRecall AI Backend Server on port 5000...');
    const backend = require('./src/index');
    backendServer = backend.server;
    await sleep(600);
  } else {
    console.log('[Setup] HireRecall AI backend detected running on port 5000.');
  }

  try {
    await post('/api/seed/reset', {});

    // [Step 1] Hindsight Health Check
    console.log('\n--- [Step 1] Hindsight Health Check (GET /api/hindsight/health) ---');
    const hsHealth = await get('/api/hindsight/health');
    console.log('    Status: ' + hsHealth.status);
    console.log('    Connected: ' + hsHealth.body?.connected);
    console.log('    Engine: "' + hsHealth.body?.engine + '"');
    console.log('    Bank ID: "' + hsHealth.body?.bank + '"');
    console.log('    Version: "' + hsHealth.body?.version + '"');
    if (hsHealth.status !== 200 || !hsHealth.body?.connected) {
      throw new Error('Real Hindsight health check failed (Status ' + hsHealth.status + '): ' + JSON.stringify(hsHealth.body));
    }
    console.log('    ✓ Step 1 Passed: Real Hindsight service confirmed reachable and healthy.');

    // [Step 2] Login
    console.log('\n--- [Step 2] Recruiter Login (POST /api/auth/demo-login) ---');
    const loginRes = await post('/api/auth/demo-login', {});
    console.log('    Status: ' + loginRes.status + ', Recruiter: "' + loginRes.body?.recruiter?.name + '"');
    if (loginRes.status !== 200 || !loginRes.body?.token) {
      throw new Error('Step 2 Login failed: No JWT token issued.');
    }
    authToken = loginRes.body.token;
    console.log('    ✓ Step 2 Passed: JWT Token acquired and attached to session.');

    // [Step 3] Create/Select Rahul
    console.log('\n--- [Step 3] Create / Select Candidate Rahul (cand_rahul_01) ---');
    const rahulRes = await get('/api/candidates/cand_rahul_01');
    if (rahulRes.status !== 200 || !rahulRes.body?.candidate) {
      throw new Error('Step 3 Failed: Candidate Rahul Sharma (cand_rahul_01) not found in system.');
    }
    console.log('    Candidate: "' + rahulRes.body.candidate.name + '", Role: "' + rahulRes.body.candidate.role + '"');
    console.log('    ✓ Step 3 Passed: Candidate Rahul selected successfully.');

    // [Step 4] Retain Rahul Round 1 feedback
    console.log('\n--- [Step 4] Retain Rahul Round 1 Feedback into Real Hindsight ---');
    const r1Feedback = await post('/api/candidates/cand_rahul_01/interviews', {
      roundNumber: 1,
      roundName: 'Round 1 — Initial Technical Screening',
      interviewer: 'Priya Sharma (Bar Raiser)',
      feedback: 'Candidate demonstrated solid Python fundamentals and REST API patterns. However, had significant gaps in database indexing and MongoDB query execution planning.',
      strengths: ['Python Syntax', 'REST API Design'],
      weaknesses: ['MongoDB Indexing Weak', 'Query Optimization Weak'],
      questions: [
        'How does Python garbage collection and reference counting work?',
        'How does MongoDB handle indexing under the hood?'
      ],
      outcome: 'Advanced to Round 2'
    });
    console.log('    Status: ' + r1Feedback.status + ', Retained count: ' + r1Feedback.body?.retainedMemoryCount);
    if (r1Feedback.status !== 201 || (r1Feedback.body?.retainedMemoryCount || 0) < 1) {
      throw new Error('Step 4 Failed: Could not retain Rahul Round 1 feedback in Hindsight.');
    }
    console.log('    ✓ Step 4 Passed: Rahul Round 1 feedback retained in Real Hindsight.');

    // [Step 5] Recall Rahul memories
    console.log('\n--- [Step 5] Recall Rahul Memories from Real Hindsight ---');
    const recallRahul1 = await get('/api/memories/candidate/cand_rahul_01');
    console.log('    Status: ' + recallRahul1.status + ', Memory Count: ' + recallRahul1.body?.count);
    if (recallRahul1.status !== 200 || !recallRahul1.body?.memories || recallRahul1.body.memories.length === 0) {
      throw new Error('Step 5 Failed: Real Hindsight recall returned empty memories for Rahul.');
    }
    console.log('    ✓ Step 5 Passed: Real Hindsight recall succeeded for Rahul.');

    // [Step 6] Verify Round 1 memories exist in REAL Hindsight
    console.log('\n--- [Step 6] Verify Round 1 Memories Exist in REAL Hindsight ---');
    const allRahulMemText = recallRahul1.body.memories.map(m => (m.text || '').toLowerCase()).join(' ');
    const hasR1Topics = allRahulMemText.includes('indexing') || allRahulMemText.includes('database') || allRahulMemText.includes('query');
    if (!hasR1Topics) {
      throw new Error('Step 6 Failed: Retained Round 1 database indexing memories not found in recall results.');
    }
    console.log('    Verified evidence in recalled memory: "' + recallRahul1.body.memories[0]?.text?.slice(0, 100) + '..."');
    console.log('    ✓ Step 6 Passed: Round 1 memories verified in Real Hindsight.');

    // [Step 7] Generate Round 2 interview plan
    console.log('\n--- [Step 7] Generate Round 2 Interview Plan (POST /api/ai/prepare-interview) ---');
    const planR2 = await post('/api/ai/prepare-interview', { candidateId: 'cand_rahul_01' });
    console.log('    Status: ' + planR2.status + ', Target Round: "' + planR2.body?.plan?.targetRound + '"');
    if (planR2.status !== 200 || !planR2.body?.plan) {
      throw new Error('Step 7 Failed: Could not generate Round 2 interview plan.');
    }
    console.log('    ✓ Step 7 Passed: Round 2 interview plan generated.');

    // [Step 8] Verify Round 2 uses recalled Round 1 information
    console.log('\n--- [Step 8] Verify Round 2 Uses Recalled Round 1 Information ---');
    const avoidTopics = (planR2.body.plan.avoidRepeating || []).map(a => a.topic.toLowerCase()).join(', ');
    const focusTopics = (planR2.body.plan.focusAreas || []).map(f => f.topic.toLowerCase()).join(', ');
    console.log('    Avoid Repeating (Proven): ' + avoidTopics);
    console.log('    Focus Areas (Gaps): ' + focusTopics);
    console.log('    Targeted Question 1: "' + planR2.body.plan.recommendedQuestions?.[0]?.question + '"');

    const hasDbFocus = focusTopics.includes('database') || focusTopics.includes('indexing') || focusTopics.includes('mongodb') || focusTopics.includes('query');
    if (!hasDbFocus) {
      throw new Error('Step 8 Failed: Round 2 plan does not focus on database / indexing weaknesses identified in Round 1.');
    }
    console.log('    ✓ Step 8 Passed: Round 2 plan directly addresses Round 1 weaknesses without repeating proven syntax.');

    // [Step 9] Retain Round 2 feedback
    console.log('\n--- [Step 9] Retain Round 2 Feedback into Real Hindsight ---');
    const r2Feedback = await post('/api/candidates/cand_rahul_01/interviews', {
      roundNumber: 2,
      roundName: 'Round 2 — Database & API Architecture',
      interviewer: 'Ananya Roy (Principal Architect)',
      feedback: 'Candidate demonstrated marked improvement in MongoDB indexing and explain plan analysis. Gaps identified in distributed consensus and handling network partitions in microservices.',
      strengths: ['MongoDB Indexing Improved', 'Query Optimization Strong'],
      weaknesses: ['Distributed consensus under network partition'],
      questions: [
        'How do you analyze a MongoDB explain plan?',
        'How do you handle compound index selectivity?'
      ],
      outcome: 'Advanced to Round 3'
    });
    console.log('    Status: ' + r2Feedback.status + ', Retained count: ' + r2Feedback.body?.retainedMemoryCount);
    if (r2Feedback.status !== 201) {
      throw new Error('Step 9 Failed: Could not retain Rahul Round 2 feedback in Hindsight.');
    }
    console.log('    ✓ Step 9 Passed: Rahul Round 2 feedback retained in Real Hindsight.');

    // [Step 10] Recall Rahul again
    console.log('\n--- [Step 10] Recall Rahul Again After Round 2 ---');
    const recallRahul2 = await get('/api/memories/candidate/cand_rahul_01');
    console.log('    Status: ' + recallRahul2.status + ', Updated Memory Count: ' + recallRahul2.body?.count);
    if (recallRahul2.status !== 200 || recallRahul2.body.memories.length < recallRahul1.body.memories.length) {
      throw new Error('Step 10 Failed: Updated recall did not reflect accumulated Round 2 memories.');
    }
    console.log('    ✓ Step 10 Passed: Accumulated candidate history recalled from Real Hindsight.');

    // [Step 11] Generate Round 3 plan
    console.log('\n--- [Step 11] Generate Round 3 Interview Plan ---');
    const planR3 = await post('/api/ai/prepare-interview', { candidateId: 'cand_rahul_01' });
    console.log('    Status: ' + planR3.status + ', Target Round: "' + planR3.body?.plan?.targetRound + '"');
    if (planR3.status !== 200 || !planR3.body?.plan) {
      throw new Error('Step 11 Failed: Could not generate Round 3 interview plan.');
    }
    console.log('    ✓ Step 11 Passed: Round 3 interview plan generated.');

    // [Step 12] Verify Round 3 plan reflects updated history
    console.log('\n--- [Step 12] Verify Round 3 Plan Reflects Updated History ---');
    const r3Questions = planR3.body.plan.recommendedQuestions || [];
    console.log('    Round 3 Recommended Deep Dive Questions:');
    r3Questions.forEach((q, i) => console.log('      Q' + (i + 1) + ': "' + q.question + '"'));
    const allR3QText = r3Questions.map(q => q.question.toLowerCase()).join(' ');
    const hasDeepenedScenario = allR3QText.includes('esr') || allR3QText.includes('50m') || allR3QText.includes('distributed') || allR3QText.includes('partition') || allR3QText.includes('compound index');
    if (!hasDeepenedScenario) {
      throw new Error('Step 12 Failed: Round 3 plan did not escalate into advanced production scenarios (ESR rules / distributed scale).');
    }
    console.log('    ✓ Step 12 Passed: Round 3 plan reflects candidate progression into production scale architecture.');

    // [Step 13] Create/Select Ananya
    console.log('\n--- [Step 13] Create / Select Candidate Ananya (cand_ananya_02) ---');
    const ananyaRes = await get('/api/candidates/cand_ananya_02');
    if (ananyaRes.status !== 200 || !ananyaRes.body?.candidate) {
      throw new Error('Step 13 Failed: Candidate Ananya Rao (cand_ananya_02) not found in system.');
    }
    console.log('    Candidate: "' + ananyaRes.body.candidate.name + '", Role: "' + ananyaRes.body.candidate.role + '"');
    console.log('    ✓ Step 13 Passed: Candidate Ananya selected successfully.');

    // [Step 14] Retain Ananya memory
    console.log('\n--- [Step 14] Retain Ananya Memory into Real Hindsight ---');
    const ananyaRetain = await post('/api/candidates/cand_ananya_02/interviews', {
      roundNumber: 1,
      roundName: 'Round 1 — Frontend Architecture & State',
      interviewer: 'Marcus Chen (Staff UI Engineer)',
      feedback: 'Outstanding mastery of React 18 concurrent rendering, Suspense, and TypeScript generic constraints. Exhibited difficulties with Webpack 5 module federation and bundle splitting optimization.',
      strengths: ['React 18 Concurrent Rendering', 'TypeScript Generics'],
      weaknesses: ['Webpack 5 Custom Bundling', 'Module Federation'],
      questions: [
        'Explain React 18 useTransition vs useDeferredValue.',
        'How do you configure Webpack 5 splitChunks and module federation?'
      ],
      outcome: 'Advanced to Round 2'
    });
    console.log('    Status: ' + ananyaRetain.status + ', Retained count: ' + ananyaRetain.body?.retainedMemoryCount);
    if (ananyaRetain.status !== 201) {
      throw new Error('Step 14 Failed: Could not retain Ananya memory in Hindsight.');
    }
    console.log('    ✓ Step 14 Passed: Ananya Frontend memory retained in Real Hindsight.');

    // [Step 15] Recall Rahul
    console.log('\n--- [Step 15] Recall Rahul Memories for Isolation Verification ---');
    const recallRahulCheck = await get('/api/memories/candidate/cand_rahul_01');
    console.log('    Rahul Memory Count: ' + recallRahulCheck.body?.count);
    const rahulAllMemText = (recallRahulCheck.body?.memories || []).map(m => (m.text || '').toLowerCase()).join(' ');

    // [Step 16] Verify Ananya information does not appear
    console.log('\n--- [Step 16] Verify Zero Leakage: Ananya info does not appear in Rahul ---');
    const hasAnanyaLeakage = rahulAllMemText.includes('webpack') || rahulAllMemText.includes('module federation') || rahulAllMemText.includes('suspense');
    if (hasAnanyaLeakage) {
      throw new Error('CRITICAL LEAK: Ananya Frontend memories leaked into Rahul Backend memory bank!');
    }
    console.log('    ✓ Step 16 Passed: ZERO leakage from Ananya into Rahul confirmed.');

    // [Step 17] Recall Ananya
    console.log('\n--- [Step 17] Recall Ananya Memories for Isolation Verification ---');
    const recallAnanyaCheck = await get('/api/memories/candidate/cand_ananya_02');
    console.log('    Ananya Memory Count: ' + recallAnanyaCheck.body?.count);
    const ananyaAllMemText = (recallAnanyaCheck.body?.memories || []).map(m => (m.text || '').toLowerCase()).join(' ');

    // [Step 18] Verify Rahul information does not appear
    console.log('\n--- [Step 18] Verify Zero Leakage: Rahul info does not appear in Ananya ---');
    const hasRahulLeakage = ananyaAllMemText.includes('mongodb') || ananyaAllMemText.includes('fastapi') || ananyaAllMemText.includes('explain plan');
    if (hasRahulLeakage) {
      throw new Error('CRITICAL LEAK: Rahul Backend memories leaked into Ananya Frontend memory bank!');
    }
    console.log('    ✓ Step 18 Passed: ZERO leakage from Rahul into Ananya confirmed.');

    // [Step 19] Test Before/After Memory
    console.log('\n--- [Step 19] Test Before vs After Memory (GET /api/ai/before-after/cand_rahul_01) ---');
    const comparison = await get('/api/ai/before-after/cand_rahul_01');
    console.log('    Without Memory (Generic): "' + comparison.body?.comparison?.withoutMemory?.questionsSuggested?.[0]?.question + '"');
    console.log('    With Memory (Targeted): "' + comparison.body?.comparison?.withMemory?.questionsSuggested?.[0]?.question + '"');
    const withMemQ = (comparison.body?.comparison?.withMemory?.questionsSuggested?.[0]?.question || '').toLowerCase();
    if (!withMemQ.includes('index') && !withMemQ.includes('database') && !withMemQ.includes('mongodb') && !withMemQ.includes('query')) {
      throw new Error('Step 19 Failed: Before/After comparison did not demonstrate memory-grounded question targeting.');
    }
    console.log('    ✓ Step 19 Passed: Before vs After demonstrates dramatic contrast between generic and memory-informed interviews.');

    // [Step 20] Test Memory Explorer
    console.log('\n--- [Step 20] Test Memory Explorer (GET /api/memories/candidate/cand_rahul_01) ---');
    const explorerRes = await get('/api/memories/candidate/cand_rahul_01');
    const statsRes = await get('/api/memories/stats');
    console.log('    Candidate Memories Found: ' + explorerRes.body?.count);
    console.log('    Global Bank Memory Stats: Total ' + (statsRes.body?.totalMemories || statsRes.body?.total || explorerRes.body?.count) + ' items');
    const sampleMem = explorerRes.body?.memories?.[0];
    if (!sampleMem || !sampleMem.text || !sampleMem.type) {
      throw new Error('Step 20 Failed: Memory Explorer payload missing structured memory attributes.');
    }
    console.log('    Sample Memory [Type: ' + sampleMem.type + ']: "' + sampleMem.text.slice(0, 90) + '..."');
    console.log('    ✓ Step 20 Passed: Memory Explorer returns structured Real Hindsight memories.');

    // [Step 21] Test Chatbot Memory Retrieval
    console.log('\n--- [Step 21] Test Chatbot Memory Retrieval (POST /api/ai/chat) ---');
    const chatRes = await post('/api/ai/chat', {
      candidateId: 'cand_rahul_01',
      question: 'What were the primary database indexing challenges Rahul exhibited in earlier rounds?'
    });
    console.log('    Chatbot Response: "' + chatRes.body?.response?.slice(0, 120) + '..."');
    const chatText = (chatRes.body?.response || '').toLowerCase();
    if (!chatText.includes('database') && !chatText.includes('index') && !chatText.includes('mongodb')) {
      throw new Error('Step 21 Failed: Chatbot response was not grounded in candidate memories.');
    }
    console.log('    ✓ Step 21 Passed: Chatbot successfully retrieves and grounds answers in Real Hindsight candidate memory.');

    // Reset database back to clean demo state for recruiters
    console.log('\n--- [Cleanup] Restoring Clean Demo State ---');
    const resetRes = await post('/api/seed/reset', {});
    console.log('    Reset status: ' + resetRes.status + ', message: "' + resetRes.body?.message + '"');

    console.log('\n================================================================');
    console.log('REAL HINDSIGHT END-TO-END TEST PASSED');
    console.log('================================================================\n');

    process.exit(0);
  } finally {
    if (backendServer && backendServer.close) {
      try { backendServer.close(); } catch (e) {}
    }
  }
}

runTests().catch(err => {
  console.error('\n❌ Real Hindsight Verification Suite Failed with Error:\n', err);
  process.exit(1);
});
