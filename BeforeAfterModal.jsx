import React, { useState, useEffect } from 'react';
import { X, Sparkles, AlertOctagon, CheckCircle2, ArrowRight, Brain, Zap } from 'lucide-react';
import { aiApi } from '../../services/api';

export function BeforeAfterModal({ isOpen, onClose, candidateId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (isOpen && candidateId) {
        setLoading(true);
        try {
          const res = await aiApi.getBeforeAfter(candidateId);
          if (res.data.success) {
            setData(res.data.comparison);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    }
    loadData();
  }, [isOpen, candidateId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full p-6 shadow-2xl border border-slate-100 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-brand-600 to-memory-600 text-white">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">Before & After Memory Demonstration</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-memory-100 text-memory-700 uppercase tracking-wide">
                  Judge Key Metric
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Comparing interview preparation for <strong className="text-slate-700">{data?.candidateName || 'Candidate'}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-500">
            <Brain className="w-8 h-8 mx-auto mb-2 text-memory-600 animate-pulse" />
            <p className="text-xs">Computing comparative evaluation between stateless AI vs Hindsight persistent memory...</p>
          </div>
        ) : (
          <div className="mt-5 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: WITHOUT MEMORY */}
              <div className="rounded-2xl border-2 border-rose-200 bg-rose-50/20 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-rose-900">
                    <AlertOctagon className="w-5 h-5 text-rose-600" />
                    <h4 className="text-sm font-bold">WITHOUT MEMORY</h4>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                    Stateless (0 Recall)
                  </span>
                </div>

                <p className="text-xs text-slate-600">
                  {data?.withoutMemory?.description}
                </p>

                {/* Questions Suggested */}
                <div className="space-y-2.5">
                  <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Questions Naively Generated:
                  </h5>
                  {data?.withoutMemory?.questionsSuggested?.map((item, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-xl border border-rose-100 shadow-2xs text-xs space-y-1">
                      <p className="font-semibold text-slate-800">"{item.question}"</p>
                      <p className="text-[11px] text-rose-600 font-medium">❌ Flaw: {item.critique}</p>
                    </div>
                  ))}
                </div>

                {/* Blind Spots */}
                <div className="p-3 rounded-xl bg-white border border-rose-100 space-y-1.5">
                  <h5 className="text-[11px] font-bold text-rose-900 uppercase tracking-wider">
                    Critical Recruiter Blind Spots:
                  </h5>
                  <ul className="space-y-1 text-xs text-slate-700">
                    {data?.withoutMemory?.blindSpots?.map((spot, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-[11px]">
                        <span className="text-rose-500 font-bold">•</span>
                        <span>{spot}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right Column: WITH HINDSIGHT MEMORY */}
              <div className="rounded-2xl border-2 border-memory-300 bg-memory-50/20 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-memory-950">
                    <Brain className="w-5 h-5 text-memory-600" />
                    <h4 className="text-sm font-bold">WITH HINDSIGHT MEMORY</h4>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-memory-100 text-memory-800">
                    Persistent (Full Recall)
                  </span>
                </div>

                <p className="text-xs text-slate-600">
                  {data?.withMemory?.description}
                </p>

                {/* Questions Suggested */}
                <div className="space-y-2.5">
                  <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Targeted Scenario Questions:
                  </h5>
                  {data?.withMemory?.questionsSuggested?.map((item, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-xl border border-memory-200/80 shadow-2xs text-xs space-y-1">
                      <p className="font-semibold text-slate-900">"{item.question}"</p>
                      <p className="text-[11px] text-memory-700 font-medium">✨ Target: {item.why}</p>
                    </div>
                  ))}
                </div>

                {/* Intelligence Value */}
                <div className="p-3 rounded-xl bg-white border border-memory-200/80 space-y-1.5">
                  <h5 className="text-[11px] font-bold text-memory-900 uppercase tracking-wider">
                    Hindsight Business Differentiator:
                  </h5>
                  <ul className="space-y-1 text-xs text-slate-700">
                    {data?.withMemory?.intelligenceValue?.map((val, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-[11px]">
                        <span className="text-memory-600 font-bold">•</span>
                        <span>{val}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Bottom summary bar */}
            <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-amber-300" />
                <div>
                  <h5 className="text-xs font-bold text-white">The Core Insight for Hackathon Judges</h5>
                  <p className="text-[11px] text-slate-300">
                    HireRecall transforms interviews from disjointed evaluations into an accumulating intelligence asset.
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold"
              >
                Close Comparison
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
