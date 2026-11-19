import { useEffect, useState } from 'react';
import { ASSETS } from '../config/assets';
import { CAPSULES, getReward } from '../config/rewards';
import { OPENING_TIMING as T } from '../config/timing';
import { useGame } from '../game/store';
import { CapsuleVisual } from './CapsuleVisual';
import { RewardVisual } from './RewardVisual';

type Step = 'pop' | 'shake' | 'open' | 'reveal';

/**
 * 캡슐 개봉: 등장 → 흔들림+빛 → 뚜껑 열림 → 보상 등장.
 * ASSETS.animations.capsuleOpening 에 영상 경로를 지정하면 영상이 먼저 재생됩니다(실패 시 CSS 연출).
 */
export function CapsuleOpeningScreen() {
  const { state, dispatch } = useGame();
  const capsule = CAPSULES.find((c) => c.id === state.activeCapsuleId)!;
  const reward = getReward(state.activeRewardId!);
  const [step, setStep] = useState<Step>('pop');
  const video = ASSETS.animations.capsuleOpening;
  const [videoOk, setVideoOk] = useState(!!video);

  useEffect(() => {
    if (videoOk) return;
    const timers: number[] = [];
    let t = 0;
    const at = (d: number, fn: () => void) => { t += d; timers.push(window.setTimeout(fn, t)); };
    at(T.pop, () => setStep('shake'));
    at(T.shake, () => setStep('open'));
    at(T.lidOpen, () => setStep('reveal'));
    at(T.reveal, () => dispatch({ type: 'OPENING_DONE' }));
    return () => timers.forEach(clearTimeout);
  }, [dispatch, videoOk]);

  if (videoOk && video) {
    return (
      <div className="overlay reveal-bg">
        <video
          className="opening-video"
          src={video}
          autoPlay
          playsInline
          muted
          onEnded={() => dispatch({ type: 'OPENING_DONE' })}
          onError={() => setVideoOk(false)}
        />
      </div>
    );
  }

  return (
    <div className={`overlay reveal-bg opening step-${step}`}>
      <div className="glow" />
      <div className="sparkles">{Array.from({ length: 8 }, (_, i) => <i key={i} style={{ ['--i' as string]: i }} />)}</div>
      <div className="cap-stack">
        <div className="cap-part bottom"><CapsuleVisual id={capsule.id} color={capsule.color} part="bottom" /></div>
        <div className="cap-reward"><RewardVisual reward={reward} /></div>
        <div className="cap-part top"><CapsuleVisual id={capsule.id} color={capsule.color} part="top" /></div>
      </div>
    </div>
  );
}
