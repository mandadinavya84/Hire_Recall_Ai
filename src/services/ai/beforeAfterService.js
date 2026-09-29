const memoryService = require('../hindsight/memoryService');
const db = require('../../data/dbAdapter');

/**
 * Demonstrates the stark difference between an AI without memory vs HireRecall powered by Hindsight.
 * Dynamically tailored for ANY candidate and role.
 */
async function generateBeforeAfterComparison(candidateId) {
  const candidate = db.findById('candidates', candidateId);
  if (!candidate) {
    throw new Error(`Candidate ${candidateId} not found`);
  }

  const interviews = db.find('interviews', { candidateId });
  const memoryResult = await memoryService.recall(candidateId, 'weakness strength gap interview', { limit: 8 });
  const reflection = await memoryService.reflect(candidateId);

  const role = candidate.role;
  const isFrontend = role.toLowerCase().includes('frontend') || role.toLowerCase().includes('react');
  const isML = role.toLowerCase().includes('machine learning') || role.toLowerCase().includes('ai');

  // Dynamic without-memory questions tailored to role
  let withoutMemoryQuestions = [];
  if (isFrontend) {
    withoutMemoryQuestions = [
      {
        question: 'Can you explain the difference between state and props in React?',
        critique: 'Elementary React definition that was already proven in screening. Wastes 20 minutes.'
      },
      {
        question: 'What is TypeScript and how does it differ from JavaScript?',
        critique: 'Basic language check. Misses that candidate already has 4 years of TypeScript experience.'
      },
      {
        question: 'What is CSS Flexbox and how do you center a div?',
        critique: 'Completely ignores that the candidate struggled with Webpack build optimization.'
      }
    ];
  } else if (isML) {
    withoutMemoryQuestions = [
      {
        question: 'Can you explain the difference between supervised and unsupervised learning?',
        critique: 'Textbook definition already validated. Ignores candidate’s Master’s degree in AI.'
      },
      {
        question: 'What is a neural network loss function?',
        critique: 'Naive check. Misses that candidate already implemented complex attention losses in Round 1.'
      },
      {
        question: 'What is PyTorch?',
        critique: 'Oblivious to the fact that candidate struggled with TensorRT and inference latency profiling.'
      }
    ];
  } else {
    // Backend default
    withoutMemoryQuestions = [
      {
        question: 'Can you explain the difference between a list and a tuple in Python?',
        critique: 'Repeats elementary Python syntax that was already thoroughly validated in Round 1.'
      },
      {
        question: 'What is a REST API and how does HTTP GET differ from POST?',
        critique: 'Wastes 20 minutes on basic API concepts already proven in Round 1 and Round 2.'
      },
      {
        question: 'Have you used MongoDB or databases before?',
        critique: 'Naive check. Misses that candidate has 2 years exp and repeatedly struggled with indexing.'
      }
    ];
  }

  // Dynamic with-memory questions derived from candidate evidence, active gaps, and reflection
  const withMemoryQuestions = [];
  const allMemText = ((memoryResult.evidence || []).map(e => e.text || e.quote || '').join(' ') + ' ' + (reflection.activeGaps || []).join(' ') + ' ' + (reflection.improvedAreas || []).join(' ')).toLowerCase();
  
  if (!isFrontend && !isML) {
    // Backend candidate: memory directly identifies the database/indexing challenge from earlier rounds
    if (allMemText.includes('index') || allMemText.includes('database') || allMemText.includes('mongodb') || allMemText.includes('query')) {
      withMemoryQuestions.push({
        question: 'In Round 1, you touched on indexing basics. Now let\'s go deeper: How would you architect a compound indexing strategy for a database collection with 50M records with 15k writes/sec, considering the ESR (Equality, Sort, Range) rule and index memory overhead?',
        why: 'Directly follows up on MongoDB query optimization and compound indexing evaluated in prior rounds, avoiding repeated basic questions.'
      });
    }
  } else if (isFrontend) {
    if (allMemText.includes('webpack') || allMemText.includes('bundle') || allMemText.includes('build') || allMemText.includes('performance')) {
      withMemoryQuestions.push({
        question: 'How would you profile and optimize a 5MB bundle size using code splitting, dynamic imports, and Webpack plugins?',
        why: 'Follows up on Round 1 feedback where candidate struggled with Webpack bundle optimization.'
      });
    }
  } else if (isML) {
    if (allMemText.includes('latency') || allMemText.includes('tensorrt') || allMemText.includes('quantization') || allMemText.includes('serving')) {
      withMemoryQuestions.push({
        question: 'How would you serve this model to maintain sub-40ms P99 latency under 500 QPS with INT8 quantization and TensorRT?',
        why: 'Follows up on Round 1 feedback where production inference serving was flagged as weak.'
      });
    }
  }

  const activeGaps = reflection.activeGaps || [];
  if (activeGaps.length > 0) {
    activeGaps.slice(0, 3).forEach(gap => {
      const gLower = gap.toLowerCase();
      if ((gLower.includes('database') || gLower.includes('optimization') || gLower.includes('index') || gLower.includes('mongodb')) && !withMemoryQuestions.some(q => q.question.includes('indexing'))) {
        withMemoryQuestions.push({
          question: 'How would you architect an indexing strategy for a database collection with 50M records and high write volume?',
          why: `Directly targets ${gap} flagged as an active gap in prior interview rounds.`
        });
      } else if (gLower.includes('distributed') || gLower.includes('system design') || gLower.includes('consensus') || gLower.includes('network')) {
        withMemoryQuestions.push({
          question: `Walk us through how you would scale this service horizontally when under heavy concurrent traffic spikes without data loss.`,
          why: `Probes horizontal scalability and distributed consensus gap noted in previous feedback.`
        });
      } else if ((gLower.includes('webpack') || gLower.includes('bundle')) && !withMemoryQuestions.some(q => q.question.includes('bundle'))) {
        withMemoryQuestions.push({
          question: 'How would you profile and optimize a 5MB bundle size using code splitting, dynamic imports, and Webpack plugins?',
          why: `Follows up on Round 1 feedback where candidate struggled with Webpack bundle optimization.`
        });
      } else {
        withMemoryQuestions.push({
          question: `In production, how would you troubleshoot unexpected performance degradations in ${gap}?`,
          why: `Follows up on ${gap} identified as active gap in candidate memory.`
        });
      }
    });
  }

  // Ensure 3 questions
  if (withMemoryQuestions.length < 3) {
    withMemoryQuestions.push({
      question: `How would you architect failure isolation and circuit breakers for your ${candidate.role} microservices?`,
      why: `Tests unevaluated system design requirements while adapting to recruiter preferences.`
    });
  }

  return {
    candidateName: candidate.name,
    role: candidate.role,
    completedRounds: interviews.length,
    withoutMemory: {
      title: 'WITHOUT MEMORY (Standard Stateless AI)',
      description: 'The AI only has the resume and the generic job description. It is completely blind to prior interview interactions.',
      contextAwareness: 'Stateless (0 prior interviews recalled)',
      questionsSuggested: withoutMemoryQuestions,
      blindSpots: [
        `Unaware candidate already validated core competencies in ${reflection.verifiedStrengths.slice(0, 2).join(' and ') || 'screening'}`,
        `Completely oblivious to active gaps: ${reflection.activeGaps.slice(0, 2).join(', ') || 'prior struggles'}`,
        'Zero continuity with previous interviewers notes',
        'Creates an exhausting, repetitive candidate experience'
      ]
    },
    withMemory: {
      title: 'WITH HINDSIGHT MEMORY (HireRecall AI)',
      description: `The AI recalls ${memoryResult.evidence.length} structured memory nodes across ${interviews.length} rounds, synthesizes gaps, and adapts to recruiter preferences.`,
      contextAwareness: `Recalled ${memoryResult.evidence.length} Hindsight memories across ${interviews.length} rounds`,
      retrievedEvidence: memoryResult.evidence.slice(0, 3).map(e => ({
        source: e.roundLabel,
        quote: e.quote
      })),
      avoidRepeating: reflection.verifiedStrengths.slice(0, 3).map(s => `${s} (Proven in prior evaluations)`),
      questionsSuggested: withMemoryQuestions.slice(0, 3),
      intelligenceValue: [
        'Zero redundant questions — candidate feels recognized and respected',
        'Directly tests whether prior gaps were resolved',
        'Objective audit trail linking questions to previous interviewer notes',
        'Transforms recruitment from fragmented rounds into a continuous learning curve'
      ]
    }
  };
}

module.exports = {
  generateBeforeAfterComparison
};
