import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { LogOut, Sun, Moon, UserCheck, Edit3, Bell, AlertTriangle, User } from 'lucide-react';
import logoImg from '../assets/logo.png';

export const Navbar = () => {
  const { user, logout, updateUserProfile } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { lowStockAlerts, isLiveConnected } = useData();

  // Notification Modal State
  const [showNotifications, setShowNotifications] = useState(false);

  // Profile Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [savedNotice, setSavedNotice] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync state whenever user or edit modal changes
  React.useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user, showEditModal]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateUserProfile({ name, email });
      setSavedNotice(true);
      setTimeout(() => {
        setSavedNotice(false);
        setShowEditModal(false);
      }, 1200);
    } catch (err) {
      console.error('Error updating profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 shadow-xs px-4 sm:px-6 py-3.5 flex items-center justify-between transition-colors duration-300 font-sans print:hidden">
      {/* Brand & System Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 bg-white rounded-2xl css3-rounded-card border border-slate-200 dark:border-slate-700 shadow-sm p-1 overflow-hidden shrink-0">
          <img src={logoImg} alt="Oil Logo" className="w-full h-full object-contain" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white css3-text-shadow-subtle leading-none">
              OilSync <span className="text-blue-600 dark:text-amber-400">ERP</span>
            </h1>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold tracking-wide uppercase mt-0.5 hidden sm:block">
            Factory Operations Platform
          </p>
        </div>
      </div>

      {/* Controls, Notifications, Theme Switcher & Profile Actions */}
      <div className="flex items-center gap-3 relative">
        {/* Real-time Connection Status Indicator (compact icon with pulsing dot) */}
        <div
          title={isLiveConnected ? 'Live Real-time Server Connected' : 'Operating in Local Mode'}
          className={`hidden sm:flex items-center justify-center w-9 h-9 rounded-xl border transition-all duration-300 cursor-help ${
            isLiveConnected
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 shadow-xs'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-500'
          }`}
        >
          <span className="relative flex h-2.5 w-2.5">
            {isLiveConnected && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isLiveConnected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
          </span>
        </div>

        {/* Low Stock Notifications Bell Button */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(prev => !prev)}
            className="relative p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 transition-all font-semibold cursor-pointer flex items-center justify-center"
            title="Low Stock Notifications"
          >
            <Bell className="w-4 h-4" />
            {lowStockAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center animate-bounce shadow-md">
                {lowStockAlerts.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Drawer */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl z-50 p-4 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  Inventory Threshold Alerts
                </h3>
                <span className="text-[10px] bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 font-bold px-2 py-0.5 rounded-full">
                  {lowStockAlerts.length} Low Stock
                </span>
              </div>

              {lowStockAlerts.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">
                  All oil varieties are sufficiently stocked above minimum levels.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {lowStockAlerts.map(item => (
                    <div
                      key={item.id}
                      className="p-3 bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-500/30 rounded-2xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">{item.name}</h4>
                        <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5">
                          Current: <strong>{item.currentLiters}L</strong> (Min: {item.minAlert}L)
                        </p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-1 bg-rose-500 text-white rounded-lg shadow-xs">
                        Refill Required
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Theme Mode Switcher Toggle Button */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-200 transition-all font-semibold cursor-pointer"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-600" />
              <span className="hidden sm:inline">Dark Mode</span>
            </>
          )}
        </button>

        {/* User Identity & Active Role Badge */}
        {user && (
          <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
            {/* Clickable Profile Card Trigger */}
            <button
              onClick={() => {
                setName(user.name);
                setEmail(user.email);
                setShowEditModal(true);
              }}
              className="flex items-center gap-2.5 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-left cursor-pointer group"
              title="Click to edit profile details"
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-amber-500/10 border border-blue-200 dark:border-amber-500/30 flex items-center justify-center text-blue-700 dark:text-amber-400 font-bold text-xs shadow-xs">
                  <User className="w-4 h-4" />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-blue-600 dark:bg-amber-500 text-white dark:text-slate-950 p-0.5 rounded-full shadow-xs">
                  <Edit3 className="w-2.5 h-2.5" />
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-amber-400 transition-colors">
                    {user.name}
                  </span>
                  <span className="text-[10px] bg-blue-600 dark:bg-amber-500/10 dark:border dark:border-amber-500/30 text-white dark:text-amber-400 px-2 py-0.5 rounded-full font-bold shadow-xs">
                    {user.role}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate max-w-[160px]">{user.email}</p>
              </div>
            </button>

            {/* Logout Action Button WITH EXPLICIT TEXT LABEL */}
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
              title="Sign Out of Account"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>

      {/* Profile Editing Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3.5 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-amber-500/10 border border-blue-200 dark:border-amber-500/30 flex items-center justify-center text-blue-600 dark:text-amber-400 shadow-sm shrink-0">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Profile Details</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Update display name & email address</p>
              </div>
            </div>

            {savedNotice && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                <span>Profile details updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleProfileSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
                  Gmail / Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-amber-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 dark:bg-amber-500 hover:bg-blue-700 dark:hover:bg-amber-400 disabled:opacity-50 text-white dark:text-slate-950 font-bold rounded-xl text-xs shadow-md cursor-pointer transition-all"
                >
                  {isSaving ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
