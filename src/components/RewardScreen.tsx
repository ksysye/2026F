import { getReward } from '../config/rewards';
import { useGame } from '../game/store';
import { RewardVisual } from './RewardVisual';

/** 보상 확인: 저장하기 → 보관함 등록 & 캡슐 제거 / 닫기 → 캡슐 복귀(하트 차감 없음) */
export function RewardScreen() {
  const { state, dispatch } = useGame();
  const reward = getReward(state.activeRewardId!);
  return (
    <div className="overlay reveal-bg reward-screen">
      <div className="glow on" />
      <div className="reward-display">
        <div className="reward-img"><RewardVisual reward={reward} /></div>
        <h2>{reward.name}</h2>
        <p>{reward.description}</p>
      </div>
      <div className="reward-actions">
        <button type="button" className="pill primary" data-testid="save" onClick={() => dispatch({ type: 'SAVE' })}>보관함에 저장하기</button>
        <button type="button" className="pill" data-testid="close" onClick={() => dispatch({ type: 'CLOSE_REWARD' })}>닫기</button>
      </div>
    </div>
  );
}
