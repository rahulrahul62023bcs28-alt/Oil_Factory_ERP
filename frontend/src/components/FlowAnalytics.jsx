import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { PieChart as PieIcon, BarChart2, TrendingUp, Layers } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export const FlowAnalytics = ({
  title = "Flow Analytics",
  subtitle = "Distribution breakdown & volume trends",
  pieData = [],
  barData = [],
  pieValueKey = "value",
  barValueKey = "quantity",
  barXKey = "name",
  unit = "Liters",
  isCurrency = false
}) => {
  const { isDark } = useTheme();

  // Vibrant, rich color palette for light & dark modes
  const COLORS = isDark
    ? ['#f59e0b', '#3b82f6', '#10b981', '#a855f7', '#f43f5e']
    : ['#2563eb', '#d97706', '#059669', '#7c3aed', '#e11d48'];

  const totalVal = pieData.reduce((acc, curr) => acc + (Number(curr[pieValueKey]) || 0), 0);

  const formatVal = (val) => {
    if (isCurrency) return `₹${val.toLocaleString()}`;
    return `${val.toLocaleString()} ${unit}`;
  };

  return (
    <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-600/10 dark:bg-amber-500/10 text-blue-600 dark:text-amber-400 rounded-xl">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              {title}
              <span className="text-[10px] bg-blue-100 dark:bg-amber-500/15 text-blue-700 dark:text-amber-300 px-2.5 py-0.5 rounded-full font-mono font-bold border border-blue-200 dark:border-amber-500/30">
                Live Insights
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl theme-text-secondary">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
          <span>Total Volume: <strong className="theme-text-primary">{formatVal(totalVal)}</strong></span>
        </div>
      </div>

      {/* Grid of Pie Chart & Bar Flow Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pie Chart Card (5 cols) */}
        <div className="lg:col-span-5 p-6 glass-panel rounded-3xl flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-blue-600 dark:text-amber-400" />
              Category Share Breakdown
            </h4>
            <span className="text-[11px] font-mono text-slate-400">Pie Distribution</span>
          </div>

          <div className="h-56 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey={pieValueKey}
                >
                  {pieData.map((_, idx) => (
                    <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#0f172a' : '#ffffff',
                    borderColor: isDark ? '#334155' : '#cbd5e1',
                    borderRadius: '16px',
                    color: isDark ? '#ffffff' : '#0f172a',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                  formatter={(val) => [formatVal(val), 'Volume Share']}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Inner Ring Total Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Total</span>
              <span className="text-base font-black text-slate-900 dark:text-white">
                {isCurrency ? `₹${(totalVal / 1000).toFixed(0)}k` : `${totalVal.toLocaleString()}`}
              </span>
            </div>
          </div>

          {/* Custom Styled Color Legend */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            {pieData.map((entry, idx) => {
              const pct = totalVal > 0 ? Math.round((entry[pieValueKey] / totalVal) * 100) : 0;
              return (
                <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium truncate">{entry.name.split(' ')[0]}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 dark:text-white ml-1">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bar Flow Chart Card (7 cols) */}
        <div className="lg:col-span-7 p-6 glass-panel rounded-3xl flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Volume Flow Trend
            </h4>
            <span className="text-[11px] font-mono text-slate-400">Sequential Flow</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#f1f5f9'} vertical={false} />
                <XAxis dataKey={barXKey} stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={11} tickLine={false} />
                <YAxis stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#0f172a' : '#ffffff',
                    borderColor: isDark ? '#334155' : '#cbd5e1',
                    borderRadius: '16px',
                    color: isDark ? '#ffffff' : '#0f172a',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
                    fontSize: '12px'
                  }}
                  formatter={(val) => [formatVal(val), 'Volume']}
                />
                <Bar
                  dataKey={barValueKey}
                  fill={isDark ? '#f59e0b' : '#2563eb'}
                  radius={[10, 10, 0, 0]}
                  maxBarSize={45}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Micro Stat Bar */}
          <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-500 dark:text-slate-400">Sequence Records: <strong className="text-slate-900 dark:text-white font-bold">{barData.length} Entries</strong></span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Updated Automatically</span>
          </div>
        </div>
      </div>
    </div>
  );
};
