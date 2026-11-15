/**
 * 개발자 설정 (게임 규칙)
 * ---------------------------------------------------------------
 * 여기 값만 바꾸면 UI와 로직에 자동 반영됩니다.
 * 이미 저장된 게임(localStorage)은 저장된 하트 수를 유지하므로,
 * 새 값을 즉시 적용하려면 개발용 패널(Ctrl+Shift+D, dev 서버 전용)에서 초기화하세요.
 */
export const GAME_CONFIG = {
  /** 처음 시작할 때의 하트 수 */
  initialHearts: 3,
  /** 하트 최대 수 (HeartDisplay 슬롯 수) */
  maxHearts: 3,

  /** true: 실패했을 때만 하트 차감 (false면 성공 시에도 차감 - 테스트용) */
  deductHeartOnFailureOnly: true,

  /** 기계에 들어가는 캡슐 개수 (1~4, config/rewards.ts의 앞에서부터) */
  capsuleCount: 4,
  /** true: 캡슐마다 보상 고정. false: 뽑을 때마다 보상 랜덤 */
  fixedRewards: true,
  /** fixedRewards=false 일 때만 사용: 이미 저장한 보상 재등장 허용 여부 */
  allowDuplicateRewards: false,

  /** 집기 범위 안에서의 성공 확률 (0~1) */
  successProbability: 0.8,

  /** localStorage 저장 사용 여부 */
  persistGameState: true,

  /** 집게 중심과 캡슐 중심의 허용 거리(px, 스테이지 좌표) */
  grabRange: 22,
  /** 집게 좌우 이동 속도(px/s, 스테이지 좌표) */
  clawSpeed: 150,

  /** localStorage 키 (서버 연동 시 StorageAdapter 교체) */
  storageKey: 'capsule-claw-game/v1',
} as const;
