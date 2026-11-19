/**
 * 입장 암호 화면 (배포본 전용: 개발 서버 `npm run dev` 에서는 자동으로 꺼짐)
 * 주의: 정적 사이트라 암호가 코드에 들어 있습니다. 실수로 열어보는 것을 막는 용도이며,
 *       개발자 도구를 쓰는 사람은 우회할 수 있습니다.
 */
export const GATE_CONFIG = {
  enabled: true,
  password: '1107',
  /** 한 번 통과하면 이 브라우저에서 기억 */
  remember: true,
  storageKey: 'capsule-claw-game/v1/gate',
};

export const gateActive = () => GATE_CONFIG.enabled && !import.meta.env.DEV;

export const isGateUnlocked = () => {
  try { return GATE_CONFIG.remember && localStorage.getItem(GATE_CONFIG.storageKey) === '1'; } catch { return false; }
};

export const rememberGateUnlock = () => {
  try { if (GATE_CONFIG.remember) localStorage.setItem(GATE_CONFIG.storageKey, '1'); } catch { /* ignore */ }
};
