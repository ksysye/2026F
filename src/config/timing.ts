/** 각 애니메이션을 독립적으로 조정하는 타이밍(ms) */
export const INTRO_TIMING = {
  startDelay: 700,
  keyRise: 1300, // 열쇠가 아래에서 자물쇠로 접근
  keyInsert: 500, // 열쇠 구멍에 삽입
  keyTurn: 800, // 열쇠 회전
  lockOpen: 1000, // 자물쇠 열림/떨어짐
  bgTransition: 1300, // 배경 전환(인트로 → 기계)
};

export const OPENING_TIMING = {
  pop: 600, // 캡슐 등장
  shake: 1300, // 흔들림 + 빛
  lidOpen: 600, // 뚜껑 열림
  reveal: 1300, // 보상 등장
};

export const CLAW_TIMING = {
  descend: 1100,
  settle: 200,
  close: 450,
  ascend: 1100,
  carry: 1300,
  release: 350,
  drop: 550,
  afterDrop: 400,
};

export const ENDING_TIMING = {
  letterOpen: 1500,
  letterClose: 700,
  fadeOut: 1100,
};
