import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Activity, BrainCircuit, Database, Sun, Moon,
  User, Lock, Eye, EyeOff, ArrowRight, CheckCircle, Send
} from 'lucide-react';
import logoImg from '../assets/logo.png';

export const AuthGateway = () => {
  const { loginWithGmail, accountsPool } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  // Sign In State
  const [identifier,   setIdentifier]   = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe,   setRememberMe]   = useState(false);
  const [error,        setError]        = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [activeSlide,  setActiveSlide]  = useState(0);

  // Active View: 'login' | 'forgot' | 'sent'
  const [view,         setView]         = useState('login');

  // Forgot Password State
  const [fpIdentifier, setFpIdentifier] = useState('');
  const [fpError,      setFpError]      = useState('');
  const [fpLoading,    setFpLoading]    = useState(false);

  const heroSlides = [
    {
      title: "Smart Factory Production Telemetry",
      desc: "Real-time IoT monitoring of oil pressing, extraction lines, and automated tank storage updates.",
      icon: Activity,
      color: "from-blue-600 to-indigo-500",
      badge1: "IoT Sensors",
      badge2: "Tank Telemetry"
    },
    {
      title: "AI Business Intelligence & Demand ML",
      desc: "Predictive demand forecasting, price optimization, and smart batch size recommendations.",
      icon: BrainCircuit,
      color: "from-purple-600 to-indigo-600",
      badge1: "Neural Engine",
      badge2: "ML Demand"
    },
    {
      title: "Role-Based Security & Cloud Data",
      desc: "MongoDB Atlas cloud infrastructure with JWT token authentication for Staff, Managers, and Admins.",
      icon: Database,
      color: "from-blue-600 to-teal-500",
      badge1: "Cloud Atlas",
      badge2: "JWT Security"
    }
  ];

  // Restore remembered identifier
  useEffect(() => {
    const saved = localStorage.getItem('oilsync_remember');
    if (saved) { setIdentifier(saved); setRememberMe(true); }
  }, []);

  // Auto-advance slide every 2 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!identifier) { setError('Please enter your username or email address.'); return; }
    if (!password)   { setError('Please enter your password.'); return; }

    setLoginLoading(true);
    try {
      await loginWithGmail(identifier, password);
      if (rememberMe) localStorage.setItem('oilsync_remember', identifier);
      else            localStorage.removeItem('oilsync_remember');
    } catch (err) {
      setError(err.message || 'Invalid username/email or password.');
    } finally {
      setLoginLoading(false);
    }
  };


  const handleForgotSubmit = (e) => {
    e.preventDefault();
    setFpError('');
    const trimmed = fpIdentifier.trim().toLowerCase();
    if (!trimmed) { setFpError('Please enter your username or email.'); return; }
    const found = accountsPool.find(
      a => a.email.toLowerCase() === trimmed || a.username.toLowerCase() === trimmed
    );
    if (!found) { setFpError('No account found with that username or email.'); return; }
    setFpLoading(true);
    setTimeout(() => {
      const existing = JSON.parse(localStorage.getItem('oilsync_reset_requests') || '[]');
      const alreadyPending = existing.find(r => r.email === found.email && r.status === 'pending');
      if (!alreadyPending) {
        existing.push({
          id: Date.now(),
          name: found.name, email: found.email,
          username: found.username, role: found.role,
          requestedAt: new Date().toISOString(),
          status: 'pending'
        });
        localStorage.setItem('oilsync_reset_requests', JSON.stringify(existing));
      }
      setFpLoading(false);
      setView('sent');
    }, 1200);
  };

  const currentSlide = heroSlides[activeSlide];
  const SlideIcon    = currentSlide.icon;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans transition-colors duration-300 relative">

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg text-slate-700 dark:text-slate-200 hover:scale-105 transition-all flex items-center gap-2 text-xs font-bold z-50 cursor-pointer"
      >
        {isDark
          ? <><Sun  className="w-4 h-4 text-amber-400" /><span>Light Mode</span></>
          : <><Moon className="w-4 h-4 text-indigo-600"/><span>Dark Mode</span></>}
      </button>

      {/* Card */}
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 grid grid-cols-1 lg:grid-cols-12 min-h-[580px] transition-colors duration-300">

        {/* ══ LEFT PANEL — Animated Icon Carousel ══════════════════ */}
        <div className="lg:col-span-6 bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden text-white transition-colors duration-300">
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

          {/* Brand */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-2xl border border-white/40 shadow-lg p-1.5 flex items-center justify-center overflow-hidden shrink-0">
              <img src={logoImg} alt="Oil Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white">
                OilSync <span className="text-blue-200 dark:text-amber-400">ERP</span>
              </span>
            </div>
          </div>

          {/* Carousel */}
          <div className="relative z-10 my-auto text-center px-4">
            <div className="w-36 h-36 mx-auto mb-6 bg-white/15 dark:bg-slate-800/60 backdrop-blur-md rounded-full border border-white/25 dark:border-slate-700 flex items-center justify-center shadow-2xl relative transition-all duration-500">
              <div key={activeSlide} className={`w-24 h-24 bg-gradient-to-tr ${currentSlide.color} rounded-full flex items-center justify-center text-white shadow-inner animate-pulse transition-all duration-500`}>
                <SlideIcon className="w-12 h-12 text-white transform transition-transform duration-500 scale-105" />
              </div>
              <div className="absolute -top-2 -right-2 px-2.5 py-1 bg-blue-500 dark:bg-amber-500 text-white dark:text-slate-950 text-[10px] font-bold rounded-full shadow-md">
                {currentSlide.badge1}
              </div>
              <div className="absolute -bottom-2 -left-2 px-2.5 py-1 bg-emerald-500 text-white text-[10px] font-bold rounded-full shadow-md">
                {currentSlide.badge2}
              </div>
            </div>

            <h2 key={`title-${activeSlide}`} className="text-xl font-bold text-white mb-2 leading-snug transition-all duration-500 min-h-[56px] flex items-center justify-center">
              {currentSlide.title}
            </h2>
            <p key={`desc-${activeSlide}`} className="text-xs text-blue-100/90 dark:text-slate-300 max-w-sm mx-auto leading-relaxed transition-all duration-500 min-h-[40px]">
              {currentSlide.desc}
            </p>

            <div className="flex justify-center gap-2 mt-6">
              {heroSlides.map((_, idx) => (
                <div key={idx} className={`h-2 rounded-full transition-all duration-500 ${activeSlide === idx ? 'w-6 bg-white dark:bg-amber-400' : 'w-2 bg-white/40 dark:bg-slate-700'}`} />
              ))}
            </div>
          </div>
        </div>

        {/* ══ RIGHT PANEL — Sign-In / Register Form ══════════════════════════ */}
        <div className="lg:col-span-6 p-8 lg:p-12 flex flex-col justify-center bg-white dark:bg-slate-900 transition-colors duration-300">


          {/* ── LOGIN VIEW ── */}
          {view === 'login' && (
            <div>
              <div className="mb-6">
                <p className="text-base font-bold text-orange-500 mb-1">Welcome to</p>
                <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white leading-tight">
                  Sign in to your account
                </h1>
                <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">
                  Access your factory dashboard and manage operations
                </p>
              </div>

              {error && (
                <div className="mb-5 p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0"></span>
                  {error}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-5">
                {/* Email / Username */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Email or Username
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      id="login-identifier"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="Enter your email or username"
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => { setView('forgot'); setFpIdentifier(identifier); setFpError(''); }}
                      className="text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="login-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-11 pr-12 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    id="remember-me"
                    onClick={() => setRememberMe(!rememberMe)}
                    className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all cursor-pointer flex-shrink-0 ${rememberMe ? 'bg-orange-500 border-orange-500' : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600'}`}
                  >
                    {rememberMe && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <span className="text-sm text-slate-600 dark:text-slate-400">Remember me</span>
                </div>

                <button
                  type="submit"
                  id="login-submit"
                  disabled={loginLoading}
                  className="w-full py-4 px-6 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 active:scale-[0.98] text-white font-bold rounded-2xl shadow-lg shadow-orange-500/30 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  {loginLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-full text-xs text-slate-500 dark:text-slate-400">
                    <Lock className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                    <span>Restricted Access: Accounts are created by Administrator</span>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* ── FORGOT PASSWORD VIEW ── */}
          {view === 'forgot' && (
            <div>
              <button
                onClick={() => { setView('login'); setFpError(''); }}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 mb-6 transition-colors cursor-pointer"
              >
                <ArrowRight className="w-3.5 h-3.5 rotate-180" /> Back to Sign In
              </button>
              <div className="mb-8">
                <p className="text-base font-bold text-orange-500 mb-1">Forgot Password?</p>
                <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white leading-tight">
                  Request a Password Reset
                </h1>
                <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">
                  Enter your username or email. A reset request will be sent to your administrator.
                </p>
              </div>

              {fpError && (
                <div className="mb-5 p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0"></span>
                  {fpError}
                </div>
              )}

              <form onSubmit={handleForgotSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Username or Email
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      id="forgot-identifier"
                      value={fpIdentifier}
                      onChange={(e) => { setFpIdentifier(e.target.value); setFpError(''); }}
                      placeholder="Enter your username or email"
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all placeholder:text-slate-400"
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={fpLoading}
                  id="forgot-submit"
                  className="w-full py-4 px-6 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] text-white font-bold rounded-2xl shadow-lg shadow-orange-500/30 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  {fpLoading
                    ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span> Sending Request...</>
                    : <><Send className="w-4 h-4" /> Send Reset Request</>}
                </button>
              </form>
            </div>
          )}

          {/* ── REQUEST SENT VIEW ── */}
          {view === 'sent' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
              <p className="text-base font-bold text-orange-500 mb-1">Request Sent!</p>
              <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white leading-tight mb-3">
                Check with your Admin
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                Your password reset request has been sent to your{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">Administrator</span>.
                They will update your credentials and notify you.
              </p>
              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl text-amber-700 dark:text-amber-400 text-xs font-medium">
                Please contact your admin directly if this is urgent.
              </div>
              <button
                onClick={() => { setView('login'); setFpIdentifier(''); setFpError(''); }}
                className="mt-8 w-full py-4 px-6 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-bold rounded-2xl shadow-lg shadow-orange-500/30 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowRight className="w-4 h-4 rotate-180" /> Back to Sign In
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
