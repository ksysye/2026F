import { useState } from 'react';
import { CAPSULES, LETTER_TO, getReward } from '../config/rewards';
import { activeCapsules, useGame } from '../game/store';
import { PlaceholderHeart } from './placeholders';
import { RewardVisual } from './RewardVisual';
import { useClickGuard } from './useReady';

const BackButton = ({ onClick, testId }: { onClick: () => void; testId: string }) => (
  <button type="button" className="back-btn" aria-label="뒤로" data-testid={testId} onClick={onClick}>
    <svg viewBox="0 0 24 24" width="55%" height="55%"><path d="M15 5l-7 7 7 7" fill="none" stroke="#111" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
  </button>
);

/** 첨부 사진 (불러오지 못하면 숨김). 누르면 확대 */
function Photo({ src, onOpen }: { src: string; onOpen: (s: string) => void }) {
  const [bad, setBad] = useState(false);
  if (bad) return null;
  return (
    <button type="button" className="photo" onClick={() => onOpen(src)}>
      <img src={src} alt="" draggable={false} onError={() => setBad(true)} />
    </button>
  );
}

/** 보관함(시안): 열어 본 메시지 n/4, 2x2 카드. 저장한 카드를 누르면 편지지 상세. */
export function CollectionScreen() {
  const { state, dispatch, collectedCount, totalCount } = useGame();
  const [detail, setDetail] = useState<string | null>(null);
  const [pop, setPop] = useState(false);
  const [zoom, setZoom] = useState<string | null>(null);
  const guard = useClickGuard();
  const complete = collectedCount === totalCount;

  if (detail && state.saved[detail]) {
    const reward = getReward(state.saved[detail]);
    return (
      <div className="overlay collection detail-page" key="detail">
        <div className="col-top">
          <BackButton testId="detail-close" onClick={guard(() => setDetail(null))} />
          <h1>{reward.name}</h1>
        </div>
        <div className="letter-card">
          <div className="letter-scroll">
            <div className="letter-to">FOR<br />{LETTER_TO}</div>
            <hr className="dots" />
            <p className="letter-body">{reward.message}</p>
            {reward.photos.length > 0 && (
              <div className="photos">
                {reward.photos.map((src) => <Photo key={src} src={src} onOpen={setZoom} />)}
              </div>
            )}
          </div>
          <div className="letter-from">— {reward.sender}</div>
          <button type="button" className={`heart-fab ${pop ? 'pop' : ''}`} aria-label="하트" onClick={() => { setPop(false); requestAnimationFrame(() => setPop(true)); }}>
            <PlaceholderHeart color="#fff" />
          </button>
        </div>
        {zoom && <div className="lightbox" onClick={() => setZoom(null)}><img src={zoom} alt="" /></div>}
      </div>
    );
  }

  return (
    <div className={`overlay collection ${complete ? 'complete' : ''}`} key="list">
      <div className="col-top">
        <BackButton testId="col-close" onClick={guard(() => dispatch({ type: 'CLOSE_COLLECTION' }))} />
        <h1>보관함</h1>
      </div>
      <div className="col-meta">
        <span>열어 본 메시지</span>
        <span className="count dot-font" data-testid="count">{collectedCount}/{totalCount}</span>
      </div>
      <hr className="dots" />
      <div className="col-grid">
        {activeCapsules().map((c, i) => {
          const got = !!state.saved[c.id];
          const reward = getReward(state.saved[c.id] ?? CAPSULES.find((x) => x.id === c.id)!.rewardId);
          return (
            <button
              key={c.id}
              type="button"
              className={`slot ${got ? 'got' : 'empty'}`}
              data-slot={c.id}
              data-got={got}
              disabled={!got}
              onClick={guard(() => setDetail(c.id))}
            >
              <span className="slot-no dot-font">{String(i + 1).padStart(2, '0')}</span>
              {!got && <span className="slot-dot" />}
              <div className="slot-img"><RewardVisual reward={reward} /></div>
              <span className="slot-name">{reward.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
