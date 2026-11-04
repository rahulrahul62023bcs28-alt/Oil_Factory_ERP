import React from 'react';
import { useData } from '../context/DataContext';
import { PackageCheck, Droplets, AlertTriangle } from 'lucide-react';
import { FlowAnalytics } from './FlowAnalytics';

export const InventoryModule = () => {
  const { inventory } = useData();

  // Pie Chart Data: Current Stock Distribution
  const pieData = inventory.map(item => ({
    name: item.name,
    value: item.currentLiters
  }));

  // Bar Flow Data: Stock Volume Breakdown
  const barData = inventory.map(item => ({
    name: item.name.split(' ')[0],
    current: item.currentLiters
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 glass-panel rounded-3xl">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <PackageCheck className="w-6 h-6 text-blue-600 dark:text-amber-400" />
          Inventory Flow
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Real-time stock of oil produced under each category. Automatically increases with Production & decreases with Sales.
        </p>
      </div>

      {/* Inventory Oil Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {inventory.map((item) => {
          const fillPercent = Math.round((item.currentLiters / item.capacityLiters) * 100);
          const isLow = item.currentLiters <= item.minAlert;

          return (
            <div key={item.id} className="p-6 glass-card rounded-3xl space-y-4 relative overflow-hidden">
              {isLow && (
                <div className="absolute top-4 right-4 px-2.5 py-1 bg-rose-100 dark:bg-rose-500/20 border border-rose-200 dark:border-rose-500/40 text-rose-700 dark:text-rose-400 rounded-full text-[10px] font-bold flex items-center gap-1 animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Low Stock Alert</span>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/10 dark:bg-amber-500/10 text-blue-600 dark:text-amber-400 rounded-2xl">
                  <Droplets className="w-6 h-6 fill-current" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{item.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Category Code: OIL-0{item.id}</p>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">
                    {item.currentLiters.toLocaleString()} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">Liters</span>
                  </span>
                  <span className="text-xs font-bold text-blue-600 dark:text-amber-400">{fillPercent}% Capacity</span>
                </div>

                {/* Progress Level Bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isLow ? 'bg-rose-500' : 'bg-blue-600 dark:bg-amber-500'
                    }`}
                    style={{ width: `${fillPercent}%` }}
                  ></div>
                </div>
              </div>

              <div className="pt-2 text-xs text-slate-500 dark:text-slate-400 flex justify-between border-t border-slate-100 dark:border-slate-800">
                <span>Maximum Storage: <strong>{item.capacityLiters.toLocaleString()} L</strong></span>
                <span>Minimum Alert: <strong>{item.minAlert.toLocaleString()} L</strong></span>
              </div>
            </div>
          );
        })}
      </div>

      {/* High-End Analytics Section AT THE VERY BOTTOM */}
      <FlowAnalytics
        title="Inventory Storage Analytics & Stock Flow"
        subtitle="Distribution of oil stock shares and category storage volume breakdown"
        pieData={pieData}
        barData={barData}
        pieValueKey="value"
        barValueKey="current"
        barXKey="name"
        unit="Liters"
      />
    </div>
  );
};
