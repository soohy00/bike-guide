import { describe, expect, it } from 'vitest';
import { acceptFix, avgSpeedKmh, formatDuration, haversineKm, type Fix } from './geo';

describe('haversineKm', () => {
  it('measures Seoul City Hall to Gangnam Station at about 8.8 km', () => {
    const d = haversineKm({ lat: 37.5663, lng: 126.9779 }, { lat: 37.4979, lng: 127.0276 });
    expect(d).toBeGreaterThan(8.5);
    expect(d).toBeLessThan(9.1);
  });
});

describe('acceptFix', () => {
  const base: Fix = { lat: 37.5, lng: 127, accuracy: 5, time: 0 };

  it('accepts the first good fix with zero distance', () => {
    expect(acceptFix(null, base)).toBe(0);
  });

  it('rejects inaccurate fixes', () => {
    expect(acceptFix(null, { ...base, accuracy: 100 })).toBeNull();
  });

  it('rejects tiny jitter', () => {
    expect(acceptFix(base, { ...base, lat: base.lat + 0.00001, time: 1000 })).toBeNull();
  });

  it('rejects impossible jumps', () => {
    // 1 km in 10 s = 360 km/h
    expect(acceptFix(base, { ...base, lat: base.lat + 0.009, time: 10_000 })).toBeNull();
  });

  it('accepts normal riding', () => {
    // about 100 m in 15 s = 24 km/h
    const km = acceptFix(base, { ...base, lat: base.lat + 0.0009, time: 15_000 });
    expect(km).not.toBeNull();
    expect(km!).toBeCloseTo(0.1, 2);
  });
});

describe('format helpers', () => {
  it('formats durations', () => {
    expect(formatDuration(65)).toBe('1:05');
    expect(formatDuration(3725)).toBe('1:02:05');
  });

  it('computes average speed', () => {
    expect(avgSpeedKmh(30, 3600)).toBe(30);
    expect(avgSpeedKmh(10, 0)).toBe(0);
  });
});
