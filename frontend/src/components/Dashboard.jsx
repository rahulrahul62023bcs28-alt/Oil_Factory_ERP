import React from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Droplets, Factory, ShoppingBag } from 'lucide-react';

export const Dashboard = ({ setActiveTab }) => {
  const { inventory, productionLogs, salesLogs } = useData();
  const { user } = useAuth();

  const totalStockLiters = inventory.reduce((acc, item) => acc + item.currentLiters, 0);
  const totalProductionLiters = productionLogs.reduce((acc, item) => acc + item.quantityLiters, 0);
  const totalSalesRevenue = salesLogs.reduce((acc, item) => acc + item.totalAmount, 0);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="p-6 glass-panel rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-amber-400 border border-blue-500/20 dark:border-amber-500/30">
              Role: {user?.role}
            </span>
          </div>
          <h2 className="text-2xl font-black theme-text-primary">OilSync Factory Operations Dashboard</h2>
          <p className="text-xs theme-text-muted mt-1">Real-time oil inventory, production batches, supplier intake & sales ledger</p>
        </div>
      </div>

      {/* 3 Simple KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-5 glass-card rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold theme-text-muted uppercase">Total Oil Stock</span>
            <h3 className="text-2xl font-black theme-text-primary mt-1">
              {totalStockLiters.toLocaleString()} <span className="text-xs font-normal theme-text-muted">Liters</span>
            </h3>
            <p className="text-xs text-blue-600 dark:text-amber-400 mt-1 font-medium">Across 5 Oil Categories</p>
          </div>
          <div className="p-3 bg-blue-500/10 dark:bg-amber-500/10 text-blue-600 dark:text-amber-400 rounded-2xl">
            <Droplets className="w-6 h-6 fill-current" />
          </div>
        </div>

        <div className="p-5 glass-card rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold theme-text-muted uppercase">Total Oil Produced</span>
            <h3 className="text-2xl font-black theme-text-primary mt-1">
              {totalProductionLiters.toLocaleString()} <span className="text-xs font-normal theme-text-muted">Liters</span>
            </h3>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">{productionLogs.length} Batches Processed</p>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl">
            <Factory className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 glass-card rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold theme-text-muted uppercase">Total Revenue</span>
            <h3 className="text-2xl font-black theme-text-primary mt-1">
              ₹{totalSalesRevenue.toLocaleString()}
            </h3>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1 font-medium">{salesLogs.length} Sales Dispatches</p>
          </div>
          <div className="p-3 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-2xl">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Stock Summary Table */}
      <div className="p-6 glass-panel rounded-3xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold theme-text-primary">Oil Category Inventory Levels</h3>
          <button onClick={() => setActiveTab('inventory')} className="text-xs text-blue-600 dark:text-amber-400 font-semibold hover:underline">
            View Inventory Flow
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {inventory.map(item => (
            <div key={item.id} className="p-4 theme-bg-input rounded-2xl border theme-border">
              <span className="text-xs theme-text-muted block truncate font-medium">{item.name}</span>
              <span className="text-xl font-extrabold theme-text-primary mt-1 block">
                {item.currentLiters.toLocaleString()} L
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Production Entries */}
        <div className="p-6 glass-panel rounded-3xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold theme-text-primary flex items-center gap-2">
              <Factory className="w-4 h-4 text-blue-600 dark:text-amber-400" />
              Recent Production Entries
            </h3>
            <button onClick={() => setActiveTab('production')} className="text-xs text-blue-600 dark:text-amber-400 font-semibold hover:underline">
              Add Production
            </button>
          </div>

          <div className="space-y-3">
            {productionLogs.slice(0, 4).map(log => (
              <div key={log.id} className="p-3 theme-bg-input rounded-xl border theme-border flex justify-between items-center text-xs">
                <div>
                  <span className="font-mono font-bold text-blue-700 dark:text-amber-400">{log.id}</span>
                  <p className="font-bold theme-text-primary mt-0.5">{log.oilType}</p>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-emerald-700 dark:text-emerald-400">+{log.quantityLiters} L</span>
                  <p className="theme-text-muted text-[10px] mt-0.5">{log.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Sales Dispatches */}
        <div className="p-6 glass-panel rounded-3xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold theme-text-primary flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              Recent Sales Orders
            </h3>
            <button onClick={() => setActiveTab('sales')} className="text-xs text-blue-600 dark:text-amber-400 font-semibold hover:underline">
              Add Sales Order
            </button>
          </div>

          <div className="space-y-3">
            {salesLogs.slice(0, 4).map(sale => (
              <div key={sale.id} className="p-3 theme-bg-input rounded-xl border theme-border flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold theme-text-primary">{sale.buyerName}</span>
                  <p className="theme-text-muted text-[11px] mt-0.5">{sale.oilType} ({sale.orderType})</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-rose-600 dark:text-rose-400">-{sale.quantityLiters} L</span>
                  <p className="font-extrabold text-emerald-700 dark:text-emerald-400 text-[11px] mt-0.5">₹{sale.totalAmount.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
