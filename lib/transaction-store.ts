'use client';

import { type Transaction } from './finance-data';

const KEY = 'rg_transactions';

export function getSavedTransactions(): Transaction[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Transaction[]) : [];
  } catch {
    return [];
  }
}

export function saveTransaction(tx: Transaction): void {
  if (typeof window === 'undefined') return;
  const existing = getSavedTransactions();
  // Avoid duplicates by id
  const updated = [tx, ...existing.filter(t => t.id !== tx.id)];
  localStorage.setItem(KEY, JSON.stringify(updated));
}

export function clearSavedTransactions(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEY);
}
