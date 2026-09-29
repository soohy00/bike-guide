import type { AppState } from '../types';
import { findModel } from '../data/bikeModels';
import { PARTS } from '../data/parts';
import { allPartHealth, byUrgency, statusLabel } from '../lib/maintenance';
import { go } from '../lib/router';
import { LifeBuoy, ListChecks, PartyPopper, Play, Settings } from 'lucide-react';
import { Card, Chevron, IconTile, StatusPill, WearBar, km } from '../components/ui';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export default function Home({ state, currentKm }: { state: AppState; currentKm: number }) {
  const bike = state.bike!;
  const model = findModel(bike.modelId);
  const todo = byUrgency(allPartHealth(state, PARTS)).filter((h) => h.status !== 'ok');
  const weekAgo = Date.now() - WEEK_MS;
  const weekKm = state.rides.filter((r) => new Date(r.date).getTime() >= weekAgo).reduce((s, r) => s + r.distanceKm, 0);

  return (
    <div className="stack">
      <header className="home-head">
        <div>
          <p className="eyebrow">{`${model.brand} ${model.name}`}</p>
          <h1>{bike.nickname || '내 자전거'}</h1>
        </div>
        <button className="icon-btn" onClick={() => go('/settings')} aria-label="설정">
          <Settings size={20} aria-hidden />
        </button>
      </header>

      <Card className="odometer">
        <p className="eyebrow">총 주행 거리</p>
        <p className="odometer-value">
          {Math.round(currentKm).toLocaleString('ko-KR')}
          <small>km</small>
        </p>
        <p className="muted small">최근 7일 {km(weekKm, 1)}</p>
        <div className="row">
          <button className="btn primary grow" onClick={() => go('/rides/record')}>
            <Play size={16} aria-hidden />
            주행 기록
          </button>
          <button className="btn grow" onClick={() => go('/rides/new')}>
            거리 입력
          </button>
        </div>
      </Card>

      <button className="sos" onClick={() => go('/help')}>
        <IconTile icon={LifeBuoy} />
        <span className="grow">
          자전거가 고장 났어요
          <span className="muted small" style={{ display: 'block', fontWeight: 400 }}>
            증상을 고르면 필요한 것을 알려 줘요
          </span>
        </span>
        <Chevron />
      </button>

      <h2>할 일</h2>
      {todo.length === 0 ? (
        <Card>
          <p className="row">
            <PartyPopper size={18} className="muted" aria-hidden />
            <span>지금은 모두 좋아요. 타기 전 점검만 잊지 마세요.</span>
          </p>
        </Card>
      ) : (
        todo.slice(0, 3).map((h) => (
          <Card key={h.part.id} onClick={() => go(`/parts/${h.part.id}`)}>
            <div className="part-row">
              <IconTile icon={h.part.icon} />
              <div className="grow">
                <div className="part-title">
                  <strong>{h.part.name}</strong>
                  <StatusPill status={h.status}>{statusLabel(h)}</StatusPill>
                </div>
                <WearBar wear={h.wear} status={h.status} />
              </div>
            </div>
          </Card>
        ))
      )}

      <h2>오늘 타기 전에</h2>
      <Card onClick={() => go('/learn/pre-ride')}>
        <div className="part-row">
          <IconTile icon={ListChecks} />
          <div className="grow">
            <strong>1분 점검 하기</strong>
            <p className="muted small">공기, 브레이크, 체인을 봐요.</p>
          </div>
          <Chevron />
        </div>
      </Card>
    </div>
  );
}
