import { useCallback, useEffect, useRef, useState } from 'react';
import type { LatLng } from '../types';
import { acceptFix, type Fix } from './geo';

export type RecorderStatus = 'idle' | 'waiting' | 'recording';

export interface RecordedRide {
  startedAt: string;
  distanceKm: number;
  durationSec: number;
  path: LatLng[];
}

interface WakeLockLike {
  release(): Promise<void>;
}

/**
 * 휴대폰 GPS로 주행을 기록해요.
 * App 에서 1번만 써요. 그래서 다른 탭으로 가도 기록이 계속돼요.
 */
export function useRecorder() {
  const [status, setStatus] = useState<RecorderStatus>('idle');
  const [distanceKm, setDistanceKm] = useState(0);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const watchId = useRef<number | null>(null);
  const timer = useRef<number | null>(null);
  const startedAt = useRef<number>(0);
  const prev = useRef<Fix | null>(null);
  const path = useRef<LatLng[]>([]);
  const dist = useRef(0);
  const wakeLock = useRef<WakeLockLike | null>(null);

  const cleanup = useCallback(() => {
    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    if (timer.current !== null) window.clearInterval(timer.current);
    watchId.current = null;
    timer.current = null;
    wakeLock.current?.release().catch(() => undefined);
    wakeLock.current = null;
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const start = useCallback(async () => {
    if (!('geolocation' in navigator)) {
      setError('이 브라우저는 GPS를 쓸 수 없어요. 거리를 손으로 입력해 주세요.');
      return;
    }
    setError(null);
    setDistanceKm(0);
    setElapsedSec(0);
    setAccuracy(null);
    prev.current = null;
    path.current = [];
    dist.current = 0;
    startedAt.current = Date.now();
    setStatus('waiting');

    try {
      const nav = navigator as Navigator & { wakeLock?: { request(type: 'screen'): Promise<WakeLockLike> } };
      wakeLock.current = (await nav.wakeLock?.request('screen')) ?? null;
    } catch {
      // 화면 켜짐 유지를 못 해도 기록은 해요
    }

    timer.current = window.setInterval(() => {
      setElapsedSec((Date.now() - startedAt.current) / 1000);
    }, 1000);

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const fix: Fix = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          time: pos.timestamp,
        };
        setAccuracy(Math.round(fix.accuracy));
        const added = acceptFix(prev.current, fix);
        if (added === null) return;
        prev.current = fix;
        path.current.push({ lat: fix.lat, lng: fix.lng });
        dist.current += added;
        setDistanceKm(dist.current);
        setStatus('recording');
      },
      (err) => {
        setError(
          err.code === err.PERMISSION_DENIED
            ? '위치 권한이 꺼져 있어요. 브라우저 설정에서 위치를 허용해 주세요.'
            : 'GPS 신호를 못 찾았어요. 하늘이 보이는 곳으로 가 보세요.',
        );
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 20_000 },
    );
  }, []);

  /** 기록을 끝내고 결과를 돌려줘요. 거리가 없으면 null. */
  const stop = useCallback((): RecordedRide | null => {
    cleanup();
    const result: RecordedRide = {
      startedAt: new Date(startedAt.current).toISOString(),
      distanceKm: dist.current,
      durationSec: Math.round((Date.now() - startedAt.current) / 1000),
      path: path.current,
    };
    setStatus('idle');
    return result.distanceKm > 0 ? result : null;
  }, [cleanup]);

  const cancel = useCallback(() => {
    cleanup();
    setStatus('idle');
  }, [cleanup]);

  return { status, distanceKm, elapsedSec, accuracy, error, start, stop, cancel };
}

export type Recorder = ReturnType<typeof useRecorder>;
