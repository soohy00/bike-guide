import { describe, expect, it } from 'vitest';
import { BIKE_HOTSPOTS } from './bikeHotspots';
import { PARTS } from './parts';

describe('BIKE_HOTSPOTS', () => {
  it('has a spot for every part except the shop checkup', () => {
    const ids = PARTS.map((p) => p.id).filter((id) => id !== 'checkup');
    expect(Object.keys(BIKE_HOTSPOTS).sort()).toEqual(ids.sort());
  });
});
