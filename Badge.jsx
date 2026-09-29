import React from 'react';

export function Badge({ children, variant = 'default', size = 'sm', className = '' }) {
  const variants = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-brand-50 text-brand-700 border-brand-200',
    memory: 'bg-memory-50 text-memory-700 border-memory-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200'
  };

  const sizes = {
    xs: 'text-[10px] px-1.5 py-0.5',
    sm: 'text-xs px-2.5 py-1',
    md: 'text-sm px-3 py-1.5'
  };

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${variants[variant] || variants.default} ${sizes[size] || sizes.sm} ${className}`}>
      {children}
    </span>
  );
}
