import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Truck, Plus, CheckCircle2 } from 'lucide-react';
import { FlowAnalytics } from './FlowAnalytics';

export const SupplierModule = () => {
  const { supplierLogs, addSupplier } = useData();

  const [supplierName, setSupplierName] = useState('');
  const [materialItem, setMaterialItem] = useState('Raw Groundnuts');
  const [quantity, setQuantity] = useState('');
  const [totalCost, setTotalCost] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || !supplierName || !quantity || !totalCost) return;

    setIsSubmitting(true);
    try {
      await addSupplier({
        supplierName,
        materialItem,
        quantity,
        totalCost: Number(totalCost)
      });

      setSuccessMsg(`Success! Saved raw material purchase from ${supplierName}.`);
      setSupplierName('');
      setQuantity('');
      setTotalCost('');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to save supplier intake:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1. Pie Chart Data: Procurement Expenditure Share by Material Item
  const materialSpendMap = {};
  supplierLogs.forEach(log => {
    materialSpendMap[log.materialItem] = (materialSpendMap[log.materialItem] || 0) + log.totalCost;
  });

  const pieData = Object.keys(materialSpendMap).map(item => ({
    name: item,
    value: materialSpendMap[item]
  }));

  // 2. Bar Flow Data: Purchase Spend per Supplier
  const barData = supplierLogs.map(log => ({
    name: log.supplierName.split(' ')[0],
    cost: log.totalCost
  }));

  return (
    <div className="space-y-6">
      <div className="p-6 glass-panel rounded-3xl">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Truck className="w-6 h-6 text-blue-600 dark:text-amber-400" />
          Supplier Flow
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Record supplier details and raw material purchases for factory production.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {successMsg}
        </div>
      )}

      {/* Supplier Purchase Form */}
      <div className="p-6 glass-panel rounded-3xl">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Record New Supplier Material Purchase</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
              Supplier Name / Company
            </label>
            <input
              type="text"
              required
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
              placeholder="e.g. AgriCorp Farmers Co."
              className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
              Material Item
            </label>
            <select
              value={materialItem}
              onChange={(e) => setMaterialItem(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white font-semibold focus:outline-none"
            >
              <option value="Raw Groundnuts">Raw Groundnuts</option>
              <option value="Sunflower Seeds">Sunflower Seeds</option>
              <option value="Mustard Seeds">Mustard Seeds</option>
              <option value="Sesame Seeds">Sesame Seeds</option>
              <option value="Copra (Dried Coconut)">Copra (Dried Coconut)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
              Quantity / Weight
            </label>
            <input
              type="text"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g. 5 Tons"
              className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
              Total Purchase Cost (₹)
            </label>
            <input
              type="number"
              required
              min="1"
              value={totalCost}
              onChange={(e) => setTotalCost(e.target.value)}
              placeholder="e.g. 425000"
              className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="lg:col-span-4 flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex items-center gap-2 px-5 py-3 bg-blue-600 dark:bg-amber-500 hover:bg-blue-700 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md ${
                isSubmitting ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving Purchase...' : 'Save Supplier Purchase Entry'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Supplier Purchases Table */}
      <div className="p-6 glass-panel rounded-3xl overflow-x-auto">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Supplier Purchases Registry</h3>
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
              <th className="py-3 px-4">Purchase ID</th>
              <th className="py-3 px-4">Supplier Name</th>
              <th className="py-3 px-4">Material Purchased</th>
              <th className="py-3 px-4">Quantity</th>
              <th className="py-3 px-4">Total Cost</th>
              <th className="py-3 px-4">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {supplierLogs.map((po) => (
              <tr key={po.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                <td className="py-3.5 px-4 font-mono font-bold text-blue-700 dark:text-amber-400">{po.id}</td>
                <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-white">{po.supplierName}</td>
                <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{po.materialItem}</td>
                <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">{po.quantity}</td>
                <td className="py-3.5 px-4 font-extrabold text-emerald-700 dark:text-emerald-400">₹{po.totalCost.toLocaleString()}</td>
                <td className="py-3.5 px-4 text-slate-400 font-mono">{po.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* High-End Analytics Section AT THE VERY BOTTOM */}
      <FlowAnalytics
        title="Supplier Procurement Analytics & Cost Flow"
        subtitle="Raw material expenditure share and supplier purchase cost trends"
        pieData={pieData}
        barData={barData}
        pieValueKey="value"
        barValueKey="cost"
        barXKey="name"
        isCurrency={true}
      />
    </div>
  );
};
