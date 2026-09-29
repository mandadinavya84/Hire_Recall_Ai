import React, { useState } from 'react';
import { X, Sparkles, Brain, Plus, Trash2 } from 'lucide-react';
import { candidateApi } from '../../services/api';
import confetti from 'canvas-confetti';

export function AddInterviewModal({ isOpen, onClose, candidate, nextRoundNumber = 3, onSuccess }) {
  const [roundNumber, setRoundNumber] = useState(nextRoundNumber);
  const [roundName, setRoundName] = useState(`Round ${nextRoundNumber} — Advanced Evaluation`);
  const [interviewer, setInterviewer] = useState('Priya Sharma (Recruiter & Bar Raiser)');
  const [feedback, setFeedback] = useState('');
  const [strengths, setStrengths] = useState(['']);
  const [weaknesses, setWeaknesses] = useState(['']);
  const [questions, setQuestions] = useState(['']);
  const [outcome, setOutcome] = useState('Advanced to Next Stage');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Quick fill helper for Round 3 demo story
  const fillRound3Demo = () => {
    setRoundNumber(3);
    setRoundName('Round 3 — Database & Systems Deep-Dive');
    setInterviewer('Priya Sharma (Bar Raiser)');
    setFeedback('Candidate successfully explained database indexing and query optimization using explain plans. Still struggled with distributed consensus and event-driven architectures.');
    setStrengths([
      'Explained B-tree indexing and ESR rule clearly',
      'Demonstrated query optimization with compound indexes',
      'Strong grasp of practical caching with Redis'
    ]);
    setWeaknesses([
      'Still struggled with distributed consensus and Kafka partition replication',
      'Limited understanding of split-brain scenarios in clusters'
    ]);
    setQuestions([
      'How would you architect an indexing strategy for a MongoDB collection with 10M records and high write volume?',
      'How do you optimize an aggregate query with high latency using explain plans?',
      'How do you manage eventual consistency between services without distributed 2PC?'
    ]);
    setOutcome('Advanced with Recommendation');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feedback.trim()) {
      setError('Please provide interview feedback notes.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await candidateApi.addInterview(candidate.id, {
        roundNumber: Number(roundNumber),
        roundName,
        interviewer,
        feedback,
        strengths: strengths.filter(s => s.trim()),
        weaknesses: weaknesses.filter(w => w.trim()),
        questions: questions.filter(q => q.trim()),
        outcome
      });

      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      if (onSuccess) onSuccess(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to record interview');
    } finally {
      setLoading(false);
    }
  };

  const handleArrayChange = (setter, list, index, value) => {
    const updated = [...list];
    updated[index] = value;
    setter(updated);
  };

  const addArrayItem = (setter, list) => {
    setter([...list, '']);
  };

  const removeArrayItem = (setter, list, index) => {
    if (list.length === 1) return;
    setter(list.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 relative my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-memory-50 text-memory-600 border border-memory-200">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Record Interview & Retain in Memory</h3>
              <p className="text-xs text-slate-500">Adding feedback for <strong className="text-slate-700">{candidate.name}</strong></p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fillRound3Demo}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition flex items-center gap-1"
              title="Auto-fill with realistic Round 3 feedback for Rahul Sharma"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Auto-Fill Round 3 Demo</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Round Number</label>
              <input
                type="number"
                min="1"
                max="10"
                value={roundNumber}
                onChange={(e) => setRoundNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Round Title</label>
              <input
                type="text"
                value={roundName}
                onChange={(e) => setRoundName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Interviewer Name / Role</label>
              <input
                type="text"
                value={interviewer}
                onChange={(e) => setInterviewer(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Interview Outcome</label>
              <select
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                <option value="Advanced to Next Stage">Advanced to Next Stage</option>
                <option value="Advanced with Recommendation">Advanced with Recommendation</option>
                <option value="Decision Pending Discussion">Decision Pending Discussion</option>
                <option value="Strong Hire Consensus">Strong Hire Consensus</option>
                <option value="Not Proceeding">Not Proceeding</option>
              </select>
            </div>
          </div>

          {/* Feedback */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Overall Interview Notes & Observations <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="e.g. Candidate explained database indexing well, resolving prior round concerns, but struggled with distributed consensus..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              required
            />
          </div>

          {/* Strengths */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-emerald-800">Observed Strengths (Retained as positive observations)</label>
              <button
                type="button"
                onClick={() => addArrayItem(setStrengths, strengths)}
                className="text-[11px] text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5"
              >
                <Plus className="w-3 h-3" /> Add Strength
              </button>
            </div>
            <div className="space-y-1.5">
              {strengths.map((str, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={str}
                    onChange={(e) => handleArrayChange(setStrengths, strengths, idx, e.target.value)}
                    placeholder="e.g. Strong understanding of compound indexing and ESR rule"
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  {strengths.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem(setStrengths, strengths, idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Weaknesses */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-rose-800">Unresolved Gaps / Weaknesses (Retained for future probing)</label>
              <button
                type="button"
                onClick={() => addArrayItem(setWeaknesses, weaknesses)}
                className="text-[11px] text-rose-600 hover:text-rose-700 flex items-center gap-0.5"
              >
                <Plus className="w-3 h-3" /> Add Gap
              </button>
            </div>
            <div className="space-y-1.5">
              {weaknesses.map((weak, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={weak}
                    onChange={(e) => handleArrayChange(setWeaknesses, weaknesses, idx, e.target.value)}
                    placeholder="e.g. Struggled with distributed consensus algorithms"
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                  {weaknesses.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem(setWeaknesses, weaknesses, idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-gradient-to-r from-memory-600 to-brand-600 hover:from-memory-500 hover:to-brand-500 text-white rounded-lg text-xs font-bold shadow-md flex items-center gap-2 transition disabled:opacity-50"
            >
              <Brain className="w-4 h-4" />
              <span>{loading ? '🧠 Retaining in Hindsight Memory...' : 'Update Candidate Memory'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
