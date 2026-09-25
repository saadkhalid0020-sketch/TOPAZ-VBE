import React from 'react';
import { useGameStore } from '../../state/gameStore';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import { formatCurrency } from '../../utils/rounding';

export const HistoryView: React.FC = () => {
  const { game } = useGameStore();
  const history = game.history;

  const chartData = history.map((snap) => ({
    period: `Y${snap.year} Q${snap.quarter}`,
    sharePrice: snap.sharePrice,
    revenue: snap.revenue,
    profit: snap.profit,
    cash: snap.cash,
    debt: snap.debt,
    marketShare: Math.round(snap.marketShare * 100),
    netWorth: snap.netWorth,
  }));

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60">
        <h2 className="text-lg font-bold text-white tracking-tight">Quarterly Performance History & Longitudinal Trends</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Visualizing corporate trajectory, financial health, and market share progression across elapsed quarters.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Share Price Chart */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/70 space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Share Price Progression ($)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="period" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  formatter={(value: any) => [`$${parseFloat(value).toFixed(2)}`, 'Share Price']}
                />
                <Line type="monotone" dataKey="sharePrice" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue and Profit Chart */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/70 space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Revenue & Net Profit ($)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="period" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `$${val / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  formatter={(value: any) => [formatCurrency(value as number), '']}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="revenue" fill="#38bdf8" name="Revenue" />
                <Bar dataKey="profit" fill="#10b981" name="Net Profit" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cash vs Debt Chart */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/70 space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Liquidity: Cash vs Total Debt ($)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="period" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `$${val / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  formatter={(value: any) => [formatCurrency(value as number), '']}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="cash" stroke="#10b981" strokeWidth={2.5} name="Cash Reserves" />
                <Line type="monotone" dataKey="debt" stroke="#f43f5e" strokeWidth={2.5} name="Bank Debt" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Market Share Chart */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/70 space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Overall Market Share (%)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="period" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `${val}%`} domain={[0, 50]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  formatter={(value: any) => [`${value}%`, 'Market Share']}
                />
                <Line type="monotone" dataKey="marketShare" stroke="#a855f7" strokeWidth={2.5} dot={{ r: 4 }} name="Market Share %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
