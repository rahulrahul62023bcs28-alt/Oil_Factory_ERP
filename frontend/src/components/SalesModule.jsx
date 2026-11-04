import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { ShoppingBag, CheckCircle2, AlertTriangle, Plus } from 'lucide-react';
import { FlowAnalytics } from './FlowAnalytics';

export const SalesModule = () => {
  const { inventory, salesLogs, addSale } = useData();

  const [orderType, setOrderType] = useState('Retail Customer');
  const [buyerName, setBuyerName] = useState('');
  const [oilType, setOilType] = useState('Groundnut Oil');
  const [quantityLiters, setQuantityLiters] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!buyerName || !quantityLiters || !totalAmount) return;
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await addSale({
        orderType,
        buyerName,
        oilType,
        quantityLiters: Number(quantityLiters),
        totalAmount: Number(totalAmount)
      });

      setSuccessMsg(`Success! Order for ${quantityLiters}L ${oilType} recorded. Inventory updated automatically.`);
      setBuyerName('');
      setQuantityLiters('');
      setTotalAmount('');
      setTimeout(() => setSuccessMsg(''), 4500);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to record sales order.');
      setTimeout(() => setErrorMsg(''), 6000);
    }
  };

  // 1. Pie Chart Data: Revenue Share by Order Variety (Retail Customer vs Wholesale Supplier)
  const salesCategoryMap = {};
  salesLogs.forEach(log => {
    salesCategoryMap[log.orderType] = (salesCategoryMap[log.orderType] || 0) + log.totalAmount;
  });

  const pieData = Object.keys(salesCategoryMap).map(type => ({
    name: type,
    value: salesCategoryMap[type]
  }));

  // 2. Bar Flow Data: Dispatched Liters Flow per Order
  const barData = salesLogs.map(log => ({
    name: log.id,
    dispatchedLiters: log.quantityLiters
  }));

  return (
    <div className="space-y-6">
      <div className="p-6 glass-panel rounded-3xl">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-blue-600 dark:text-amber-400" />
          Sales Flow
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Record customer and wholesale supplier sales orders. Automatically reduces oil stock from inventory.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-2xl text-rose-700 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Sales Order Entry Form */}
      <div className="p-6 glass-panel rounded-3xl">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Record New Sales Order</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
              Order Category
            </label>
            <select
              value={orderType}
              onChange={(e) => setOrderType(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white font-bold focus:outline-none"
            >
              <option value="Retail Customer">Retail Customer</option>
              <option value="Wholesale Supplier">Wholesale Supplier</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
              Buyer / Client Name
            </label>
            <input
              type="text"
              required
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              placeholder="e.g. FreshMart Stores"
              className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
              Oil Category
            </label>
            <select
              value={oilType}
              onChange={(e) => setOilType(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white font-semibold focus:outline-none"
            >
              {inventory.map(item => (
                <option key={item.id} value={item.name}>{item.name} (Stock: {item.currentLiters}L)</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
              Quantity Sold (Liters)
            </label>
            <input
              type="number"
              required
              min="1"
              value={quantityLiters}
              onChange={(e) => setQuantityLiters(e.target.value)}
              placeholder="e.g. 200"
              className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
              Total Order Price (₹)
            </label>
            <input
              type="number"
              required
              min="1"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              placeholder="e.g. 95000"
              className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="lg:col-span-5 flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-3 bg-blue-600 dark:bg-amber-500 hover:bg-blue-700 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Record Sale & Deduct Inventory</span>
            </button>
          </div>
        </form>
      </div>

      {/* Sales Transactions History */}
      <div className="p-6 glass-panel rounded-3xl overflow-x-auto">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Sales Transactions Ledger</h3>
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
              <th className="py-3 px-4">Order ID</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Buyer / Client</th>
              <th className="py-3 px-4">Oil Variety</th>
              <th className="py-3 px-4">Dispatched Vol</th>
              <th className="py-3 px-4">Total Amount</th>
              <th className="py-3 px-4">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {salesLogs.map((ord) => (
              <tr key={ord.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                <td className="py-3.5 px-4 font-mono font-bold text-blue-700 dark:text-amber-400">{ord.id}</td>
                <td className="py-3.5 px-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    ord.orderType === 'Wholesale Supplier' ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300' : 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300'
                  }`}>
                    {ord.orderType}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-white">{ord.buyerName}</td>
                <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{ord.oilType}</td>
                <td className="py-3.5 px-4 font-bold text-rose-600 dark:text-rose-400">-{ord.quantityLiters.toLocaleString()} Liters</td>
                <td className="py-3.5 px-4 font-extrabold text-emerald-700 dark:text-emerald-400">₹{ord.totalAmount.toLocaleString()}</td>
                <td className="py-3.5 px-4 text-slate-400 font-mono">{ord.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* High-End Analytics Section AT THE VERY BOTTOM */}
      <FlowAnalytics
        title="Sales Revenue Analytics & Dispatch Flow"
        subtitle="Revenue share by order category and dispatched volume flow"
        pieData={pieData}
        barData={barData}
        pieValueKey="value"
        barValueKey="dispatchedLiters"
        barXKey="name"
        unit="Liters"
        isCurrency={true}
      />
    </div>
  );
};
