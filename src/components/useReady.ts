import { useCallback, useEffect, useRef, useState } from 'react';
import { UI_TIMING } from '../config/timing';

/** 화면이 나타난 뒤 일정 시간 동안 버튼을 잠가 두 번 눌러 넘어가는 것을 막는다. */
export function useReady(ms: number = UI_TIMING.buttonReadyDelay) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return ready;
}

/** 한 번 누르면 cooldown 동안 추가 클릭 무시 */
export function useClickGuard(cooldown: number = UI_TIMING.clickCooldown) {
  const last = useRef(0);
  return useCallback(
    (fn: () => void) => () => {
      const now = performance.now();
      if (now - last.current < cooldown) return;
      last.current = now;
      fn();
    },
    [cooldown],
  );
}
