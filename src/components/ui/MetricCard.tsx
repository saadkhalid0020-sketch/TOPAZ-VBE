import React from 'react';

interface MetricCardProps {
  label: string;
  value: string;
  subtitle?: string;
  change?: {
    value: string;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtitle,
  change,
  icon,
  variant = 'default',
}) => {
  const borderColors = {
    default: 'border-slate-800 bg-slate-900/80',
    primary: 'border-indigo-800/80 bg-indigo-950/40',
    success: 'border-emerald-800/80 bg-emerald-950/40',
    warning: 'border-amber-800/80 bg-amber-950/40',
    danger: 'border-rose-800/80 bg-rose-950/40',
  };

  return (
    <div className={`p-4 rounded-xl border backdrop-blur-sm shadow-sm transition-all hover:border-slate-700 ${borderColors[variant]}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</span>
        {icon && <div className="text-slate-400 text-lg">{icon}</div>}
      </div>
      <div className="mt-2 flex items-baseline justify-between">
        <span className="text-2xl font-bold tracking-tight text-white">{value}</span>
        {change && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            change.isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
          }`}>
            {change.isPositive ? '▲' : '▼'} {change.value}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
    </div>
  );
};
