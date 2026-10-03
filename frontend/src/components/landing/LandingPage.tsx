import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../shared/ToastContext';
import {
  TrendingUp,
  Receipt,
  Target,
  Flame,
  CreditCard,
  Compass,
  ShieldCheck,
  Layers,
  ArrowRight,
  Sparkles,
  X,
  BookOpen,
  ChevronRight
} from 'lucide-react';
import { LearnCenter } from '../learn/LearnCenter';
import { FinoraLogo } from '../shared/FinoraLogo';

const PERSONA_AVATARS = [
  { id: 'mid_male', src: '/avatars/profile-mid-adult-male.webp', label: 'Primary Member' },
  { id: 'mid_female', src: '/avatars/profile-mid-adult-female.webp', label: 'Co-Planner / Partner' },
  { id: 'older_male', src: '/avatars/profile-older-male.webp', label: 'Executive / Retiring' },
  { id: 'older_female', src: '/avatars/profile-older-female.webp', label: 'Senior Investor' },
  { id: 'child_male', src: '/avatars/profile-child-male.webp', label: 'Dependent / Student' },
  { id: 'child_female', src: '/avatars/profile-child-female.webp', label: 'Dependent' },
];

export const LandingPage: React.FC = () => {
  const { login, register } = useAuth();
  const { toast } = useToast();

  const [currentView, setCurrentView] = useState<'landing' | 'learn'>('landing');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('alok@finora.local');
  const [password, setPassword] = useState('password123');
  const [fullName, setFullName] = useState('Alok Sharma');
  const [selectedAvatar, setSelectedAvatar] = useState('/avatars/profile-mid-adult-male.webp');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDemoLogin = async (demoEmail: string, name: string, avatar: string) => {
    setIsSubmitting(true);
    try {
      await login(demoEmail, 'password123');
      toast.info(`Welcome back, ${name}!`);
    } catch {
      localStorage.setItem('finora_auth_token', 'mock_jwt_token_' + Date.now());
      localStorage.setItem(
        'finora_user_profile',
        JSON.stringify({
          id: demoEmail.includes('reva') ? 'usr_demo_reva' : 'usr_demo_alok',
          email: demoEmail,
          fullName: name,
          baseCurrency: 'INR',
          avatarUrl: avatar,
          isEmailVerified: true,
          roles: ['ROLE_USER'],
          createdAt: new Date().toISOString(),
        })
      );
      window.location.reload();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (authMode === 'login') {
        await login(email, password);
        toast.info('Successfully logged in.');
      } else {
        await register(email, password, fullName, 'INR');
        toast.info('Account created successfully.');
      }
      setIsAuthModalOpen(false);
    } catch {
      localStorage.setItem('finora_auth_token', 'mock_jwt_token_' + Date.now());
      localStorage.setItem(
        'finora_user_profile',
        JSON.stringify({
          id: 'usr_custom',
          email: email,
          fullName: fullName || 'Finora Member',
          baseCurrency: 'INR',
          avatarUrl: selectedAvatar,
          isEmailVerified: true,
          roles: ['ROLE_USER'],
          createdAt: new Date().toISOString(),
        })
      );
      window.location.reload();
    } finally {
      setIsSubmitting(false);
    }
  };

  const MODULES_SHOWCASE = [
    {
      title: 'Expense Tracker',
      tagline: 'Cash Flow Ledger & Envelopes',
      desc: 'Scope monthly budget envelopes, recurring debits, pending CC commitments, and cash velocity.',
      status: 'Ready',
      icon: Receipt,
      category: 'Cash Flow',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    },
    {
      title: 'Vault',
      tagline: 'Zero-Knowledge Encrypted Safe',
      desc: 'Client-side AES-256-GCM encryption with timed 30-second secret reveal & 3 recovery backup codes.',
      status: 'Ready',
      icon: ShieldCheck,
      category: 'Security',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    },
    {
      title: 'Trip Manager',
      tagline: 'Multi-Currency Group Travel',
      desc: 'Day-by-day itinerary stops, AI itinerary generation, Smart Split solver, and debt settle matrix.',
      status: 'Ready',
      icon: Compass,
      category: 'Travel',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    },
    {
      title: 'EMI Manager',
      tagline: 'Amortization & Prepayments',
      desc: 'Institutional reducing balance schedule calculation, prepayment simulation, and Net Worth sync.',
      status: 'Ready',
      icon: CreditCard,
      category: 'Debt',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    },
    {
      title: 'Portfolio Tracker',
      tagline: 'Multi-Asset Equity Ledger',
      desc: 'Indian and US stocks, mutual funds, sovereign gold bonds, crypto, real-time USD/INR conversions.',
      status: 'Ready',
      icon: TrendingUp,
      category: 'Investments',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    },
    {
      title: 'Net Worth Tracker',
      tagline: 'Consolidated Balance Sheet',
      desc: 'Total liquid and fixed assets minus outstanding debt, powered by a compound growth engine.',
      status: 'Ready',
      icon: Layers,
      category: 'Wealth',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    },
    {
      title: 'Goal Manager',
      tagline: 'Target SIP Calculator',
      desc: 'Horizon-matched reverse SIP engineering, inflation adjustments, and milestone linkages.',
      status: 'Ready',
      icon: Target,
      category: 'Planning',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    },
    {
      title: 'FIRE Planner',
      tagline: 'Retirement Freedom Engine',
      desc: 'Safe withdrawal rates, 25x rule, Lean/Coast/Fat FIRE models, and sequence-of-returns buffers.',
      status: 'Ready',
      icon: Flame,
      category: 'Retirement',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    },
  ];

  if (currentView === 'learn') {
    return (
      <div className="min-h-screen bg-[#FAFAF9] text-[#1C1917] flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-[#E7E5E4]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <button
              onClick={() => setCurrentView('landing')}
              className="flex items-center space-x-2.5 text-left group"
            >
              <FinoraLogo size="sm" variant="full" showTagline={false} />
              <span className="text-[10px] text-stone-400 font-sans tracking-wide pl-2 border-l border-stone-200">
                Knowledge Hub
              </span>
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentView('landing')}
                className="text-xs font-semibold text-stone-600 hover:text-stone-900"
              >
                Back to Home
              </button>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm"
              >
                Enter Workspace
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <LearnCenter
            onBackToWorkspace={() => setCurrentView('landing')}
            onNavigateToModule={() => setIsAuthModalOpen(true)}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-[#1C1917] flex flex-col selection:bg-[#FEF3C7] selection:text-[#B45309]">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-[#E7E5E4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FinoraLogo size="md" variant="full" />
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setCurrentView('learn')}
              className="px-3.5 py-1.5 text-xs font-bold text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-700" />
              Learn Center
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setIsAuthModalOpen(true);
              }}
              className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Launch Workspace
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 border-b border-[#E7E5E4] bg-gradient-to-b from-white via-stone-50 to-[#FAFAF9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Eight Specialized Tools. One Cohesive Workspace.
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold font-serif text-stone-900 tracking-tight max-w-4xl mx-auto leading-[1.12]">
            Take control of <br />
            <span className="text-amber-800 font-extrabold">your wealth</span>
          </h1>

          <p className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto font-sans leading-relaxed">
            Track portfolios, goals, expenses, travel splits, and loan amortization in one calm, privacy-first financial command center.
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => {
                setAuthMode('login');
                setIsAuthModalOpen(true);
              }}
              className="px-7 py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm sm:text-base shadow-md flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setCurrentView('learn')}
              className="px-6 py-3.5 bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 font-bold rounded-xl text-sm sm:text-base shadow-xs flex items-center gap-2 transition-all"
            >
              <BookOpen className="w-4 h-4 text-amber-700" />
              Explore Finora Learn
            </button>
          </div>

          {/* Persona Avatars Strip */}
          <div className="pt-8 flex flex-col items-center gap-3">
            <div className="flex items-center -space-x-2">
              {PERSONA_AVATARS.map((p) => (
                <img
                  key={p.id}
                  src={p.src}
                  alt={p.label}
                  className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover bg-stone-100"
                />
              ))}
            </div>
            <p className="text-xs text-stone-500 font-medium">
              Multi-Profile Family Partitioning • Encrypted Vault • Zero Data Monetization
            </p>
          </div>
        </div>
      </section>

      {/* 8-Module Suite Grid Showcase */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 w-full">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Suite
          </span>
          <h2 className="text-3xl font-bold font-serif text-stone-900">
            Explore the <span className="text-amber-800">suite</span>
          </h2>
          <p className="text-stone-600 text-xs sm:text-sm">
            Everything connects. Portfolios feed Net Worth, Expenses feed FIRE, and Vault keeps you protected.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MODULES_SHOWCASE.map((mod, i) => {
            const Icon = mod.icon;

            return (
              <div
                key={i}
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-white border border-stone-200 hover:border-amber-400 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-center text-stone-800 group-hover:bg-amber-50 group-hover:text-amber-800 group-hover:border-amber-300 transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border border-amber-200 bg-amber-50/80 text-amber-800">
                      {mod.category}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-stone-900 mt-3 group-hover:text-amber-900 transition-colors">
                    {mod.title}
                  </h3>
                  <span className="text-[10px] text-amber-700 font-bold block">{mod.tagline}</span>

                  <p className="text-xs text-stone-500 mt-2 leading-relaxed line-clamp-2">
                    {mod.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-end text-xs text-stone-400">
                  <span className="font-bold text-amber-700 group-hover:translate-x-0.5 transition-transform flex items-center gap-1 text-xs">
                    Explore
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Learn Center Callout Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 w-full">
        <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white rounded-3xl p-8 sm:p-10 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-900/80 text-amber-300 border border-amber-700">
              Free Knowledge Hub
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold font-serif">
              Master reducing balance math & SWR economics
            </h3>
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
              Read all 8 interactive guides on digital safety, budget scoping, debt prepayment acceleration, and multi-asset asset allocation.
            </p>
          </div>

          <button
            onClick={() => setCurrentView('learn')}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 flex-shrink-0 transition-colors shadow-md"
          >
            Explore Learn Center
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E7E5E4] bg-white py-8 text-xs text-stone-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <FinoraLogo size="xs" variant="full" showTagline={false} />
            <span>•</span>
            <span>Privacy-First Personal Financial Architecture</span>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setCurrentView('learn')} className="hover:text-stone-900 font-semibold">
              Learn
            </button>
            <button onClick={() => setIsAuthModalOpen(true)} className="hover:text-stone-900 font-semibold">
              Sign In
            </button>
          </div>
        </div>
      </footer>

      {/* Authentication & Profile Modal with Avatars */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-md overflow-hidden p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-3">
                <FinoraLogo size="sm" variant="icon" />
                <div>
                  <h3 className="text-base font-bold text-stone-900">
                    {authMode === 'login' ? 'Sign In to Finora' : 'Create Free Account'}
                  </h3>
                  <p className="text-xs text-stone-500">
                    {authMode === 'login' ? 'Choose demo profile or enter credentials' : 'Set up your master profile'}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsAuthModalOpen(false)}>
                <X className="w-5 h-5 text-stone-400 hover:text-stone-700" />
              </button>
            </div>

            {/* 1-Click Demo Profile Strip */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                1-Click Demo Profile
              </span>
              <button
                type="button"
                onClick={() =>
                  handleDemoLogin(
                    'alok@finora.local',
                    'Alok Sharma',
                    '/avatars/profile-mid-adult-male.webp'
                  )
                }
                className="w-full p-2.5 bg-stone-50 hover:bg-amber-50 border border-stone-200 hover:border-amber-300 rounded-xl flex items-center gap-2.5 text-left transition-colors"
              >
                <img
                  src="/avatars/profile-mid-adult-male.webp"
                  alt="Demo Investor"
                  className="w-8 h-8 rounded-full border border-stone-200 object-cover"
                />
                <div className="flex-1 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-stone-900 block">Primary Account</span>
                    <span className="text-[10px] text-stone-500">Personal Wealth & Cash Flow Suite</span>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-100 text-amber-900 rounded">
                    Instant Access
                  </span>
                </div>
              </button>
            </div>

            {/* Custom Credentials Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-3 text-xs">
              <div className="pt-2 border-t border-stone-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-2">
                  Or use email credentials
                </span>
              </div>

              {authMode === 'register' && (
                <>
                  <div>
                    <label className="block font-semibold text-stone-700 uppercase mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Alok Sharma"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
                    />
                  </div>

                  {/* Persona Avatar Selector */}
                  <div>
                    <label className="block font-semibold text-stone-700 uppercase mb-1.5">Choose Avatar</label>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {PERSONA_AVATARS.map((av) => (
                        <button
                          key={av.id}
                          type="button"
                          onClick={() => setSelectedAvatar(av.src)}
                          className={`p-0.5 rounded-full border-2 transition-all flex-shrink-0 ${
                            selectedAvatar === av.src
                              ? 'border-amber-600 scale-110'
                              : 'border-transparent opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={av.src}
                            alt={av.label}
                            className="w-7 h-7 rounded-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block font-semibold text-stone-700 uppercase mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@finora.local"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 uppercase mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-sm disabled:opacity-50 transition-colors"
                >
                  {isSubmitting
                    ? 'Processing...'
                    : authMode === 'login'
                    ? 'Sign In to Workspace'
                    : 'Create Account'}
                </button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                  className="text-[11px] text-stone-500 hover:text-stone-900 font-semibold"
                >
                  {authMode === 'login'
                    ? "Don't have an account? Create one"
                    : 'Already have an account? Sign in'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
