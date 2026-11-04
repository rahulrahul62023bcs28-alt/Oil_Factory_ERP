import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthGateway } from './components/AuthGateway';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { AiAnalyticsModule } from './components/AIAnalyticsModule';
import { ProductionModule } from './components/ProductionModule';
import { InventoryModule } from './components/InventoryModule';
import { SupplierModule } from './components/SupplierModule';
import { SalesModule } from './components/SalesModule';
import { EmployeeModule } from './components/EmployeeModule';
import { ReportsModule } from './components/ReportsModule';
import { CustomCursor } from './components/CustomCursor';
import { ShieldAlert } from 'lucide-react';

const MainLayout = () => {
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!isAuthenticated) {
    return (
      <>
        <CustomCursor />
        <AuthGateway />
      </>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'ai-analytics':
        return <AiAnalyticsModule />;
      case 'production':
        return <ProductionModule />;
      case 'inventory':
        return <InventoryModule />;
      case 'suppliers':
        return <SupplierModule />;
      case 'sales':
        return <SalesModule />;
      case 'employees':
        if (user?.role === 'Factory Staff') {
          return (
            <div className="p-8 sm:p-12 glass-panel rounded-3xl text-center space-y-4 max-w-lg mx-auto my-12 border border-rose-200 dark:border-rose-900/40">
              <div className="w-16 h-16 bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-3 py-1 rounded-full border border-rose-200 dark:border-rose-800">
                  Access Restricted
                </span>
                <h2 className="text-xl font-black text-slate-900 dark:text-white pt-2">
                  Staff Access Denied
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Factory Staff do not have authorization to view the factory users directory. Please contact your Factory Manager or System Administrator.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('dashboard')}
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 dark:bg-amber-500 hover:bg-blue-700 dark:hover:bg-amber-400 text-white dark:text-slate-950 text-xs font-bold rounded-xl shadow cursor-pointer transition-all"
              >
                Return to Dashboard
              </button>
            </div>
          );
        }
        return <EmployeeModule />;
      case 'reports':
        return <ReportsModule />;
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300 print:bg-white print:text-black print:min-h-0 print:block">
      <CustomCursor />
      <Navbar />
      <div className="flex flex-1 overflow-hidden print:block print:overflow-visible">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-[calc(100vh-65px)] print:p-0 print:m-0 print:max-h-none print:overflow-visible print:block print:w-full">
          <div className="max-w-7xl mx-auto space-y-6 print:max-w-none print:w-full print:p-0 print:m-0 print:space-y-0">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <MainLayout />
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
