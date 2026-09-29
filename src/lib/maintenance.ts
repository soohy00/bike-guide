import type { AppState, PartRecord } from '../types';
import type { PartDef } from '../data/parts';

export type PartStatus = 'ok' | 'soon' | 'now';

export interface PartHealth {
  part: PartDef;
  /** 마지막 교체 뒤에 탄 거리 */
  usedKm: number;
  /** 남은 거리 (0보다 작으면 넘었어요) */
  leftKm: number;
  /** 0 = 새것, 1 = 교체할 때 */
  wear: number;
  status: PartStatus;
  /** 기간 때문에 교체할 때가 됐어요 */
  dueByTime: boolean;
}

export const SOON_AT = 0.8;
const DAY_MS = 24 * 60 * 60 * 1000;
const MONTH_MS = 30.44 * DAY_MS;

export function totalKm(state: Pick<AppState, 'bike' | 'rides'>): number {
  const start = state.bike?.startKm ?? 0;
  return state.rides.reduce((sum, r) => sum + r.distanceKm, start);
}

/**
 * 부품 상태를 계산해요.
 * 교체 기록이 없으면 "자전거를 산 뒤로 한 번도 안 바꿨다"고 봐요.
 * 그래서 거리는 0km부터, 기간은 앱에 등록한 날부터 세요.
 */
export function partHealth(
  part: PartDef,
  record: PartRecord | undefined,
  currentKm: number,
  bikeCreatedAt: string,
  now: Date = new Date(),
): PartHealth {
  const fromKm = record?.replacedAtKm ?? 0;
  const fromDate = new Date(record?.replacedAt ?? bikeCreatedAt);
  const usedKm = Math.max(0, currentKm - fromKm);
  const kmWear = usedKm / part.intervalKm;

  let timeWear = 0;
  if (part.intervalMonths) {
    const months = (now.getTime() - fromDate.getTime()) / MONTH_MS;
    timeWear = Math.max(0, months / part.intervalMonths);
  }

  const wear = Math.max(kmWear, timeWear);
  const status: PartStatus = wear >= 1 ? 'now' : wear >= SOON_AT ? 'soon' : 'ok';
  return {
    part,
    usedKm,
    leftKm: part.intervalKm - usedKm,
    wear,
    status,
    dueByTime: timeWear >= 1 && kmWear < 1,
  };
}

export function allPartHealth(state: AppState, parts: PartDef[], now: Date = new Date()): PartHealth[] {
  const km = totalKm(state);
  const createdAt = state.bike?.createdAt ?? now.toISOString();
  return parts.map((p) => partHealth(p, state.parts[p.id], km, createdAt, now));
}

/** 할 일이 급한 순서로 정렬해요 */
export function byUrgency(list: PartHealth[]): PartHealth[] {
  return [...list].sort((a, b) => b.wear - a.wear);
}

export function statusLabel(h: PartHealth): string {
  if (h.status === 'now') return `지금 ${h.part.actionWord}`;
  if (h.status === 'soon') return `곧 ${h.part.actionWord}`;
  return '좋아요';
}
