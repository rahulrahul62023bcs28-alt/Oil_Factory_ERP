import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import {
  Factory,
  Plus,
  CheckCircle2,
  Scale,
  Search,
  Layers,
  Sparkles,
  Droplets,
  PackageCheck,
  Activity
} from 'lucide-react';
import { FlowAnalytics } from './FlowAnalytics';

// 5 Active Project Oils
const PROJECT_OILS = [
  { name: 'Groundnut Oil', badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30' },
  { name: 'Sunflower Oil', badgeClass: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/30' },
  { name: 'Mustard Oil', badgeClass: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30' },
  { name: 'Sesame Oil', badgeClass: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30' },
  { name: 'Coconut Oil', badgeClass: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/30' },
];

export const ProductionModule = () => {
  const { productionLogs, addProduction } = useData();

  const [oilType, setOilType] = useState('Groundnut Oil');
  const [rawSeedWeightKg, setRawSeedWeightKg] = useState('');
  const [quantityLiters, setQuantityLiters] = useState('');
  const [details, setDetails] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [filterOil, setFilterOil] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Total Production Aggregate KPIs
  const aggregateMetrics = useMemo(() => {
    const totalSeed = productionLogs.reduce((sum, log) => sum + (log.rawSeedWeightKg || 0), 0);
    const totalLiters = productionLogs.reduce((sum, log) => sum + (log.quantityLiters || 0), 0);
    return {
      totalSeedKg: totalSeed,
      totalLiters,
      totalBatches: productionLogs.length,
      activeVarieties: PROJECT_OILS.length,
    };
  }, [productionLogs]);

  // Filtered Production Logs
  const filteredLogs = useMemo(() => {
    return productionLogs.filter((log) => {
      const matchOil = filterOil === 'ALL' || log.oilType === filterOil;
      const matchSearch =
        !searchQuery ||
        log.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.oilType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.details && log.details.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchOil && matchSearch;
    });
  }, [productionLogs, filterOil, searchQuery]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || !quantityLiters || Number(quantityLiters) <= 0) return;

    const seedKg = Number(rawSeedWeightKg) > 0 ? Number(rawSeedWeightKg) : Math.round(Number(quantityLiters) * 2.44);
    const qty = Number(quantityLiters);

    setIsSubmitting(true);
    try {
      await addProduction({
        oilType,
        rawSeedWeightKg: seedKg,
        quantityLiters: qty,
        details: details || `${oilType} Production Batch`,
      });

      setSuccessMsg(
        `Recorded Batch: Added ${qty.toLocaleString()} Liters of ${oilType} (from ${seedKg.toLocaleString()} kg seed intake) to inventory.`
      );
      setRawSeedWeightKg('');
      setQuantityLiters('');
      setDetails('');
      setTimeout(() => setSuccessMsg(''), 4500);
    } catch (err) {
      console.error('Failed to record production batch:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pie Chart Data: Production Volume Share by Category
  const categoryProductionMap = {};
  productionLogs.forEach((log) => {
    categoryProductionMap[log.oilType] = (categoryProductionMap[log.oilType] || 0) + log.quantityLiters;
  });

  const pieChartData = Object.keys(categoryProductionMap).map((type) => ({
    name: type,
    value: categoryProductionMap[type],
  }));

  // Bar Flow Data: Recent Batch Volume Flow Breakdown (last 10 batches)
  const barChartData = productionLogs.slice(0, 10).reverse().map((log) => ({
    name: log.id,
    quantity: log.quantityLiters,
  }));

  return (
    <div className="space-y-6">
      {/* Module Title */}
      <div className="p-6 glass-panel rounded-3xl css3-rounded-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white css3-text-shadow-heading flex items-center gap-2">
              <Factory className="w-6 h-6 text-blue-600 dark:text-amber-400" />
              Production Flow & Raw Intake
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Factory batch logging for raw seed intake ($x$) and extracted oil volume ($y$). Feeds live operational data into Inventory & AI Analytics.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-full text-xs font-bold font-mono bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30">
              5 Oils Monitored
            </span>
            <span className="px-3 py-1.5 rounded-full text-xs font-bold font-mono bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
              {productionLogs.length} Total Batches
            </span>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Production Summary KPI Cards (Standard Industrial Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 glass-panel rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Seed Crushed
            </span>
            <Scale className="w-5 h-5 text-blue-600 dark:text-amber-400" />
          </div>
          <h3 className="text-2xl font-black font-mono text-slate-900 dark:text-white">
            {aggregateMetrics.totalSeedKg.toLocaleString()} <span className="text-xs text-slate-400">kg</span>
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Cumulative seed intake across all press units
          </p>
        </div>

        <div className="p-5 glass-panel rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Oil Produced
            </span>
            <Droplets className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
            {aggregateMetrics.totalLiters.toLocaleString()} <span className="text-xs text-slate-400">L</span>
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Total extracted oil delivered to storage tanks
          </p>
        </div>

        <div className="p-5 glass-panel rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Completed Batches
            </span>
            <PackageCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-2xl font-black font-mono text-slate-900 dark:text-white">
            {aggregateMetrics.totalBatches} <span className="text-xs text-slate-400">runs</span>
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Verified production extraction cycles
          </p>
        </div>

        <div className="p-5 glass-panel rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Oil Tanks
            </span>
            <Activity className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="text-2xl font-black font-mono text-slate-900 dark:text-white">
            {aggregateMetrics.activeVarieties} <span className="text-xs text-slate-400">categories</span>
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Groundnut, Sunflower, Mustard, Sesame, Coconut
          </p>
        </div>
      </div>

      {/* Direct Batch Entry Form */}
      <div className="p-6 glass-panel rounded-3xl">
        <div className="mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600 dark:text-amber-400" />
            Record New Oil Production Batch
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Log physical seed intake weight and extracted oil volume to update stock and train the AI model.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Oil Variety Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
              Oil Variety / Tank
            </label>
            <select
              value={oilType}
              onChange={(e) => setOilType(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-amber-500"
            >
              {PROJECT_OILS.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>

          {/* Raw Seed Weight Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
              Raw Seed Intake (kg)
            </label>
            <input
              type="number"
              required
              min="10"
              value={rawSeedWeightKg}
              onChange={(e) => setRawSeedWeightKg(e.target.value)}
              placeholder="e.g. 2000"
              className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-amber-500"
            />
          </div>

          {/* Extracted Liters Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
              Oil Extracted (Liters)
            </label>
            <input
              type="number"
              required
              min="1"
              value={quantityLiters}
              onChange={(e) => setQuantityLiters(e.target.value)}
              placeholder="e.g. 825"
              className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-amber-500"
            />
          </div>

          {/* Batch Details / Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
              Batch Notes / Machine #
            </label>
            <input
              type="text"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="e.g. Hydraulic Press #2 - Morning Shift"
              className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-amber-500"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-4 flex justify-between items-center pt-2">
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-amber-400" />
              <span>
                Batch updates tank inventory in real time and streams seed data into the AI Analytics Linear Regression model.
              </span>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex items-center gap-2 px-6 py-3 bg-blue-600 dark:bg-amber-500 hover:bg-blue-700 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md ${
                isSubmitting ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'Recording Batch...' : 'Submit Batch & Update Inventory'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Production History Table with Filters */}
      <div className="p-6 glass-panel rounded-3xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600 dark:text-amber-400" />
              Production Logs History ({filteredLogs.length} Records)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Historical records of seed intake, extracted liters, and press run notes.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search batch code, notes..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
            />
          </div>
        </div>

        {/* Oil Filter Tabs */}
        <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setFilterOil('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterOil === 'ALL'
                ? 'bg-blue-600 dark:bg-amber-500 text-white dark:text-slate-950 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Oils ({productionLogs.length})
          </button>
          {PROJECT_OILS.map((v) => {
            const count = productionLogs.filter((log) => log.oilType === v.name).length;
            const isSelected = filterOil === v.name;
            return (
              <button
                key={v.name}
                onClick={() => setFilterOil(v.name)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-blue-600 dark:bg-amber-500 text-white dark:text-slate-950 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{v.name}</span>
                <span className="text-[10px] opacity-75 font-mono">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                <th className="py-3 px-4">Batch Code</th>
                <th className="py-3 px-4">Oil Variety</th>
                <th className="py-3 px-4">Seed Intake (kg)</th>
                <th className="py-3 px-4">Oil Extracted (L)</th>
                <th className="py-3 px-4">Batch Details</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No production batches found matching the selected filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const variety = PROJECT_OILS.find((v) => v.name === log.oilType) || PROJECT_OILS[0];
                  const seed = log.rawSeedWeightKg || Math.round(log.quantityLiters * 2.44);

                  return (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-700 dark:text-amber-400">
                        {log.id}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-white">
                        <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold border ${variety.badgeClass}`}>
                          {log.oilType}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-slate-300 font-bold">
                        {seed.toLocaleString()} kg
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-emerald-700 dark:text-emerald-400 font-mono">
                        +{log.quantityLiters.toLocaleString()} L
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        {log.details}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono">
                        {log.date}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Production Analytics & Batch Flow Visualizer */}
      <FlowAnalytics
        title="Production Analytics & Batch Flow"
        subtitle="Distribution of produced oil categories and batch output trends across factory press units"
        pieData={pieChartData}
        barData={barChartData}
        pieValueKey="value"
        barValueKey="quantity"
        barXKey="name"
        unit="Liters"
      />
    </div>
  );
};

export default ProductionModule;
