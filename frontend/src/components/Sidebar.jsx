import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  BrainCircuit,
  Factory,
  Warehouse,
  Truck,
  Receipt,
  Users,
  FileSpreadsheet,
  ShieldCheck,
  Briefcase,
  UserCheck
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user, hasAccess } = useAuth();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['Factory Staff', 'Factory Manager', 'Administrator']
    },
    {
      id: 'ai-analytics',
      label: 'AI Analytics',
      icon: BrainCircuit,
      roles: ['Factory Staff', 'Factory Manager', 'Administrator']
    },
    {
      id: 'production',
      label: 'Production Flow',
      icon: Factory,
      roles: ['Factory Staff', 'Factory Manager', 'Administrator']
    },
    {
      id: 'inventory',
      label: 'Inventory Flow',
      icon: Warehouse,
      roles: ['Factory Staff', 'Factory Manager', 'Administrator']
    },
    {
      id: 'suppliers',
      label: 'Supplier Flow',
      icon: Truck,
      roles: ['Factory Staff', 'Factory Manager', 'Administrator']
    },
    {
      id: 'sales',
      label: 'Sales Flow',
      icon: Receipt,
      roles: ['Factory Staff', 'Factory Manager', 'Administrator']
    },
    {
      id: 'reports',
      label: 'Audit & Reports',
      icon: FileSpreadsheet,
      roles: ['Factory Staff', 'Factory Manager', 'Administrator']
    },
    {
      id: 'employees',
      label: 'Staff & Member Accounts',
      icon: Users,
      roles: ['Factory Manager', 'Administrator']
    }
  ];

  // Strictly filter items to display ONLY modules accessible by current user's role
  const accessibleNavItems = navItems.filter((item) => hasAccess(item.roles));

  const getRoleIcon = (role) => {
    if (role === 'Administrator') return <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-amber-400" />;
    if (role === 'Factory Manager') return <Briefcase className="w-5 h-5 text-indigo-600 dark:text-purple-400" />;
    return <UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
  };

  return (
    <aside className="w-64 bg-white dark:bg-slate-950 border-r border-slate-200/80 dark:border-slate-800 flex flex-col justify-between p-4 shrink-0 min-h-[calc(100vh-65px)] transition-colors duration-300 font-sans print:hidden">
      <div className="space-y-5">
        {/* User Role Card - Neat & Elegant Executive Profile Scope */}
        <div className="p-4 bg-slate-50/80 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
              Active Role Scope
            </span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl shadow-xs">
              {getRoleIcon(user?.role)}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">
                {user?.role}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="space-y-1.5">
          <p className="px-3 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
            Application Modules
          </p>
          {accessibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 dark:bg-amber-500 text-white dark:text-slate-950 shadow-lg shadow-blue-600/20 dark:shadow-amber-500/20 font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 transition-transform ${isActive ? 'scale-110 text-white dark:text-slate-950' : 'text-slate-500 dark:text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};
