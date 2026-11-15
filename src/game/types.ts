export type GamePhase =
  | 'INTRO'
  | 'UNLOCKING'
  | 'MACHINE_IDLE'
  | 'CLAW_MOVING'
  | 'CLAW_GRABBING'
  | 'CLAW_RETURNING'
  | 'CAPSULE_OPENING'
  | 'REWARD_REVEAL'
  | 'COLLECTION'
  | 'MESSAGE_ARRIVAL' // 엔딩: "메세지 창이 도착했습니다!"
  | 'MESSAGE_OPEN' // 엔딩: 편지 확인
  | 'GAME_OVER'; // 엔딩: 최종 종료

export type CapsuleStatus = 'AVAILABLE' | 'IN_PROGRESS' | 'SAVED';

export interface CapsuleDef { id: string; rewardId: string; color: string }
export interface RewardDef {
  id: string;
  name: string;
  description: string;
  color: string;
  shape: 'star' | 'moon' | 'flower' | 'cloud';
}

/** 저장되는 "확정" 상태. 진행 중(IN_PROGRESS) 같은 일시 상태는 저장하지 않음. */
export interface PersistedState {
  version: 1;
  hearts: number;
  /** 캡슐 ID → 저장된 보상 ID (캡슐이 SAVED 상태이며 보관함에 등록됨) */
  saved: Record<string, string>;
  endingFinished: boolean;
}

/** 개발자 런타임 설정 (dev 서버에서만 override 가능) */
export interface RuntimeSettings {
  initialHearts: number;
  maxHearts: number;
  successProbability: number;
}
