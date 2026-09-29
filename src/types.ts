export type BrakeType = 'rim' | 'disc';

export interface BikeModel {
  id: string;
  brand: string;
  name: string;
  groupset: string;
  speeds: number;
  brakeType: BrakeType;
  tireSize: string;
}

export interface Bike {
  modelId: string;
  nickname: string;
  /** 앱에 등록할 때 이미 탄 거리 (km) */
  startKm: number;
  createdAt: string;
}

export interface PartRecord {
  /** 교체했을 때의 총 주행 거리 (km) */
  replacedAtKm: number;
  /** 교체한 날 (ISO) */
  replacedAt: string;
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Ride {
  id: string;
  date: string;
  distanceKm: number;
  durationSec: number;
  source: 'manual' | 'gps';
  note?: string;
  path?: LatLng[];
}

export interface AppState {
  bike: Bike | null;
  parts: Record<string, PartRecord>;
  rides: Ride[];
}
