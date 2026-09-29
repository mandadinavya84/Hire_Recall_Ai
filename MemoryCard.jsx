import React from 'react';
import { Brain, Sparkles, BookOpen, MessageSquare, CheckCircle, AlertTriangle } from 'lucide-react';
import { Badge } from '../common/Badge';

export function MemoryCard({ memory, highlighted = false }) {
  const getIconAndStyle = () => {
    if (memory.type === 'world_fact') {
      return {
        icon: BookOpen,
        border: 'border-blue-200/80',
        bg: 'bg-blue-50/40',
        badge: 'primary',
        label: 'World Fact'
      };
    }
    if (memory.type === 'experience') {
      return {
        icon: MessageSquare,
        border: 'border-purple-200/80',
        bg: 'bg-purple-50/40',
        badge: 'memory',
        label: 'Episodic Experience'
      };
    }
    if (memory.subType === 'strength') {
      return {
        icon: CheckCircle,
        border: 'border-emerald-200/80',
        bg: 'bg-emerald-50/40',
        badge: 'success',
        label: 'Strength Observation'
      };
    }
    if (memory.subType === 'weakness') {
      return {
        icon: AlertTriangle,
        border: 'border-rose-200/80',
        bg: 'bg-rose-50/40',
        badge: 'danger',
        label: 'Gap Observation'
      };
    }
    return {
      icon: Brain,
      border: 'border-slate-200',
      bg: 'bg-white',
      badge: 'default',
      label: 'Memory Node'
    };
  };

  const style = getIconAndStyle();
  const Icon = style.icon;

  return (
    <div className={`rounded-xl border p-4 transition shadow-sm ${style.border} ${style.bg} ${highlighted ? 'ring-2 ring-brand-500 shadow-md' : 'hover:shadow'}`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-white border border-slate-200/80 shadow-2xs">
            <Icon className="w-3.5 h-3.5 text-slate-700" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-slate-900 leading-snug">{memory.title}</h5>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-slate-500">
                {memory.roundNumber > 0 ? `Round ${memory.roundNumber}` : 'Baseline Intake'}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-[10px] text-slate-400">
                {new Date(memory.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {memory.skillTag && (
            <Badge variant="default" size="xs">
              {memory.skillTag}
            </Badge>
          )}
          <Badge variant={style.badge} size="xs">
            {style.label}
          </Badge>
        </div>
      </div>

      <p className="text-xs text-slate-700 leading-relaxed mt-2 pl-6">
        {memory.content}
      </p>

      {memory.relevanceScore && (
        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span>Relevance Score: {memory.relevanceScore}</span>
          <span>ID: {memory.id}</span>
        </div>
      )}
    </div>
  );
}
