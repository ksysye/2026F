import type { CapsuleDef, RewardDef } from '../game/types';

/** 편지를 받는 사람 (편지지 상단 "FOR ..." 에 표시) */
export const LETTER_TO = 'JIHO';
const SENDER = '신예';
const LETTER_01 = '지호야, 생일 축하해 주고 싶었는데\n수능 눈치 보느라 못 했어.\n\n손편지 증정식 해줄게.';
const LETTER_02 = '미국 여행 티켓이얌.';
const LETTER_03 = '같이 밥 묵자\n\n나 창원에 내려가면 밥 사주마.\n먹고 싶은 거 생각해놔.';
const LETTER_04 = '생일 선물\n\n생일이 수능이랑 너무 가까워서\n문자 보낼까 오백번 고민한 것 같아.\n\n늦었지만 진짜 생일 축하해.\n갖고 싶은 거 생각해놔.';

/**
 * 보상 정보 (이름/설명/본문/사진은 여기서 교체)
 * 사진 첨부: public/assets/photos/ 에 파일을 넣고 photos 에 경로를 적으세요. (여러 장 가능)
 *   예) photos: [ASSETS.photo('reward-01-a.jpg'), ASSETS.photo('reward-01-b.jpg')]
 */
export const REWARDS: RewardDef[] = [
  { id: 'reward-01', name: '편지 01', description: '생일 축하 편지', color: '#111111', shape: 'letter', message: LETTER_01, sender: SENDER, photos: [] },
  { id: 'reward-02', name: '초대장 02', description: '미국 여행 티켓', color: '#111111', shape: 'invitation', message: LETTER_02, sender: SENDER, photos: [] },
  { id: 'reward-03', name: '쪽지 03', description: '같이 밥 묵자', color: '#111111', shape: 'note', message: LETTER_03, sender: SENDER, photos: [] },
  { id: 'reward-04', name: '엽서 04', description: '생일 선물', color: '#111111', shape: 'postcard', message: LETTER_04, sender: SENDER, photos: [] },
];

/** 캡슐 ↔ 보상 고정 매핑 (fixedRewards=true) */
export const CAPSULES: CapsuleDef[] = [
  { id: 'capsule-01', rewardId: 'reward-01', color: '#111111' },
  { id: 'capsule-02', rewardId: 'reward-02', color: '#111111' },
  { id: 'capsule-03', rewardId: 'reward-03', color: '#111111' },
  { id: 'capsule-04', rewardId: 'reward-04', color: '#111111' },
];

export const getReward = (id: string) => REWARDS.find((r) => r.id === id)!;
