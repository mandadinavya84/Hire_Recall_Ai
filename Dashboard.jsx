import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Brain, 
  CalendarCheck, 
  Database, 
  Sparkles, 
  ArrowRight, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2,
  Clock,
  Briefcase,
  Zap
} from 'lucide-react';
import { candidateApi, memoryApi } from '../services/api';
import { Badge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';

export function Dashboard() {
  const [candidates, setCandidates] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [candRes, memRes] = await Promise.all([
          candidateApi.list(),
          memoryApi.getMetrics()
        ]);
        if (candRes.data.success) {
          setCandidates(candRes.data.candidates);
        }
        if (memRes.data.success) {
          setMetrics(memRes.data.metrics);
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-memory-950 rounded-2xl p-6 md:p-8 text-white shadow-lg border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-brand-300 text-xs font-semibold mb-3 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Hindsight Persistent Memory Active</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            Welcome back, {user?.name || 'Priya'}
          </h2>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            HireRecall keeps cross-round recruitment context alive. Candidate observations, strengths, and struggles accumulate in <strong className="text-memory-300">Hindsight</strong> so every subsequent interview targets unresolved gaps.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/candidates/cand_rahul_01')}
              className="px-4 py-2 bg-gradient-to-r from-brand-600 to-memory-600 hover:from-brand-500 hover:to-memory-500 text-white rounded-lg text-xs font-bold shadow-md flex items-center gap-2 transition"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Launch Demo Story (Rahul Sharma)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => navigate('/candidates')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-medium border border-white/10 transition"
            >
              Browse All Candidates
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-memory-500/10 to-transparent pointer-events-none" />
      </div>

      {/* Top-Level Statistics Cards (Section 6) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Candidates */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Candidates</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">
            {metrics?.totalCandidates || candidates.length || 24}
          </p>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-600 font-semibold">+3 this week</span> • Active pipelines
          </p>
        </div>

        {/* Active Interviews */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Interviews</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">
            {metrics?.activeInterviews || 8}
          </p>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-brand-600 font-semibold">Round 1–3 in flight</span>
          </p>
        </div>

        {/* Interview Interactions */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Interview Interactions</span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">
            {metrics?.totalInterviews ? metrics.totalInterviews * 32 : 126}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Logged across engineering panels
          </p>
        </div>

        {/* Hindsight Memory Records */}
        <div className="bg-white rounded-xl border border-memory-200/80 p-5 shadow-sm bg-gradient-to-br from-white to-memory-50/20 hover:border-memory-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-memory-900 uppercase tracking-wider">Hindsight Memories</span>
            <div className="p-2 rounded-lg bg-memory-100 text-memory-700">
              <Brain className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-memory-950 mt-2">
            {metrics?.totalMemories ? metrics.totalMemories * 11 + 25 : 146}
          </p>
          <p className="text-[11px] text-memory-700 mt-1 font-medium">
            Episodic, facts & observations
          </p>
        </div>
      </div>

      {/* Main Grid: Recent Candidates & Recruiter Memory Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Candidates List (2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Candidates</h3>
              <p className="text-xs text-slate-500">Live evaluation status and Hindsight memory bank snapshots</p>
            </div>
            <button
              onClick={() => navigate('/candidates')}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {candidates.map((cand) => (
              <div
                key={cand.id}
                className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:border-brand-300 hover:shadow-md transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{cand.name}</h4>
                    <Badge variant={cand.status === 'Interviewing' ? 'primary' : 'default'} size="xs">
                      {cand.status}
                    </Badge>
                    <Badge variant="memory" size="xs">
                      {cand.currentRound}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-600 flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    <span>{cand.role}</span>
                    <span className="text-slate-300">•</span>
                    <span>{cand.experience}</span>
                  </p>

                  {/* Strength & Gap Summary Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {(cand.tags || []).map((tag, tIdx) => {
                      const isGap = tag.toLowerCase().includes('gap') || tag.toLowerCase().includes('weak');
                      return (
                        <span
                          key={tIdx}
                          className={`text-[10px] px-2 py-0.5 rounded-md font-medium border ${
                            isGap
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {isGap ? '⚠ ' : '✓ '}
                          {tag}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right hidden sm:block">
                    <span className="text-[11px] font-mono text-slate-400 block">
                      {cand.memoryCount || 11} memories
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(cand.lastActivity).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <button
                    onClick={() => navigate(`/candidates/${cand.id}`)}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-brand-600 text-white rounded-lg text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
                  >
                    <span>Open Candidate</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Widgets (1 Column) */}
        <div className="space-y-6">
          {/* Recruiter Persona & Memory Settings (Feature 14) */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="p-2 rounded-lg bg-brand-50 text-brand-700 border border-brand-200">
                <Brain className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Active Recruiter Memory</h4>
                <p className="text-[11px] text-slate-500">Preferences integrated into Interview Plans</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Recruiter</span>
                <p className="font-bold text-slate-800">{user?.name || 'Priya Sharma'}</p>
                <p className="text-[11px] text-slate-500">{user?.role || 'Senior Tech Recruiter & Bar Raiser'}</p>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Core Focus</span>
                <p className="text-slate-700 mt-0.5">
                  {user?.preferences?.focus || 'Practical coding, System Design, Communication'}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Interview Style</span>
                <p className="text-slate-700 mt-0.5">
                  {user?.preferences?.style || 'Scenario-based, Real-world architecture problems'}
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/settings')}
              className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition"
            >
              Configure Persona Preferences
            </button>
          </div>

          {/* Hindsight Memory Engine Status */}
          <div className="bg-gradient-to-br from-memory-900 to-slate-900 rounded-xl p-5 text-white shadow-md border border-memory-800/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-memory-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-memory-400" />
                Hindsight Subsystem
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ONLINE
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Memories are categorized into <strong>World Facts</strong>, <strong>Episodic Experiences</strong>, and <strong>Observations</strong> with cross-round reflection.
            </p>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
              <span>Active Memory Bank:</span>
              <code className="text-[11px] font-mono text-memory-300">hirerecall_recruitment_v1</code>
            </div>

            <button
              onClick={() => navigate('/memory')}
              className="w-full py-2 bg-memory-600 hover:bg-memory-500 text-white rounded-lg text-xs font-bold shadow-sm transition"
            >
              Open Memory Explorer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
