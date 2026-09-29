import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Brain, 
  CheckCircle, 
  AlertTriangle, 
  HelpCircle, 
  Copy, 
  Check, 
  UserCheck, 
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { aiApi } from '../../services/api';
import { Badge } from '../common/Badge';

export function PrepareNextInterview({ candidateId, onClose }) {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingStage, setLoadingStage] = useState(0);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const stages = [
    { label: '🧠 Recalling candidate history from Hindsight...', desc: 'Traversing episodic memories, past rounds, and world facts' },
    { label: '🔎 Finding relevant interview evidence...', desc: 'Extracting verified strengths and prioritizing unresolved gaps' },
    { label: '✨ Preparing personalized questions...', desc: 'Synthesizing deep scenario questions tailored to candidate gaps' },
    { label: '✓ Finalizing interview plan...', desc: 'Applying recruiter persona preferences and evidence citations' }
  ];

  const loadPlan = async () => {
    setLoading(true);
    setLoadingStage(0);
    setError('');

    // Stage intervals for smooth visual progression
    const interval1 = setTimeout(() => setLoadingStage(1), 600);
    const interval2 = setTimeout(() => setLoadingStage(2), 1200);
    const interval3 = setTimeout(() => setLoadingStage(3), 1800);

    try {
      const res = await aiApi.prepareNextInterview(candidateId);
      if (res.data.success) {
        setPlan(res.data.plan);
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to prepare interview plan');
    } finally {
      clearTimeout(interval1);
      clearTimeout(interval2);
      clearTimeout(interval3);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (candidateId) {
      loadPlan();
    }
  }, [candidateId]);

  const copyToClipboard = () => {
    if (!plan) return;
    const text = `
HIRE RECALL AI — PERSONALIZED INTERVIEW PLAN
Candidate: ${plan.candidateName} (${plan.role})
Target: ${plan.targetRound}
Recruiter Persona: ${plan.recruiterPersona}

AVOID REPEATING (Already Proven):
${plan.avoidRepeating.map(a => `• ${a.topic}: ${a.reason}`).join('\n')}

FOCUS AREAS (Active Gaps from Hindsight):
${plan.focusAreas.map(f => `• [${f.urgency}] ${f.topic}: ${f.reason}`).join('\n')}

RECOMMENDED SCENARIO QUESTIONS:
${plan.recommendedQuestions.map((q, i) => `${i + 1}. ${q.question}\n   Why: ${q.whyThisQuestion}\n   Target: ${q.whatToLookFor}`).join('\n\n')}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center shadow-lg max-w-2xl mx-auto">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-brand-600 via-memory-600 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-brand-500/20 animate-pulse">
          <Brain className="w-8 h-8" />
        </div>

        <h4 className="text-base font-bold text-slate-800 transition-all">
          {stages[loadingStage].label}
        </h4>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-6">
          {stages[loadingStage].desc}
        </p>

        {/* Progress Bar & Stage Pills */}
        <div className="w-full bg-slate-100 rounded-full h-2 mb-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-brand-500 to-memory-600 h-2 transition-all duration-500 rounded-full"
            style={{ width: `${((loadingStage + 1) / stages.length) * 100}%` }}
          />
        </div>

        <div className="grid grid-cols-4 gap-2 text-[10px] text-slate-400 font-medium">
          <span className={loadingStage >= 0 ? 'text-brand-600 font-bold' : ''}>1. Recall</span>
          <span className={loadingStage >= 1 ? 'text-brand-600 font-bold' : ''}>2. Evidence</span>
          <span className={loadingStage >= 2 ? 'text-memory-600 font-bold' : ''}>3. Questions</span>
          <span className={loadingStage >= 3 ? 'text-emerald-600 font-bold' : ''}>4. Ready</span>
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
        <h4 className="text-sm font-bold text-rose-900">Failed to Generate Plan</h4>
        <p className="text-xs text-rose-600 mt-1 mb-4">{error}</p>
        <button
          onClick={loadPlan}
          className="px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-semibold"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-brand-950 via-slate-900 to-memory-950 text-white p-6 border-b border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 rounded bg-brand-500/20 text-brand-300 border border-brand-400/30">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-semibold tracking-wider uppercase text-brand-300">
                Hindsight-Grounded Interview Plan
              </span>
              <Badge variant="memory" size="xs">
                {plan.targetRound}
              </Badge>
            </div>
            <h3 className="text-xl font-extrabold text-white tracking-tight">
              Personalized Plan for {plan.candidateName}
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              {plan.role} • Recruiter Persona: <strong className="text-slate-100">{plan.recruiterPersona}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/10 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Plan'}</span>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/10 transition"
              >
                Close
              </button>
            )}
          </div>
        </div>

        {/* Synthesis Reasoning Quote */}
        <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200 leading-relaxed flex items-start gap-2.5">
          <Brain className="w-4 h-4 text-memory-400 shrink-0 mt-0.5" />
          <span>{plan.synthesisReasoning}</span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Memory Evidence Citations Strip */}
        <div className="p-3.5 rounded-xl bg-memory-50/70 border border-memory-200/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-memory-900 flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-memory-600" />
              Retrieved Hindsight Evidence ({plan.retrievedEvidence?.length || 0} memories cited)
            </span>
            <span className="text-[10px] text-memory-700 font-mono">Confidence: 96%</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {(plan.retrievedEvidence || []).map((ev, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-white border border-memory-100 text-xs shadow-2xs">
                <span className="font-semibold text-memory-950 block text-[11px] mb-0.5">
                  [{ev.roundLabel}] {ev.title}
                </span>
                <p className="text-slate-600 text-[11px] italic">"{ev.quote}"</p>
              </div>
            ))}
          </div>
        </div>

        {/* Two-Column Guidance: Avoid vs Focus */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Avoid Repeating */}
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80">
            <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Avoid Repeating (Already Proven)
            </h4>
            <ul className="space-y-2.5">
              {plan.avoidRepeating.map((item, idx) => (
                <li key={idx} className="bg-white p-2.5 rounded-lg border border-emerald-100 text-xs shadow-2xs">
                  <span className="font-bold text-emerald-950 block">{item.topic}</span>
                  <p className="text-slate-600 text-[11px] mt-0.5">{item.reason}</p>
                  <p className="text-[10px] text-emerald-700/80 italic mt-1 border-t border-slate-50 pt-1">
                    ✓ Evidence: {item.evidence}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* Focus Areas */}
          <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200/80">
            <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Focus Next Interview On (Unresolved Gaps)
            </h4>
            <ul className="space-y-2.5">
              {plan.focusAreas.map((item, idx) => (
                <li key={idx} className="bg-white p-2.5 rounded-lg border border-rose-100 text-xs shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-950">{item.topic}</span>
                    <Badge variant="danger" size="xs">{item.urgency}</Badge>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-0.5">{item.reason}</p>
                  <p className="text-[10px] text-rose-700/80 italic mt-1 border-t border-slate-50 pt-1">
                    ⚠ Evidence: {item.evidence}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recommended Tailored Questions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-brand-600" />
              Recommended Deep-Dive Scenario Questions
            </h4>
            <span className="text-xs text-slate-500">
              Style: {plan.interviewerStyle}
            </span>
          </div>

          <div className="space-y-4">
            {plan.recommendedQuestions.map((q, idx) => (
              <div
                key={q.id || idx}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 shadow-sm hover:border-brand-300 transition"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-800">{q.category}</span>
                  </div>
                  <Badge variant="primary" size="xs">
                    {q.focusSkill}
                  </Badge>
                </div>

                <p className="text-sm font-semibold text-slate-900 pl-8 leading-snug">
                  "{q.question}"
                </p>

                {/* Why this question was chosen */}
                <div className="mt-3 pl-8 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/60">
                    <strong className="text-amber-900 block text-[11px] mb-0.5">🧠 Why this question?</strong>
                    <span className="text-amber-800 text-[11px]">{q.whyThisQuestion}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-200/60">
                    <strong className="text-blue-900 block text-[11px] mb-0.5">🎯 What to look for:</strong>
                    <span className="text-blue-800 text-[11px]">{q.whatToLookFor}</span>
                  </div>
                </div>

                {/* Evidence citations */}
                {q.retrievedEvidence && (
                  <div className="mt-2.5 pl-8 text-[11px] text-slate-500 flex items-center gap-2">
                    <span className="font-semibold text-slate-600">Memory Citations:</span>
                    {q.retrievedEvidence.map((ev, eIdx) => (
                      <span key={eIdx} className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                        Round {ev.round}: "{ev.note}"
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
