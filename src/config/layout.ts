/**
 * 배치 설정. 모든 좌표는 360x640 가상 스테이지 기준(화면 크기에 맞게 자동 확대/축소).
 * 열쇠·자물쇠·집게·캡슐은 각각 개별적으로 위치/크기를 조정할 수 있습니다.
 */
export interface Rect { x: number; y: number; w: number; h: number }

export const STAGE = { width: 360, height: 640 };

export const INTRO_LAYOUT = {
  // 제공된 배경(924x2000, 세로 중앙 기준 cover)에서 자물쇠를 잘라낸 lock.png 의 위치
  lock: { x: 138.7, y: 336.4, w: 81.4, h: 107.1 } as Rect,
  /** 열쇠 구멍 위치 (자물쇠 영역 안의 비율) */
  keyhole: { fx: 0.507, fy: 0.72 },
  /** 열쇠 크기(key.png 는 끝이 위를 향한 세로 이미지), tip = 열쇠 끝의 비율 위치 */
  key: { w: 44, h: 110, tip: { fx: 0.5, fy: 0.01 } },
  /** 열쇠가 처음 숨어 있는 아래 오프셋(px) / 접근 중 멈춤 거리(px) */
  keyStartOffset: 380,
  keyApproachOffset: 46,
  keyTurnDegrees: 90,
};

export const MACHINE_LAYOUT = {
  /** machine.png 를 놓을 영역 (기본: 스테이지 전체) */
  machineImage: { x: 0, y: 0, w: 360, h: 640 } as Rect,
  frame: { x: 16, y: 54, w: 328, h: 552 } as Rect,
  glass: { x: 30, y: 96, w: 300, h: 334 } as Rect,
  railY: 106,
  floorY: 430,

  clawStartX: 180,
  clawMinX: 52,
  clawMaxX: 308,
  clawRestY: 132,
  /** 허공(캡슐 없음)에서 내려가는 깊이 */
  clawMissY: 372,
  /** 집게 허브 → 잡은 캡슐 중심까지 거리 */
  carryOffset: 30,
  /** 집게 시각 크기(px). claw.png 사용 시 이 크기로 표시, 허브 = 상단 중앙 */
  claw: { w: 84, h: 84 },

  capsuleSize: 48,
  /** 캡슐별 위치(중심 좌표). id는 config/rewards.ts 와 동일 */
  capsules: {
    'capsule-01': { x: 134, y: 404, scale: 1, rotate: -8 },
    'capsule-02': { x: 187, y: 404, scale: 1, rotate: 6 },
    'capsule-03': { x: 240, y: 404, scale: 1, rotate: -4 },
    'capsule-04': { x: 293, y: 404, scale: 1, rotate: 10 },
  } as Record<string, { x: number; y: number; scale: number; rotate: number }>,

  outlet: { x: 30, y: 436, w: 84, h: 76 } as Rect,
  outletX: 66,
  outletCapsuleY: 478,

  controls: {
    left: { cx: 62, cy: 562, r: 26 },
    right: { cx: 126, cy: 562, r: 26 },
    grab: { cx: 284, cy: 558, r: 34 },
  },
};
