export type TransactionType = 'expense' | 'income' | 'refund';
export type TransactionStatus = 'cleared' | 'pending' | 'review';
export type Currency = 'USD' | 'CAD' | 'EUR' | 'GBP' | 'BTC';

export interface Transaction {
  id: string;
  date: string;
  vendor: string;
  description: string;
  amount: number;
  currency: Currency;
  amountUSD: number;
  type: TransactionType;
  status: TransactionStatus;
  category: string;
  project: string;
  receiptUrl?: string;
  aiExtracted?: boolean;
  notes?: string;
}

export interface FinanceCategory {
  id: string;
  label: string;
  color: string;
  budget?: number;
}

export interface FinanceProject {
  id: string;
  label: string;
  color: string;
}

export const financeCategories: FinanceCategory[] = [
  { id: 'saas', label: 'SaaS & Software', color: '#3b82f6', budget: 2000 },
  { id: 'travel', label: 'Travel', color: '#f59e0b', budget: 3000 },
  { id: 'marketing', label: 'Marketing', color: '#a855f7', budget: 5000 },
  { id: 'hardware', label: 'Hardware', color: '#22c55e', budget: 1500 },
  { id: 'payroll', label: 'Payroll', color: '#ef4444', budget: 20000 },
  { id: 'hosting', label: 'Hosting & Infra', color: '#06b6d4', budget: 800 },
  { id: 'office', label: 'Office & Supplies', color: '#84cc16', budget: 600 },
  { id: 'revenue', label: 'Revenue', color: '#22c55e' },
];

export const financeProjects: FinanceProject[] = [
  { id: 'client-retainer', label: 'Client Retainer', color: '#22c55e' },
  { id: 'consulting-ops', label: 'Consulting Ops', color: '#3b82f6' },
  { id: 'marketing-q2', label: 'Marketing Q2', color: '#a855f7' },
  { id: 'infrastructure', label: 'Infrastructure', color: '#06b6d4' },
];

