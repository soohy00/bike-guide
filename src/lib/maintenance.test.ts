import { describe, expect, it } from 'vitest';
import { allPartHealth, byUrgency, partHealth, statusLabel, totalKm } from './maintenance';
import { PARTS, findPart } from '../data/parts';
import type { AppState } from '../types';

const chain = findPart('chain')!;
const barTape = findPart('bar-tape')!;
const created = '2026-01-01T00:00:00.000Z';

describe('totalKm', () => {
  it('adds rides to the starting odometer', () => {
    const state: Pick<AppState, 'bike' | 'rides'> = {
      bike: { modelId: 'unknown', nickname: '', startKm: 100, createdAt: created },
      rides: [
        { id: 'a', date: created, distanceKm: 20.5, durationSec: 3600, source: 'manual' },
        { id: 'b', date: created, distanceKm: 9.5, durationSec: 1800, source: 'gps' },
      ],
    };
    expect(totalKm(state)).toBe(130);
  });
});

describe('partHealth', () => {
  const now = new Date('2026-02-01T00:00:00.000Z');

  it('is ok when little used', () => {
    const h = partHealth(chain, undefined, 1000, created, now);
    expect(h.status).toBe('ok');
    expect(h.leftKm).toBe(2000);
  });

  it('is soon at 80% of the interval', () => {
    expect(partHealth(chain, undefined, 2400, created, now).status).toBe('soon');
  });

  it('is now at or past the interval', () => {
    const h = partHealth(chain, undefined, 3100, created, now);
    expect(h.status).toBe('now');
    expect(h.leftKm).toBe(-100);
    expect(statusLabel(h)).toBe('지금 교체');
  });

  it('counts from the last replacement', () => {
    const h = partHealth(chain, { replacedAtKm: 3000, replacedAt: created }, 3500, created, now);
    expect(h.usedKm).toBe(500);
    expect(h.status).toBe('ok');
  });

  it('becomes due by time even with low km', () => {
    const later = new Date('2027-02-01T00:00:00.000Z');
    const h = partHealth(barTape, undefined, 100, created, later);
    expect(h.status).toBe('now');
    expect(h.dueByTime).toBe(true);
  });
});

describe('byUrgency', () => {
  it('puts the most worn part first', () => {
    const state: AppState = {
      bike: { modelId: 'unknown', nickname: '', startKm: 400, createdAt: created },
      parts: {},
      rides: [],
    };
    const sorted = byUrgency(allPartHealth(state, PARTS, new Date(created)));
    expect(sorted[0].part.id).toBe('chain-lube');
  });
});
