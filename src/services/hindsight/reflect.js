const db = require('../../data/dbAdapter');
const client = require('./client');

/**
 * Reflects over candidate memory banks to synthesize candidate evolution and gap analysis
 * Dynamically adapts to ANY candidate, ANY job role, and ANY technical domain.
 */
async function reflectCandidateEvolution(candidateId) {
  const candidate = db.findById('candidates', candidateId);
  if (!candidate) {
    throw new Error(`Candidate with id ${candidateId} not found`);
  }

  // 1. Fetch all interviews and memories for this specific candidate
  const interviews = db.find('interviews', { candidateId }).sort((a, b) => a.roundNumber - b.roundNumber);
  const memories = db.find('memories', { candidateId });

  // 2. Find corresponding Job Role
  const role = db.findOne('roles', { title: candidate.role }) || {
    title: candidate.role || 'Software Engineer',
    requiredSkills: candidate.resume?.skills?.slice(0, 4) || ['Technical Problem Solving'],
    preferredSkills: ['System Architecture', 'Communication']
  };

  // 3. Dynamically collect all relevant competencies for this candidate & role
  const skillSet = new Set();

  // Add required and preferred skills from role
  (role.requiredSkills || []).forEach(s => skillSet.add(s));
  (role.preferredSkills || []).forEach(s => skillSet.add(s));

  // Add resume skills
  (candidate.resume?.skills || []).forEach(s => skillSet.add(s));

  // Add memory tags
  memories.forEach(m => {
    if (m.skillTag && m.skillTag !== 'General Technical') skillSet.add(m.skillTag);
  });

  // Always include communication
  skillSet.add('Communication');

  // Build dynamic round progression tracker for each detected skill
  const skillRounds = {};
  for (const skill of skillSet) {
    skillRounds[skill] = { r1: null, r2: null, r3: null, r4: null };
  }

  for (const iv of interviews) {
    const rKey = `r${iv.roundNumber}`;
    const roundMemories = memories.filter(m => m.roundNumber === iv.roundNumber);

    for (const skill of Object.keys(skillRounds)) {
      const sLower = skill.toLowerCase();

      // Check observation memories for this round
      const memStrength = roundMemories.some(m => 
        (m.skillTag && (m.skillTag.toLowerCase() === sLower || sLower.includes(m.skillTag.toLowerCase()) || m.skillTag.toLowerCase().includes(sLower))) && 
        (m.sentiment === 'positive' || m.subType === 'strength')
      );
      const memWeakness = roundMemories.some(m => 
        (m.skillTag && (m.skillTag.toLowerCase() === sLower || sLower.includes(m.skillTag.toLowerCase()) || m.skillTag.toLowerCase().includes(sLower))) && 
        (m.sentiment === 'negative' || m.subType === 'weakness')
      );

      // Check strengths and weaknesses specific to this round
      const inStrengths = matchesSkillText(skill, iv.strengths);
      const inWeaknesses = matchesSkillText(skill, iv.weaknesses);

      const isEvaluated = memStrength || memWeakness || inStrengths || inWeaknesses;
      if (!isEvaluated) continue;

      const isWeak = memWeakness || inWeaknesses;
      const isStrong = memStrength || inStrengths;

      if (isWeak && !isStrong) {
        skillRounds[skill][rKey] = 'Weak';
      } else if (isStrong && !isWeak) {
        skillRounds[skill][rKey] = 'Proven';
      } else if (isStrong && isWeak) {
        skillRounds[skill][rKey] = 'Improved';
      }
    }
  }

  // 4. Calculate current synthesized status for each skill
  const matrix = Object.entries(skillRounds).map(([skill, rounds]) => {
    let current = 'Not Evaluated';
    let icon = '⚪';
    let trajectory = 'Pending evaluation against role rubric';

    const states = [rounds.r1, rounds.r2, rounds.r3, rounds.r4].filter(Boolean);
    const latestState = states[states.length - 1];
    const hadWeaknessEarlier = states.slice(0, -1).some(s => s === 'Weak');

    if (latestState === 'Proven' || latestState === 'Improved') {
      if (hadWeaknessEarlier) {
        current = 'Improved';
        icon = '🟠';
        trajectory = 'Progressed from earlier deficit to verified competence';
      } else {
        current = 'Solid';
        icon = '🟢';
        trajectory = states.length > 1 ? 'Consistently demonstrated' : 'Demonstrated in screening';
      }
    } else if (latestState === 'Weak') {
      current = 'Active Gap';
      icon = '🔴';
      const weakCount = states.filter(s => s === 'Weak').length;
      trajectory = weakCount > 1
        ? 'Repeated struggle across multiple interviews'
        : 'Flagged in recent evaluation';
    } else {
      current = 'Not Evaluated';
      icon = '⚪';
      trajectory = 'Not yet evaluated';
    }

    return {
      skill,
      round1: rounds.r1 ? formatStatus(rounds.r1) : '—',
      round2: rounds.r2 ? formatStatus(rounds.r2) : '—',
      round3: rounds.r3 ? formatStatus(rounds.r3) : '—',
      currentStatus: current,
      icon,
      trajectory
    };
  }).filter(row => {
    // Keep evaluated skills or top required skills from role
    return row.currentStatus !== 'Not Evaluated' || (role.requiredSkills || []).includes(row.skill);
  });

  // Sort: Active gaps (multi-round struggles first), then Improved, then Solid, then Not Evaluated
  const order = { 'Active Gap': 1, 'Improved': 2, 'Solid': 3, 'Not Evaluated': 4 };
  matrix.sort((a, b) => {
    const orderDiff = (order[a.currentStatus] || 5) - (order[b.currentStatus] || 5);
    if (orderDiff !== 0) return orderDiff;
    if (a.currentStatus === 'Active Gap') {
      const aWeaks = [a.round1, a.round2, a.round3].filter(r => r && r.includes('Weak')).length;
      const bWeaks = [b.round1, b.round2, b.round3].filter(r => r && r.includes('Weak')).length;
      return bWeaks - aWeaks;
    }
    return 0;
  });

  // Categorize for Interview Planner
  const verifiedStrengths = matrix.filter(m => m.currentStatus === 'Solid').map(m => m.skill);
  const activeGaps = matrix.filter(m => m.currentStatus === 'Active Gap').map(m => m.skill);
  const improvedAreas = matrix.filter(m => m.currentStatus === 'Improved').map(m => m.skill);
  const unevaluated = matrix.filter(m => m.currentStatus === 'Not Evaluated').map(m => m.skill);

  // Compile synthesized narrative dynamically
  const narrative = generateDynamicEvolutionNarrative({
    name: candidate.name,
    roleTitle: candidate.role,
    matrix,
    roundsCount: interviews.length,
    verifiedStrengths,
    activeGaps,
    improvedAreas
  });

  // Call official Hindsight Reflect
  let hindsightReflectionText = '';
  try {
    const reflectRes = await client.client.reflect(client.bankId, `Summarize the evolution, verified competencies, and unresolved technical gaps for candidate ${candidate.name} applying for ${candidate.role}`, {
      tags: [`candidate_${candidateId}`],
      tagsMatch: 'any_strict'
    });
    console.log(`[Hindsight Reflect] Official Hindsight reflection completed for candidate ${candidateId}`);
    if (reflectRes && reflectRes.text) {
      hindsightReflectionText = reflectRes.text;
    }
  } catch (err) {
    console.warn(`[Hindsight REFLECT failed]: ${err.message}`);
  }

  return {
    candidateId,
    candidateName: candidate.name,
    role: candidate.role,
    totalRoundsCompleted: interviews.length,
    matrix,
    verifiedStrengths,
    activeGaps,
    improvedAreas,
    unevaluated,
    narrative,
    hindsightReflection: hindsightReflectionText || narrative
  };
}

