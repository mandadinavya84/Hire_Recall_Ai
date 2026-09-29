const { v4: uuidv4 } = require('uuid');
const db = require('../../data/dbAdapter');
const client = require('./client');

/**
 * Retains interview feedback into Hindsight persistent memory.
 * Stores structured candidate evidence including topic assessments, quotes, and episodic context.
 *
 * Example Structure:
 * Candidate: Rahul Sharma
 * Role: Backend Developer
 * Round: Round 2
 * Topic: Database Architecture
 * Assessment: Weak
 * Detail: Candidate struggled to explain indexing strategy and query planning.
 */
async function retainInterviewFeedback({
  candidateId,
  roundNumber,
  interviewer,
  role,
  feedback,
  strengths = [],
  weaknesses = [],
  questions = [],
  outcome = 'Pending',
  date = new Date().toISOString()
}) {
  const candidate = db.findById('candidates', candidateId);
  const candidateName = candidate ? candidate.name : 'Unknown Candidate';
  const candidateRole = role || candidate?.role || 'Software Engineer';

  // 1. Compile individual topic observations
  const observations = [];

  for (const str of strengths) {
    if (!str || !str.trim()) continue;
    const topic = extractSkillTopic(str, candidateRole);
    observations.push({
      topic,
      assessment: 'Strong',
      sentiment: 'positive',
      detail: str.trim(),
      type: 'observation'
    });
  }

  for (const weak of weaknesses) {
    if (!weak || !weak.trim()) continue;
    const topic = extractSkillTopic(weak, candidateRole);
    observations.push({
      topic,
      assessment: 'Weak',
      sentiment: 'negative',
      detail: weak.trim(),
      type: 'observation'
    });
  }

  // 2. Retain via official Vectorize Hindsight Client
  try {
    // Retain the main episodic interview experience
    const episodicContent = [
      `Candidate: ${candidateName}`,
      `Role: ${candidateRole}`,
      `Round: Round ${roundNumber}`,
      `Interviewer: ${interviewer || 'Technical Interviewer'}`,
      `Outcome: ${outcome}`,
      `Date: ${date}`,
      `Overall Feedback: ${feedback || 'Technical round evaluation completed.'}`,
      questions.length > 0 ? `Questions Evaluated: ${questions.map(q => typeof q === 'string' ? q : q.text).join('; ')}` : ''
    ].filter(Boolean).join('\n');

    await client.client.retain(client.bankId, episodicContent, {
      context: `Candidate: ${candidateName} | Role: ${candidateRole} | Round: Round ${roundNumber} Episodic Experience`,
      tags: [
        `candidate_${candidateId}`,
        `round_${roundNumber}`,
        `role_${candidateRole.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`
      ],
      metadata: {
        candidateId,
        candidateName,
        role: candidateRole,
        roundNumber: String(roundNumber),
        type: 'experience',
        interviewer: String(interviewer || 'Interviewer')
      },
      timestamp: date
    });

    // Retain fine-grained topic observations with assessment evidence
    for (const obs of observations) {
      const obsContent = [
        `Candidate: ${candidateName}`,
        `Role: ${candidateRole}`,
        `Round: Round ${roundNumber}`,
        `Topic: ${obs.topic}`,
        `Assessment: ${obs.assessment}`,
        `Evidence: "${obs.detail}"`
      ].join('\n');

      await client.client.retain(client.bankId, obsContent, {
        context: `Candidate: ${candidateName} | Round ${roundNumber} Assessment for ${obs.topic}`,
        tags: [
          `candidate_${candidateId}`,
          `round_${roundNumber}`,
          `topic_${obs.topic.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
          `assessment_${obs.assessment.toLowerCase()}`
        ],
        metadata: {
          candidateId,
          candidateName,
          role: candidateRole,
          roundNumber: String(roundNumber),
          topic: obs.topic,
          assessment: obs.assessment,
          type: 'observation'
        },
        timestamp: date
      });
    }

    console.log(`[Hindsight Retain] Successfully retained ${observations.length + 1} memories for ${candidateName} into bank ${client.bankId}`);
  } catch (err) {
    console.error(`[Hindsight RETAIN failed]: ${err.message}`);
    throw new Error(`Hindsight RETAIN failed: ${err.message}. Please check Hindsight connection.`);
  }

  // 3. Store in Application Database for fast UI audit trail & visualization
  const retainedRecords = [];

  const expRecord = {
    id: `mem_exp_${uuidv4().slice(0, 8)}`,
    candidateId,
    candidateName,
    type: 'experience',
    bankId: client.bankId,
    roundNumber,
    interviewer: interviewer || 'Interviewer',
    title: `Round ${roundNumber} Interview (${candidateRole})`,
    content: feedback || `Interview round ${roundNumber} completed with interviewer ${interviewer}`,
    metadata: {
      roundNumber,
      interviewer,
      outcome,
      questionsCount: questions.length,
      questions: questions.map(q => typeof q === 'string' ? q : q.text)
    },
    timestamp: date
  };
  db.insert('memories', expRecord);
  retainedRecords.push(expRecord);

  for (const obs of observations) {
    const obsRecord = {
      id: `mem_obs_${uuidv4().slice(0, 8)}`,
      candidateId,
      candidateName,
      type: 'observation',
      subType: obs.sentiment === 'positive' ? 'strength' : 'weakness',
      bankId: client.bankId,
      roundNumber,
      title: `${obs.assessment === 'Strong' ? 'Strength' : 'Area to Investigate'}: ${obs.topic}`,
      content: `In Round ${roundNumber}, candidate demonstrated ${obs.assessment.toLowerCase()} assessment on ${obs.topic}: "${obs.detail}"`,
      skillTag: obs.topic,
      sentiment: obs.sentiment,
      timestamp: date
    };
    db.insert('memories', obsRecord);
    retainedRecords.push(obsRecord);
  }

  db.incrementMetric('retentionEvents', retainedRecords.length);
  db.incrementMetric('memoryUpdates', 1);

  return retainedRecords;
}

/**
 * Retains Resume World Facts into Hindsight
 */
async function retainResumeWorldFacts(candidateId, parsedResume) {
  const candidate = db.findById('candidates', candidateId);
  const candidateName = candidate ? candidate.name : 'Candidate';
  const roleTitle = parsedResume.role || candidate?.role || 'Developer';

  const factContent = [
    `Candidate: ${candidateName}`,
    `Role: ${roleTitle}`,
    `World Fact: Resume Baseline`,
    `Experience: ${parsedResume.experience || '2+ years'}`,
    `Core Skills: ${(parsedResume.skills || []).join(', ')}`,
    `Education: ${parsedResume.education || 'B.Tech in Computer Science'}`
  ].join('\n');

  try {
    await client.client.retain(client.bankId, factContent, {
      context: `Candidate: ${candidateName} | Baseline Qualifications`,
      tags: [
        `candidate_${candidateId}`,
        `round_0`,
        `type_world_fact`
      ],
      metadata: {
        candidateId,
        candidateName,
        type: 'world_fact',
        experience: parsedResume.experience || '2+ years'
      },
      timestamp: new Date().toISOString()
    });
    console.log(`[Hindsight Retain] Retained Resume World Facts for ${candidateName}`);
  } catch (err) {
    console.error(`[Hindsight RETAIN failed]: ${err.message}`);
    throw new Error(`Hindsight RETAIN failed: ${err.message}`);
  }

  const factMemory = {
    id: `mem_fact_${uuidv4().slice(0, 8)}`,
    candidateId,
    candidateName,
    type: 'world_fact',
    bankId: client.bankId,
    roundNumber: 0,
    title: 'Resume & Baseline Qualifications',
    content: factContent,
    metadata: {
      skills: parsedResume.skills,
      experience: parsedResume.experience,
      education: parsedResume.education,
      projects: parsedResume.projects
    },
    timestamp: new Date().toISOString()
  };

  db.insert('memories', factMemory);
  db.incrementMetric('retentionEvents', 1);
  return factMemory;
}

function extractSkillTopic(text, roleContext = '') {
  const lower = text.toLowerCase();

  // Database & Storage
  if (lower.includes('mongodb') || lower.includes('mongo')) return 'MongoDB';
  if (lower.includes('index') || lower.includes('b-tree') || lower.includes('database architecture')) return 'Database Architecture';
  if (lower.includes('query') || lower.includes('optimization') || lower.includes('explain plan')) return 'Query Optimization';
  
  // Backend & APIs
  if (lower.includes('fastapi') || lower.includes('api design') || lower.includes('rest')) return 'API Design';
  if (lower.includes('python')) return 'Python';
  if (lower.includes('system design') || lower.includes('horizontal scal') || lower.includes('architecture')) return 'System Design';
  if (lower.includes('distributed') || lower.includes('kafka') || lower.includes('consensus')) return 'Distributed Systems';
  
  // Frontend
  if (lower.includes('react') || lower.includes('hook') || lower.includes('component')) return 'React';
  if (lower.includes('typescript') || lower.includes('typing')) return 'TypeScript';
  if (lower.includes('webpack') || lower.includes('bundle') || lower.includes('vite')) return 'Webpack Tuning';
  if (lower.includes('tailwind') || lower.includes('css') || lower.includes('ui')) return 'Tailwind CSS';
  if (lower.includes('state') || lower.includes('redux') || lower.includes('zustand')) return 'State Management';

  // General & Behavioral
  if (lower.includes('communicat') || lower.includes('articulate') || lower.includes('presentation')) return 'Communication';

  return 'Technical Problem Solving';
}

module.exports = {
  retainInterviewFeedback,
  retainCandidateInteraction: retainInterviewFeedback, // backwards compatibility alias
  retainResumeWorldFacts
};
