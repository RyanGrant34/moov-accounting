'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, Sparkles, ArrowUpDown, Search } from 'lucide-react';
import {
  transactions as allTransactions,
  financeCategories,
  financeProjects,
  type Transaction,
  type TransactionType,
  type TransactionStatus,
} from '@/lib/finance-data';

function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

type SortField = 'date' | 'amount' | 'vendor';
type SortDir = 'asc' | 'desc';

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

export default function TransactionsPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | TransactionStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const filtered = useMemo(() => {
    let txns: Transaction[] = [...allTransactions];

    if (search.trim()) {
      const q = search.toLowerCase();
      txns = txns.filter(
        (t) =>
          t.vendor.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }
    if (typeFilter !== 'all') {
      txns = txns.filter((t) => t.type === typeFilter);
    }
    if (statusFilter !== 'all') {
      txns = txns.filter((t) => t.status === statusFilter);
    }
    if (categoryFilter !== 'all') {
      txns = txns.filter((t) => t.category === categoryFilter);
    }

    txns.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'date') {
        cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortField === 'amount') {
        cmp = a.amountUSD - b.amountUSD;
      } else if (sortField === 'vendor') {
        cmp = a.vendor.localeCompare(b.vendor);
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return txns;
  }, [search, typeFilter, statusFilter, categoryFilter, sortField, sortDir]);

  const netTotal = filtered.reduce((acc, t) => {
    return t.type === 'income' ? acc + t.amountUSD : acc - t.amountUSD;
  }, 0);

  const filterBtnStyle = (active: boolean) => ({
    padding: '6px 14px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 500,
    border: '1px solid',
    borderColor: active ? '#22c55e' : '#27272a',
    backgroundColor: active ? 'rgba(34,197,94,0.1)' : 'transparent',
    color: active ? '#22c55e' : '#a1a1aa',
    cursor: 'pointer',
    transition: 'all 0.15s',
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#09090b', color: '#e4e4e7', fontFamily: 'sans-serif' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid #27272a', padding: '24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', color: '#71717a', textDecoration: 'none' }}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#ffffff', margin: 0 }}>Transactions</h1>
            <p style={{ fontSize: '13px', color: '#71717a', margin: '3px 0 0 0' }}>
              {filtered.length} of {allTransactions.length} transactions
            </p>
          </div>
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

      <div style={{ padding: '24px 32px' }}>
        {/* Filters */}
        <div style={{ backgroundColor: '#111113', border: '1px solid #27272a', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
          {/* Search */}
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <Search size={15} color="#52525b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search vendor or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%', boxSizing: 'border-box',
                backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px',
                padding: '9px 12px 9px 36px', fontSize: '14px', color: '#e4e4e7',
                outline: 'none',
              }}
            />
          </div>

          {/* Filter rows */}
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Type */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: '#52525b', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</span>
              {(['all', 'income', 'expense'] as const).map((v) => (
                <button key={v} style={filterBtnStyle(typeFilter === v)} onClick={() => setTypeFilter(v)}>
                  {v === 'all' ? 'All' : v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>

            {/* Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: '#52525b', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</span>
              {(['all', 'cleared', 'pending', 'review'] as const).map((v) => (
                <button key={v} style={filterBtnStyle(statusFilter === v)} onClick={() => setStatusFilter(v)}>
                  {v === 'all' ? 'All' : v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>

            {/* Category */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: '#52525b', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{
                  backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '6px',
                  color: '#e4e4e7', fontSize: '13px', padding: '6px 10px', outline: 'none', cursor: 'pointer',
                }}
              >
                <option value="all">All</option>
                {financeCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Net total */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
          <span style={{ fontSize: '14px', color: '#a1a1aa' }}>
            Net total:{' '}
            <span style={{ fontWeight: 700, color: netTotal >= 0 ? '#22c55e' : '#ef4444' }}>
              {netTotal >= 0 ? '+' : ''}{formatUSD(netTotal)}
            </span>
          </span>
        </div>

        {/* Table */}
        <div style={{ backgroundColor: '#111113', border: '1px solid #27272a', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #27272a' }}>
                {/* Date */}
                <th
                  style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
                  onClick={() => handleSort('date')}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    Date <ArrowUpDown size={12} color={sortField === 'date' ? '#22c55e' : '#52525b'} />
                  </span>
                </th>
                {/* Vendor */}
                <th
                  style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => handleSort('vendor')}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    Vendor <ArrowUpDown size={12} color={sortField === 'vendor' ? '#22c55e' : '#52525b'} />
                  </span>
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Project</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                {/* Amount */}
                <th
                  style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => handleSort('amount')}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                    Amount <ArrowUpDown size={12} color={sortField === 'amount' ? '#22c55e' : '#52525b'} />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '48px 16px', textAlign: 'center', color: '#52525b', fontSize: '14px' }}>
                    No transactions match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((tx, idx) => {
                  const cat = financeCategories.find((c) => c.id === tx.category);
                  const proj = financeProjects.find((p) => p.id === tx.project);
                  return (
                    <tr
                      key={tx.id}
                      style={{
                        borderBottom: idx < filtered.length - 1 ? '1px solid #1a1a1c' : 'none',
                        transition: 'background-color 0.1s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#18181b')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {/* Date */}
                      <td style={{ padding: '14px 16px', fontSize: '13px', color: '#71717a', whiteSpace: 'nowrap' }}>
                        {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                      </td>

                      {/* Vendor */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            backgroundColor: '#27272a', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '12px', fontWeight: 700, color: '#a1a1aa', flexShrink: 0,
                          }}>
                            {tx.vendor.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <span style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>{tx.vendor}</span>
                              {tx.aiExtracted && (
                                <Sparkles size={12} color="#a855f7" />
                              )}
                            </div>
                            <div style={{ fontSize: '12px', color: '#71717a', maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {tx.description}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td style={{ padding: '14px 16px' }}>
                        {cat && (
                          <span style={{
                            fontSize: '12px', fontWeight: 500, padding: '3px 8px', borderRadius: '6px',
                            backgroundColor: `${cat.color}18`,
                            color: cat.color,
                            whiteSpace: 'nowrap',
                          }}>
                            {cat.label}
                          </span>
                        )}
                      </td>

                      {/* Project */}
                      <td style={{ padding: '14px 16px' }}>
                        {proj && (
                          <span style={{
                            fontSize: '12px', fontWeight: 500, padding: '3px 8px', borderRadius: '6px',
                            backgroundColor: `${proj.color}18`,
                            color: proj.color,
                            whiteSpace: 'nowrap',
                          }}>
                            {proj.label}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          fontSize: '12px', fontWeight: 600, padding: '3px 8px', borderRadius: '6px',
                          backgroundColor: statusBg[tx.status] ?? 'rgba(161,161,170,0.12)',
                          color: statusColors[tx.status] ?? '#a1a1aa',
                        }}>
                          {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                        </span>
                      </td>

                      {/* Amount */}
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: tx.type === 'income' ? '#22c55e' : '#ffffff' }}>
                          {tx.type === 'income' ? '+' : '-'}{formatUSD(tx.amountUSD)}
                        </span>
                        {tx.currency !== 'USD' && (
                          <div style={{ fontSize: '11px', color: '#52525b' }}>{tx.currency}</div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
