import { useState } from 'react';
import type { Actions } from '../App';
import type { LatLng, Ride } from '../types';
import type { Recorder } from '../lib/useRecorder';
import { avgSpeedKmh, formatDuration } from '../lib/geo';
import { go } from '../lib/router';
import { Bike, Play, Square, Trash2 } from 'lucide-react';
import { Card, Tip, TopBar, Warning, km } from '../components/ui';

const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

export function RideList({ rides, actions }: { rides: Ride[]; actions: Actions }) {
  const monthAgo = Date.now() - MONTH_MS;
  const month = rides.filter((r) => new Date(r.date).getTime() >= monthAgo);
  const monthKm = month.reduce((s, r) => s + r.distanceKm, 0);
  const monthSec = month.reduce((s, r) => s + r.durationSec, 0);

  return (
    <div className="stack">
      <TopBar title="주행" />
      <div className="row">
        <button className="btn primary grow" onClick={() => go('/rides/record')}>
          <Play size={16} aria-hidden />
          GPS로 기록
        </button>
        <button className="btn grow" onClick={() => go('/rides/new')}>
          손으로 입력
        </button>
      </div>

      <Card>
        <p className="muted small">최근 30일</p>
        <div className="stats">
          <div>
            <strong>{monthKm.toFixed(1)}</strong>
            <span>km</span>
          </div>
          <div>
            <strong>{month.length}</strong>
            <span>번</span>
          </div>
          <div>
            <strong>{formatDuration(monthSec)}</strong>
            <span>시간</span>
          </div>
        </div>
      </Card>

      {rides.length === 0 ? (
        <Card>
          <p className="row">
            <Bike size={18} className="muted" aria-hidden />
            <span>아직 기록이 없어요. 첫 주행을 기록해 봐요!</span>
          </p>
        </Card>
      ) : (
        rides.map((r) => (
          <Card key={r.id}>
            <div className="ride">
              {r.path && r.path.length > 1 && <RouteSketch path={r.path} />}
              <div className="grow">
                <p className="muted small">
                  {new Date(r.date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })} ·{' '}
                  {r.source === 'gps' ? 'GPS' : '입력'}
                </p>
                <p className="ride-km">{km(r.distanceKm, 1)}</p>
                <p className="muted small">
                  {formatDuration(r.durationSec)} · 평균 {avgSpeedKmh(r.distanceKm, r.durationSec).toFixed(1)} km/h
                </p>
                {r.note && <p className="small">{r.note}</p>}
              </div>
              <button
                className="icon-btn"
                aria-label="기록 지우기"
                onClick={() => {
                  if (window.confirm('이 기록을 지울까요? 총 거리도 줄어요.')) actions.deleteRide(r.id);
                }}
              >
                <Trash2 size={18} aria-hidden />
              </button>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}

export function RecordRide({ recorder, actions }: { recorder: Recorder; actions: Actions }) {
  const { status, distanceKm, elapsedSec, accuracy, error } = recorder;
  const [message, setMessage] = useState<string | null>(null);

  const finish = () => {
    const ride = recorder.stop();
    if (!ride) {
      setMessage('움직인 거리가 없어서 저장하지 않았어요.');
      return;
    }
    actions.addRide({
      date: ride.startedAt,
      distanceKm: Math.round(ride.distanceKm * 100) / 100,
      durationSec: ride.durationSec,
      source: 'gps',
      path: ride.path,
    });
    go('/rides');
  };

  return (
    <div className="stack">
      <TopBar title="GPS 주행 기록" backTo="/rides" />

      <Card className="recorder">
        <p className="rec-distance">
          {distanceKm.toFixed(2)}
          <span> km</span>
        </p>
        <div className="stats">
          <div>
            <strong>{formatDuration(elapsedSec)}</strong>
            <span>시간</span>
          </div>
          <div>
            <strong>{avgSpeedKmh(distanceKm, elapsedSec).toFixed(1)}</strong>
            <span>평균 km/h</span>
          </div>
          <div>
            <strong>{accuracy === null ? '–' : `±${accuracy}m`}</strong>
            <span>GPS</span>
          </div>
        </div>
        {status === 'waiting' && <p className="muted small">GPS 신호를 찾고 있어요…</p>}
        {status === 'idle' ? (
          <button className="btn primary big" onClick={() => void recorder.start()}>
            <Play size={16} aria-hidden />
            시작
          </button>
        ) : (
          <div className="row">
            <button
              className="btn grow"
              onClick={() => {
                if (window.confirm('기록을 버릴까요?')) recorder.cancel();
              }}
            >
              버리기
            </button>
            <button className="btn primary grow" onClick={finish}>
              <Square size={14} aria-hidden />
              끝내고 저장
            </button>
          </div>
        )}
      </Card>

      {error && <Warning>{error}</Warning>}
      {message && <p className="muted">{message}</p>}

      <Tip>
        기록하는 동안 이 화면을 켜 두세요. 화면이 꺼지면 휴대폰이 GPS를 멈출 수 있어요. 다른 탭으로 가도 기록은 계속돼요.
      </Tip>
      <Warning>타는 동안 휴대폰을 보지 마세요. 휴대폰은 주머니나 가방에 넣어요.</Warning>
    </div>
  );
}

export function ManualRide({ actions }: { actions: Actions }) {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [distance, setDistance] = useState('');
  const [minutes, setMinutes] = useState('');
  const [note, setNote] = useState('');
  const d = Number(distance);
  const valid = d > 0 && d < 1000;

  const save = () => {
    actions.addRide({
      date: new Date(`${date}T12:00:00`).toISOString(),
      distanceKm: Math.round(d * 10) / 10,
      durationSec: Math.max(0, Math.round((Number(minutes) || 0) * 60)),
      source: 'manual',
      note: note.trim() || undefined,
    });
    go('/rides');
  };

  return (
    <div className="stack">
      <TopBar title="거리 입력" backTo="/rides" />
      <Card>
        <label className="field">
          <span>날짜</span>
          <input type="date" value={date} max={today} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label className="field">
          <span>거리 (km)</span>
          <input inputMode="decimal" value={distance} onChange={(e) => setDistance(e.target.value.replace(/[^0-9.]/g, ''))} placeholder="예: 20" autoFocus />
        </label>
        <label className="field">
          <span>시간 (분, 선택)</span>
          <input inputMode="numeric" value={minutes} onChange={(e) => setMinutes(e.target.value.replace(/[^0-9]/g, ''))} placeholder="예: 60" />
        </label>
        <label className="field">
          <span>메모 (선택)</span>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="예: 한강 자전거길" maxLength={60} />
        </label>
        <button className="btn primary big" disabled={!valid} onClick={save}>
          저장하기
        </button>
      </Card>
      <Tip>다른 앱이나 자전거 속도계에 나온 거리를 써도 돼요.</Tip>
    </div>
  );
}

/** 지도 없이 경로 모양만 그려요 */
function RouteSketch({ path }: { path: LatLng[] }) {
  const size = 64;
  const pad = 4;
  const lats = path.map((p) => p.lat);
  const lngs = path.map((p) => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  // 경도 1도는 위도에 따라 짧아져요
  const xScale = Math.cos((((minLat + maxLat) / 2) * Math.PI) / 180);
  const span = Math.max((maxLng - minLng) * xScale, maxLat - minLat) || 1;
  const k = (size - pad * 2) / span;
  const points = path
    .map((p) => `${(pad + (p.lng - minLng) * xScale * k).toFixed(1)},${(size - pad - (p.lat - minLat) * k).toFixed(1)}`)
    .join(' ');
  return (
    <svg className="route" viewBox={`0 0 ${size} ${size}`} width={size} height={size} aria-hidden>
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
