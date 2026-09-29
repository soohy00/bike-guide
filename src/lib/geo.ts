import type { LatLng } from '../types';

const EARTH_KM = 6371;

function rad(d: number): number {
  return (d * Math.PI) / 180;
}

/** 두 점 사이 거리 (km) */
export function haversineKm(a: LatLng, b: LatLng): number {
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_KM * Math.asin(Math.sqrt(h));
}

export interface Fix extends LatLng {
  /** 정확도 (m) */
  accuracy: number;
  /** ms */
  time: number;
}

/** 이 값보다 정확도가 나쁘면 버려요 (m) */
export const MAX_ACCURACY_M = 30;
/** 이 값보다 짧게 움직이면 제자리 흔들림으로 봐요 (m) */
export const MIN_STEP_M = 5;
/** 자전거로 이것보다 빠를 수 없어요 (km/h) → GPS 튐 */
export const MAX_SPEED_KMH = 90;

/**
 * 새 GPS 점을 받을지 정해요.
 * 받으면 더할 거리(km)를, 버리면 null 을 돌려줘요.
 */
export function acceptFix(prev: Fix | null, next: Fix): number | null {
  if (next.accuracy > MAX_ACCURACY_M) return null;
  if (!prev) return 0;
  const km = haversineKm(prev, next);
  if (km * 1000 < MIN_STEP_M) return null;
  const hours = (next.time - prev.time) / 3_600_000;
  if (hours <= 0) return null;
  if (km / hours > MAX_SPEED_KMH) return null;
  return km;
}

export function formatDuration(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(r).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${m}:${ss}`;
}

export function avgSpeedKmh(distanceKm: number, durationSec: number): number {
  return durationSec > 0 ? distanceKm / (durationSec / 3600) : 0;
}
