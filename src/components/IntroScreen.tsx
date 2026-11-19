import { useEffect, useState } from 'react';
import { ASSETS } from '../config/assets';
import { INTRO_LAYOUT as L } from '../config/layout';
import { INTRO_TIMING as T } from '../config/timing';
import { useGame } from '../game/store';
import { AssetImage } from './AssetImage';
import { KeyAnimation, type KeyStage } from './KeyAnimation';
import { LockAnimation } from './LockAnimation';

/** 버튼 없이 자동 진행: 열쇠 등장 → 접근 → 삽입 → 회전 → 자물쇠 해제 → 배경 전환 */
export function IntroScreen() {
  const { dispatch } = useGame();
  const [key, setKey] = useState<KeyStage>('hidden');
  const [shake, setShake] = useState(false);
  const [open, setOpen] = useState(false);
  const [flash, setFlash] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const timers: number[] = [];
    let t = 0;
    const at = (delay: number, fn: () => void) => { t += delay; timers.push(window.setTimeout(fn, t)); };
    at(T.startDelay, () => setKey('rise'));
    at(T.keyRise, () => setKey('insert'));
    at(T.keyInsert, () => { setKey('turn'); dispatch({ type: 'START_UNLOCK' }); });
    at(T.keyTurn * 0.7, () => setShake(true));
    at(T.keyTurn * 0.3, () => { setOpen(true); setFlash(true); setKey('gone'); });
    at(T.lockOpen, () => setLeaving(true));
    at(T.bgTransition, () => dispatch({ type: 'INTRO_DONE' }));
    return () => timers.forEach(clearTimeout);
  }, [dispatch]);

  return (
    <div className={`intro ${leaving ? 'leaving' : ''}`} style={{ ['--bg-ms' as string]: `${T.bgTransition}ms` }}>
      <AssetImage src={ASSETS.intro.background} fallback={<div className="intro-bg-placeholder" />} className="fill" fit="cover" />
      <LockAnimation shaking={shake} open={open} />
      <KeyAnimation stage={key} />
      {flash && <div className="flash" style={{ left: L.lock.x + L.lock.w / 2, top: L.lock.y + L.lock.h / 2 }} />}
    </div>
  );
}
