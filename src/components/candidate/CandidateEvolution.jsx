import React from 'react';
import { TrendingUp, Sparkles, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';
import { Badge } from '../common/Badge';

export function CandidateEvolution({ evolution }) {
  if (!evolution || !evolution.matrix) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 text-center text-slate-500">
        Loading candidate evolution matrix from Hindsight...
      </div>
    );
  }

  const { matrix, verifiedStrengths = [], activeGaps = [], improvedAreas = [], narrative } = evolution;

  return (
    <div className="space-y-6">
      {/* Header & Narrative Box */}
      <div className="bg-gradient-to-br from-memory-900 via-brand-900 to-slate-900 rounded-xl p-5 text-white shadow-md border border-memory-700/30">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-lg bg-memory-500/20 border border-memory-400/40 text-memory-300">
            <Sparkles className="w-4 h-4 text-memory-300" />
          </div>
          <h4 className="text-sm font-bold tracking-tight text-white">Hindsight Cross-Round Reflection</h4>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-memory-200 border border-white/10">
            Synthesized Evolution
          </span>
        </div>
        <p className="text-xs text-slate-200 leading-relaxed font-normal">
          {narrative}
        </p>
      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800">Validated Strengths</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-bold text-emerald-950 mt-1">{verifiedStrengths.length}</p>
          <p className="text-[11px] text-emerald-700 truncate mt-0.5">
            {verifiedStrengths.join(', ') || 'None yet'}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800">Improved Competencies</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl font-bold text-amber-950 mt-1">{improvedAreas.length}</p>
          <p className="text-[11px] text-amber-700 truncate mt-0.5">
            {improvedAreas.join(', ') || 'Pending Round 3 feedback'}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-800">Unresolved Gaps</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-xl font-bold text-rose-950 mt-1">{activeGaps.length}</p>
          <p className="text-[11px] text-rose-700 truncate mt-0.5">
            {activeGaps.join(', ') || 'No critical gaps'}
          </p>
        </div>
      </div>

      {/* Evolution Matrix Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>Skill Progression Matrix Across Rounds</span>
          </h4>
          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">🟢 Proven</span>
            <span className="flex items-center gap-1">🟠 Improved</span>
            <span className="flex items-center gap-1">🔴 Weak</span>
            <span className="flex items-center gap-1">⚪ Not Evaluated</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200/80">
              <tr>
                <th className="py-3 px-4">Technical Competency</th>
                <th className="py-3 px-4 text-center">Round 1</th>
                <th className="py-3 px-4 text-center">Round 2</th>
                <th className="py-3 px-4 text-center">Round 3</th>
                <th className="py-3 px-4 text-center">Current Status</th>
                <th className="py-3 px-4">Observed Trajectory</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {matrix.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition">
                  <td className="py-3.5 px-4 font-semibold text-slate-800 flex items-center gap-2">
                    <span>{row.icon}</span>
                    <span>{row.skill}</span>
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-600 font-medium">
                    {renderCellBadge(row.round1)}
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-600 font-medium">
                    {renderCellBadge(row.round2)}
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-600 font-medium">
                    {renderCellBadge(row.round3)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <Badge variant={getStatusVariant(row.currentStatus)} size="xs">
                      {row.currentStatus}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                    {row.trajectory}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function renderCellBadge(val) {
  if (!val || val === '—') return <span className="text-slate-300 font-mono">—</span>;
  if (val.includes('Proven')) return <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">🟢 Solid</span>;
  if (val.includes('Improved')) return <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">🟠 Improved</span>;
  if (val.includes('Weak')) return <span className="text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">🔴 Gap</span>;
  return <span>{val}</span>;
}

function getStatusVariant(status) {
  if (status === 'Solid') return 'success';
  if (status === 'Improved') return 'warning';
  if (status === 'Active Gap') return 'danger';
  return 'default';
}
