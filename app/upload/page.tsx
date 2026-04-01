'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, Loader2, CheckCircle, Sparkles, FileText } from 'lucide-react';
import { financeCategories, financeProjects } from '@/lib/finance-data';

type UploadState = 'idle' | 'uploading' | 'extracting' | 'done' | 'saved';

interface ExtractedData {
  vendor: string;
  description: string;
  amount: string;
  currency: string;
  date: string;
  category: string;
  project: string;
}

const MOCK_EXTRACTED: ExtractedData = {
  vendor: 'Adobe Systems',
  description: 'Creative Cloud — monthly subscription',
  amount: '89.99',
  currency: 'USD',
  date: new Date().toISOString().split('T')[0],
  category: 'saas',
  project: 'moov-crm',
};

export default function UploadPage() {
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [extracted, setExtracted] = useState<ExtractedData | null>(null);
  const [form, setForm] = useState<ExtractedData>(MOCK_EXTRACTED);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const runUpload = useCallback((file: File) => {
    setFileName(file.name);
    setUploadState('uploading');
    setProgress(0);

    // Simulate upload progress
    const uploadInterval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(uploadInterval);
          setUploadState('extracting');
          setProgress(0);

          // Simulate extraction progress
          const extractInterval = setInterval(() => {
            setProgress((ep) => {
              if (ep >= 100) {
                clearInterval(extractInterval);
                setTimeout(() => {
                  setExtracted(MOCK_EXTRACTED);
                  setForm(MOCK_EXTRACTED);
                  setUploadState('done');
                }, 200);
                return 100;
              }
              return ep + 8;
            });
          }, 80);

          return 100;
        }
        return p + 12;
      });
    }, 80);
  }, []);

  const handleFileSelect = (file: File | null | undefined) => {
    if (!file) return;
    runUpload(file);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) runUpload(file);
    },
    [runUpload]
  );

  const handleSave = () => {
    setUploadState('saved');
  };

  const handleReset = () => {
    setUploadState('idle');
    setProgress(0);
    setFileName(null);
    setExtracted(null);
    setForm(MOCK_EXTRACTED);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const inputStyle = {
    width: '100%', boxSizing: 'border-box' as const,
    backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px',
    padding: '9px 12px', fontSize: '14px', color: '#e4e4e7',
    outline: 'none',
  };
  const labelStyle = { fontSize: '13px', color: '#a1a1aa', fontWeight: 500, display: 'block' as const, marginBottom: '6px' };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#09090b', color: '#e4e4e7', fontFamily: 'sans-serif' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid #27272a', padding: '24px 32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', color: '#71717a', textDecoration: 'none' }}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#ffffff', margin: 0 }}>Upload Receipt</h1>
          <p style={{ fontSize: '13px', color: '#71717a', margin: '3px 0 0 0' }}>AI will extract vendor, amount, and date automatically</p>
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
              <button
                onClick={handleReset}
                style={{
                  padding: '8px 14px', borderRadius: '7px', fontSize: '13px', fontWeight: 600,
                  backgroundColor: 'rgba(34,197,94,0.15)', color: '#22c55e',
                  border: '1px solid rgba(34,197,94,0.3)', cursor: 'pointer',
                }}
              >
                Upload another
              </button>
              <Link href="/transactions" style={{ textDecoration: 'none' }}>
                <button style={{
                  padding: '8px 14px', borderRadius: '7px', fontSize: '13px', fontWeight: 600,
                  backgroundColor: '#22c55e', color: '#000000',
                  border: 'none', cursor: 'pointer',
                }}>
                  View transactions
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* Drop zone */}
        {(uploadState === 'idle' || uploadState === 'uploading' || uploadState === 'extracting') && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => uploadState === 'idle' && fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${dragOver ? '#22c55e' : '#27272a'}`,
              borderRadius: '16px',
              padding: '56px 32px',
              textAlign: 'center',
              cursor: uploadState === 'idle' ? 'pointer' : 'default',
              backgroundColor: dragOver ? 'rgba(34,197,94,0.04)' : '#111113',
              transition: 'all 0.2s',
              marginBottom: '24px',
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              style={{ display: 'none' }}
              onChange={(e) => handleFileSelect(e.target.files?.[0])}
            />

            {uploadState === 'idle' && (
              <>
                <div style={{ display: 'inline-flex', backgroundColor: '#27272a', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                  <Upload size={28} color="#a1a1aa" />
                </div>
                <div style={{ fontSize: '17px', fontWeight: 600, color: '#ffffff', marginBottom: '8px' }}>Drop your receipt here</div>
                <div style={{ fontSize: '14px', color: '#71717a', marginBottom: '6px' }}>or click to browse files</div>
                <div style={{ fontSize: '12px', color: '#52525b' }}>
                  <Sparkles size={12} color="#a855f7" style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                  AI will automatically extract vendor, date, amount, and category
                </div>
              </>
            )}

            {(uploadState === 'uploading' || uploadState === 'extracting') && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Loader2 size={22} color="#22c55e" style={{ animation: 'spin 1s linear infinite' }} />
                  <span style={{ fontSize: '16px', fontWeight: 600, color: '#ffffff' }}>
                    {uploadState === 'uploading' ? 'Uploading receipt...' : 'AI extracting data...'}
                  </span>
                </div>
                {fileName && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileText size={14} color="#52525b" />
                    <span style={{ fontSize: '13px', color: '#52525b' }}>{fileName}</span>
                  </div>
                )}
                {/* Progress bar */}
                <div style={{ width: '100%', maxWidth: '320px', height: '6px', backgroundColor: '#27272a', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${progress}%`,
                    backgroundColor: uploadState === 'uploading' ? '#22c55e' : '#a855f7',
                    borderRadius: '3px',
                    transition: 'width 0.1s linear',
                  }} />
                </div>
                <div style={{ fontSize: '13px', color: '#52525b' }}>
                  {uploadState === 'uploading' ? `${progress}% uploaded` : `Analyzing with AI...`}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Extracted form */}
        {(uploadState === 'done' || uploadState === 'saved') && extracted && uploadState !== 'saved' && (
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
                <span style={{ fontSize: '13px', color: '#71717a', marginLeft: '8px' }}>Review and confirm the details below</span>
              </div>
            </div>

            <div style={{ backgroundColor: '#111113', border: '1px solid #27272a', borderRadius: '12px', padding: '28px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                {/* Vendor */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Vendor</label>
                  <input
                    style={inputStyle}
                    value={form.vendor}
                    onChange={(e) => setForm((f) => ({ ...f, vendor: e.target.value }))}
                  />
                </div>

                {/* Description */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Description</label>
                  <input
                    style={inputStyle}
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </div>

                {/* Amount */}
                <div>
                  <label style={labelStyle}>Amount</label>
                  <input
                    style={inputStyle}
                    type="number"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  />
                </div>

                {/* Currency */}
                <div>
                  <label style={labelStyle}>Currency</label>
                  <select
                    style={{ ...inputStyle, cursor: 'pointer' }}
                    value={form.currency}
                    onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                  >
                    {(['USD', 'CAD', 'EUR', 'GBP'] as const).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label style={labelStyle}>Date</label>
                  <input
                    style={inputStyle}
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  />
                </div>

                {/* Category */}
                <div>
                  <label style={labelStyle}>Category</label>
                  <select
                    style={{ ...inputStyle, cursor: 'pointer' }}
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  >
                    {financeCategories.map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>

                {/* Project */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Project</label>
                  <select
                    style={{ ...inputStyle, cursor: 'pointer' }}
                    value={form.project}
                    onChange={(e) => setForm((f) => ({ ...f, project: e.target.value }))}
                  >
                    {financeProjects.map((p) => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Save button */}
              <button
                onClick={handleSave}
                style={{
                  width: '100%', padding: '12px', borderRadius: '9px',
                  backgroundColor: '#22c55e', color: '#000000',
                  border: 'none', fontSize: '15px', fontWeight: 700,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
              >
                <CheckCircle size={16} />
                Save Transaction
              </button>
            </div>
          </div>
        )}

        {/* Loader spin keyframe injection */}
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
