import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { ToastProvider } from './components/shared/ToastContext';
import { CurrencySelector, OnboardingDrawer } from './components/shared';
import { LandingPage } from './components/landing/LandingPage';
import { WorkspaceHub } from './components/workspace/WorkspaceHub';
import { ExpenseTracker } from './components/expense/ExpenseTracker';
import { Vault } from './components/vault/Vault';
import { TripManager } from './components/trip/TripManager';
import { EmiManager } from './components/emi/EmiManager';
import { NetWorthTracker } from './components/networth/NetWorthTracker';
import { PortfolioTracker } from './components/portfolio/PortfolioTracker';
import { GoalManager } from './components/goal/GoalManager';
import { FirePlanner } from './components/fire/FirePlanner';
import { LearnCenter } from './components/learn/LearnCenter';
import { FinoraLogo } from './components/shared/FinoraLogo';
import {
  HelpCircle,
  LogOut,
  ChevronLeft,
  BookOpen,
  Compass,
} from 'lucide-react';

const SUITE_ONBOARDING_STEPS = [
  {
    stepNumber: 1,
    title: 'Centralized Architecture',
    description: 'Finora organizes your financial life into 8 specialized tools across wealth growth, cash flow, debt management, and encrypted storage.',
    tip: 'All balances store in base INR and convert smoothly to display currencies.',
  },
  {
    stepNumber: 2,
    title: 'Cross-Tool Linking',
    description: 'Portfolios feed Net Worth and Goals. Expense Tracker feeds FIRE and savings metrics. Delinking preserves an independent manual snapshot.',
    tip: 'Toggle Include/Exclude on any item to drop it from rollups without deleting.',
  },
  {
    stepNumber: 3,
    title: 'Cash Flow, Debt & Encrypted Vault',
    description: 'Scope budget months, plan group trips, calculate loan amortization schedules, and store encrypted credentials in your private vault.',
  },
];

const SUITE_TIPS = [
  { id: 'tip_1', label: 'Use tabular numerals across financial figures', completed: true },
  { id: 'tip_2', label: 'Review Monthly Inflow vs Committed Outflow regularly', completed: false },
  { id: 'tip_3', label: 'Maintain a 6-month liquid emergency fund cushion', completed: false },
];

type ViewMode =
  | 'workspace'
  | 'portfolio-tracker'
  | 'expense-tracker'
  | 'vault'
  | 'trip-manager'
  | 'emi-manager'
  | 'net-worth-tracker'
  | 'goal-manager'
  | 'fire-planner'
  | 'learn';

const VALID_VIEWS: Record<string, ViewMode> = {
  workspace: 'workspace',
  'portfolio-tracker': 'portfolio-tracker',
  portfolio: 'portfolio-tracker',
  'expense-tracker': 'expense-tracker',
  expense: 'expense-tracker',
  vault: 'vault',
  'trip-manager': 'trip-manager',
  trip: 'trip-manager',
  'emi-manager': 'emi-manager',
  emi: 'emi-manager',
  'net-worth-tracker': 'net-worth-tracker',
  'net-worth': 'net-worth-tracker',
  networth: 'net-worth-tracker',
  'goal-manager': 'goal-manager',
  goal: 'goal-manager',
  'fire-planner': 'fire-planner',
  fire: 'fire-planner',
  learn: 'learn',
};

