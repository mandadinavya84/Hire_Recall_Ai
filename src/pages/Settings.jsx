import React, { useState } from 'react';
import { Settings as SettingsIcon, Brain, User, Save, RotateCcw, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { seedApi } from '../services/api';
import confetti from 'canvas-confetti';

export function Settings() {
  const { user, updatePreferences } = useAuth();

  const [focus, setFocus] = useState(user?.preferences?.focus || 'Practical coding, System Design, Communication');
  const [style, setStyle] = useState(user?.preferences?.style || 'Scenario-based, Real-world architecture problems');
  const [note, setNote] = useState(user?.preferences?.note || 'Prefers deep architecture scenarios over theoretical trivia');
  
  const [hindsightMode, setHindsightMode] = useState('embedded');
  const [apiUrl, setApiUrl] = useState('http://localhost:8888');
  const [bankId, setBankId] = useState('hirerecall_recruitment_v1');
  
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await updatePreferences({ focus, style, note });
      setMessage('Recruiter preferences updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      alert('Error updating preferences: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleResetData = async () => {
    if (window.confirm('Reset database to initial demo state (Rahul Sharma with R1 & R2 completed)?')) {
      try {
        await seedApi.resetData();
        confetti({ particleCount: 60, spread: 70 });
        setMessage('Demo database reset successfully!');
        setTimeout(() => window.location.reload(), 1200);
      } catch (err) {
        alert('Failed to reset: ' + err.message);
      }
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <SettingsIcon className="w-5 h-5 text-brand-600" />
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            Settings & Persona Configuration
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          Configure Recruiter Persona memory, Hindsight memory engine modes, and demo state.
        </p>
      </div>

      {message && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {/* Recruiter Persona Memory Form (Feature 14 & 18) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="p-2 rounded-xl bg-brand-50 text-brand-700 border border-brand-200">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recruiter Memory & Evaluation Preferences</h3>
            <p className="text-xs text-slate-500">These preferences shape how the AI generates interview questions and plans</p>
          </div>
        </div>

        <form onSubmit={handleSavePreferences} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Active Recruiter Profile</label>
            <input
              type="text"
              disabled
              value={`${user?.name || 'Priya Sharma'} (${user?.role || 'Senior Tech Recruiter'})`}
              className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 font-medium cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Core Evaluation Focus</label>
            <input
              type="text"
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              placeholder="e.g. Practical coding, System Design, Communication"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Preferred Question Style</label>
            <input
              type="text"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              placeholder="e.g. Scenario-based, Real-world architecture problems"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Interviewer Persona Notes</label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-bold shadow-sm transition flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Recruiter Preferences'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Hindsight Configuration */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="p-2 rounded-xl bg-memory-50 text-memory-700 border border-memory-200">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Hindsight Persistent Memory Subsystem</h3>
            <p className="text-xs text-slate-500">Configure connection to local or cloud Hindsight instances</p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Hindsight Engine Mode</label>
            <select
              value={hindsightMode}
              onChange={(e) => setHindsightMode(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
            >
              <option value="embedded">Embedded Biomimetic Engine (Self-contained Demo Mode)</option>
              <option value="remote">Remote Hindsight API Server (hindsight-api / Docker)</option>
            </select>
          </div>

          {hindsightMode === 'remote' && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Hindsight Server URL</label>
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs"
              />
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Memory Bank ID</label>
            <input
              type="text"
              value={bankId}
              onChange={(e) => setBankId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs"
            />
          </div>
        </div>
      </div>

      {/* Demo Reset Card for Hackathon Judges */}
      <div className="bg-white rounded-2xl border border-rose-200 p-6 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Reset Demo Environment</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Re-seed candidate Rahul Sharma with Round 1 & Round 2 completed, ready for Round 3 testing.
            </p>
          </div>
          <button
            onClick={handleResetData}
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>
    </div>
  );
}
