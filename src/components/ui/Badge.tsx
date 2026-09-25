import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'slate' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'purple';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'slate', size = 'sm' }) => {
  const styles = {
    slate: 'bg-slate-800 text-slate-300 border-slate-700',
    indigo: 'bg-indigo-900/60 text-indigo-300 border-indigo-700',
    emerald: 'bg-emerald-900/60 text-emerald-300 border-emerald-700',
    amber: 'bg-amber-900/60 text-amber-300 border-amber-700',
    rose: 'bg-rose-900/60 text-rose-300 border-rose-700',
    purple: 'bg-purple-900/60 text-purple-300 border-purple-700',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  };

  return (
    <span className={`inline-flex items-center gap-1 font-medium rounded-md border ${styles[variant]} ${sizes[size]}`}>
      {children}
    </span>
  );
};
