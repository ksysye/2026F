import { ASSETS } from '../config/assets';
import { INTRO_LAYOUT as L } from '../config/layout';
import { INTRO_TIMING as T } from '../config/timing';
import { AssetImage } from './AssetImage';
import { PlaceholderLock } from './placeholders';

/** 자물쇠: 열쇠가 돌아가면 흔들리며 열리고 떨어져 사라진다. */
export function LockAnimation({ shaking, open }: { shaking: boolean; open: boolean }) {
  return (
    <div
      className={`lock-wrap ${shaking ? 'shaking' : ''} ${open ? 'open' : ''}`}
      style={{ left: L.lock.x, top: L.lock.y, width: L.lock.w, height: L.lock.h, ['--lock-ms' as string]: `${T.lockOpen}ms` }}
    >
      <AssetImage src={ASSETS.intro.lock} fallback={<PlaceholderLock open={open} />} />
    </div>
  );
}
