import { useCallback, useEffect, useMemo, useState } from 'react';
import { Bike as BikeIcon, BookOpen, Bolt, House, LifeBuoy } from 'lucide-react';
import type { AppState, Bike, Ride } from './types';
import { clearState, EMPTY_STATE, loadState, newId, saveState } from './lib/storage';
import { go, useRoute } from './lib/router';
import { totalKm } from './lib/maintenance';
import { useRecorder } from './lib/useRecorder';
import { formatDuration } from './lib/geo';
import Onboarding from './screens/Onboarding';
import Home from './screens/Home';
import { PartDetail, PartList } from './screens/Parts';
import { TroubleDetail, TroubleList } from './screens/Troubles';
import { GuideDetail, GuideList } from './screens/Learn';
import { ManualRide, RecordRide, RideList } from './screens/Rides';
import Settings from './screens/Settings';

export interface Actions {
  setBike(bike: Bike): void;
  markReplaced(partId: string): void;
  undoReplaced(partId: string): void;
  addRide(ride: Omit<Ride, 'id'>): void;
  deleteRide(id: string): void;
  resetAll(): void;
}

const TABS = [
  { path: '', label: '홈', icon: House },
  { path: 'parts', label: '부품', icon: Bolt },
  { path: 'help', label: '고장', icon: LifeBuoy },
  { path: 'learn', label: '배우기', icon: BookOpen },
  { path: 'rides', label: '주행', icon: BikeIcon },
];

export default function App() {
  const [state, setState] = useState<AppState>(loadState);
  const route = useRoute();
  const recorder = useRecorder();

  useEffect(() => saveState(state), [state]);

  const currentKm = totalKm(state);

  const markReplaced = useCallback(
    (partId: string) =>
      setState((s) => ({
        ...s,
        parts: { ...s.parts, [partId]: { replacedAtKm: totalKm(s), replacedAt: new Date().toISOString() } },
      })),
    [],
  );

  const actions: Actions = useMemo(
    () => ({
      setBike: (bike) => setState((s) => ({ ...s, bike })),
      markReplaced,
      undoReplaced: (partId) =>
        setState((s) => {
          const parts = { ...s.parts };
          delete parts[partId];
          return { ...s, parts };
        }),
      addRide: (ride) =>
        setState((s) => ({
          ...s,
          rides: [{ ...ride, id: newId() }, ...s.rides].sort((a, b) => b.date.localeCompare(a.date)),
        })),
      deleteRide: (id) => setState((s) => ({ ...s, rides: s.rides.filter((r) => r.id !== id) })),
      resetAll: () => {
        clearState();
        setState(EMPTY_STATE);
        go('/');
      },
    }),
    [markReplaced],
  );

  if (!state.bike) {
    return <Onboarding onDone={actions.setBike} />;
  }

  const [tab = '', id] = route;
  let screen;
  switch (tab) {
    case 'parts':
      screen = id ? <PartDetail id={id} state={state} actions={actions} /> : <PartList state={state} />;
      break;
    case 'help':
      screen = id ? <TroubleDetail id={id} bike={state.bike} /> : <TroubleList />;
      break;
    case 'learn':
      screen = id ? <GuideDetail id={id} /> : <GuideList />;
      break;
    case 'rides':
      if (id === 'record') screen = <RecordRide recorder={recorder} actions={actions} />;
      else if (id === 'new') screen = <ManualRide actions={actions} />;
      else screen = <RideList rides={state.rides} actions={actions} />;
      break;
    case 'settings':
      screen = <Settings state={state} actions={actions} currentKm={currentKm} />;
      break;
    default:
      screen = <Home state={state} currentKm={currentKm} />;
  }

  const recording = recorder.status !== 'idle' && !(tab === 'rides' && id === 'record');

  return (
    <div className="app">
      {recording && (
        <button className="rec-banner" onClick={() => go('/rides/record')}>
          <span className="rec-dot" aria-hidden /> 기록 중 · {recorder.distanceKm.toFixed(2)} km · {formatDuration(recorder.elapsedSec)}
        </button>
      )}
      <main className="screen" key={route.join('/')}>
        {screen}
      </main>
      <nav className="tabbar" aria-label="메뉴">
        {TABS.map((t) => (
          <a key={t.path} href={`#/${t.path}`} className={`tab ${tab === t.path ? 'active' : ''}`} aria-current={tab === t.path ? 'page' : undefined}>
            <t.icon className="tab-icon" size={20} aria-hidden />
            <span className="tab-label">{t.label}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}
