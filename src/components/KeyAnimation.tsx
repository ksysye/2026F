import { ASSETS } from '../config/assets';
import { INTRO_LAYOUT as L } from '../config/layout';
import { INTRO_TIMING as T } from '../config/timing';
import { AssetImage } from './AssetImage';
import { PlaceholderKey } from './placeholders';

export type KeyStage = 'hidden' | 'rise' | 'insert' | 'turn' | 'gone';

/** 열쇠: 아래에서 등장 → 접근 → 삽입 → 회전. 열쇠 끝(tip)이 열쇠 구멍에 오도록 배치. */
export function KeyAnimation({ stage }: { stage: KeyStage }) {
  const hole = { x: L.lock.x + L.lock.w * L.keyhole.fx, y: L.lock.y + L.lock.h * L.keyhole.fy };
  const left = hole.x - L.key.w * L.key.tip.fx;
  const top = hole.y - L.key.h * L.key.tip.fy;

  const transforms: Record<KeyStage, { t: string; o: number; ms: number; ease: string }> = {
    hidden: { t: `translateY(${L.keyStartOffset}px)`, o: 0, ms: 0, ease: 'ease' },
    rise: { t: `translateY(${L.keyApproachOffset}px)`, o: 1, ms: T.keyRise, ease: 'cubic-bezier(.3,.8,.3,1)' },
    insert: { t: 'translateY(0) scale(.96)', o: 1, ms: T.keyInsert, ease: 'ease-in-out' },
    turn: { t: `translateY(0) scale(.96) rotate(${L.keyTurnDegrees}deg)`, o: 1, ms: T.keyTurn, ease: 'cubic-bezier(.5,0,.2,1)' },
    gone: { t: `translateY(0) scale(.9) rotate(${L.keyTurnDegrees}deg)`, o: 0, ms: 400, ease: 'ease-out' },
  };
  const c = transforms[stage];
  return (
    <div
      className="key-wrap"
      style={{
        left, top, width: L.key.w, height: L.key.h,
        transformOrigin: `${L.key.tip.fx * 100}% ${L.key.tip.fy * 100}%`,
        transform: c.t, opacity: c.o,
        transition: `transform ${c.ms}ms ${c.ease}, opacity ${stage === 'hidden' ? 0 : Math.min(c.ms, 700)}ms ease`,
      }}
    >
      <AssetImage src={ASSETS.intro.key} fallback={<PlaceholderKey />} />
    </div>
  );
}
