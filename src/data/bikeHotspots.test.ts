import { describe, expect, it } from 'vitest';
import { BIKE_HOTSPOTS, hotspotsFor } from './bikeHotspots';
import { PARTS } from './parts';

describe('BIKE_HOTSPOTS', () => {
  it('has a spot for every part except the shop checkup', () => {
    const ids = PARTS.map((p) => p.id).filter((id) => id !== 'checkup');
    expect(Object.keys(BIKE_HOTSPOTS).sort()).toEqual(ids.sort());
  });

  it('moves the brake pad spot to the caliper on disc brakes', () => {
    expect(Object.keys(hotspotsFor('disc')).sort()).toEqual(Object.keys(BIKE_HOTSPOTS).sort());
    expect(hotspotsFor('disc')['brake-pads']).not.toEqual(hotspotsFor('rim')['brake-pads']);
  });
});
