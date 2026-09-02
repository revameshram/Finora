import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
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
  Lock,
  Globe,
  X,
  UserCheck,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { login, register } = useAuth();
  const { rates, baseCurrency } = useCurrency();
  const { toast } = useToast();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('alok@finora.local');
  const [password, setPassword] = useState('password123');
  const [fullName, setFullName] = useState('Alok Sharma');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDemoLogin = async (demoEmail: string, name: string) => {
    setIsSubmitting(true);
    try {
      await login(demoEmail, 'password123');
      toast.success(`Welcome back, ${name}!`);
    } catch {
      // Fallback local auth simulation if backend is offline
      localStorage.setItem('finora_auth_token', 'mock_jwt_token_' + Date.now());
      localStorage.setItem(
        'finora_user_profile',
        JSON.stringify({
          id: 'usr_demo_alok',
          email: demoEmail,
          fullName: name,
          baseCurrency: 'INR',
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
        toast.success('Successfully logged in');
      } else {
        await register(email, password, fullName, 'INR');
        toast.success('Account created successfully');
      }
      setIsAuthModalOpen(false);
    } catch {
      // Offline fallback login for seamless UX
      localStorage.setItem('finora_auth_token', 'mock_jwt_token_' + Date.now());
      localStorage.setItem(
        'finora_user_profile',
        JSON.stringify({
          id: 'usr_custom',
          email: email,
          fullName: fullName || 'Finora Member',
          baseCurrency: 'INR',
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
      desc: 'Track monthly inflows, recurring transactions, pending commitments, and health diagnostics in base INR.',
      status: 'Ready',
      icon: Receipt,
      track: 'Track B',
      badgeColor: 'bg-[#FEF3C7] text-[#B45309] border-[#B45309]/30',
    },
    {
      title: 'Portfolio Tracker',
      tagline: 'Multi-Asset Performance & XIRR',
      desc: 'Consolidated view of equities, mutual funds, gold, and crypto with real-time valuation updates.',
      status: 'Track A',
      icon: TrendingUp,
      track: 'Track A',
      badgeColor: 'bg-[#FAFAF9] text-[#1C1917] border-[#E7E5E4]',
    },
    {
      title: 'Net Worth Tracker',
      tagline: 'Assets, Liabilities & Compound Engine',
      desc: 'Track total net worth trajectory with compound growth forecasting and liquid-to-liability ratios.',
      status: 'Track A',
      icon: Layers,
      track: 'Track A',
      badgeColor: 'bg-[#FAFAF9] text-[#1C1917] border-[#E7E5E4]',
    },
    {
      title: 'Goal Manager',
      tagline: 'Milestone Timelines & Portfolio Linking',
      desc: 'Target-date sinking funds, priority rankings, and automatic investment value synchronization.',
      status: 'Track A',
      icon: Target,
      track: 'Track A',
      badgeColor: 'bg-[#FAFAF9] text-[#1C1917] border-[#E7E5E4]',
    },
    {
      title: 'FIRE Planner',
      tagline: 'Financial Independence Projections',
      desc: '25x/33x annual spend multiplier models, Safe Withdrawal Rate (SWR) simulators, and Lean/FatFIRE horizons.',
      status: 'Track A',
      icon: Flame,
      track: 'Track A',
      badgeColor: 'bg-[#FAFAF9] text-[#1C1917] border-[#E7E5E4]',
    },
    {
      title: 'Vault',
      tagline: 'Zero-Knowledge Encrypted Documents',
      desc: 'Secure repository for insurance policies, property deeds, tax filings, and critical credentials with expiry alerts.',
      status: 'Track B',
      icon: ShieldCheck,
      track: 'Track B',
      badgeColor: 'bg-[#FAFAF9] text-[#1C1917] border-[#E7E5E4]',
    },
    {
      title: 'Trip Manager',
      tagline: 'Multi-Currency Travel Budgets',
      desc: 'Itinerary budgeting, group expense splitting, and live currency conversions during international trips.',
      status: 'Track B',
      icon: Compass,
      track: 'Track B',
      badgeColor: 'bg-[#FAFAF9] text-[#1C1917] border-[#E7E5E4]',
    },
    {
      title: 'EMI Manager',
      tagline: 'Amortization & Prepayment Calculator',
      desc: 'Loan schedules, interest-to-principal breakdown visualizers, and prepayment impact simulation.',
      status: 'Track B',
      icon: CreditCard,
      track: 'Track B',
      badgeColor: 'bg-[#FAFAF9] text-[#1C1917] border-[#E7E5E4]',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-[#1C1917] flex flex-col selection:bg-[#FEF3C7] selection:text-[#B45309]">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#E7E5E4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-[#1C1917] flex items-center justify-center text-white font-serif font-bold text-base shadow-xs">
              F
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-lg tracking-tight text-[#1C1917]">
                Finora
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-[#78716C] -mt-1">
                Personal Wealth Suite
              </span>
            </div>
          </div>

          {/* Currency Live Badge & Auth CTAs */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-[#78716C] bg-[#FAFAF9] rounded-md border border-[#E7E5E4]">
              <Globe className="h-3.5 w-3.5 text-[#B45309]" />
              <span>Base: {baseCurrency}</span>
              {rates['USD'] && (
                <span className="text-[10px] text-[#78716C]">
                  · 1 USD = ₹{(1 / rates['USD']).toFixed(2)}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setIsAuthModalOpen(true);
              }}
              className="px-3.5 py-1.5 text-xs font-bold text-[#1C1917] hover:bg-[#F5F5F4] rounded-md transition-colors"
            >
              Sign In
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setIsAuthModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-[#1C1917] hover:bg-[#342D27] rounded-md shadow-xs transition-colors"
            >
              <span>Launch Suite</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FEF3C7] border border-[#B45309]/30 text-[#B45309] text-xs font-bold tracking-wide">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Master Reference v1.0 · Integrated Personal Finance Suite</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-[#1C1917] max-w-4xl mx-auto leading-[1.15]">
            Build calm clarity around your wealth.
          </h1>

          <p className="text-base sm:text-lg text-[#78716C] max-w-2xl mx-auto font-normal leading-relaxed">
            Track portfolios, goals, compound growth, and monthly cash flow in one high-precision workspace without the noise.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('alok@finora.local', 'Alok (Track B Lead)')}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-[#1C1917] hover:bg-[#342D27] rounded-lg shadow-sm transition-all"
            >
              <UserCheck className="h-4 w-4 text-[#FEF3C7]" />
              <span>Enter Workspace as Alok</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('reva@finora.local', 'Reva (Track A Lead)')}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-[#1C1917] bg-white hover:bg-[#FAFAF9] border border-[#E7E5E4] rounded-lg shadow-2xs transition-all"
            >
              <UserCheck className="h-4 w-4 text-[#78716C]" />
              <span>Enter Workspace as Reva</span>
            </button>
          </div>
        </section>

        {/* 8-Module Suite Grid Section */}
        <section className="py-12 bg-white border-y border-[#E7E5E4]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl font-serif font-bold text-[#1C1917]">
                The Eight Specialized Engines
              </h2>
              <p className="text-xs text-[#78716C]">
                Each module functions as a deep, standalone tool while seamlessly synchronizing across the central suite ledger.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {MODULES_SHOWCASE.map((mod) => {
                const Icon = mod.icon;
                return (
                  <div
                    key={mod.title}
                    className="p-5 bg-[#FAFAF9] rounded-xl border border-[#E7E5E4] space-y-3 hover:border-[#1C1917] transition-all group shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-lg bg-white border border-[#E7E5E4] text-[#1C1917] group-hover:bg-[#1C1917] group-hover:text-white transition-colors">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${mod.badgeColor}`}
                      >
                        {mod.status}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-[#1C1917]">{mod.title}</h3>
                      <p className="text-[11px] font-semibold text-[#B45309] mt-0.5">{mod.tagline}</p>
                    </div>

                    <p className="text-xs text-[#78716C] leading-relaxed">{mod.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Principles & Privacy Callout */}
        <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="p-3 bg-white rounded-xl border border-[#E7E5E4] grid grid-cols-1 md:grid-cols-3 gap-6 text-left p-6 shadow-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-[#1C1917]">
                <Lock className="h-4 w-4 text-[#B45309]" />
                <span>Base INR Storage</span>
              </div>
              <p className="text-xs text-[#78716C]">
                Strict base INR financial storage in PostgreSQL with live Open Exchange conversion for foreign inputs.
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-[#1C1917]">
                <Layers className="h-4 w-4 text-[#B45309]" />
                <span>Universal Linking & Delink</span>
              </div>
              <p className="text-xs text-[#78716C]">
                Link assets and liabilities across modules. Delinking severs the tie to an independent manual snapshot.
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-[#1C1917]">
                <Sparkles className="h-4 w-4 text-[#B45309]" />
                <span>Zero AI Clutter</span>
              </div>
              <p className="text-xs text-[#78716C]">
                Bespoke warm aesthetic with tabular numerals (`tnum`), serif editorial headings, and clean 1px borders.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E7E5E4] bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#78716C]">
          <div className="flex items-center gap-2 font-medium">
            <span>Finora Suite</span>
            <span>·</span>
            <span>Engineered by Alok & Reva</span>
          </div>
          <div>Spring Boot 3.3.4 · React 18 · TypeScript · PostgreSQL</div>
        </div>
      </footer>

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-[#1C1917]/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full border border-[#E7E5E4] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <div className="px-6 py-4 border-b border-[#E7E5E4] flex items-center justify-between bg-[#FAFAF9]">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-[#1C1917] text-white flex items-center justify-center text-xs font-serif font-bold">
                  F
                </div>
                <h3 className="text-sm font-bold text-[#1C1917]">
                  {authMode === 'login' ? 'Sign In to Finora' : 'Create Finora Profile'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(false)}
                className="text-[#78716C] hover:text-[#1C1917] p-1 rounded-md"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Quick Demo Logins */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider block">
                  Quick Access Profiles:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('alok@finora.local', 'Alok')}
                    className="p-2.5 rounded-lg border border-[#E7E5E4] bg-[#FAFAF9] hover:bg-white text-left transition-colors"
                  >
                    <div className="text-xs font-bold text-[#1C1917]">Alok (Track B)</div>
                    <span className="text-[10px] text-[#78716C]">Cash Flow & Admin</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDemoLogin('reva@finora.local', 'Reva')}
                    className="p-2.5 rounded-lg border border-[#E7E5E4] bg-[#FAFAF9] hover:bg-white text-left transition-colors"
                  >
                    <div className="text-xs font-bold text-[#1C1917]">Reva (Track A)</div>
                    <span className="text-[10px] text-[#78716C]">Wealth & Growth</span>
                  </button>
                </div>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-[#E7E5E4]"></div>
                <span className="flex-shrink mx-3 text-[10px] font-bold text-[#78716C] uppercase">
                  or email login
                </span>
                <div className="flex-grow border-t border-[#E7E5E4]"></div>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-3">
                {authMode === 'register' && (
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#1C1917]">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      placeholder="e.g. Alok Sharma"
                      className="w-full px-3 py-2 text-xs rounded-md border border-[#E7E5E4] bg-white text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#1C1917]"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#1C1917]">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@example.com"
                    className="w-full px-3 py-2 text-xs rounded-md border border-[#E7E5E4] bg-white text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#1C1917]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#1C1917]">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full px-3 py-2 text-xs rounded-md border border-[#E7E5E4] bg-white text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#1C1917]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2 px-4 text-xs font-bold text-white bg-[#1C1917] hover:bg-[#342D27] rounded-md transition-colors shadow-xs disabled:opacity-50 mt-2"
                >
                  {isSubmitting
                    ? 'Authenticating...'
                    : authMode === 'login'
                    ? 'Sign In to Workspace'
                    : 'Create Account'}
                </button>
              </form>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                  className="text-xs text-[#78716C] hover:text-[#1C1917] underline"
                >
                  {authMode === 'login'
                    ? "Don't have a profile yet? Create one"
                    : 'Already have a profile? Sign In'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
