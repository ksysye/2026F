import { createContext, useContext, useEffect, useMemo, useReducer, type Dispatch, type ReactNode } from 'react';
import { ENDING_CONFIG } from '../config/endingConfig';
import { GAME_CONFIG } from '../config/gameConfig';
import { CAPSULES } from '../config/rewards';
import { loadSettings, saveSettings, storage } from './storage';
import type { CapsuleDef, CapsuleStatus, GamePhase, PersistedState, RuntimeSettings } from './types';

export interface GameState {
  phase: GamePhase;
  hearts: number;
  saved: Record<string, string>; // capsuleId -> rewardId
  endingFinished: boolean;
  activeCapsuleId: string | null; // 뽑기 성공 후 진행 중인 캡슐 (저장하지 않음)
  activeRewardId: string | null;
  returnedCapsuleId: string | null; // 닫기 후 되돌아온 캡슐 (등장 효과용)
  lastSavedId: string | null;
  settings: RuntimeSettings;
}

export type Action =
  | { type: 'START_UNLOCK' }
  | { type: 'INTRO_DONE' }
  | { type: 'SET_PHASE'; phase: 'MACHINE_IDLE' | 'CLAW_MOVING' | 'CLAW_GRABBING' | 'CLAW_RETURNING' }
  | { type: 'FAIL' }
  | { type: 'CAPTURE'; capsuleId: string; rewardId: string }
  | { type: 'OPENING_DONE' }
  | { type: 'SAVE' }
  | { type: 'CLOSE_REWARD' }
  | { type: 'OPEN_COLLECTION' }
  | { type: 'CLOSE_COLLECTION' }
  | { type: 'ENDING_ARRIVE' }
  | { type: 'ENDING_OPEN' }
  | { type: 'ENDING_FINISH' }
  | { type: 'DEV_SET_HEARTS'; hearts: number }
  | { type: 'DEV_SET_SETTINGS'; settings: Partial<RuntimeSettings> }
  | { type: 'DEV_RESET_HEARTS' }
  | { type: 'DEV_RESET_ENDING' }
  | { type: 'DEV_RESET_ALL' };

const MACHINE_PHASES: GamePhase[] = ['MACHINE_IDLE', 'CLAW_MOVING', 'CLAW_GRABBING', 'CLAW_RETURNING'];
const clampHearts = (h: number, max: number) => Math.max(0, Math.min(max, Math.round(h)));

export const activeCapsules = (): CapsuleDef[] => CAPSULES.slice(0, GAME_CONFIG.capsuleCount);

/**
 * 개발자용 숨김 초기화: 주소 끝에 #reset 을 붙여 열면 저장 데이터를 지우고 처음부터 시작.
 * 기본은 꺼져 있고(일반 사용자 노출 없음), 테스트 배포본에서만 window.__ALLOW_HASH_RESET=true 로 켭니다.
 */
