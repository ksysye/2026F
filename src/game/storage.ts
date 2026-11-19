import { GAME_CONFIG } from '../config/gameConfig';
import type { PersistedState, RuntimeSettings } from './types';

/**
 * 저장소 어댑터. 지금은 localStorage 이지만,
 * 회원 계정/서버 DB 연결 시 같은 인터페이스로 서버 API 구현체를 만들어 교체하세요.
 * (서버 연동 시 하트·보상 지급은 서버에서 검증해야 클라이언트 조작을 막을 수 있습니다.)
 */
export interface StorageAdapter {
  load(): PersistedState | null;
  save(state: PersistedState): void;
  clear(): void;
}

const safe = <T,>(fn: () => T, fallback: T): T => {
  try { return fn(); } catch { return fallback; }
};

export const localStorageAdapter: StorageAdapter = {
  load() {
    return safe(() => {
      const raw = localStorage.getItem(GAME_CONFIG.storageKey);
      if (!raw) return null;
      const d = JSON.parse(raw);
      if (d?.version !== 1 || typeof d.hearts !== 'number' || typeof d.saved !== 'object' || d.saved === null) return null;
      return d as PersistedState;
    }, null);
  },
  save(state) { safe(() => localStorage.setItem(GAME_CONFIG.storageKey, JSON.stringify(state)), undefined); },
  clear() {
    safe(() => {
      localStorage.removeItem(GAME_CONFIG.storageKey);
      localStorage.removeItem(`${GAME_CONFIG.storageKey}/dev`);
    }, undefined);
  },
};

export const storage: StorageAdapter = GAME_CONFIG.persistGameState
  ? localStorageAdapter
  : { load: () => null, save: () => undefined, clear: () => undefined };

/** 개발자 설정. 프로덕션 빌드에서는 override 를 절대 읽지 않습니다. */
export const IS_DEV = import.meta.env.DEV;
const devKey = `${GAME_CONFIG.storageKey}/dev`;

export function loadSettings(): RuntimeSettings {
  const base: RuntimeSettings = {
    initialHearts: GAME_CONFIG.initialHearts,
    maxHearts: GAME_CONFIG.maxHearts,
    successProbability: GAME_CONFIG.successProbability,
  };
  if (!IS_DEV) return base;
  return { ...base, ...safe(() => JSON.parse(localStorage.getItem(devKey) ?? '{}'), {}) };
}

export function saveSettings(s: RuntimeSettings) {
  if (!IS_DEV) return;
  safe(() => localStorage.setItem(devKey, JSON.stringify(s)), undefined);
}