export const transactions: Transaction[] = [
  { id: 'tx-001', date: '2026-03-28', vendor: 'Anthropic', description: 'Claude API — March usage', amount: 247.50, currency: 'USD', amountUSD: 247.50, type: 'expense', status: 'cleared', category: 'saas', project: 'client-retainer', aiExtracted: true },
  { id: 'tx-002', date: '2026-03-25', vendor: 'Vercel', description: 'Pro plan — monthly subscription', amount: 20.00, currency: 'USD', amountUSD: 20.00, type: 'expense', status: 'cleared', category: 'hosting', project: 'infrastructure', aiExtracted: false },
  { id: 'tx-003', date: '2026-03-22', vendor: 'Google Workspace', description: 'Business Starter — 3 seats', amount: 18.00, currency: 'USD', amountUSD: 18.00, type: 'expense', status: 'cleared', category: 'saas', project: 'consulting-ops', aiExtracted: true },
  { id: 'tx-004', date: '2026-03-20', vendor: 'James Whitfield', description: 'Strategy retainer — Q2 2026', amount: 12500.00, currency: 'USD', amountUSD: 12500.00, type: 'income', status: 'cleared', category: 'revenue', project: 'client-retainer', aiExtracted: false },
  { id: 'tx-005', date: '2026-03-18', vendor: 'Delta Airlines', description: 'Flight — CLT → NYC, client meeting', amount: 342.00, currency: 'USD', amountUSD: 342.00, type: 'expense', status: 'cleared', category: 'travel', project: 'consulting-ops', aiExtracted: true },
  { id: 'tx-006', date: '2026-03-15', vendor: 'Meta Ads', description: 'LinkedIn campaign — awareness push', amount: 580.00, currency: 'USD', amountUSD: 580.00, type: 'expense', status: 'cleared', category: 'marketing', project: 'marketing-q2', aiExtracted: false },
  { id: 'tx-007', date: '2026-03-12', vendor: 'AWS', description: 'EC2 + RDS — Feb invoice', amount: 189.34, currency: 'USD', amountUSD: 189.34, type: 'expense', status: 'cleared', category: 'hosting', project: 'infrastructure', aiExtracted: true },
  { id: 'tx-008', date: '2026-03-10', vendor: 'Apple Store', description: 'iPad Pro — client demo device', amount: 1099.00, currency: 'USD', amountUSD: 1099.00, type: 'expense', status: 'cleared', category: 'hardware', project: 'consulting-ops', aiExtracted: true },
  { id: 'tx-009', date: '2026-03-08', vendor: 'Rebecca Torres', description: 'Project engagement — Phase 1', amount: 9800.00, currency: 'CAD', amountUSD: 7203.00, type: 'income', status: 'cleared', category: 'revenue', project: 'client-retainer', aiExtracted: false },
  { id: 'tx-010', date: '2026-03-05', vendor: 'Figma', description: 'Organization plan renewal', amount: 45.00, currency: 'USD', amountUSD: 45.00, type: 'expense', status: 'cleared', category: 'saas', project: 'client-retainer', aiExtracted: false },
  { id: 'tx-011', date: '2026-03-03', vendor: 'Marriott', description: 'Hotel — 2 nights, conference stay', amount: 418.00, currency: 'USD', amountUSD: 418.00, type: 'expense', status: 'review', category: 'travel', project: 'marketing-q2', aiExtracted: true, notes: 'Receipt pending upload' },
  { id: 'tx-012', date: '2026-02-28', vendor: 'Stripe', description: 'Processing fees — Feb', amount: 94.20, currency: 'USD', amountUSD: 94.20, type: 'expense', status: 'cleared', category: 'saas', project: 'client-retainer', aiExtracted: false },
  { id: 'tx-013', date: '2026-02-24', vendor: 'Notion', description: 'Team plan — Q1 annual', amount: 96.00, currency: 'USD', amountUSD: 96.00, type: 'expense', status: 'cleared', category: 'saas', project: 'consulting-ops', aiExtracted: false },
  { id: 'tx-014', date: '2026-02-20', vendor: 'Gretchen Hall', description: 'New engagement — kickoff phase', amount: 8750.00, currency: 'USD', amountUSD: 8750.00, type: 'income', status: 'pending', category: 'revenue', project: 'client-retainer', aiExtracted: false, notes: 'Invoice sent, awaiting payment' },
  { id: 'tx-015', date: '2026-02-15', vendor: 'Staples', description: 'Office supplies — printer paper, pens', amount: 67.40, currency: 'USD', amountUSD: 67.40, type: 'expense', status: 'cleared', category: 'office', project: 'consulting-ops', aiExtracted: true },
];

export function getTotalExpenses(txns: Transaction[]): number {
  return txns.filter(t => t.type === 'expense' && t.status !== 'review').reduce((s, t) => s + t.amountUSD, 0);
}
export function getTotalIncome(txns: Transaction[]): number {
  return txns.filter(t => t.type === 'income' && t.status === 'cleared').reduce((s, t) => s + t.amountUSD, 0);
}
export function getNetCashflow(txns: Transaction[]): number {
  return getTotalIncome(txns) - getTotalExpenses(txns);
}
export function getExpensesByCategory(txns: Transaction[]): Record<string, number> {
  return txns.filter(t => t.type === 'expense').reduce<Record<string, number>>((acc, t) => {
    acc[t.category] = (acc[t.category] ?? 0) + t.amountUSD;
    return acc;
  }, {});
}
export function getMonthlyTrend() {
  return [
    { month: 'Nov', income: 18200, expenses: 2840 },
    { month: 'Dec', income: 21500, expenses: 3120 },
    { month: 'Jan', income: 15800, expenses: 2670 },
    { month: 'Feb', income: 29300, expenses: 3890 },
    { month: 'Mar', income: 35200, expenses: 3108 },
  ];
}
