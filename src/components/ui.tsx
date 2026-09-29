import type { ReactNode } from 'react';
import type { PartStatus } from '../lib/maintenance';
import { go } from '../lib/router';

export function TopBar({ title, backTo }: { title: string; backTo?: string }) {
  return (
    <header className="topbar">
      {backTo !== undefined && (
        <button className="topbar-back" onClick={() => go(backTo)} aria-label="뒤로">
          ‹
        </button>
      )}
      <h1>{title}</h1>
    </header>
  );
}

export function WearBar({ wear, status }: { wear: number; status: PartStatus }) {
  const pct = Math.min(100, Math.round(wear * 100));
  return (
    <div className="wearbar" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="닳은 정도">
      <div className={`wearbar-fill ${status}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function StatusPill({ status, children }: { status: PartStatus; children: ReactNode }) {
  return <span className={`pill ${status}`}>{children}</span>;
}

const DIY_TEXT: Record<1 | 2 | 3, string> = {
  1: '혼자 쉽게 해요',
  2: '연습하면 혼자 해요',
  3: '샵에 맡겨요',
};

export function DiyBadge({ level }: { level: 1 | 2 | 3 }) {
  return <span className={`diy diy-${level}`}>{DIY_TEXT[level]}</span>;
}

export function Card({ children, onClick, className = '' }: { children: ReactNode; onClick?: () => void; className?: string }) {
  if (onClick) {
    return (
      <button className={`card card-button ${className}`} onClick={onClick}>
        {children}
      </button>
    );
  }
  return <section className={`card ${className}`}>{children}</section>;
}

export function Tip({ children }: { children: ReactNode }) {
  return (
    <p className="tip">
      <span aria-hidden>💡</span> {children}
    </p>
  );
}

export function Warning({ children }: { children: ReactNode }) {
  return (
    <p className="warning">
      <span aria-hidden>⚠️</span> {children}
    </p>
  );
}

export function km(n: number, digits = 0): string {
  return `${n.toLocaleString('ko-KR', { maximumFractionDigits: digits, minimumFractionDigits: digits })} km`;
}
