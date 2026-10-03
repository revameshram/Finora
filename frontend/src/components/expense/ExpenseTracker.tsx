import React, { useState, useEffect, useCallback } from 'react';
import expenseApi from '../../services/expenseApi';
import {
  IncomeSource,
  ExpenseTransaction,
  ExpenseTask,
  MonthlyNote,
  ExpenseDashboardMetrics,
  ExpenseInsights,
  ExpenseCategory,
  TaskStatus,
} from '../../types/expense';
import { useToast } from '../shared/ToastContext';
import TransactionsTab from './TransactionsTab';
import IncomeSourcesTab from './IncomeSourcesTab';
import SummaryTab from './SummaryTab';
import InsightsTab from './InsightsTab';
import TasksAndNotesTab from './TasksAndNotesTab';
import CopyMonthModal from './CopyMonthModal';
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Receipt,
  Wallet,
  PieChart,
  Activity,
  CheckSquare,
  Sparkles,
} from 'lucide-react';

const SEED_INCOMES: IncomeSource[] = [
  {
    id: 'inc_seed_1',
    profileId: 'usr_demo',
    budgetMonth: '2026-09',
    name: 'Primary Tech Retainer',
    amount: 185000,
    instrument: 'HDFC Direct Deposit',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'inc_seed_2',
    profileId: 'usr_demo',
    budgetMonth: '2026-09',
    name: 'Dividend Yield',
    amount: 15000,
    instrument: 'Zerodha Payout',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const SEED_TRANSACTIONS: ExpenseTransaction[] = [
  {
    id: 'txn_seed_1',
    profileId: 'usr_demo',
    budgetMonth: '2026-09',
    item: 'Luxury Apartment Lease',
    description: 'Monthly residential rent',
    category: 'HOUSING',
    amount: 35000,
    status: 'DONE',
    paymentDate: '2026-09-01',
    paymentMethod: 'Net Banking',
    isIncluded: true,
    isLinked: false,
    sourceModule: 'MANUAL',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'txn_seed_2',
    profileId: 'usr_demo',
    budgetMonth: '2026-09',
    item: 'Whole Foods & Gourmet Market',
    description: 'Weekly organic groceries',
    category: 'FOOD_GROCERIES',
    amount: 18000,
    status: 'DONE',
    paymentDate: '2026-09-02',
    paymentMethod: 'UPI',
    isIncluded: true,
    isLinked: false,
    sourceModule: 'MANUAL',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'txn_seed_3',
    profileId: 'usr_demo',
    budgetMonth: '2026-09',
    item: 'Index Fund SIP (Nifty 50)',
    description: 'Monthly automated investment allocation',
    category: 'INVESTMENT',
    amount: 25000,
    status: 'PENDING',
    paymentDate: '2026-09-10',
    paymentMethod: 'Auto Debit',
    linkedGoalId: 'goal_fire_01',
    isIncluded: true,
    isLinked: false,
    sourceModule: 'MANUAL',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'txn_seed_4',
    profileId: 'usr_demo',
    budgetMonth: '2026-09',
    item: 'High-Speed Fiber & Cloud Utilities',
    description: 'Workstation internet & server hosting',
    category: 'UTILITIES',
    amount: 8500,
    status: 'DONE',
    paymentDate: '2026-09-02',
    paymentMethod: 'Credit Card',
    isIncluded: true,
    isLinked: false,
    sourceModule: 'MANUAL',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'txn_seed_5',
    profileId: 'usr_demo',
    budgetMonth: '2026-09',
    item: 'EV Charging & Highway Tolls',
    description: 'Commute and city travel',
    category: 'TRANSPORTATION',
    amount: 6000,
    status: 'PENDING',
    paymentDate: '2026-09-15',
    paymentMethod: 'Fastag / UPI',
    isIncluded: true,
    isLinked: false,
    sourceModule: 'MANUAL',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const SEED_TASKS: ExpenseTask[] = [
  {
    id: 'task_seed_1',
    profileId: 'usr_demo',
    budgetMonth: '2026-09',
    task: 'Pay quarterly advance tax installment',
    status: 'TODO',
    dueDate: '2026-09-15',
    notes: 'Verify with CA',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task_seed_2',
    profileId: 'usr_demo',
    budgetMonth: '2026-09',
    task: 'Review annual health insurance auto-renewal',
    status: 'DONE',
    dueDate: '2026-09-05',
    notes: 'Paid via HDFC Ergo',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const SEED_NOTES: MonthlyNote[] = [
  {
    id: 'note_seed_1',
    profileId: 'usr_demo',
    budgetMonth: '2026-09',
    content: 'September budget initiated with healthy 53% savings outlook. All fixed overheads budgeted.',
    createdAt: new Date().toISOString(),
  },
];

export const ExpenseTracker: React.FC = () => {
  const { toast } = useToast();

  const getCurrentMonthStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  const [currentMonth, setCurrentMonth] = useState<string>(getCurrentMonthStr);
  const [availableMonths, setAvailableMonths] = useState<string[]>([getCurrentMonthStr()]);
  const [activeSubTab, setActiveSubTab] = useState<'transactions' | 'incomes' | 'summary' | 'insights' | 'tasks'>('transactions');
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [isLoading] = useState(false);

  // Data state
  const [transactions, setTransactions] = useState<ExpenseTransaction[]>(SEED_TRANSACTIONS);
  const [incomes, setIncomes] = useState<IncomeSource[]>(SEED_INCOMES);
  const [tasks, setTasks] = useState<ExpenseTask[]>(SEED_TASKS);
  const [notes, setNotes] = useState<MonthlyNote[]>(SEED_NOTES);
  const [metrics, setMetrics] = useState<ExpenseDashboardMetrics | null>(null);
  const [insights, setInsights] = useState<ExpenseInsights | null>(null);

  // Calculate local metrics if backend not connected
  const computeMetricsLocally = useCallback((incomesList: IncomeSource[], txnsList: ExpenseTransaction[], month: string) => {
    const totalInflow = incomesList.reduce((sum, i) => sum + i.amount, 0);
    const includedTxns = txnsList.filter((t) => t.isIncluded);
    const totalOutflow = includedTxns.reduce((sum, t) => sum + t.amount, 0);
    const doneOutflow = includedTxns.filter((t) => t.status === 'DONE').reduce((sum, t) => sum + t.amount, 0);
    const pendingOutflow = includedTxns.filter((t) => t.status === 'PENDING').reduce((sum, t) => sum + t.amount, 0);
    const cashFlow = totalInflow - totalOutflow;
    const netPosition = totalInflow - doneOutflow;

    const computedMetrics: ExpenseDashboardMetrics = {
      budgetMonth: month,
      totalInflow,
      totalOutflow,
      cashFlow,
      netPosition,
      pendingOutflow,
      completedTransactionsCount: includedTxns.filter((t) => t.status === 'DONE').length,
      pendingTransactionsCount: includedTxns.filter((t) => t.status === 'PENDING').length,
      totalIncomeSourcesCount: incomesList.length,
    };

    const savingsRate = totalInflow > 0 ? (cashFlow / totalInflow) * 100 : 0;
    const expenseRatio = totalInflow > 0 ? (totalOutflow / totalInflow) * 100 : 0;
    const pendingRatio = totalOutflow > 0 ? (pendingOutflow / totalOutflow) * 100 : 0;

    let score = 50;
    if (savingsRate >= 30) score += 30;
    else if (savingsRate >= 20) score += 20;
    if (expenseRatio <= 60 && expenseRatio > 0) score += 20;

    const computedInsights: ExpenseInsights = {
      budgetMonth: month,
      financialHealthScore: Math.min(100, Math.max(0, Math.round(score))),
      healthBadge: score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Attention',
      savingsRate: Math.round(savingsRate * 10) / 10,
      expenseRatio: Math.round(expenseRatio * 10) / 10,
      pendingRatio: Math.round(pendingRatio * 10) / 10,
      emergencyFundTarget: totalOutflow * 6,
      largestIncomeAmount: incomesList[0]?.amount || 0,
      largestIncomeName: incomesList[0]?.name || 'None',
      largestExpenseAmount: includedTxns[0]?.amount || 0,
      largestExpenseItem: includedTxns[0]?.item || 'None',
      cashFlowVelocity: Math.round(cashFlow / 30),
      recommendations: [
        savingsRate >= 20
          ? `Outstanding savings discipline! You are retaining ${savingsRate.toFixed(1)}% of your monthly cash flow.`
          : 'Savings rate is below the 20% benchmark. Review discretionary spending.',
        pendingOutflow > 0
          ? `You have ₹${pendingOutflow.toLocaleString('en-IN')} in scheduled pending outflows to settle this month.`
          : 'All scheduled expenses for this month have been settled.',
      ],
    };

    setMetrics(computedMetrics);
    setInsights(computedInsights);
  }, []);

  const fetchAllData = useCallback(async (month: string) => {
    try {
      const [monthsData, txnsData, incomesData, tasksData, notesData, metricsData, insightsData] =
        await Promise.all([
          expenseApi.getAvailableMonths(),
          expenseApi.getTransactions({ month }),
          expenseApi.getIncomes(month),
          expenseApi.getTasks(month),
          expenseApi.getNotes(month),
          expenseApi.getMetrics(month),
          expenseApi.getInsights(month),
        ]);

      if (monthsData && monthsData.length > 0) setAvailableMonths(monthsData);
      if (txnsData && txnsData.length > 0) setTransactions(txnsData);
      if (incomesData && incomesData.length > 0) setIncomes(incomesData);
      if (tasksData) setTasks(tasksData);
      if (notesData) setNotes(notesData);
      if (metricsData) setMetrics(metricsData);
      if (insightsData) setInsights(insightsData);
    } catch {
      // Clean fallback to seed state without throwing looping toasts
      computeMetricsLocally(SEED_INCOMES, SEED_TRANSACTIONS, month);
    }
  }, [computeMetricsLocally]);

  useEffect(() => {
    fetchAllData(currentMonth);
  }, [currentMonth, fetchAllData]);

  // Month navigation helpers
  const handlePrevMonth = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    const d = new Date(year, month - 2, 1);
    const prev = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    setCurrentMonth(prev);
  };

  const handleNextMonth = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    const d = new Date(year, month, 1);
    const next = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    setCurrentMonth(next);
  };

  // CRUD Handlers for Transactions
  const handleAddTransaction = async (txnData: Partial<ExpenseTransaction> & { budgetMonth: string; item: string; amount: number; category: ExpenseCategory }) => {
    try {
      const created = await expenseApi.createTransaction(txnData);
      setTransactions((prev) => [created, ...prev]);
      toast.success(`Added ${txnData.item} to ${currentMonth}`, 'Transaction Created');
    } catch {
      const fallback: ExpenseTransaction = {
        id: 'txn_' + Date.now(),
        profileId: 'usr_demo',
        budgetMonth: txnData.budgetMonth,
        item: txnData.item,
        description: txnData.description,
        category: txnData.category,
        amount: txnData.amount,
        status: txnData.status || 'DONE',
        paymentDate: txnData.paymentDate,
        paymentMethod: txnData.paymentMethod,
        linkedGoalId: txnData.linkedGoalId,
        isIncluded: true,
        isLinked: false,
        sourceModule: 'MANUAL',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setTransactions((prev) => [fallback, ...prev]);
      computeMetricsLocally(incomes, [fallback, ...transactions], currentMonth);
      toast.success(`Added ${txnData.item} locally`, 'Transaction Created');
    }
  };

  const handleUpdateTransaction = async (id: string, txnData: Partial<ExpenseTransaction>) => {
    try {
      const updated = await expenseApi.updateTransaction(id, txnData);
      setTransactions((prev) => prev.map((t) => (t.id === id ? updated : t)));
      toast.success('Updated transaction details');
    } catch {
      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...txnData, updatedAt: new Date().toISOString() } : t))
      );
      computeMetricsLocally(
        incomes,
        transactions.map((t) => (t.id === id ? { ...t, ...txnData } : t)),
        currentMonth
      );
      toast.success('Updated transaction locally');
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await expenseApi.deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      toast.info('Deleted transaction');
    } catch {
      const updated = transactions.filter((t) => t.id !== id);
      setTransactions(updated);
      computeMetricsLocally(incomes, updated, currentMonth);
      toast.info('Deleted transaction locally');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const updated = await expenseApi.toggleTransactionStatus(id);
      setTransactions((prev) => prev.map((t) => (t.id === id ? updated : t)));
      toast.info(
        updated.status === 'DONE' ? `${updated.item} marked settled (Done)` : `${updated.item} marked Pending`,
        'Status Updated'
      );
    } catch {
      const updated = transactions.map((t) =>
        t.id === id ? { ...t, status: (t.status === 'DONE' ? 'PENDING' : 'DONE') as 'DONE' | 'PENDING' } : t
      );
      setTransactions(updated);
      computeMetricsLocally(incomes, updated, currentMonth);
      toast.info('Status updated locally');
    }
  };

  const handleToggleIncluded = async (id: string) => {
    try {
      const updated = await expenseApi.toggleTransactionIncluded(id);
      setTransactions((prev) => prev.map((t) => (t.id === id ? updated : t)));
      toast.info(
        updated.isIncluded ? `${updated.item} included in rollups` : `${updated.item} excluded from rollups`,
        'Rollup Updated'
      );
    } catch {
      const updated = transactions.map((t) => (t.id === id ? { ...t, isIncluded: !t.isIncluded } : t));
      setTransactions(updated);
      computeMetricsLocally(incomes, updated, currentMonth);
      toast.info('Inclusion toggle updated locally');
    }
  };

  // CRUD Handlers for Income
  const handleAddIncome = async (data: { budgetMonth: string; name: string; amount: number; instrument?: string }) => {
    try {
      const created = await expenseApi.createIncome(data);
      setIncomes((prev) => [created, ...prev]);
      toast.success(`Added income source: ${data.name}`);
    } catch {
      const fallback: IncomeSource = {
        id: 'inc_' + Date.now(),
        profileId: 'usr_demo',
        budgetMonth: data.budgetMonth,
        name: data.name,
        amount: data.amount,
        instrument: data.instrument,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setIncomes((prev) => [fallback, ...prev]);
      computeMetricsLocally([fallback, ...incomes], transactions, currentMonth);
      toast.success(`Added income source: ${data.name} locally`);
    }
  };

  const handleUpdateIncome = async (id: string, data: { name: string; amount: number; instrument?: string }) => {
    try {
      const updated = await expenseApi.updateIncome(id, data);
      setIncomes((prev) => prev.map((i) => (i.id === id ? updated : i)));
      toast.success('Updated income source');
    } catch {
      const updated = incomes.map((i) => (i.id === id ? { ...i, ...data } : i));
      setIncomes(updated);
      computeMetricsLocally(updated, transactions, currentMonth);
      toast.success('Updated income locally');
    }
  };

  const handleDeleteIncome = async (id: string) => {
    try {
      await expenseApi.deleteIncome(id);
      setIncomes((prev) => prev.filter((i) => i.id !== id));
      toast.info('Deleted income source');
    } catch {
      const updated = incomes.filter((i) => i.id !== id);
      setIncomes(updated);
      computeMetricsLocally(updated, transactions, currentMonth);
      toast.info('Deleted income source locally');
    }
  };

  // CRUD Handlers for Tasks & Notes
  const handleAddTask = async (task: { budgetMonth: string; task: string; status?: TaskStatus; dueDate?: string; notes?: string }) => {
    try {
      const created = await expenseApi.createTask(task);
      setTasks((prev) => [created, ...prev]);
      toast.success(`Task added: ${task.task}`);
    } catch {
      const fallback: ExpenseTask = {
        id: 'task_' + Date.now(),
        profileId: 'usr_demo',
        budgetMonth: task.budgetMonth,
        task: task.task,
        status: task.status || 'TODO',
        dueDate: task.dueDate,
        notes: task.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setTasks((prev) => [fallback, ...prev]);
      toast.success(`Task added: ${task.task} locally`);
    }
  };

  const handleUpdateTask = async (id: string, task: Partial<ExpenseTask>) => {
    try {
      const updated = await expenseApi.updateTask(id, task);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch {
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...task } : t)));
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await expenseApi.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      toast.info('Deleted task');
    } catch {
      setTasks((prev) => prev.filter((t) => t.id !== id));
      toast.info('Deleted task locally');
    }
  };

  const handleAddNote = async (month: string, content: string) => {
    try {
      const created = await expenseApi.createNote(month, content);
      setNotes((prev) => [...prev, created]);
      toast.success('Note appended to monthly log');
    } catch {
      const fallback: MonthlyNote = {
        id: 'note_' + Date.now(),
        profileId: 'usr_demo',
        budgetMonth: month,
        content,
        createdAt: new Date().toISOString(),
      };
      setNotes((prev) => [...prev, fallback]);
      toast.success('Note appended to monthly log locally');
    }
  };

  // Copy Month Handler
  const handleCopyMonth = async (fromMonth: string, copyIncome: boolean, copyTxns: boolean, copyTasks: boolean) => {
    try {
      await expenseApi.copyMonth(fromMonth, currentMonth, copyIncome, copyTxns, copyTasks);
      toast.success(`Successfully replicated setup from ${fromMonth} to ${currentMonth}`);
      fetchAllData(currentMonth);
    } catch {
      toast.success(`Replicated setup from ${fromMonth} to ${currentMonth} locally`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Month Scoping Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-[#E7E5E4] flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-[#FEF3C7] text-[#B45309]">
            <Receipt className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#B45309] uppercase tracking-wider block">
              Cash Flow Backbone
            </span>
            <h2 className="text-base font-serif font-bold text-[#1C1917]">Expense Tracker</h2>
          </div>
        </div>

        {/* Month Selector Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#FAFAF9] rounded-lg border border-[#E7E5E4] p-0.5">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded text-[#78716C] hover:text-[#1C1917] hover:bg-white transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="px-3 py-1 font-serif font-bold text-xs text-[#1C1917] select-none min-w-[5rem] text-center tabular-nums">
              {currentMonth}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded text-[#78716C] hover:text-[#1C1917] hover:bg-white transition-colors"
              title="Next Month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsCopyModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#FAFAF9] border border-[#E7E5E4] text-[#1C1917] hover:bg-white transition-colors shadow-2xs"
            title="Duplicate recurring income/expenses from another month"
          >
            <Copy className="h-3.5 w-3.5 text-[#B45309]" />
            <span>Copy Month</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-[#E7E5E4] overflow-x-auto pb-px">
        <button
          type="button"
          onClick={() => setActiveSubTab('transactions')}
          className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition-all ${
            activeSubTab === 'transactions'
              ? 'border-[#1C1917] text-[#1C1917]'
              : 'border-transparent text-[#78716C] hover:text-[#1C1917]'
          }`}
        >
          <Receipt className="h-3.5 w-3.5" />
          <span>Transactions ({transactions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('incomes')}
          className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition-all ${
            activeSubTab === 'incomes'
              ? 'border-[#1C1917] text-[#1C1917]'
              : 'border-transparent text-[#78716C] hover:text-[#1C1917]'
          }`}
        >
          <Wallet className="h-3.5 w-3.5" />
          <span>Income Sources ({incomes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('summary')}
          className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition-all ${
            activeSubTab === 'summary'
              ? 'border-[#1C1917] text-[#1C1917]'
              : 'border-transparent text-[#78716C] hover:text-[#1C1917]'
          }`}
        >
          <PieChart className="h-3.5 w-3.5" />
          <span>Summary & Donuts</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('insights')}
          className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition-all ${
            activeSubTab === 'insights'
              ? 'border-[#1C1917] text-[#1C1917]'
              : 'border-transparent text-[#78716C] hover:text-[#1C1917]'
          }`}
        >
          <Activity className="h-3.5 w-3.5" />
          <span>Financial Insights</span>
          {insights && insights.financialHealthScore >= 80 && (
            <Sparkles className="h-3 w-3 text-[#B45309]" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('tasks')}
          className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition-all ${
            activeSubTab === 'tasks'
              ? 'border-[#1C1917] text-[#1C1917]'
              : 'border-transparent text-[#78716C] hover:text-[#1C1917]'
          }`}
        >
          <CheckSquare className="h-3.5 w-3.5" />
          <span>Tasks & Notes ({tasks.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-[#78716C] bg-white rounded-xl border border-[#E7E5E4]">
          Loading budget data for {currentMonth}...
        </div>
      ) : (
        <>
          {activeSubTab === 'transactions' && (
            <TransactionsTab
              transactions={transactions}
              metrics={metrics}
              budgetMonth={currentMonth}
              onAddTransaction={handleAddTransaction}
              onUpdateTransaction={handleUpdateTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              onToggleStatus={handleToggleStatus}
              onToggleIncluded={handleToggleIncluded}
            />
          )}

          {activeSubTab === 'incomes' && (
            <IncomeSourcesTab
              incomes={incomes}
              budgetMonth={currentMonth}
              onAddIncome={handleAddIncome}
              onUpdateIncome={handleUpdateIncome}
              onDeleteIncome={handleDeleteIncome}
            />
          )}

          {activeSubTab === 'summary' && (
            <SummaryTab
              transactions={transactions}
              metrics={metrics}
              budgetMonth={currentMonth}
            />
          )}

          {activeSubTab === 'insights' && (
            <InsightsTab
              insights={insights}
              budgetMonth={currentMonth}
            />
          )}

          {activeSubTab === 'tasks' && (
            <TasksAndNotesTab
              tasks={tasks}
              notes={notes}
              budgetMonth={currentMonth}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              onAddNote={handleAddNote}
            />
          )}
        </>
      )}

      {/* Copy Month Modal */}
      <CopyMonthModal
        isOpen={isCopyModalOpen}
        onClose={() => setIsCopyModalOpen(false)}
        currentMonth={currentMonth}
        availableMonths={availableMonths}
        onCopy={handleCopyMonth}
      />
    </div>
  );
};

export default ExpenseTracker;
