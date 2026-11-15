/**
 * 에셋 경로 설정.
 * public/assets/ 아래에 같은 이름의 파일을 넣으면 임시(플레이스홀더) 그림 대신 자동으로 사용됩니다.
 * 파일이 없거나 불러오지 못하면 코드가 만든 임시 그림이 표시됩니다.
 * 확장자/이름을 바꾸고 싶으면 이 파일의 경로만 수정하세요.
 */
const base = `${import.meta.env.BASE_URL}assets/`;
// 단일 HTML로 배포할 때 이미지를 data URI로 주입하기 위한 선택적 후크 (일반 실행에는 영향 없음)
const overrides = (globalThis as { __ASSET_OVERRIDES?: Record<string, string> }).__ASSET_OVERRIDES;
const p = (path: string) => overrides?.[path] ?? `${base}${path}`;

export const ASSETS = {
  intro: {
    background: p('intro/background.png'),
    key: p('intro/key.png'),
    lock: p('intro/lock.png'),
  },
  machine: {
    background: p('machine/background.png'),
    /** 기계 프레임 이미지 (스테이지 전체 크기, 투명 유리 가능) */
    machine: p('machine/machine.png'),
    claw: p('machine/claw.png'),
    /** 선택: 집게가 닫힌 이미지. 없으면 claw.png 를 그대로 사용 */
    clawClosed: p('machine/claw-closed.png'),
    buttonLeft: p('machine/button-left.png'),
    buttonRight: p('machine/button-right.png'),
    buttonGrab: p('machine/button-grab.png'),
  },
  capsules: {
    'capsule-01': p('capsules/capsule-01.png'),
    'capsule-02': p('capsules/capsule-02.png'),
    'capsule-03': p('capsules/capsule-03.png'),
    'capsule-04': p('capsules/capsule-04.png'),
  } as Record<string, string>,
  rewards: {
    'reward-01': p('rewards/reward-01.png'),
    'reward-02': p('rewards/reward-02.png'),
    'reward-03': p('rewards/reward-03.png'),
    'reward-04': p('rewards/reward-04.png'),
  } as Record<string, string>,
  ui: {
    heart: p('ui/heart.png'),
    collection: p('ui/collection.png'),
  },
  animations: {
    /** 캡슐 개봉 영상. 영상 파일을 넣고 경로를 지정하면 CSS 애니메이션 대신 재생됩니다. */
    capsuleOpening: null as string | null, // 예: p('animations/capsule-opening.mp4')
  },
};
