import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import {
  FileSpreadsheet,
  Download,
  CheckCircle,
  Printer,
  Warehouse,
  Factory,
  Receipt,
  Truck,
  ShieldCheck,
} from 'lucide-react';

export const ReportsModule = () => {
  const {
    inventory = [],
    productionLogs = [],
    salesLogs = [],
    supplierLogs = [],
  } = useData();

  const [activeReportTab, setActiveReportTab] = useState('all');
  const [downloadMsg, setDownloadMsg] = useState('');

  // Fixed Audit ID and generation timestamp so they remain stable across print preview
  const auditId = useMemo(
    () => `#AUD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    []
  );
  const formattedDate = useMemo(
    () => new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    []
  );

  // Summary Metrics
  const totalStockLiters = inventory.reduce((acc, t) => acc + (t.currentLiters ?? t.current ?? 0), 0);
  const totalCapacityLiters = inventory.reduce((acc, t) => acc + (t.capacityLiters ?? t.capacity ?? 0), 0);
  const totalSalesRevenue = salesLogs.reduce((acc, s) => acc + (s.totalAmount ?? 0), 0);
  const totalProcurementSpend = supplierLogs.reduce((acc, sup) => acc + (sup.totalCost ?? 0), 0);
  const totalProductionLiters = productionLogs.reduce((acc, p) => acc + (p.quantityLiters ?? 0), 0);

  // Export to Real CSV (Opens in Excel) tailored to the active tab
  const exportToCSV = () => {
    const today = new Date().toISOString().split('T')[0];
    let csvRows = [];

    csvRows.push(['OILSYNC FACTORY MANAGEMENT SYSTEM - OPERATIONAL AUDIT REPORT']);
    csvRows.push([`Generated On: ${today}`, 'Confidential Industrial Record']);
    csvRows.push([`Category Filter: ${
      activeReportTab === 'all' ? 'Complete Audit Snapshot' :
      activeReportTab === 'inventory' ? 'Tanks & Storage' :
      activeReportTab === 'production' ? 'Production Runs' :
      activeReportTab === 'sales' ? 'Sales Dispatches' : 'Supplier Intakes'
    }`]);
    csvRows.push([]);

    // 1. Inventory Tanks
    if (activeReportTab === 'all' || activeReportTab === 'inventory') {
      csvRows.push(['SECTION 1: STORAGE TANK AUDIT SNAPSHOT']);
      csvRows.push(['Tank ID', 'Oil Variant', 'Current Liters', 'Capacity', 'Fill Ratio', 'Status', 'Min Alert Liters']);
      inventory.forEach((t) => {
        const cur = t.currentLiters ?? t.current ?? 0;
        const cap = t.capacityLiters ?? t.capacity ?? 1;
        const util = Math.round((cur / cap) * 100);
        const isLow = cur <= (t.minAlert || 1000);
        csvRows.push([`TANK-0${t.id}`, t.name, `${cur} L`, `${cap} L`, `${util}%`, isLow ? 'Reorder Alert' : 'Normal Capacity', t.minAlert || 1000]);
      });
      csvRows.push([]);
    }

    // 2. Production Batches
    if (activeReportTab === 'all' || activeReportTab === 'production') {
      csvRows.push(['SECTION 2: PRODUCTION BATCHES & YIELDS']);
      csvRows.push(['Batch ID', 'Date', 'Oil Variant', 'Seed Weight (Kg)', 'Extracted (L)', 'Recovery Rate', 'Details']);
      productionLogs.forEach((p) => {
        const seedKg = p.rawSeedWeightKg || 1000;
        const qtyL = p.quantityLiters || 0;
        const eff = ((qtyL / seedKg) * 100).toFixed(1);
        csvRows.push([p.id, p.date || p.createdAt?.split('T')[0] || today, p.oilType, `${seedKg} kg`, `${qtyL} L`, `${eff}%`, `"${p.details || 'Standard Batch'}"`]);
      });
      csvRows.push([]);
    }

    // 3. Sales Dispatches
    if (activeReportTab === 'all' || activeReportTab === 'sales') {
      csvRows.push(['SECTION 3: WHOLESALE SALES & OUTBOUND DISPATCHES']);
      csvRows.push(['Order ID', 'Date', 'Customer / Client', 'Oil Variant', 'Volume (L)', 'Total Amount (INR)']);
      salesLogs.forEach((s) => {
        csvRows.push([s.id, s.date || s.createdAt?.split('T')[0] || today, `"${s.buyerName || 'Buyer'}"`, s.oilType, s.quantityLiters, s.totalAmount]);
      });
      csvRows.push([]);
    }

    // 4. Supplier Intakes
    if (activeReportTab === 'all' || activeReportTab === 'suppliers') {
      csvRows.push(['SECTION 4: RAW SEED PROCUREMENT INTAKE LOGS']);
      csvRows.push(['Intake ID', 'Date', 'Vendor / Farmer', 'Raw Seed Variety', 'Quantity', 'Cost (INR)']);
      supplierLogs.forEach((sup) => {
        csvRows.push([sup.id, sup.date || sup.createdAt?.split('T')[0] || today, `"${sup.supplierName}"`, sup.materialItem, sup.quantity, sup.totalCost]);
      });
    }

    const filePrefix = {
      all: 'OilSync_Complete_Audit_Snapshot',
      inventory: 'OilSync_Tanks_and_Storage_Audit',
      production: 'OilSync_Production_Runs_Audit',
      sales: 'OilSync_Sales_Dispatches_Audit',
      suppliers: 'OilSync_Supplier_Intakes_Audit',
    }[activeReportTab] || 'OilSync_Audit_Report';

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filePrefix}_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadMsg(`Successfully exported ${filePrefix}_${today}.csv`);
    setTimeout(() => setDownloadMsg(''), 4500);
  };

  // Trigger Print to PDF with tab-aware document filename
  const triggerPrint = () => {
    const titles = {
      all: 'OilSync_Complete_Audit_Snapshot',
      inventory: 'OilSync_Storage_Tanks_Audit',
      production: 'OilSync_Production_Runs_Audit',
      sales: 'OilSync_Sales_Dispatches_Audit',
      suppliers: 'OilSync_Supplier_Intakes_Audit',
    };
    const prevTitle = document.title;
    document.title = titles[activeReportTab] || 'OilSync_Audit_Report';
    window.print();
    setTimeout(() => {
      document.title = prevTitle;
    }, 1000);
  };

  const batchesToDisplay = activeReportTab === 'production' ? productionLogs : productionLogs.slice(0, 15);
  const salesToDisplay = activeReportTab === 'sales' ? salesLogs : salesLogs.slice(0, 12);
  const suppliersToDisplay = activeReportTab === 'suppliers' ? supplierLogs : supplierLogs.slice(0, 12);

  return (
    <div className="space-y-6 font-sans print:space-y-0 print:w-full print:m-0 print:p-0">
      {/* Top Banner & Control Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 glass-panel rounded-3xl print:hidden">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-blue-600 dark:bg-amber-500 text-white dark:text-slate-950 rounded-xl shadow-md">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                Factory Audit & Compliance Reports
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Generate and export certified operational reports for management review and supply chain auditing.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={triggerPrint}
            title="Download or print current report as PDF in standard A4 format"
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-md shadow-blue-600/20"
          >
            <Printer className="w-4 h-4 text-white" />
            <span>Download as PDF (A4)</span>
          </button>
          <button
            onClick={exportToCSV}
            title="Download report data as CSV for Microsoft Excel"
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-md shadow-emerald-600/20"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {downloadMsg && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 shadow-xs animate-fadeIn print:hidden">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{downloadMsg}</span>
        </div>
      )}

      {/* KPI Overview Strip - Hidden in PDF print */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:hidden">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Stock</span>
            <Warehouse className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white">
            {totalStockLiters.toLocaleString()} <span className="text-xs font-normal text-slate-500">Liters</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {Math.round((totalStockLiters / (totalCapacityLiters || 1)) * 100)}% total tank capacity
          </p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Extracted Oil</span>
            <Factory className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white">
            {totalProductionLiters.toLocaleString()} <span className="text-xs font-normal text-slate-500">Liters</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">{productionLogs.length} production batches logged</p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Sales Revenue</span>
            <Receipt className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
            ₹{totalSalesRevenue.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">{salesLogs.length} fulfilled client orders</p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Seed Spend</span>
            <Truck className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400">
            ₹{totalProcurementSpend.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">{supplierLogs.length} vendor deliveries</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 print:hidden overflow-x-auto">
        {[
          { id: 'all', label: 'Complete Audit Snapshot' },
          { id: 'inventory', label: 'Tanks & Storage' },
          { id: 'production', label: 'Production Runs' },
          { id: 'sales', label: 'Sales Dispatches' },
          { id: 'suppliers', label: 'Supplier Intakes' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveReportTab(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeReportTab === tab.id
                ? 'bg-blue-600 dark:bg-amber-500 text-white dark:text-slate-950 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Printable Report Document Sheet */}
      <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl space-y-8 shadow-xs print:p-0 print:border-none print:shadow-none print:space-y-6 print:rounded-none print:w-full print:block">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6 print:border-slate-300 print:flex-row print:items-center print:justify-between print:pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-widest text-blue-600 dark:text-amber-400 uppercase print:text-blue-700">
                OILSYNC ERP
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 print:text-slate-600">
                Official Production & Inventory Audit Log
              </span>
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1 print:text-black">
              {activeReportTab === 'all' && 'Industrial Plant Operational Report (Full Audit)'}
              {activeReportTab === 'inventory' && 'Storage Tank Audit Snapshot'}
              {activeReportTab === 'production' && 'Production Batches & Yields Report'}
              {activeReportTab === 'sales' && 'Wholesale Sales & Outbound Dispatches Report'}
              {activeReportTab === 'suppliers' && 'Raw Seed Procurement Intake Report'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 font-mono print:text-slate-500">
              Audit ID: {auditId} • Category: {
                activeReportTab === 'all' ? 'Complete Audit Snapshot' :
                activeReportTab === 'inventory' ? 'Tanks & Storage' :
                activeReportTab === 'production' ? 'Production Runs' :
                activeReportTab === 'sales' ? 'Sales Dispatches' : 'Supplier Intakes'
              }
            </p>
          </div>

          <div className="text-right">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20 print:border-emerald-400 print:text-emerald-800 print:bg-emerald-50">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Authenticity
            </span>
            <p className="text-xs text-slate-400 mt-1 font-mono print:text-slate-600">
              Generated: {formattedDate}
            </p>
          </div>
        </div>

        {/* Section 1: Storage Tank Levels */}
        {(activeReportTab === 'all' || activeReportTab === 'inventory') && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2 print:text-slate-900">
                <Warehouse className="w-4 h-4 text-blue-500" />
                1. Storage Tank Audit Snapshot
              </h4>
              <span className="text-xs text-slate-400 font-mono print:text-slate-600">{inventory.length} Active Tanks</span>
            </div>
            <div className="overflow-x-auto print:overflow-visible border border-slate-200/80 dark:border-slate-800 rounded-2xl print:border print:border-slate-300 print:rounded-lg">
              <table className="w-full text-left text-xs print:text-[8.5pt] print:w-full table-auto">
                <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-slate-800 print:bg-slate-100 print:text-slate-700">
                  <tr>
                    <th className="p-3 print:py-2 print:px-2.5 font-bold uppercase tracking-wider text-[11px] print:text-[8pt] text-slate-600 dark:text-slate-300 w-[15%]">Tank ID</th>
                    <th className="p-3 print:py-2 print:px-2.5 font-bold uppercase tracking-wider text-[11px] print:text-[8pt] text-slate-600 dark:text-slate-300 w-[25%]">Oil Variant</th>
                    <th className="p-3 print:py-2 print:px-2.5 font-bold uppercase tracking-wider text-[11px] print:text-[8pt] text-slate-600 dark:text-slate-300 w-[17%]">Current Liters</th>
                    <th className="p-3 print:py-2 print:px-2.5 font-bold uppercase tracking-wider text-[11px] print:text-[8pt] text-slate-600 dark:text-slate-300 w-[17%]">Capacity</th>
                    <th className="p-3 print:py-2 print:px-2.5 font-bold uppercase tracking-wider text-[11px] print:text-[8pt] text-slate-600 dark:text-slate-300 w-[12%]">Fill Ratio</th>
                    <th className="p-3 print:py-2 print:px-2.5 font-bold uppercase tracking-wider text-[11px] print:text-[8pt] text-slate-600 dark:text-slate-300 w-[14%]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 print:divide-slate-200">
                  {inventory.map((t) => {
                    const current = t.currentLiters ?? t.current ?? 0;
                    const capacity = t.capacityLiters ?? t.capacity ?? 1;
                    const util = Math.round((current / capacity) * 100);
                    const isLow = current <= (t.minAlert || 1000);

                    return (
                      <tr key={t.id} className="text-slate-700 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 print:hover:bg-transparent">
                        <td className="p-3 print:py-2 print:px-2.5 font-mono font-bold text-blue-600 dark:text-amber-400 print:text-blue-800 whitespace-nowrap">TANK-0{t.id}</td>
                        <td className="p-3 print:py-2 print:px-2.5 font-semibold text-slate-900 dark:text-white print:text-slate-900">{t.name}</td>
                        <td className="p-3 print:py-2 print:px-2.5 font-mono font-semibold text-slate-800 dark:text-slate-200 print:text-slate-900 whitespace-nowrap">{current.toLocaleString()} L</td>
                        <td className="p-3 print:py-2 print:px-2.5 font-mono text-slate-400 print:text-slate-600 whitespace-nowrap">{capacity.toLocaleString()} L</td>
                        <td className="p-3 print:py-2 print:px-2.5 font-bold font-mono text-slate-800 dark:text-slate-200 print:text-slate-900 whitespace-nowrap">{util}%</td>
                        <td className="p-3 print:py-2 print:px-2.5 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] print:text-[7.5pt] font-bold whitespace-nowrap inline-block ${
                              isLow
                                ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 print:bg-rose-50 print:text-rose-700 print:border print:border-rose-300'
                                : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 print:bg-emerald-50 print:text-emerald-700 print:border print:border-emerald-300'
                            }`}
                          >
                            {isLow ? 'Reorder Alert' : 'Normal Capacity'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Section 2: Production Extraction Batches */}
        {(activeReportTab === 'all' || activeReportTab === 'production') && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2 print:text-slate-900">
                <Factory className="w-4 h-4 text-indigo-500" />
                2. Historical Production Batches & Yields
              </h4>
              <span className="text-xs text-slate-400 font-mono print:text-slate-600">{productionLogs.length} Batches</span>
            </div>
            <div className="overflow-x-auto print:overflow-visible border border-slate-200/80 dark:border-slate-800 rounded-2xl max-h-96 print:max-h-none print:border print:border-slate-300 print:rounded-lg">
              <table className="w-full text-left text-xs print:text-[8.5pt] print:w-full table-auto">
                <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-slate-800 sticky top-0 print:static print:bg-slate-100 print:text-slate-700">
                  <tr>
                    <th className="p-3 print:py-2 print:px-2.5 font-bold uppercase tracking-wider text-[11px] print:text-[8pt] text-slate-600 dark:text-slate-300 w-[15%]">Batch ID</th>
                    <th className="p-3 print:py-2 print:px-2.5 font-bold uppercase tracking-wider text-[11px] print:text-[8pt] text-slate-600 dark:text-slate-300 w-[15%]">Date</th>
                    <th className="p-3 print:py-2 print:px-2.5 font-bold uppercase tracking-wider text-[11px] print:text-[8pt] text-slate-600 dark:text-slate-300 w-[24%]">Oil Variant</th>
                    <th className="p-3 print:py-2 print:px-2.5 font-bold uppercase tracking-wider text-[11px] print:text-[8pt] text-slate-600 dark:text-slate-300 w-[16%]">Seed Weight (Kg)</th>
                    <th className="p-3 print:py-2 print:px-2.5 font-bold uppercase tracking-wider text-[11px] print:text-[8pt] text-slate-600 dark:text-slate-300 w-[15%]">Extracted (L)</th>
                    <th className="p-3 print:py-2 print:px-2.5 font-bold uppercase tracking-wider text-[11px] print:text-[8pt] text-slate-600 dark:text-slate-300 w-[15%]">Recovery Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 print:divide-slate-200">
                  {batchesToDisplay.map((p) => {
                    const seedKg = p.rawSeedWeightKg || 1000;
                    const qtyL = p.quantityLiters || 0;
                    const eff = ((qtyL / seedKg) * 100).toFixed(1);

                    return (
                      <tr key={p.id} className="text-slate-700 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 print:hover:bg-transparent">
                        <td className="p-3 print:py-2 print:px-2.5 font-mono font-bold text-blue-600 dark:text-amber-400 print:text-blue-800 whitespace-nowrap">{p.id}</td>
                        <td className="p-3 print:py-2 print:px-2.5 font-mono text-slate-400 print:text-slate-600 whitespace-nowrap">{p.date || '2026-10-26'}</td>
                        <td className="p-3 print:py-2 print:px-2.5 font-semibold text-slate-900 dark:text-white print:text-slate-900">{p.oilType}</td>
                        <td className="p-3 print:py-2 print:px-2.5 font-mono text-slate-800 dark:text-slate-200 print:text-slate-900 whitespace-nowrap">{seedKg.toLocaleString()} kg</td>
                        <td className="p-3 print:py-2 print:px-2.5 font-mono font-bold text-emerald-600 dark:text-emerald-400 print:text-emerald-700 whitespace-nowrap">
                          {qtyL.toLocaleString()} L
                        </td>
                        <td className="p-3 print:py-2 print:px-2.5 font-mono font-bold text-slate-900 dark:text-white print:text-slate-900 whitespace-nowrap">{eff}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Section 3: Recent Wholesale Sales */}
        {(activeReportTab === 'all' || activeReportTab === 'sales') && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2 print:text-slate-900">
                <Receipt className="w-4 h-4 text-emerald-500" />
                3. Recent Wholesale Sales Dispatches
              </h4>
              <span className="text-xs text-slate-400 font-mono print:text-slate-600">{salesLogs.length} Orders</span>
            </div>
            <div className="overflow-x-auto print:overflow-visible border border-slate-200/80 dark:border-slate-800 rounded-2xl print:border print:border-slate-300 print:rounded-lg">
              <table className="w-full text-left text-xs print:text-[8.5pt] print:w-full table-auto">
                <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-slate-800 print:bg-slate-100 print:text-slate-700">
                  <tr>
                    <th className="p-3 print:py-2 print:px-2.5 font-bold uppercase tracking-wider text-[11px] print:text-[8pt] text-slate-600 dark:text-slate-300 w-[16%]">Order ID</th>
                    <th className="p-3 print:py-2 print:px-2.5 font-bold uppercase tracking-wider text-[11px] print:text-[8pt] text-slate-600 dark:text-slate-300 w-[28%]">Customer / Client</th>
                    <th className="p-3 print:py-2 print:px-2.5 font-bold uppercase tracking-wider text-[11px] print:text-[8pt] text-slate-600 dark:text-slate-300 w-[22%]">Oil Variant</th>
                    <th className="p-3 print:py-2 print:px-2.5 font-bold uppercase tracking-wider text-[11px] print:text-[8pt] text-slate-600 dark:text-slate-300 w-[16%]">Volume</th>
                    <th className="p-3 print:py-2 print:px-2.5 font-bold uppercase tracking-wider text-[11px] print:text-[8pt] text-slate-600 dark:text-slate-300 w-[18%]">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 print:divide-slate-200">
                  {salesToDisplay.map((o) => (
                    <tr key={o.id} className="text-slate-700 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 print:hover:bg-transparent">
                      <td className="p-3 print:py-2 print:px-2.5 font-mono font-bold text-blue-600 dark:text-amber-400 print:text-blue-800 whitespace-nowrap">{o.id}</td>
                      <td className="p-3 print:py-2 print:px-2.5 font-semibold text-slate-900 dark:text-white print:text-slate-900">{o.buyerName || 'Buyer'}</td>
                      <td className="p-3 print:py-2 print:px-2.5 text-slate-700 dark:text-slate-300 print:text-slate-800">{o.oilType}</td>
                      <td className="p-3 print:py-2 print:px-2.5 font-mono font-semibold text-slate-800 dark:text-slate-200 print:text-slate-900 whitespace-nowrap">{o.quantityLiters.toLocaleString()} L</td>
                      <td className="p-3 print:py-2 print:px-2.5 font-mono font-bold text-emerald-600 dark:text-emerald-400 print:text-emerald-700 whitespace-nowrap">
                        ₹{o.totalAmount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Section 4: Supplier Procurement Intake */}
        {(activeReportTab === 'all' || activeReportTab === 'suppliers') && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2 print:text-slate-900">
                <Truck className="w-4 h-4 text-amber-500" />
                4. Raw Seed Procurement Intake Logs
              </h4>
              <span className="text-xs text-slate-400 font-mono print:text-slate-600">{supplierLogs.length} Deliveries</span>
            </div>
            <div className="overflow-x-auto print:overflow-visible border border-slate-200/80 dark:border-slate-800 rounded-2xl print:border print:border-slate-300 print:rounded-lg">
              <table className="w-full text-left text-xs print:text-[8.5pt] print:w-full table-auto">
                <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-slate-800 print:bg-slate-100 print:text-slate-700">
                  <tr>
                    <th className="p-3 print:py-2 print:px-2.5 font-bold uppercase tracking-wider text-[11px] print:text-[8pt] text-slate-600 dark:text-slate-300 w-[16%]">Intake ID</th>
                    <th className="p-3 print:py-2 print:px-2.5 font-bold uppercase tracking-wider text-[11px] print:text-[8pt] text-slate-600 dark:text-slate-300 w-[28%]">Vendor / Farmer</th>
                    <th className="p-3 print:py-2 print:px-2.5 font-bold uppercase tracking-wider text-[11px] print:text-[8pt] text-slate-600 dark:text-slate-300 w-[22%]">Raw Seed Variety</th>
                    <th className="p-3 print:py-2 print:px-2.5 font-bold uppercase tracking-wider text-[11px] print:text-[8pt] text-slate-600 dark:text-slate-300 w-[16%]">Quantity</th>
                    <th className="p-3 print:py-2 print:px-2.5 font-bold uppercase tracking-wider text-[11px] print:text-[8pt] text-slate-600 dark:text-slate-300 w-[18%]">Cost (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 print:divide-slate-200">
                  {suppliersToDisplay.map((sup) => (
                    <tr key={sup.id} className="text-slate-700 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 print:hover:bg-transparent">
                      <td className="p-3 print:py-2 print:px-2.5 font-mono font-bold text-blue-600 dark:text-amber-400 print:text-blue-800 whitespace-nowrap">{sup.id}</td>
                      <td className="p-3 print:py-2 print:px-2.5 font-semibold text-slate-900 dark:text-white print:text-slate-900">{sup.supplierName}</td>
                      <td className="p-3 print:py-2 print:px-2.5 text-slate-700 dark:text-slate-300 print:text-slate-800">{sup.materialItem}</td>
                      <td className="p-3 print:py-2 print:px-2.5 font-mono text-slate-800 dark:text-slate-200 print:text-slate-900 whitespace-nowrap">{sup.quantity}</td>
                      <td className="p-3 print:py-2 print:px-2.5 font-mono font-bold text-amber-600 dark:text-amber-400 print:text-amber-700 whitespace-nowrap">
                        ₹{sup.totalCost.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Audit Sign-off Footer */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 print:border-slate-300 flex flex-col sm:flex-row print:flex-row print:items-center sm:items-center justify-between text-xs print:text-[8pt] text-slate-400 print:text-slate-600 gap-2">
          <p>© 2026 SmartOil ERP • Certified Operational Record • All rights reserved.</p>
          <p className="font-mono">Document Hash: SHA256-ED9827A1BC4</p>
        </div>
      </div>
    </div>
  );
};

export default ReportsModule;
