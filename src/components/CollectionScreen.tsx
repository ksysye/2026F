import { useState } from 'react';
import { CAPSULES, getReward } from '../config/rewards';
import { activeCapsules, useGame } from '../game/store';
import { RewardVisual } from './RewardVisual';

/** 보관함: 4개 슬롯(저장한 것만 공개, 나머지는 실루엣). 하트 0이어도 접근 가능(엔딩 전). */
export function CollectionScreen() {
  const { state, dispatch, collectedCount, totalCount } = useGame();
  const [detail, setDetail] = useState<string | null>(null);
  const complete = collectedCount === totalCount;
  return (
    <div className={`overlay collection ${complete ? 'complete' : ''}`}>
      <div className="col-head">
        <span className="count" data-testid="count">{collectedCount}/{totalCount}</span>
        {complete && <span className="done-star" aria-label="수집 완료">★</span>}
      </div>
      <div className="col-grid">
        {activeCapsules().map((c) => {
          const rid = state.saved[c.id] ?? CAPSULES.find((x) => x.id === c.id)!.rewardId;
          const reward = getReward(rid);
          const got = !!state.saved[c.id];
          return (
            <button
              key={c.id}
              type="button"
              className={`slot ${got ? 'got' : 'empty'}`}
              data-slot={c.id}
              data-got={got}
              disabled={!got}
              onClick={() => setDetail(c.id)}
            >
              <div className="slot-img"><RewardVisual reward={reward} silhouette={!got} /></div>
              {got && <span className="slot-name">{reward.name}</span>}
            </button>
          );
        })}
      </div>
      <button type="button" className="pill" data-testid="col-close" onClick={() => dispatch({ type: 'CLOSE_COLLECTION' })}>닫기</button>

      {detail && state.saved[detail] && (
        <div className="detail" onClick={() => setDetail(null)}>
          <div className="detail-card" onClick={(e) => e.stopPropagation()}>
            <div className="detail-img"><RewardVisual reward={getReward(state.saved[detail])} /></div>
            <h2>{getReward(state.saved[detail]).name}</h2>
            <p>{getReward(state.saved[detail]).description}</p>
            <button type="button" className="pill" data-testid="detail-close" onClick={() => setDetail(null)}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
}
