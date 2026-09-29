import React from 'react';
import { Calendar, User, CheckCircle2, AlertCircle, HelpCircle, ArrowRight, Clock } from 'lucide-react';
import { Badge } from '../common/Badge';

export function CandidateTimeline({ interviews = [], onAddInterviewClick }) {
  if (!interviews || interviews.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 p-8 text-center">
        <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <h4 className="text-base font-semibold text-slate-800">No Interview Rounds Logged Yet</h4>
        <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-4">
          Conduct an interview and submit feedback to establish candidate memories in Hindsight.
        </p>
        <button
          onClick={onAddInterviewClick}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition"
        >
          Add First Interview Round
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <span>Interview Timeline</span>
          <span className="text-xs font-normal text-slate-500">({interviews.length} rounds recorded)</span>
        </h3>
        <button
          onClick={onAddInterviewClick}
          className="text-xs font-medium text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg border border-brand-200 transition"
        >
          + Add Next Interview Round
        </button>
      </div>

      <div className="relative pl-6 border-l-2 border-slate-200 space-y-8">
        {interviews.map((iv, idx) => (
          <div key={iv.id || idx} className="relative group">
            {/* Timeline node icon */}
            <div className="absolute -left-[31px] top-1.5 w-6 h-6 rounded-full bg-white border-2 border-brand-500 flex items-center justify-center text-[10px] font-bold text-brand-700 shadow-sm">
              {iv.roundNumber}
            </div>

            {/* Card Content */}
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-5 hover:border-slate-300 transition">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>{iv.roundName || `Round ${iv.roundNumber}`}</span>
                    <Badge variant={iv.outcome?.toLowerCase().includes('reject') ? 'danger' : 'success'} size="xs">
                      {iv.outcome || 'Completed'}
                    </Badge>
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {iv.interviewer}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(iv.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  Hindsight Retained
                </div>
              </div>

              {/* Feedback Quote */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700 italic mb-4 leading-relaxed">
                "{iv.feedback}"
              </div>

              {/* Strengths & Weaknesses Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                {/* Strengths */}
                <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-100">
                  <h5 className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5 mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Observed Strengths
                  </h5>
                  <ul className="space-y-1">
                    {(iv.strengths || []).map((s, sIdx) => (
                      <li key={sIdx} className="text-xs text-emerald-900 flex items-start gap-1.5">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses / Gaps */}
                <div className="p-3 rounded-lg bg-rose-50/60 border border-rose-100">
                  <h5 className="text-xs font-semibold text-rose-800 flex items-center gap-1.5 mb-2">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                    Identified Gaps / Struggles
                  </h5>
                  <ul className="space-y-1">
                    {(iv.weaknesses || []).map((w, wIdx) => (
                      <li key={wIdx} className="text-xs text-rose-900 flex items-start gap-1.5">
                        <span className="text-rose-500 font-bold">•</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Questions asked in this round */}
              {iv.questions && iv.questions.length > 0 && (
                <div className="pt-3 border-t border-slate-100">
                  <h5 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <HelpCircle className="w-3 h-3 text-slate-400" />
                    Key Questions Evaluated:
                  </h5>
                  <ul className="space-y-1.5">
                    {iv.questions.map((q, qIdx) => (
                      <li key={qIdx} className="text-xs text-slate-600 flex items-start gap-2">
                        <span className="text-slate-400 font-mono text-[10px] shrink-0">Q{qIdx + 1}:</span>
                        <span className="font-medium text-slate-700">{typeof q === 'string' ? q : q.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
