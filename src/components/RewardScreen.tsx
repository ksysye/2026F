import { getReward } from '../config/rewards';
import { useGame } from '../game/store';
import { RewardVisual } from './RewardVisual';
import { useClickGuard, useReady } from './useReady';

/** 보상 확인: 저장하기 → 보관함 등록 & 캡슐 제거 / 닫기 → 캡슐 복귀(하트 차감 없음) */
export function RewardScreen() {
  const { state, dispatch } = useGame();
  const reward = getReward(state.activeRewardId!);
  const ready = useReady();
  const guard = useClickGuard();
  return (
    <div className="overlay reveal-bg reward-screen">
      <div className="glow on" />
      <div className="reward-display">
        <div className="reward-img"><RewardVisual reward={reward} /></div>
        <h2>{reward.name}</h2>
        <p>{reward.description}</p>
      </div>
      <div className={`reward-actions ${ready ? 'ready' : ''}`}>
        <button type="button" className="pill primary" data-testid="save" disabled={!ready} onClick={guard(() => dispatch({ type: 'SAVE' }))}>보관함에 저장하기</button>
        <button type="button" className="pill" data-testid="close" disabled={!ready} onClick={guard(() => dispatch({ type: 'CLOSE_REWARD' }))}>닫기</button>
      </div>
    </div>
  );
}
