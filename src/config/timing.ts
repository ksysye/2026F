/** 각 애니메이션을 독립적으로 조정하는 타이밍(ms). 전체적으로 천천히 진행되도록 설정. */
export const INTRO_TIMING = {
  startDelay: 1200,
  keyRise: 2000, // 열쇠가 아래에서 자물쇠로 접근
  keyInsert: 900, // 열쇠 구멍에 삽입
  keyTurn: 1300, // 열쇠 회전
  lockOpen: 1800, // 자물쇠 열림/떨어짐
  bgTransition: 2000, // 배경 전환(인트로 → 기계)
};

export const OPENING_TIMING = {
  pop: 1000, // 캡슐 등장
  shake: 2000, // 흔들림 + 빛
  lidOpen: 1100, // 뚜껑 열림
  reveal: 2200, // 보상 등장
};

export const CLAW_TIMING = {
  descend: 1600,
  settle: 400,
  close: 700,
  ascend: 1600,
  carry: 1900,
  release: 600,
  drop: 800,
  afterDrop: 900,
};

export const ENDING_TIMING = {
  letterOpen: 2400,
  letterClose: 1000,
  fadeOut: 1800,
};

/** 화면 전환 직후 버튼이 눌리지 않는 시간(ms) — 실수로 연타해 넘어가는 것을 방지 */
export const UI_TIMING = {
  buttonReadyDelay: 1200,
  clickCooldown: 500,
};
