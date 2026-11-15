/**
 * 배치 설정. 모든 좌표는 360x780 가상 스테이지 기준(화면 크기에 맞게 자동 확대/축소).
 * 제공된 시안(407x880)을 0.8845배 한 값입니다.
 * 열쇠·자물쇠·집게·캡슐은 각각 개별적으로 위치/크기를 조정할 수 있습니다.
 */
export interface Rect { x: number; y: number; w: number; h: number }

export const STAGE = { width: 360, height: 780 };

export const INTRO_LAYOUT = {
  // 제공된 배경(924x2000)을 스테이지에 맞춘 뒤 자물쇠 영역(lock.png)의 위치
  lock: { x: 138.7, y: 406, w: 81.4, h: 107.1 } as Rect,
  /** 열쇠 구멍 위치 (자물쇠 영역 안의 비율) */
  keyhole: { fx: 0.507, fy: 0.72 },
  /** 열쇠 크기(key.png 는 끝이 위를 향한 세로 이미지), tip = 열쇠 끝의 비율 위치 */
  key: { w: 44, h: 110, tip: { fx: 0.5, fy: 0.01 } },
  /** 열쇠가 처음 숨어 있는 아래 오프셋(px) / 접근 중 멈춤 거리(px) */
  keyStartOffset: 420,
  keyApproachOffset: 46,
  keyTurnDegrees: 90,
};

export const MACHINE_LAYOUT = {
  /** machine.png 를 놓을 영역 (기본: 스테이지 전체) */
  machineImage: { x: 0, y: 0, w: 360, h: 780 } as Rect,
  frame: { x: 16, y: 71, w: 329, h: 688 } as Rect,
  topStrip: { x: 32, y: 87, w: 297, h: 24 } as Rect,
  glass: { x: 32, y: 127, w: 297, h: 429 } as Rect,
  railY: 148,
  railX: { min: 46, max: 315 },
  floorY: 501,
  dividerY: 670,

  clawStartX: 180,
  clawMinX: 66,
  clawMaxX: 296,
  /** 집게 허브(줄이 연결되는 점)의 대기 높이 */
  clawRestY: 178,
  /** 허공(캡슐 없음)에서 내려가는 깊이 */
  clawMissY: 430,
  /** 집게 허브 → 잡은 캡슐 중심까지 거리 */
  carryOffset: 24,
  /** 집게 크기(px). claw.png 사용 시 이 크기로 표시, 허브 = 이미지 위에서 6px 아래 중앙 */
  claw: { w: 46, h: 52 },

  capsuleSize: 36,
  /** 캡슐별 위치(중심 좌표). id는 config/rewards.ts 와 동일. 04는 위에 쌓인 캡슐 */
  capsules: {
    'capsule-01': { x: 212, y: 483, scale: 1, rotate: 0 },
    'capsule-02': { x: 249, y: 483, scale: 1, rotate: 0 },
    'capsule-03': { x: 286, y: 483, scale: 1, rotate: 0 },
    'capsule-04': { x: 249, y: 453, scale: 1, rotate: 0 },
  } as Record<string, { x: number; y: number; scale: number; rotate: number }>,

  outlet: { x: 32, y: 569, w: 87, h: 88 } as Rect,
  outletX: 75.5,
  outletCapsuleY: 625,

  controls: {
    left: { cx: 240.6, cy: 613, r: 25.6 },
    right: { cx: 303.4, cy: 613, r: 25.6 },
    grab: { x: 32, y: 685, w: 297, h: 59 } as Rect,
  },
};
