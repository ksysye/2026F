import type { CapsuleDef, RewardDef } from '../game/types';

/** 보상 정보 (이름/설명은 여기서 교체) */
export const REWARDS: RewardDef[] = [
  { id: 'reward-01', name: '보상 01', description: '첫 번째 보상 설명이 들어갑니다.', color: '#ff8fb1', shape: 'star' },
  { id: 'reward-02', name: '보상 02', description: '두 번째 보상 설명이 들어갑니다.', color: '#7fc8ff', shape: 'moon' },
  { id: 'reward-03', name: '보상 03', description: '세 번째 보상 설명이 들어갑니다.', color: '#ffd166', shape: 'flower' },
  { id: 'reward-04', name: '보상 04', description: '네 번째 보상 설명이 들어갑니다.', color: '#9be3b0', shape: 'cloud' },
];

/** 캡슐 ↔ 보상 고정 매핑 (fixedRewards=true) */
export const CAPSULES: CapsuleDef[] = [
  { id: 'capsule-01', rewardId: 'reward-01', color: '#ff8fb1' },
  { id: 'capsule-02', rewardId: 'reward-02', color: '#7fc8ff' },
  { id: 'capsule-03', rewardId: 'reward-03', color: '#ffd166' },
  { id: 'capsule-04', rewardId: 'reward-04', color: '#9be3b0' },
];

export const getReward = (id: string) => REWARDS.find((r) => r.id === id)!;
