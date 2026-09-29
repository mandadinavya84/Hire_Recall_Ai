import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, RotateCcw, Sparkles, Building2, Brain, Activity } from 'lucide-react';
import { seedApi, memoryApi } from '../../services/api';
import confetti from 'canvas-confetti';

export function Navbar() {
  const navigate = useNavigate();
  const [hindsightHealth, setHindsightHealth] = useState(null);

  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await memoryApi.getHindsightHealth();
        if (res.data.success) {
          setHindsightHealth(res.data);
        }
      } catch (err) {
        console.warn('Hindsight health ping:', err.message);
      }
    }
    checkHealth();
  }, []);

  const handleResetSeed = async () => {
    if (window.confirm('Reset demo dataset to initial state (Rahul Sharma with R1 & R2 completed)?')) {
      try {
        await seedApi.resetData();
        confetti({ particleCount: 50, spread: 60 });
        window.location.reload();
      } catch (err) {
        alert('Failed to reset: ' + err.message);
      }
    }
  };

  const handleJumpToRahul = () => {
    navigate('/candidates/cand_rahul_01');
  };

  const isRemote = hindsightHealth?.mode === 'remote';
  const isConnected = hindsightHealth?.connected;

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between z-10 shrink-0">
      {/* Search Bar */}
      <div className="flex items-center gap-3 w-80 lg:w-96">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidates, skills, or memory records..."
            className="w-full pl-9 pr-4 py-2 bg-slate-100/70 border border-slate-200 rounded-lg text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
          />
        </div>
      </div>

      {/* Right Controls & Demo Shortcuts */}
      <div className="flex items-center gap-3">
        {/* Hindsight Status Indicator */}
        <div
          onClick={() => navigate('/memory')}
          className="cursor-pointer transition hover:opacity-90 flex items-center gap-2"
          title={
            isConnected
              ? `Connected to official Vectorize Hindsight (${hindsightHealth?.bank || 'hirerecall_recruitment'})`
              : 'Hindsight service is offline. Please check Hindsight service status.'
          }
        >
          {isConnected ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>● Hindsight Connected</span>
              <span className="text-[10px] font-normal text-emerald-600 hidden md:inline">({hindsightHealth?.bank || 'hirerecall_recruitment'})</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-300 text-xs font-bold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>● Hindsight Offline</span>
            </span>
          )}
        </div>

        {/* Workspace Pill */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-xs font-medium text-slate-600 border border-slate-200/60">
          <Building2 className="w-3.5 h-3.5 text-slate-500" />
          <span>Workspace: Engineering Hiring</span>
        </div>

        {/* Demo Fast-Track Button */}
        <button
          onClick={handleJumpToRahul}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-brand-600 to-memory-600 text-white text-xs font-semibold shadow-sm hover:from-brand-500 hover:to-memory-500 transition"
          title="Open Hero Candidate Rahul Sharma (R1 & R2 Ready)"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Demo Story: Rahul</span>
        </button>

        {/* 1-Click Reset Demo Data */}
        <button
          onClick={handleResetSeed}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
          title="Reset database to initial demo state"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">Reset Demo</span>
        </button>
      </div>
    </header>
  );
}