const AuthenticatedApp: React.FC = () => {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState<ViewMode>('workspace');
  const [navParams, setNavParams] = useState<Record<string, string>>({});
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  const handleNavigate = (mod: string) => {
    if (!mod) {
      setCurrentView('workspace');
      setNavParams({});
      return;
    }
    const [baseMod, queryStr] = mod.includes('?') ? mod.split('?') : [mod, ''];
    const clean = baseMod.toLowerCase().replace(/_/g, '-');
    const matched = VALID_VIEWS[clean] || VALID_VIEWS[baseMod.toLowerCase()] || 'workspace';
    
    if (queryStr) {
      const searchParams = new URLSearchParams(queryStr);
      const paramsObj: Record<string, string> = {};
      searchParams.forEach((val, key) => {
        paramsObj[key] = val;
      });
      setNavParams(paramsObj);
    } else {
      setNavParams({});
    }

    setCurrentView(matched);
  };

  const avatarSrc = user?.avatarUrl || (user?.email?.includes('reva') ? '/avatars/profile-mid-adult-female.webp' : '/avatars/profile-mid-adult-male.webp');

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-[#1C1917] flex flex-col selection:bg-[#FEF3C7] selection:text-[#B45309]">
      {/* Persistent Top Bar (every screen per §2.1) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-[#E7E5E4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand + View Breadcrumb */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setCurrentView('workspace')}
              className="flex items-center space-x-2 text-left group hover:opacity-90 transition-opacity"
            >
              <FinoraLogo size="sm" variant="full" />
            </button>

            {currentView !== 'workspace' && (
              <div className="flex items-center gap-1.5 sm:gap-2 pl-2 sm:pl-3 border-l border-[#E7E5E4]">
                <button
                  type="button"
                  onClick={() => setCurrentView('workspace')}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#78716C] hover:text-[#1C1917] bg-[#FAFAF9] px-2 sm:px-2.5 py-1 rounded-md border border-[#E7E5E4] transition-colors"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Centralized Workspace</span>
                  <span className="sm:hidden text-[11px]">Home</span>
                </button>
              </div>
            )}
          </div>

          {/* Right Utilities: Currency Selector, Learn Center, Onboarding, Profile & Logout */}
          <div className="flex items-center space-x-1.5 sm:space-x-3">
            <CurrencySelector />

            <button
              type="button"
              onClick={() => setCurrentView('learn')}
              className="p-1.5 sm:p-2 text-[#78716C] hover:text-[#1C1917] hover:bg-[#F5F5F4] rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
              title="Learn Center"
            >
              <BookOpen className="h-4 w-4 text-[#B88728]" />
              <span className="hidden sm:inline">Learn</span>
            </button>

            <button
              type="button"
              onClick={() => setIsOnboardingOpen(true)}
              className="p-1.5 sm:p-2 text-[#78716C] hover:text-[#1C1917] hover:bg-[#F5F5F4] rounded-lg transition-colors"
              title="Suite Guide & Onboarding"
            >
              <HelpCircle className="h-4 sm:h-5 w-4 sm:w-5" />
            </button>

            <div className="h-4 w-px bg-[#E7E5E4] mx-0.5 sm:mx-1" />

            <div className="flex items-center space-x-1.5 sm:space-x-3">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <img
                  src={avatarSrc}
                  alt={user?.fullName || 'User Profile'}
                  className="h-7 sm:h-8 w-7 sm:w-8 rounded-full border border-[#D2DDD4] object-cover"
                />
                <div className="hidden md:flex flex-col">
                  <span className="text-xs font-bold text-[#1C1917] leading-tight">
                    {user?.fullName || 'Finora Member'}
                  </span>
                  <span className="text-[10px] text-[#78716C] leading-tight truncate max-w-[100px]">
                    {user?.email || 'member@finora.local'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={logout}
                className="p-1.5 text-[#78716C] hover:text-[#BE123C] hover:bg-[#FFE4E6] rounded-md transition-colors"
                title="Sign Out"
              >
                <LogOut className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 w-full">
        {currentView === 'workspace' && (
          <WorkspaceHub onNavigateToModule={handleNavigate} />
        )}
        {currentView === 'portfolio-tracker' && <PortfolioTracker />}
        {currentView === 'expense-tracker' && <ExpenseTracker />}
        {currentView === 'vault' && <Vault />}
        {currentView === 'trip-manager' && <TripManager />}
        {currentView === 'emi-manager' && <EmiManager />}
        {currentView === 'net-worth-tracker' && (
          <NetWorthTracker onNavigateToModule={handleNavigate} />
        )}
        {currentView === 'goal-manager' && <GoalManager initialParams={navParams} />}
        {currentView === 'fire-planner' && (
          <FirePlanner onNavigateToModule={handleNavigate} initialParams={navParams} />
        )}
        {currentView === 'learn' && (
          <LearnCenter
            onBackToWorkspace={() => setCurrentView('workspace')}
            onNavigateToModule={handleNavigate}
          />
        )}
      </main>

      {/* Persistent Footer */}
      <footer className="border-t border-[#E7E5E4] bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#78716C]">
          <div className="flex items-center gap-2 font-medium">
            <span>Finora Centralized Suite</span>
            <span>·</span>
            <span>Base Currency: INR</span>
          </div>
          <div>Multi-Module Architecture · Master Reference 1.0</div>
        </div>
      </footer>

      {/* Onboarding Drawer */}
      <OnboardingDrawer
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        moduleName="Finora Suite"
        subtitle="Personal Wealth & Cash Flow Architecture"
        icon={Compass}
        steps={SUITE_ONBOARDING_STEPS}
        tipsChecklist={SUITE_TIPS}
        storageKey="finora_suite_onboarding"
      />
    </div>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center text-xs text-[#78716C]">
        Initializing Finora Suite...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return <AuthenticatedApp />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </CurrencyProvider>
    </AuthProvider>
  );
};

export default App;
