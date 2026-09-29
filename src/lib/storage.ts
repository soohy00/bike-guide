import type { AppState } from '../types';

const KEY = 'bike-guide:v1';

export const EMPTY_STATE: AppState = { bike: null, parts: {}, rides: [] };

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY_STATE;
    const data = JSON.parse(raw) as Partial<AppState>;
    return {
      bike: data.bike ?? null,
      parts: data.parts ?? {},
      rides: Array.isArray(data.rides) ? data.rides : [],
    };
  } catch {
    return EMPTY_STATE;
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // 저장 공간이 없거나 막혔어요. 화면은 계속 동작해요.
  }
}

export function clearState(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // 무시해요
  }
}

export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