function maybeHashReset() {
  try {
    if ((window as { __ALLOW_HASH_RESET?: boolean }).__ALLOW_HASH_RESET && window.location.hash === '#reset') {
      storage.clear();
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  } catch { /* ignore */ }
}

function initState(): GameState {
  maybeHashReset();
  const settings = loadSettings();
  const p = storage.load();
  const validIds = new Set(activeCapsules().map((c) => c.id));
  const saved: Record<string, string> = {};
  if (p) for (const [k, v] of Object.entries(p.saved)) if (validIds.has(k)) saved[k] = v;
  const finished = !!(p?.endingFinished && ENDING_CONFIG.persistEnding);
  return {
    phase: finished ? 'GAME_OVER' : 'INTRO',
    hearts: p ? clampHearts(p.hearts, settings.maxHearts) : settings.initialHearts,
    saved,
    endingFinished: finished,
    activeCapsuleId: null,
    activeRewardId: null,
    returnedCapsuleId: null,
    lastSavedId: null,
    settings,
  };
}

function reducer(s: GameState, a: Action): GameState {
  switch (a.type) {
    case 'START_UNLOCK':
      return s.phase === 'INTRO' ? { ...s, phase: 'UNLOCKING' } : s;
    case 'INTRO_DONE':
      if (s.phase !== 'UNLOCKING' && s.phase !== 'INTRO') return s;
      // 새로고침 등으로 하트가 이미 0이면 곧바로 엔딩 이어서 진행
      return { ...s, phase: s.hearts <= ENDING_CONFIG.triggerHearts ? 'MESSAGE_ARRIVAL' : 'MACHINE_IDLE' };
    case 'SET_PHASE':
      return MACHINE_PHASES.includes(s.phase) ? { ...s, phase: a.phase } : s;
    case 'FAIL':
      // 실패했을 때만 하트 차감 (중복 방지는 호출 측에서 1회 호출 보장)
      return { ...s, hearts: Math.max(0, s.hearts - 1) };
    case 'CAPTURE':
      if (!MACHINE_PHASES.includes(s.phase) || s.saved[a.capsuleId]) return s;
      return {
        ...s,
        phase: 'CAPSULE_OPENING',
        activeCapsuleId: a.capsuleId,
        activeRewardId: a.rewardId,
        hearts: GAME_CONFIG.deductHeartOnFailureOnly ? s.hearts : Math.max(0, s.hearts - 1),
      };
    case 'OPENING_DONE':
      return s.phase === 'CAPSULE_OPENING' ? { ...s, phase: 'REWARD_REVEAL' } : s;
    case 'SAVE': {
      if (s.phase !== 'REWARD_REVEAL' || !s.activeCapsuleId || !s.activeRewardId) return s;
      const saved = s.saved[s.activeCapsuleId] ? s.saved : { ...s.saved, [s.activeCapsuleId]: s.activeRewardId };
      const next: GameState = {
        ...s, saved, lastSavedId: s.activeCapsuleId, activeCapsuleId: null, activeRewardId: null,
        phase: 'MACHINE_IDLE',
      };
      // 하트가 이미 0이면 엔딩 계속
      return s.hearts <= ENDING_CONFIG.triggerHearts && !s.endingFinished ? { ...next, phase: 'MESSAGE_ARRIVAL' } : next;
    }
    case 'CLOSE_REWARD':
      if (s.phase !== 'REWARD_REVEAL') return s;
      return {
        ...s, returnedCapsuleId: s.activeCapsuleId, activeCapsuleId: null, activeRewardId: null, phase: 'MACHINE_IDLE',
      };
    case 'OPEN_COLLECTION':
      return s.phase === 'MACHINE_IDLE' ? { ...s, phase: 'COLLECTION' } : s;
    case 'CLOSE_COLLECTION':
      return s.phase === 'COLLECTION' ? { ...s, phase: 'MACHINE_IDLE' } : s;
    case 'ENDING_ARRIVE':
      return s.endingFinished ? s : { ...s, phase: 'MESSAGE_ARRIVAL' };
    case 'ENDING_OPEN':
      return s.phase === 'MESSAGE_ARRIVAL' ? { ...s, phase: 'MESSAGE_OPEN' } : s;
    case 'ENDING_FINISH':
      return s.phase === 'MESSAGE_OPEN' ? { ...s, phase: 'GAME_OVER', endingFinished: true } : s;

    // ---- 개발자 전용 (dev 서버에서만 UI 노출) ----
    case 'DEV_SET_HEARTS':
      return { ...s, hearts: clampHearts(a.hearts, s.settings.maxHearts) };
    case 'DEV_SET_SETTINGS': {
      const settings = { ...s.settings, ...a.settings };
      settings.maxHearts = Math.max(1, Math.round(settings.maxHearts));
      settings.initialHearts = clampHearts(settings.initialHearts, settings.maxHearts);
      settings.successProbability = Math.min(1, Math.max(0, settings.successProbability));
      saveSettings(settings);
      return { ...s, settings, hearts: clampHearts(s.hearts, settings.maxHearts) };
    }
    case 'DEV_RESET_HEARTS':
      return { ...s, hearts: s.settings.initialHearts };
    case 'DEV_RESET_ENDING':
      return { ...s, endingFinished: false, hearts: s.settings.initialHearts, phase: 'MACHINE_IDLE' };
    case 'DEV_RESET_ALL': {
      storage.clear();
      const settings = loadSettings();
      return { ...initState(), settings, hearts: settings.initialHearts, phase: 'INTRO', saved: {}, endingFinished: false };
    }
    default:
      return s;
  }
}

interface Ctx {
  state: GameState;
  dispatch: Dispatch<Action>;
  capsuleStatus: (capsuleId: string) => CapsuleStatus;
  collectedCount: number;
  totalCount: number;
}
const GameContext = createContext<Ctx | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initState);

  // 확정된 상태만 저장 (진행 중 캡슐/애니메이션은 저장하지 않으므로 새로고침 시 AVAILABLE 로 안전 복원)
  useEffect(() => {
    const p: PersistedState = { version: 1, hearts: state.hearts, saved: state.saved, endingFinished: state.endingFinished };
    storage.save(p);
  }, [state.hearts, state.saved, state.endingFinished]);

  const value = useMemo<Ctx>(() => ({
    state,
    dispatch,
    capsuleStatus: (id) => (state.saved[id] ? 'SAVED' : state.activeCapsuleId === id ? 'IN_PROGRESS' : 'AVAILABLE'),
    collectedCount: Object.keys(state.saved).length,
    totalCount: activeCapsules().length,
  }), [state]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): Ctx {
  const c = useContext(GameContext);
  if (!c) throw new Error('useGame must be used inside GameProvider');
  return c;
}
