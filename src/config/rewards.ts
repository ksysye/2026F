import type { CapsuleDef, RewardDef } from '../game/types';

/** 편지를 받는 사람 (편지지 상단 "FOR ..." 에 표시) */
export const LETTER_TO = 'JIHO';
const LOREM = '[여기에 지호에게 전할 메시지를 적어 주세요]';
const SENDER = '[보내는 사람]';
const LETTER_01 = '지호야, 생일 축하해 주고 싶었는데\n수능 눈치 보느라 못 했어.\n\n손편지 증정식 해줄게.';
const LETTER_02 = '미국 여행 티켓이야.\n\n지호를 미국 여행에 초대할게.';

/**
 * 보상 정보 (이름/설명/본문/사진은 여기서 교체)
 * 사진 첨부: public/assets/photos/ 에 파일을 넣고 photos 에 경로를 적으세요. (여러 장 가능)
 *   예) photos: [ASSETS.photo('reward-01-a.jpg'), ASSETS.photo('reward-01-b.jpg')]
 */
export const REWARDS: RewardDef[] = [
  { id: 'reward-01', name: '편지 01', description: '생일 축하 편지', color: '#111111', shape: 'letter', message: LETTER_01, sender: SENDER, photos: [] },
  { id: 'reward-02', name: '초대장 02', description: '미국 여행 티켓', color: '#111111', shape: 'invitation', message: LETTER_02, sender: SENDER, photos: [] },
  { id: 'reward-03', name: '쪽지 03', description: '세 번째 메시지 설명이 들어갑니다.', color: '#111111', shape: 'note', message: LOREM, sender: SENDER, photos: [] },
  { id: 'reward-04', name: '엽서 04', description: '네 번째 메시지 설명이 들어갑니다.', color: '#111111', shape: 'postcard', message: LOREM, sender: SENDER, photos: [] },
];

/** 캡슐 ↔ 보상 고정 매핑 (fixedRewards=true) */
export const CAPSULES: CapsuleDef[] = [
  { id: 'capsule-01', rewardId: 'reward-01', color: '#111111' },
  { id: 'capsule-02', rewardId: 'reward-02', color: '#111111' },
  { id: 'capsule-03', rewardId: 'reward-03', color: '#111111' },
  { id: 'capsule-04', rewardId: 'reward-04', color: '#111111' },
];

export const getReward = (id: string) => REWARDS.find((r) => r.id === id)!;
