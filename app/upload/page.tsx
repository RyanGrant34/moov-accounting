'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, Loader2, CheckCircle, Sparkles, FileText, AlertCircle } from 'lucide-react';
import { financeCategories, financeProjects } from '@/lib/finance-data';

type UploadState = 'idle' | 'uploading' | 'extracting' | 'done' | 'saved' | 'error';

interface ExtractedData {
  vendor: string;
  description: string;
  amount: string;
  currency: string;
  date: string;
  category: string;
  project: string;
}

const EMPTY: ExtractedData = {
  vendor: '', description: '', amount: '', currency: 'USD',
  date: new Date().toISOString().split('T')[0], category: '', project: '',
};

export default function UploadPage() {
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [extracted, setExtracted] = useState<ExtractedData | null>(null);
  const [form, setForm] = useState<ExtractedData>(EMPTY);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const runUpload = useCallback(async (file: File) => {
    setFileName(file.name);
    setErrorMsg('');
    setUploadState('uploading');

    // Small delay so user sees the uploading state
    await new Promise(r => setTimeout(r, 600));
    setUploadState('extracting');

    try {
      const fd = new FormData();
      fd.append('file', file);

      const res = await fetch('/api/extract', { method: 'POST', body: fd });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error ?? 'Extraction failed');
      }

      const data: ExtractedData = { ...EMPTY, ...json.data, project: '' };
      setExtracted(data);
      setForm(data);
      setUploadState('done');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong');
      setUploadState('error');
    }
  }, []);

  const handleFileSelect = (file: File | null | undefined) => {
    if (!file) return;
    runUpload(file);
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) runUpload(file);
  }, [runUpload]);

  const handleSave = () => setUploadState('saved');

  const handleReset = () => {
    setUploadState('idle');
    setFileName(null);
    setExtracted(null);
    setForm(EMPTY);
    setErrorMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const inputStyle = {
    width: '100%', boxSizing: 'border-box' as const,
    backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px',
    padding: '9px 12px', fontSize: '14px', color: '#e4e4e7', outline: 'none',
  };
  const labelStyle: React.CSSProperties = {
    fontSize: '13px', color: '#a1a1aa', fontWeight: 500,
    display: 'block', marginBottom: '6px',
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#09090b', color: '#e4e4e7', fontFamily: 'sans-serif' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid #27272a', padding: '24px 32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', color: '#71717a', textDecoration: 'none' }}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#ffffff', margin: 0 }}>Upload Receipt</h1>
          <p style={{ fontSize: '13px', color: '#71717a', margin: '3px 0 0 0' }}>
            AI reads your receipt and extracts vendor, amount, date, and category automatically
          </p>
        </div>
      </div>

      <div style={{ padding: '40px 32px', maxWidth: '680px', margin: '0 auto' }}>

        {/* Success banner */}
        {uploadState === 'saved' && (
          <div style={{
            backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: '12px', padding: '20px 24px', marginBottom: '24px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CheckCircle size={20} color="#22c55e" />
              <div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#22c55e' }}>Transaction saved</div>
                <div style={{ fontSize: '13px', color: '#71717a', marginTop: '2px' }}>
                  {form.vendor} — ${form.amount} added to your records.
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleReset} style={{
                padding: '8px 14px', borderRadius: '7px', fontSize: '13px', fontWeight: 600,
                backgroundColor: 'rgba(34,197,94,0.15)', color: '#22c55e',
                border: '1px solid rgba(34,197,94,0.3)', cursor: 'pointer',
              }}>
                Upload another
              </button>
              <Link href="/transactions" style={{ textDecoration: 'none' }}>
                <button style={{
                  padding: '8px 14px', borderRadius: '7px', fontSize: '13px', fontWeight: 600,
                  backgroundColor: '#22c55e', color: '#000000', border: 'none', cursor: 'pointer',
                }}>
                  View transactions
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* Error banner */}
        {uploadState === 'error' && (
          <div style={{
            backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '12px', padding: '16px 20px', marginBottom: '24px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertCircle size={18} color="#ef4444" />
              <span style={{ fontSize: '14px', color: '#ef4444' }}>{errorMsg || 'Failed to extract receipt. Try again.'}</span>
            </div>
            <button onClick={handleReset} style={{
              padding: '6px 12px', borderRadius: '6px', fontSize: '13px',
              backgroundColor: 'rgba(239,68,68,0.15)', color: '#ef4444',
              border: '1px solid rgba(239,68,68,0.3)', cursor: 'pointer', whiteSpace: 'nowrap',
            }}>
              Try again
            </button>
          </div>
        )}

        {/* Drop zone — shown while idle, uploading, or extracting */}
        {(uploadState === 'idle' || uploadState === 'uploading' || uploadState === 'extracting' || uploadState === 'error') && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => uploadState === 'idle' && fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${dragOver ? '#22c55e' : '#27272a'}`,
              borderRadius: '16px', padding: '56px 32px', textAlign: 'center',
              cursor: uploadState === 'idle' ? 'pointer' : 'default',
              backgroundColor: dragOver ? 'rgba(34,197,94,0.04)' : '#111113',
              transition: 'all 0.2s', marginBottom: '24px',
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              style={{ display: 'none' }}
              onChange={(e) => handleFileSelect(e.target.files?.[0])}
            />

            {(uploadState === 'idle' || uploadState === 'error') && (
              <>
                <div style={{ display: 'inline-flex', backgroundColor: '#27272a', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                  <Upload size={28} color="#a1a1aa" />
                </div>
                <div style={{ fontSize: '17px', fontWeight: 600, color: '#ffffff', marginBottom: '8px' }}>
                  {uploadState === 'error' ? 'Try uploading again' : 'Drop your receipt here'}
                </div>
                <div style={{ fontSize: '14px', color: '#71717a', marginBottom: '6px' }}>or click to browse — JPG, PNG, WebP</div>
                <div style={{ fontSize: '12px', color: '#52525b' }}>
                  <Sparkles size={12} color="#a855f7" style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                  AI reads your receipt and fills in all fields automatically
                </div>
              </>
            )}

            {(uploadState === 'uploading' || uploadState === 'extracting') && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Loader2 size={22} color={uploadState === 'uploading' ? '#22c55e' : '#a855f7'}
                    style={{ animation: 'spin 1s linear infinite' }} />
                  <span style={{ fontSize: '16px', fontWeight: 600, color: '#ffffff' }}>
                    {uploadState === 'uploading' ? 'Uploading receipt...' : 'Claude is reading your receipt...'}
                  </span>
                </div>
                {fileName && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileText size={14} color="#52525b" />
                    <span style={{ fontSize: '13px', color: '#52525b' }}>{fileName}</span>
                  </div>
                )}
                <div style={{ width: '100%', maxWidth: '320px', height: '6px', backgroundColor: '#27272a', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: uploadState === 'uploading' ? '30%' : '80%',
                    backgroundColor: uploadState === 'uploading' ? '#22c55e' : '#a855f7',
                    borderRadius: '3px',
                    transition: 'width 0.4s ease',
                  }} />
                </div>
                <div style={{ fontSize: '13px', color: '#52525b' }}>
                  {uploadState === 'uploading' ? 'Sending to AI...' : 'Extracting vendor, amount, date, category...'}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Extracted form */}
        {uploadState === 'done' && extracted && (
          <div>
            {/* AI banner */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              backgroundColor: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)',
              borderRadius: '10px', padding: '12px 16px', marginBottom: '24px',
            }}>
              <Sparkles size={16} color="#a855f7" />
              <div>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#a855f7' }}>AI extraction complete</span>
                <span style={{ fontSize: '13px', color: '#71717a', marginLeft: '8px' }}>
                  Review and confirm the details below
                </span>
              </div>
            </div>

            <div style={{ backgroundColor: '#111113', border: '1px solid #27272a', borderRadius: '12px', padding: '28px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                {/* Vendor */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Vendor</label>
                  <input
                    style={inputStyle} value={form.vendor}
                    onChange={e => setForm(f => ({ ...f, vendor: e.target.value }))}
                  />
                </div>

                {/* Description */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Description</label>
                  <input
                    style={inputStyle} value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  />
                </div>

                {/* Amount */}
                <div>
                  <label style={labelStyle}>Amount</label>
                  <input
                    style={inputStyle} value={form.amount} type="number" step="0.01"
                    onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  />
                </div>

                {/* Currency */}
                <div>
                  <label style={labelStyle}>Currency</label>
                  <select
                    style={{ ...inputStyle, cursor: 'pointer' }}
                    value={form.currency}
                    onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
                  >
                    {['USD', 'CAD', 'EUR', 'GBP'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label style={labelStyle}>Date</label>
                  <input
                    style={inputStyle} type="date" value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  />
                </div>

                {/* Category */}
                <div>
                  <label style={labelStyle}>Category</label>
                  <select
                    style={{ ...inputStyle, cursor: 'pointer' }}
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  >
                    <option value="">Select category</option>
                    {financeCategories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>

                {/* Project */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Project</label>
                  <select
                    style={{ ...inputStyle, cursor: 'pointer' }}
                    value={form.project}
                    onChange={e => setForm(f => ({ ...f, project: e.target.value }))}
                  >
                    <option value="">Select project</option>
                    {financeProjects.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px', paddingTop: '8px', borderTop: '1px solid #27272a' }}>
                <button
                  onClick={handleSave}
                  style={{
                    flex: 1, padding: '11px', borderRadius: '8px', fontSize: '14px', fontWeight: 600,
                    backgroundColor: '#22c55e', color: '#000000', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  }}
                >
                  <CheckCircle size={16} /> Save Transaction
                </button>
                <button
                  onClick={handleReset}
                  style={{
                    padding: '11px 20px', borderRadius: '8px', fontSize: '14px',
                    backgroundColor: 'transparent', color: '#71717a',
                    border: '1px solid #27272a', cursor: 'pointer',
                  }}
                >
                  Discard
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Supported formats */}
        {uploadState === 'idle' && (
          <div style={{ backgroundColor: '#111113', border: '1px solid #27272a', borderRadius: '12px', padding: '20px 24px' }}>
            <div style={{ fontSize: '11px', color: '#52525b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
              Supported
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {[
                { label: 'Restaurant receipts', sub: 'Fast food, dining' },
                { label: 'Store receipts', sub: 'Retail, grocery' },
                { label: 'Invoices', sub: 'SaaS, services' },
              ].map(({ label, sub }) => (
                <div key={label} style={{
                  backgroundColor: '#18181b', borderRadius: '8px', padding: '12px',
                  border: '1px solid #27272a',
                }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: '#e4e4e7', marginBottom: '2px' }}>{label}</div>
                  <div style={{ fontSize: '12px', color: '#52525b' }}>{sub}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
