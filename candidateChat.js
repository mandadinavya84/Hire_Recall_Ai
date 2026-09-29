const memoryService = require('../hindsight/memoryService');
const db = require('../../data/dbAdapter');
const llmClient = require('./llmClient');

/**
 * Context-aware AI chatbot grounded in candidate's persistent Hindsight memory.
 * Dynamically responds for ANY candidate, role, and interview history.
 */
async function answerCandidateQuestion(candidateId, userQuery) {
  const candidate = db.findById('candidates', candidateId);
  if (!candidate) {
    throw new Error(`Candidate ${candidateId} not found`);
  }

  // 1. Recall relevant memories from Hindsight
  const recallResult = await memoryService.recall(candidateId, userQuery, { limit: 8 });
  const interviews = db.find('interviews', { candidateId }).sort((a, b) => a.roundNumber - b.roundNumber);
  const reflection = await memoryService.reflect(candidateId);

  // 2. Try LLM if configured (Gemini or OpenAI)
  if (llmClient.isLiveProviderAvailable()) {
    try {
      const systemPrompt = `You are HireRecall AI, a Recruitment Memory Assistant for candidate ${candidate.name} (${candidate.role}).
Answer the recruiter's question accurately using ONLY the provided Hindsight memory context and interview history.
Do not invent facts. Cite relevant rounds, interviewers, and observations. Keep the answer concise, professional, and evidence-grounded.`;

      const userPrompt = `Candidate: ${candidate.name}
Role: ${candidate.role}
Experience: ${candidate.experience}
Completed Rounds: ${interviews.length}

Retrieved Hindsight Memories:
${recallResult.evidence.map(e => `[${e.roundLabel}] ${e.title}: "${e.quote}"`).join('\n')}

Verified Strengths: ${reflection.verifiedStrengths.join(', ') || 'None'}
Active Gaps: ${reflection.activeGaps.join(', ') || 'None'}
Improved Areas: ${reflection.improvedAreas.join(', ') || 'None'}

Interviews:
${interviews.map(i => `Round ${i.roundNumber} (${i.interviewer}): Outcome="${i.outcome}", Notes="${i.feedback}"`).join('\n')}

Recruiter Question: "${userQuery}"`;

      const llmResponse = await llmClient.generateCompletion({ systemPrompt, userPrompt });
      if (llmResponse && llmResponse.trim()) {
        return {
          candidateId,
          candidateName: candidate.name,
          query: userQuery,
          response: llmResponse.trim(),
          evidenceCited: recallResult.evidence.slice(0, 3),
          suggestedFollowUps: generateFollowUps(candidate.name, userQuery),
          timestamp: new Date().toISOString(),
          provider: 'LLM (Cloud)'
        };
      }
    } catch (err) {
      console.warn('[Candidate Chat] LLM chat failed, using dynamic memory synthesizer:', err.message);
    }
  }

  // 3. Dynamic Heuristic Memory Synthesizer
  const answer = synthesizeAnswer({
    query: userQuery,
    candidate,
    memories: recallResult.memories,
    evidence: recallResult.evidence,
    interviews,
    reflection
  });

  return {
    candidateId,
    candidateName: candidate.name,
    query: userQuery,
    response: answer.text,
    evidenceCited: answer.citations,
    suggestedFollowUps: answer.followUps,
    timestamp: new Date().toISOString(),
    provider: 'Embedded Biomimetic Synthesizer'
  };
}

