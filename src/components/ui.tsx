import type { CSSProperties, ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Lightbulb, TriangleAlert, type LucideIcon } from 'lucide-react';
import type { PartHealth, PartStatus } from '../lib/maintenance';
import { go } from '../lib/router';

export function TopBar({ title, backTo }: { title: string; backTo?: string }) {
  return (
    <header className="topbar">
      {backTo !== undefined && (
        <button className="topbar-back" onClick={() => go(backTo)} aria-label="뒤로">
          <ChevronLeft size={24} aria-hidden />
        </button>
      )}
      <h1>{title}</h1>
    </header>
  );
}

export function WearBar({ wear, status, name }: { wear: number; status: PartStatus; name: string }) {
  const pct = Math.min(100, Math.round(wear * 100));
  return (
    <div className="wearbar" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={`${name} 닳은 정도`}>
      <div className={`wearbar-fill ${status}`} style={{ '--fill': `${pct}%` } as CSSProperties} />
    </div>
  );
}

/** Geist Progress: 막대 옆에 단위가 있는 글을 둬요. */
export function LeftKm({ health: h }: { health: PartHealth }) {
  return (
    <p className="muted small">
      {h.leftKm > 0 ? `약 ${km(h.leftKm)} 남았어요` : `${km(-h.leftKm)} 넘었어요`}
      {h.dueByTime && ' · 기간이 지났어요'}
    </p>
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
      <Lightbulb size={16} aria-hidden />
      <span>{children}</span>
    </p>
  );
}

export function Warning({ children }: { children: ReactNode }) {
  return (
    <p className="warning">
      <TriangleAlert size={16} aria-hidden />
      <span>{children}</span>
    </p>
  );
}

/** 부품, 고장, 수업 아이콘. 네모 칸 안에 아이콘을 넣어요. */
export function IconTile({ icon: Icon, big = false }: { icon: LucideIcon; big?: boolean }) {
  return (
    <span className={`icon-tile ${big ? 'big' : ''}`} aria-hidden>
      <Icon size={big ? 28 : 20} />
    </span>
  );
}

export function Chevron() {
  return <ChevronRight className="chev" size={18} aria-hidden />;
}

export function km(n: number, digits = 0): string {
  return `${n.toLocaleString('ko-KR', { maximumFractionDigits: digits, minimumFractionDigits: digits })} km`;
}
