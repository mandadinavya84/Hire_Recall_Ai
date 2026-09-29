import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Brain, 
  Sparkles, 
  Settings, 
  LogOut,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function Sidebar() {
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Candidates', path: '/candidates', icon: Users },
    { label: 'Job Roles', path: '/roles', icon: Briefcase },
    { label: 'Hindsight Memory', path: '/memory', icon: Brain, badge: 'Active' },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen border-r border-slate-800 shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-memory-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
          <Brain className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-white tracking-tight text-lg">HireRecall</span>
            <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">AI</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Recruitment Memory Agent</p>
        </div>
      </div>

      {/* Tagline / Value Proposition Banner */}
      <div className="mx-4 my-3 p-2.5 rounded-lg bg-gradient-to-r from-memory-950/60 to-brand-950/60 border border-memory-800/40 text-xs text-memory-200">
        <div className="flex items-center gap-1.5 font-medium mb-1">
          <Sparkles className="w-3.5 h-3.5 text-memory-400" />
          <span>Biomimetic Memory</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-snug">
          "Every interview makes the next interview smarter."
        </p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-memory-500/20 text-memory-300 border border-memory-500/30">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Engine Status Indicator */}
      <div className="px-4 py-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-memory-400 animate-pulse"></span>
          <span className="text-slate-300 font-medium">Hindsight Memory</span>
        </div>
        <span className="text-memory-300 font-mono text-[10px] font-bold">READY</span>
      </div>

      {/* Recruiter Persona & Logout */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center justify-between gap-3 p-2 rounded-lg bg-slate-800/40">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-400/40 text-brand-300 flex items-center justify-center font-bold text-xs shrink-0">
              {user?.name ? user.name.charAt(0) : 'P'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">{user?.name || 'Priya Sharma'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.role || 'Lead Recruiter'}</p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Log out"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