function synthesizeAnswer({ query, candidate, memories, evidence, interviews, reflection }) {
  const q = query.toLowerCase();
  const name = candidate.name;
  const role = candidate.role;

  // Extract query keywords for memory matching
  const stopWords = ['what', 'were', 'the', 'primary', 'exhibited', 'earlier', 'rounds', 'about', 'candidate', 'tell', 'show', 'round', 'interview'];
  const queryTokens = q.split(/[^a-z0-9]+/).filter(w => w.length > 2 && !stopWords.includes(w));
  const topicMatchingMemories = (evidence || []).filter(e => {
    const memStr = `${e.title || ''} ${e.quote || ''} ${e.text || ''}`.toLowerCase();
    return queryTokens.some(token => memStr.includes(token));
  });

  // Weaknesses / Gaps / Concerns / Challenges
  if (q.includes('weak') || q.includes('gap') || q.includes('struggle') || q.includes('issue') || q.includes('concern') || q.includes('challenge') || q.includes('difficult')) {
    const citations = topicMatchingMemories.length > 0
      ? topicMatchingMemories
      : (evidence || []).filter(e => e.sentiment === 'negative' || (e.title && e.title.includes('Investigate')) || /weak|struggle|challenge|gap|issue|concern/i.test(e.text || ''));

    let text = `Based on Hindsight candidate memory across ${interviews.length} rounds for **${name}** (${role}):\n\n`;
    
    if (topicMatchingMemories.length > 0) {
      text += `Regarding the specific technical focus requested (${queryTokens.join(', ')}):\n`;
      topicMatchingMemories.slice(0, 3).forEach((mem, idx) => {
        text += `${idx + 1}. **[${mem.roundLabel || 'Round 1'}]**: "${mem.quote || mem.text}"\n`;
      });
      if ((reflection.improvedAreas || []).length > 0) {
        text += `\n*Observed Evolution:* In subsequent evaluations, ${name} showed marked progress in ${(reflection.improvedAreas || []).join(', ')}.`;
      }
    } else if ((reflection.activeGaps || []).length > 0) {
      reflection.activeGaps.forEach((gap, idx) => {
        const mem = citations.find(c => (c.title || '').includes(gap) || (c.quote || '').includes(gap));
        text += `${idx + 1}. **${gap}**: ${mem ? `In ${mem.roundLabel}, the interviewer noted "${mem.quote}"` : `Flagged as an active gap requiring evaluation.`}\n`;
      });
      if ((reflection.improvedAreas || []).length > 0) {
        text += `\n*Observed Progress:* ${reflection.improvedAreas.join(', ')} showed tangible improvement in recent rounds.`;
      }
    } else {
      text += `No critical technical gaps are currently active. All evaluated areas have met or exceeded the rubric for ${role}.\n`;
    }

    return {
      text,
      citations: (topicMatchingMemories.length > 0 ? topicMatchingMemories : citations).slice(0, 3),
      followUps: [
        `What did we ask in Round 1?`,
        `What has improved across rounds?`,
        `What should we ask in the next interview?`
      ]
    };
  }

  // Strengths / What is candidate good at?
  if (q.includes('strength') || q.includes('good at') || q.includes('excel') || q.includes('positive')) {
    const citations = evidence.filter(e => e.sentiment === 'positive' || (e.title && e.title.includes('Strength')));
    const strengths = reflection.verifiedStrengths;

    let text = `Hindsight memory confirms the following verified competencies for **${name}**:\n\n`;
    if (strengths.length > 0) {
      strengths.forEach((str, idx) => {
        const mem = citations.find(c => c.title.includes(str) || c.quote.includes(str));
        text += `${idx + 1}. **${str}**: ${mem ? `Observed in ${mem.roundLabel}: "${mem.quote}"` : `Validated consistently during technical rounds.`}\n`;
      });
      text += `\n**Recruiter Recommendation:** Bypass elementary questions on ${strengths.slice(0, 2).join(' and ')} in future rounds to save interview time.`;
    } else {
      text += `Baseline skills from resume: ${(candidate.resume?.skills || []).slice(0, 4).join(', ')}. Technical screening is in progress.`;
    }

    return {
      text,
      citations: citations.slice(0, 3),
      followUps: [
        `What are ${name}'s biggest gaps?`,
        `Prepare the next interview plan`,
        `Did we already ask about technical design?`
      ]
    };
  }

  // Specific Round inquiries (e.g. Round 1, Round 2, Screening)
  const roundMatch = q.match(/round\s*(\d+)/i);
  if (roundMatch || q.includes('screening') || q.includes('first round')) {
    const rNum = roundMatch ? parseInt(roundMatch[1], 10) : 1;
    const targetRound = interviews.find(i => i.roundNumber === rNum);
    const roundMemories = evidence.filter(e => e.round === rNum);

    if (targetRound) {
      let text = `In **${targetRound.roundName || `Round ${rNum}`}** with ${targetRound.interviewer} on ${new Date(targetRound.date).toLocaleDateString()}:\n\n`;
      text += `• **Interviewer Notes:** "${targetRound.feedback}"\n`;
      if (targetRound.strengths && targetRound.strengths.length > 0) {
        text += `• **Strengths Observed:** ${targetRound.strengths.join(', ')}\n`;
      }
      if (targetRound.weaknesses && targetRound.weaknesses.length > 0) {
        text += `• **Gaps Flagged:** ${targetRound.weaknesses.join(', ')}\n`;
      }
      if (targetRound.questions && targetRound.questions.length > 0) {
        text += `• **Questions Evaluated:**\n`;
        targetRound.questions.forEach((qItem, idx) => {
          text += `  ${idx + 1}. "${typeof qItem === 'string' ? qItem : qItem.text}"\n`;
        });
      }
      text += `\n**Outcome:** ${targetRound.outcome}`;

      return {
        text,
        citations: roundMemories.slice(0, 3),
        followUps: [
          `What happened in the next round?`,
          `What should we ask next?`,
          `What are ${name}'s core strengths?`
        ]
      };
    }
  }

  // Did we already ask about [Topic]?
  if (q.includes('already ask') || q.includes('did we ask') || q.includes('already cover')) {
    // Search previous questions across rounds
    const allQuestions = [];
    interviews.forEach(iv => {
      (iv.questions || []).forEach(qItem => {
        allQuestions.push({ round: iv.roundNumber, text: typeof qItem === 'string' ? qItem : qItem.text });
      });
    });

    // Check matching
    const matchingQuestions = allQuestions.filter(qItem => {
      const tokens = q.replace(/did we ask|already ask|about/gi, '').split(/\s+/).filter(Boolean);
      return tokens.some(t => qItem.text.toLowerCase().includes(t.toLowerCase()) && t.length > 3);
    });

    let text = '';
    if (matchingQuestions.length > 0) {
      text += `Yes, according to Hindsight episodic interview records, we asked:\n\n`;
      matchingQuestions.forEach(mq => {
        text += `• **Round ${mq.round}:** "${mq.text}"\n`;
      });
      text += `\n**Recommendation:** Do not ask this identical question again. Instead, elevate the difficulty or test real-world failure scenarios in the next round.`;
    } else {
      text += `According to Hindsight memory across ${interviews.length} rounds, this specific topic has **not yet been asked** or logged in candidate interview records.\n\n`;
      text += `It is eligible for inclusion in the upcoming interview plan.`;
    }

    return {
      text,
      citations: evidence.slice(0, 2),
      followUps: [
        `What should I ask next?`,
        `What are ${name}'s biggest gaps?`,
        `How has the assessment changed?`
      ]
    };
  }

  // Improvements / What has changed?
  if (q.includes('improv') || q.includes('better') || q.includes('progress') || q.includes('evolv')) {
    let text = `Hindsight memory tracks the following evolution for **${name}**:\n\n`;
    if (reflection.improvedAreas.length > 0) {
      reflection.improvedAreas.forEach(imp => {
        text += `• **${imp}**: Candidate demonstrated tangible progress, moving from earlier hesitation to satisfactory clarity.\n`;
      });
    } else {
      text += `• Candidate has shown consistent technical performance in ${reflection.verifiedStrengths.slice(0, 2).join(' and ') || 'primary screening areas'}.\n`;
    }
    if (reflection.activeGaps.length > 0) {
      text += `\n*Unresolved Focus for Next Round:* ${reflection.activeGaps.join(', ')}.`;
    }

    return {
      text,
      citations: evidence.slice(0, 3),
      followUps: [
        `What areas remain weak?`,
        `Prepare the next interview plan`,
        `What did we ask in Round 1?`
      ]
    };
  }

  // Overall Evolution / Assessment Journey
  if (q.includes('assessment change') || q.includes('across') || q.includes('journey') || q.includes('evolution')) {
    let text = `Here is how the hiring team's assessment of **${name}** has evolved across interviews:\n\n`;
    text += `• **Baseline (Resume)**: Candidate with ${candidate.experience} experience applying for ${role}.\n`;
    interviews.forEach(iv => {
      text += `• **Round ${iv.roundNumber} (${iv.roundName || 'Interview'})**: ${iv.feedback}\n`;
    });
    text += `\n*Hindsight Reflection Summary:* ${reflection.narrative}`;

    return {
      text,
      citations: evidence.slice(0, 4),
      followUps: [
        `What should we ask in the next round?`,
        `What are the verified strengths?`,
        `Compare memory impact (before/after)`
      ]
    };
  }

  // What should I ask next?
  if (q.includes('what should i ask') || q.includes('next interview') || q.includes('suggest')) {
    const focusGaps = reflection.activeGaps;
    let text = `Based on retrieved memories for **${name}**, here is your priority plan for the next round:\n\n`;
    if (reflection.verifiedStrengths.length > 0) {
      text += `1. **Bypass validated skills**: Candidate already proved competence in ${reflection.verifiedStrengths.slice(0, 2).join(' and ')}.\n`;
    }
    if (focusGaps.length > 0) {
      text += `2. **Focus on unresolved gaps**: Prioritize ${focusGaps.join(' and ')}.\n`;
      text += `3. **Recommended Angle**: Present a deep architectural trade-off scenario to test real-world depth rather than basic definitions.\n`;
    } else {
      text += `2. **Focus on advanced system scenarios**: Evaluate high-scale reliability and architectural leadership.\n`;
    }

    return {
      text,
      citations: evidence.slice(0, 3),
      followUps: [
        `Prepare the full Next Interview Plan`,
        `What are his biggest gaps?`,
        `What did we discuss in Round 1?`
      ]
    };
  }

  // Generic Default grounded in memories
  let text = `Retrieved ${evidence.length} relevant Hindsight memory records for **${name}** (${role}):\n\n`;
  evidence.slice(0, 3).forEach((e, idx) => {
    text += `${idx + 1}. **[${e.roundLabel}] ${e.title}**: ${e.quote}\n`;
  });
  text += `\n${name} currently has ${interviews.length} completed rounds. Core strengths include ${reflection.verifiedStrengths.join(', ') || 'Initial Screening'}, with priority focus on ${reflection.activeGaps.join(', ') || 'Upcoming rounds'}.`;

  return {
    text,
    citations: evidence.slice(0, 3),
    followUps: generateFollowUps(name, query)
  };
}

function generateFollowUps(candidateName, query) {
  return [
    `What are ${candidateName}'s biggest weaknesses?`,
    `What did we discuss in Round 1?`,
    `What should I ask in the next interview?`
  ];
}

module.exports = {
  answerCandidateQuestion
};