function formatStatus(status) {
  if (status === 'Proven') return '🟢 Proven';
  if (status === 'Weak') return '🔴 Weak';
  if (status === 'Improved') return '🟠 Improved';
  return status;
}

function generateDynamicEvolutionNarrative({ name, roleTitle, matrix, roundsCount, verifiedStrengths, activeGaps, improvedAreas }) {
  if (roundsCount === 0) {
    return `${name} is a new applicant for ${roleTitle}. Baseline qualifications have been recorded in Hindsight World Facts. Technical screening is upcoming.`;
  }

  let text = `${name} has completed ${roundsCount} interview round${roundsCount > 1 ? 's' : ''} for the ${roleTitle} role. `;

  if (verifiedStrengths.length > 0) {
    text += `Core competencies in ${verifiedStrengths.slice(0, 3).join(', ')} were demonstrated solidly. `;
  }

  if (improvedAreas.length > 0) {
    text += `Notably, ${improvedAreas.join(', ')} showed positive progression, addressing concerns noted in previous rounds. `;
  }

  if (activeGaps.length > 0) {
    text += `However, ${activeGaps.join(', ')} remains an unresolved gap requiring targeted evaluation in the next round before a hiring consensus can be reached.`;
  } else {
    text += `All primary technical competencies required for this role have been satisfactorily evaluated.`;
  }

  return text;
}

function matchesSkillText(skill, textList) {
  if (!textList || textList.length === 0) return false;
  const sLower = skill.toLowerCase();
  const skillWords = sLower.split(/[\s/_-]+/).filter(w => w.length > 2);

  return textList.some(item => {
    const itemLower = item.toLowerCase();
    if (itemLower.includes(sLower)) return true;
    if (skillWords.some(w => itemLower.includes(w))) return true;

    // Domain synonym matches
    if ((sLower.includes('database') || sLower.includes('mongo') || sLower.includes('query') || sLower.includes('index')) &&
        (itemLower.includes('index') || itemLower.includes('database') || itemLower.includes('query') || itemLower.includes('b-tree') || itemLower.includes('mongo') || itemLower.includes('sql'))) {
      return true;
    }
    if ((sLower.includes('webpack') || sLower.includes('bundle') || sLower.includes('build')) &&
        (itemLower.includes('webpack') || itemLower.includes('bundle') || itemLower.includes('build'))) {
      return true;
    }
    if ((sLower.includes('react') || sLower.includes('frontend')) &&
        (itemLower.includes('react') || itemLower.includes('frontend') || itemLower.includes('ui'))) {
      return true;
    }
    if ((sLower.includes('pytorch') || sLower.includes('ml')) &&
        (itemLower.includes('pytorch') || itemLower.includes('tensor') || itemLower.includes('model'))) {
      return true;
    }
    if ((sLower.includes('system') || sLower.includes('distributed')) &&
        (itemLower.includes('system design') || itemLower.includes('distributed') || itemLower.includes('scale') || itemLower.includes('consensus') || itemLower.includes('kafka'))) {
      return true;
    }
    return false;
  });
}

module.exports = {
  reflectCandidateEvolution,
  reflectCandidateProgress: reflectCandidateEvolution
};
