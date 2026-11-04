import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  UserPlus,
  Trash2,
  ShieldCheck,
  Mail,
  Check,
  Copy,
  Sparkles,
  Search,
  KeyRound,
  Briefcase,
  UserCheck,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';

export const EmployeeModule = () => {
  const { employees, addEmployee, removeEmployee } = useData();
  const { user, removeAccountCredentials } = useAuth();
  const isAdmin = user?.role === 'Administrator';
  const isFactoryManager = user?.role === 'Factory Manager';
  const isStaff = user?.role === 'Factory Staff';
  const canManageAccounts = isAdmin;

  // Entry Form Modal State
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Factory Staff');
  const [allocatedMachine, setAllocatedMachine] = useState('');
  const [useCustomPassword, setUseCustomPassword] = useState(false);
  const [customPassword, setCustomPassword] = useState('');
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('All');

  // Delete Confirmation State
  const [accountToDelete, setAccountToDelete] = useState(null);

  // Issued Credentials Pass Modal State
  const [issuedCreds, setIssuedCreds] = useState(null);
  const [copied, setCopied] = useState(false);
  const [copiedCardId, setCopiedCardId] = useState(null);

  // Guard: Factory Staff are strictly prohibited from viewing users page
  if (isStaff || (!isAdmin && !isFactoryManager)) {
    return (
      <div className="p-8 sm:p-12 glass-panel rounded-3xl text-center space-y-4 max-w-lg mx-auto my-12 border border-rose-200 dark:border-rose-900/40">
        <div className="w-16 h-16 bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-3 py-1 rounded-full border border-rose-200 dark:border-rose-800">
            Confidential Directory
          </span>
          <h2 className="text-xl font-black text-slate-900 dark:text-white pt-2">
            Access Restricted
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Factory Staff do not have permission to view or manage user accounts in the Oil Factory ERP. Please contact your Factory Manager or Administrator for assistance.
          </p>
        </div>
      </div>
    );
  }

  // Form Submission
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim() || !email.trim()) {
      setFormError('Please enter both name and email.');
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    if (employees.some(emp => (emp.email || '').toLowerCase().trim() === cleanEmail)) {
      setFormError(`An employee with email "${email.trim()}" is already registered.`);
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate unique username and password
      const cleanName = name.replace(/[^a-zA-Z]/g, '');
      const prefix = role === 'Factory Manager' ? 'MGR' : 'EMP';
      const generatedUsername = `${prefix}_${cleanName || 'User'}`;
      const generatedPassword = useCustomPassword && customPassword.trim()
        ? customPassword.trim()
        : `OilSync@${Math.floor(1000 + Math.random() * 9000)}`;

      const newMemberData = {
        name: name.trim(),
        email: cleanEmail,
        username: generatedUsername,
        password: generatedPassword,
        role,
        dept: 'Operations',
        allocatedMachine: allocatedMachine.trim() || 'Factory Floor'
      };

      // Register in Data Context & Backend (backend automatically creates user credentials and socket event)
      await addEmployee(newMemberData);

      // Show Issued Login Credentials Pass Modal
      setIssuedCreds(newMemberData);

      // Reset Form
      setName('');
      setEmail('');
      setRole('Factory Staff');
      setAllocatedMachine('');
      setUseCustomPassword(false);
      setCustomPassword('');
      setFormError('');
      setShowModal(false);
    } catch (err) {
      setFormError(err.message || 'Failed to create account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyIssuedToClipboard = () => {
    if (!issuedCreds) return;
    const text = `OilSync ERP Login Credentials:\nRole: ${issuedCreds.role}\nUsername: ${issuedCreds.username}\nPassword: ${issuedCreds.password}\nEmail: ${issuedCreds.email}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const copyCardCredentials = (emp) => {
    const text = `OilSync ERP Login Credentials:\nRole: ${emp.role}\nUsername: ${emp.username || emp.id}\nEmail: ${emp.email}`;
    navigator.clipboard.writeText(text);
    setCopiedCardId(emp.id);
    setTimeout(() => setCopiedCardId(null), 2500);
  };

  const confirmDeleteAccount = (emp) => {
    setAccountToDelete(emp);
  };

  const handleDeleteConfirmed = async () => {
    if (accountToDelete) {
      const targetId = accountToDelete.id || accountToDelete._id || accountToDelete.email;
      await removeEmployee(targetId);
      if (removeAccountCredentials) {
        removeAccountCredentials(accountToDelete.email || targetId);
      }
      setAccountToDelete(null);
    }
  };

  // Filtered accounts list
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      (emp.name && emp.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (emp.email && emp.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (emp.username && emp.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (emp.dept && emp.dept.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole =
      selectedRoleFilter === 'All' ? true : emp.role === selectedRoleFilter;

    return matchesSearch && matchesRole;
  });

  const staffCount = employees.filter((e) => e.role === 'Factory Staff').length;
  const managerCount = employees.filter((e) => e.role === 'Factory Manager').length;
  const adminCount = employees.filter((e) => e.role === 'Administrator').length;

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 glass-panel rounded-3xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-amber-500/10 text-blue-700 dark:text-amber-400">
              {isAdmin ? 'System Administration Access' : 'Management Access'}
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600 dark:text-amber-400" />
            Factory Members & Staff Accounts
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Create new accounts and issue login credentials for factory members, staff, and supervisors.
          </p>
        </div>

        {canManageAccounts && (
          <button
            onClick={() => setShowModal(true)}
            id="create-account-btn"
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 dark:bg-amber-500 hover:bg-blue-700 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create New Account</span>
          </button>
        )}
      </div>

      {/* Factory Manager View-Only Notice Banner */}
      {isFactoryManager && (
        <div className="p-4 bg-indigo-50/80 dark:bg-purple-950/30 border border-indigo-200/80 dark:border-purple-800/50 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 text-indigo-800 dark:text-purple-300">
            <Eye className="w-5 h-5 shrink-0 text-indigo-600 dark:text-purple-400" />
            <span>
              <strong>Factory Manager Scope:</strong> You have view access to all factory staff, accounts, and assigned machines. Only Administrators can create or delete user accounts.
            </span>
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider bg-indigo-100 dark:bg-purple-900/60 text-indigo-800 dark:text-purple-200 px-3 py-1 rounded-xl shrink-0 self-start sm:self-auto">
            View-Only Access
          </span>
        </div>
      )}

      {/* Account Overview Stats (No Attendance) */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 glass-card rounded-2xl">
          <span className="text-xs font-semibold text-slate-400 uppercase">Total Accounts</span>
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{employees.length}</h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Registered Factory Users</p>
        </div>

        <div className="p-4 glass-card rounded-2xl">
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase">Factory Staff</span>
          <h3 className="text-2xl font-extrabold text-blue-700 dark:text-blue-400 mt-1">{staffCount}</h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Floor & Machine Crew</p>
        </div>

        <div className="p-4 glass-card rounded-2xl">
          <span className="text-xs font-semibold text-indigo-600 dark:text-purple-400 uppercase">Factory Managers</span>
          <h3 className="text-2xl font-extrabold text-indigo-700 dark:text-purple-400 mt-1">{managerCount}</h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Supervisors & Leads</p>
        </div>

        <div className="p-4 glass-card rounded-2xl">
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase">Administrators</span>
          <h3 className="text-2xl font-extrabold text-amber-700 dark:text-amber-400 mt-1">{adminCount}</h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">System Architecture</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 glass-card rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, username..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {['All', 'Factory Staff', 'Factory Manager', 'Administrator'].map((roleFilter) => (
            <button
              key={roleFilter}
              onClick={() => setSelectedRoleFilter(roleFilter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedRoleFilter === roleFilter
                  ? 'bg-blue-600 dark:bg-amber-500 text-white dark:text-slate-950 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {roleFilter}
            </button>
          ))}
        </div>
      </div>

      {/* Account Cards Grid */}
      {filteredEmployees.length === 0 ? (
        <div className="p-12 glass-card rounded-3xl text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <Users className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-slate-800 dark:text-white">No accounts found</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {searchQuery
              ? `No members match "${searchQuery}". Try a different search term.`
              : 'No factory accounts in this category yet.'}
          </p>
          {canManageAccounts && (
            <button
              onClick={() => setShowModal(true)}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 dark:bg-amber-500 text-white dark:text-slate-950 text-xs font-bold rounded-xl shadow cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" /> Create New Account
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEmployees.map((emp) => {
            const isEmpManager = emp.role === 'Factory Manager';
            const isEmpAdmin = emp.role === 'Administrator';

            return (
              <div
                key={emp.id}
                className={`p-5 glass-card rounded-2xl border flex flex-col justify-between transition-all hover:shadow-md ${
                  isEmpAdmin
                    ? 'border-amber-200 dark:border-amber-500/30 bg-amber-50/20 dark:bg-amber-950/10'
                    : isEmpManager
                    ? 'border-indigo-200 dark:border-purple-500/30 bg-indigo-50/20 dark:bg-purple-950/20'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div>
                  {/* Top Bar with Avatar, Name, and Actions */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-3 rounded-2xl ${
                          isEmpAdmin
                            ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300'
                            : isEmpManager
                            ? 'bg-indigo-100 dark:bg-purple-500/20 text-indigo-700 dark:text-purple-300'
                            : 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        }`}
                      >
                        {isEmpAdmin ? (
                          <ShieldCheck className="w-6 h-6" />
                        ) : isEmpManager ? (
                          <Briefcase className="w-6 h-6" />
                        ) : (
                          <UserCheck className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          {emp.name}
                          {isEmpAdmin && (
                            <span className="text-[10px] bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                              Admin
                            </span>
                          )}
                          {isEmpManager && (
                            <span className="text-[10px] bg-indigo-100 dark:bg-purple-500/20 text-indigo-700 dark:text-purple-300 border border-indigo-200 dark:border-purple-500/30 px-2 py-0.5 rounded-full font-bold">
                              Manager
                            </span>
                          )}
                          {!isEmpAdmin && !isEmpManager && (
                            <span className="text-[10px] bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30 px-2 py-0.5 rounded-full font-bold">
                              Staff
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5 font-mono">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {emp.email}
                        </p>
                      </div>
                    </div>

                    {isAdmin && !isEmpAdmin && (
                      <button
                        onClick={() => confirmDeleteAccount(emp)}
                        className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                        title="Revoke / Remove Account"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Metadata: Role & Status */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block font-semibold">Account Role</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{emp.role || 'Factory Staff'}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block font-semibold">Status</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Active
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Bar: Credentials Info & Quick Copy */}
                <div className="mt-4 pt-3 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80">
                  <div className="space-y-0.5">
                    <div>ID: <strong className="font-mono text-slate-700 dark:text-slate-300">{emp.id}</strong></div>
                    <div>Username: <strong className="font-mono text-slate-700 dark:text-slate-300">{emp.username || emp.id}</strong></div>
                  </div>

                  <button
                    onClick={() => copyCardCredentials(emp)}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-semibold text-[11px] transition-colors cursor-pointer"
                    title="Copy Login Details"
                  >
                    {copiedCardId === emp.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Pass</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Account Creation Modal */}
      {showModal && canManageAccounts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-blue-600 dark:text-amber-400" />
                  Create Factory Member Account
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Register a new staff member or manager and generate login credentials.
                </p>
              </div>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
                  Gmail / Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. ramesh@gmail.com"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
                  Role Designation
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('Factory Staff')}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      role === 'Factory Staff'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Factory Staff</span>
                    <span className="text-[10px] font-normal text-slate-400">Floor & Machine Operator</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('Factory Manager')}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      role === 'Factory Manager'
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-purple-500/10 text-indigo-700 dark:text-purple-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>Factory Manager</span>
                    <span className="text-[10px] font-normal text-slate-400">Operations & Supervisor</span>
                  </button>
                </div>
              </div>



              {/* Password Mode */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                    Password Setup
                  </label>
                  <button
                    type="button"
                    onClick={() => setUseCustomPassword(!useCustomPassword)}
                    className="text-[11px] font-bold text-blue-600 dark:text-amber-400 hover:underline cursor-pointer"
                  >
                    {useCustomPassword ? 'Use Auto-Generated Password' : 'Set Custom Password Instead'}
                  </button>
                </div>

                {useCustomPassword ? (
                  <div className="relative">
                    <input
                      type={showPasswordText ? 'text' : 'password'}
                      required
                      value={customPassword}
                      onChange={(e) => setCustomPassword(e.target.value)}
                      placeholder="Enter custom password (min 6 characters)"
                      className="w-full p-3 pr-10 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordText(!showPasswordText)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      {showPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between text-xs font-mono text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1.5 font-sans text-slate-400">
                      <KeyRound className="w-3.5 h-3.5 text-blue-500" />
                      Auto-generated format:
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">OilSync@XXXX</span>
                  </div>
                )}
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="confirm-create-account-btn"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 dark:bg-amber-500 disabled:opacity-50 text-white dark:text-slate-950 font-bold rounded-xl text-xs shadow-md hover:bg-blue-700 dark:hover:bg-amber-400 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Creating Account...' : 'Create Account & Issue Pass'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Issued Credentials Pass Modal */}
      {issuedCreds && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-amber-500/20 text-blue-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-amber-400 tracking-wider">
                Account Created Successfully
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Generated Login Credentials</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Hand over these credentials to <strong>{issuedCreds.name}</strong> to enable platform access.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-left space-y-2.5 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Role:</span>
                <span className="font-bold text-blue-700 dark:text-amber-400 font-sans">{issuedCreds.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Username:</span>
                <span className="font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                  {issuedCreds.username}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Password:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                  {issuedCreds.password}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Email:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                  {issuedCreds.email}
                </span>
              </div>

            </div>

            <div className="flex gap-2">
              <button
                onClick={copyIssuedToClipboard}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Credentials'}</span>
              </button>

              <button
                onClick={() => setIssuedCreds(null)}
                className="flex-1 py-2.5 bg-blue-600 dark:bg-amber-500 hover:bg-blue-700 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-md cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {accountToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Revoke Account Access?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Are you sure you want to delete the account for <strong>{accountToDelete.name}</strong> ({accountToDelete.email})? They will no longer be able to log in.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setAccountToDelete(null)}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirmed}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors shadow cursor-pointer"
              >
                Yes, Revoke Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
