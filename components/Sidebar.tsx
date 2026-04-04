'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Receipt, Upload, Wallet, FolderOpen, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const nav = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: Receipt },
  { href: '/upload', label: 'Upload Receipt', icon: Upload },
  { href: '/projects', label: 'Projects', icon: FolderOpen },
];

export default function Sidebar() {
  const path = usePathname();
  return (
    <aside className="w-[200px] flex-shrink-0 bg-[#111113] border-r border-[#27272a] flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-4 pb-3 border-b border-[#27272a]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-[#22c55e] flex items-center justify-center">
            <span className="text-[#09090b] font-bold text-sm">M</span>
          </div>
          <div>
            <div className="text-white font-semibold text-sm tracking-tight">RG</div>
            <div className="text-[#52525b] text-[10px]">Accounting</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 pt-3 overflow-y-auto">
        <p className="text-[10px] font-semibold text-[#3f3f46] uppercase tracking-wider px-2 mb-2">Finance</p>
        {nav.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? path === '/' : path.startsWith(href);
          return (
            <Link key={href} href={href}
              className={cn(
                'flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm mb-0.5 transition-all',
                active
                  ? 'bg-[#22c55e]/10 text-[#22c55e] font-medium'
                  : 'text-[#71717a] hover:text-[#a1a1aa] hover:bg-[#1c1c1f]'
              )}>
              <Icon size={14} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Quick action */}
      <div className="p-3 border-t border-[#27272a]">
        <Link href="/upload">
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md bg-[#22c55e]/10 text-[#22c55e] text-sm font-medium hover:bg-[#22c55e]/20 transition-all">
            <Zap size={13} />
            Upload Receipt
          </button>
        </Link>
      </div>

      {/* User */}
      <div className="p-3 border-t border-[#27272a]">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0">RG</div>
          <div>
            <div className="text-[#d4d4d8] text-xs font-medium">Ryan Grant</div>
            <div className="text-[#52525b] text-[10px]">Finance</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
