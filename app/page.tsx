'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Sparkles,
  Upload,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  transactions as mockTransactions,
  getTotalExpenses,
  getTotalIncome,
  getNetCashflow,
  getExpensesByCategory,
  getMonthlyTrend,
  financeCategories,
} from '@/lib/finance-data';
import { getSavedTransactions } from '@/lib/transaction-store';

function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function OverviewPage() {
  const transactions = useMemo(() => {
    const saved = getSavedTransactions();
    const savedIds = new Set(saved.map(t => t.id));
    return [...saved, ...mockTransactions.filter(t => !savedIds.has(t.id))];
  }, []);

  const totalIncome = getTotalIncome(transactions);
  const totalExpenses = getTotalExpenses(transactions);
  const netCashflow = getNetCashflow(transactions);
  const aiCount = transactions.filter((t) => t.aiExtracted).length;
  const expensesByCategory = getExpensesByCategory(transactions);
  const monthlyTrend = getMonthlyTrend();

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const maxCategoryAmount = Math.max(...Object.values(expensesByCategory));

  const statusColors: Record<string, string> = {
    cleared: '#22c55e',
    pending: '#f59e0b',
    review: '#ef4444',
  };

  const statusBg: Record<string, string> = {
    cleared: 'rgba(34,197,94,0.12)',
    pending: 'rgba(245,158,11,0.12)',
    review: 'rgba(239,68,68,0.12)',
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#09090b', color: '#e4e4e7', fontFamily: 'sans-serif' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid #27272a', padding: '24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#ffffff', margin: 0 }}>Overview</h1>
          <p style={{ fontSize: '14px', color: '#71717a', margin: '4px 0 0 0' }}>{todayStr}</p>
        </div>
        <Link href="/upload" style={{ textDecoration: 'none' }}>
          <button style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            backgroundColor: '#22c55e', color: '#000000',
            border: 'none', borderRadius: '8px',
            padding: '10px 18px', fontSize: '14px', fontWeight: 600,
            cursor: 'pointer',
          }}>
            <Upload size={16} />
            Upload Receipt
          </button>
        </Link>
      </div>

      <div style={{ padding: '32px' }}>
        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
          {/* Total Income */}
          <div style={{ backgroundColor: '#111113', border: '1px solid #27272a', borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', color: '#a1a1aa', fontWeight: 500 }}>Total Income</span>
              <div style={{ backgroundColor: 'rgba(34,197,94,0.12)', borderRadius: '8px', padding: '6px' }}>
                <TrendingUp size={16} color="#22c55e" />
              </div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#22c55e' }}>{formatUSD(totalIncome)}</div>
            <div style={{ fontSize: '12px', color: '#52525b', marginTop: '4px' }}>Cleared only</div>
          </div>

          {/* Total Expenses */}
          <div style={{ backgroundColor: '#111113', border: '1px solid #27272a', borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', color: '#a1a1aa', fontWeight: 500 }}>Total Expenses</span>
              <div style={{ backgroundColor: 'rgba(239,68,68,0.12)', borderRadius: '8px', padding: '6px' }}>
                <TrendingDown size={16} color="#ef4444" />
              </div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#ffffff' }}>{formatUSD(totalExpenses)}</div>
            <div style={{ fontSize: '12px', color: '#52525b', marginTop: '4px' }}>Excl. review</div>
          </div>

          {/* Net Cashflow */}
          <div style={{ backgroundColor: '#111113', border: '1px solid #27272a', borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', color: '#a1a1aa', fontWeight: 500 }}>Net Cashflow</span>
              <div style={{ backgroundColor: 'rgba(34,197,94,0.12)', borderRadius: '8px', padding: '6px' }}>
                <DollarSign size={16} color="#22c55e" />
              </div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: netCashflow >= 0 ? '#22c55e' : '#ef4444' }}>
              {netCashflow >= 0 ? '+' : ''}{formatUSD(netCashflow)}
            </div>
            <div style={{ fontSize: '12px', color: '#52525b', marginTop: '4px' }}>Income minus expenses</div>
          </div>

          {/* AI Extracted */}
          <div style={{ backgroundColor: '#111113', border: '1px solid #27272a', borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', color: '#a1a1aa', fontWeight: 500 }}>AI Extracted</span>
              <div style={{ backgroundColor: 'rgba(168,85,247,0.12)', borderRadius: '8px', padding: '6px' }}>
                <Sparkles size={16} color="#a855f7" />
              </div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#ffffff' }}>{aiCount}</div>
            <div style={{ fontSize: '12px', color: '#52525b', marginTop: '4px' }}>Receipts scanned</div>
          </div>
        </div>

        {/* Charts Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '16px', marginBottom: '32px' }}>
          {/* Monthly Cash Flow Chart */}
          <div style={{ backgroundColor: '#111113', border: '1px solid #27272a', borderRadius: '12px', padding: '24px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff', margin: '0 0 20px 0' }}>Monthly Cash Flow</h2>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyTrend} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#e4e4e7', fontSize: '13px' }}
                  formatter={(value: unknown) => formatUSD(value as number)}
                />
                <Area type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2} fill="url(#incomeGrad)" name="Income" />
                <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} fill="url(#expenseGrad)" name="Expenses" />
              </AreaChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: '20px', marginTop: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
                <span style={{ fontSize: '12px', color: '#a1a1aa' }}>Income</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                <span style={{ fontSize: '12px', color: '#a1a1aa' }}>Expenses</span>
              </div>
            </div>
          </div>

          {/* Expenses by Category */}
          <div style={{ backgroundColor: '#111113', border: '1px solid #27272a', borderRadius: '12px', padding: '24px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff', margin: '0 0 20px 0' }}>Expenses by Category</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {Object.entries(expensesByCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([catId, amount]) => {
                  const cat = financeCategories.find((c) => c.id === catId);
                  const pct = (amount / maxCategoryAmount) * 100;
                  return (
                    <div key={catId}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '13px', color: '#e4e4e7' }}>{cat?.label ?? catId}</span>
                        <span style={{ fontSize: '13px', color: '#a1a1aa', fontWeight: 500 }}>{formatUSD(amount)}</span>
                      </div>
                      <div style={{ height: '6px', backgroundColor: '#27272a', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, backgroundColor: cat?.color ?? '#a1a1aa', borderRadius: '3px', transition: 'width 0.4s ease' }} />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div style={{ backgroundColor: '#111113', border: '1px solid #27272a', borderRadius: '12px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff', margin: 0 }}>Recent Transactions</h2>
            <Link href="/transactions" style={{ fontSize: '13px', color: '#22c55e', textDecoration: 'none', fontWeight: 500 }}>
              View all
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {recentTransactions.map((tx, idx) => (
              <div
                key={tx.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '12px 8px',
                  borderBottom: idx < recentTransactions.length - 1 ? '1px solid #1f1f22' : 'none',
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: '38px', height: '38px', borderRadius: '50%',
                  backgroundColor: '#27272a', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px', fontWeight: 700, color: '#a1a1aa', flexShrink: 0,
                }}>
                  {tx.vendor.charAt(0).toUpperCase()}
                </div>

                {/* Vendor + desc */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.vendor}</span>
                    {tx.aiExtracted && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', backgroundColor: 'rgba(168,85,247,0.12)', color: '#a855f7', fontSize: '11px', fontWeight: 600, borderRadius: '4px', padding: '1px 6px' }}>
                        <Sparkles size={10} />
                        AI
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: '#71717a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>{tx.description}</div>
                </div>

                {/* Amount */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: tx.type === 'income' ? '#22c55e' : '#ffffff' }}>
                    {tx.type === 'income' ? '+' : '-'}{formatUSD(tx.amountUSD)}
                  </div>
                  <div style={{ fontSize: '11px', color: '#52525b', marginTop: '2px' }}>
                    {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>

                {/* Status pill */}
                <div style={{ flexShrink: 0 }}>
                  <span style={{
                    fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '6px',
                    backgroundColor: statusBg[tx.status] ?? 'rgba(161,161,170,0.12)',
                    color: statusColors[tx.status] ?? '#a1a1aa',
                  }}>
                    {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
