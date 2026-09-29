import type { BikeModel } from '../types';

/**
 * 예시 로드 자전거 목록.
 * 실제 자전거는 연식과 등급에 따라 부품이 달라요. 기본값으로만 써요.
 */
export const BIKE_MODELS: BikeModel[] = [
  { id: 'giant-contend', brand: 'Giant', name: 'Contend', groupset: 'Shimano Claris', speeds: 8, brakeType: 'rim', tireSize: '700x28c' },
  { id: 'giant-tcr', brand: 'Giant', name: 'TCR Advanced', groupset: 'Shimano 105', speeds: 12, brakeType: 'disc', tireSize: '700x28c' },
  { id: 'specialized-allez', brand: 'Specialized', name: 'Allez', groupset: 'Shimano Claris', speeds: 8, brakeType: 'rim', tireSize: '700x25c' },
  { id: 'specialized-tarmac', brand: 'Specialized', name: 'Tarmac SL7 Sport', groupset: 'Shimano 105', speeds: 11, brakeType: 'disc', tireSize: '700x26c' },
  { id: 'trek-domane-al', brand: 'Trek', name: 'Domane AL 2', groupset: 'Shimano Claris', speeds: 8, brakeType: 'rim', tireSize: '700x32c' },
  { id: 'trek-emonda', brand: 'Trek', name: 'Émonda SL 5', groupset: 'Shimano 105', speeds: 11, brakeType: 'disc', tireSize: '700x25c' },
  { id: 'cannondale-caad', brand: 'Cannondale', name: 'CAAD Optimo', groupset: 'Shimano Sora', speeds: 9, brakeType: 'rim', tireSize: '700x25c' },
  { id: 'merida-scultura', brand: 'Merida', name: 'Scultura Rim 400', groupset: 'Shimano 105', speeds: 11, brakeType: 'rim', tireSize: '700x25c' },
  { id: 'canyon-endurace', brand: 'Canyon', name: 'Endurace 7', groupset: 'Shimano 105', speeds: 12, brakeType: 'disc', tireSize: '700x30c' },
  { id: 'samchuly-cello', brand: '삼천리 (첼로)', name: '입문 로드', groupset: 'Shimano Tourney', speeds: 7, brakeType: 'rim', tireSize: '700x25c' },
  { id: 'unknown', brand: '잘 몰라요', name: '일반 로드 자전거', groupset: 'Shimano Claris', speeds: 8, brakeType: 'rim', tireSize: '700x25c' },
];

export function findModel(id: string | undefined): BikeModel {
  return BIKE_MODELS.find((m) => m.id === id) ?? BIKE_MODELS[BIKE_MODELS.length - 1];
}
