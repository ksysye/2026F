import { useCallback, useEffect, useRef, useState } from 'react';
import { ASSETS } from '../config/assets';
import { GAME_CONFIG } from '../config/gameConfig';
import { ENDING_CONFIG } from '../config/endingConfig';
import { MACHINE_LAYOUT as L } from '../config/layout';
import { REWARDS } from '../config/rewards';
import { CLAW_TIMING as T } from '../config/timing';
import { clamp, easeIn, easeInOut, easeOut, easeOutBounce, lerp, linear, sleep, tween } from '../game/anim';
import { activeCapsules, useGame } from '../game/store';
import { AssetImage } from './AssetImage';
import { CapsuleContainer, type Offsets } from './CapsuleContainer';
import { ClawController } from './ClawController';
import { HeartDisplay } from './HeartDisplay';
import { MachineControls } from './MachineControls';
import { PlaceholderCollectionIcon } from './placeholders';

const rectStyle = (r: { x: number; y: number; w: number; h: number }) => ({ left: r.x, top: r.y, width: r.w, height: r.h });

export function ClawMachineScreen() {
  const { state, dispatch, capsuleStatus, collectedCount, totalCount } = useGame();
  const [claw, setClaw] = useState({ x: L.clawStartX, y: L.clawRestY, grip: 0 });
  const clawRef = useRef(claw);
  const [offsets, setOffsets] = useState<Offsets>({});
  const [carryId, setCarryId] = useState<string | null>(null);
  const [dir, setDir] = useState<-1 | 0 | 1>(0);
  const busy = useRef(false);
  const alive = useRef(true);
  const stateRef = useRef(state);
  stateRef.current = state;
  const statusRef = useRef(capsuleStatus);
  statusRef.current = capsuleStatus;

  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  const isAlive = useCallback(() => alive.current, []);

  const patch = useCallback((p: Partial<typeof claw>) => {
    clawRef.current = { ...clawRef.current, ...p };
    setClaw(clawRef.current);
  }, []);

  const canControl = () => ['MACHINE_IDLE', 'CLAW_MOVING'].includes(stateRef.current.phase) && !busy.current && stateRef.current.hearts > 0;

  const press = useCallback((d: -1 | 0 | 1) => {
    if (d !== 0 && !canControl()) return;
    setDir(d);
  }, []);

  // ---- 좌우 이동 (누르는 동안) ----
  useEffect(() => {
    if (dir === 0) return;
    dispatch({ type: 'SET_PHASE', phase: 'CLAW_MOVING' });
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!busy.current) patch({ x: clamp(clawRef.current.x + dir * GAME_CONFIG.clawSpeed * dt, L.clawMinX, L.clawMaxX) });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      if (!busy.current) dispatch({ type: 'SET_PHASE', phase: 'MACHINE_IDLE' });
    };
  }, [dir, dispatch, patch]);

  // 조작이 막히는 상태가 되면 이동 정지
  useEffect(() => {
    if (!['MACHINE_IDLE', 'CLAW_MOVING'].includes(state.phase) || state.hearts <= 0) setDir(0);
  }, [state.phase, state.hearts]);

  // ---- 집게 작동 ----
  const grab = useCallback(async () => {
    if (!canControl()) return;
    busy.current = true;
    setDir(0);
    const A = isAlive;
    const s = stateRef.current;
    dispatch({ type: 'SET_PHASE', phase: 'CLAW_GRABBING' });

    const startX = clawRef.current.x;
    let target: { id: string; rewardId: string; x: number; y: number } | null = null;
    let best = Infinity;
    for (const c of activeCapsules()) {
      if (statusRef.current(c.id) !== 'AVAILABLE') continue;
      const cp = L.capsules[c.id];
      const d = Math.abs(cp.x - startX);
      // 가장 가까운 캡슐. 같은 열에 쌓여 있으면 위쪽 캡슐이 먼저 잡힘
      if (d < best - 0.5 || (Math.abs(d - best) <= 0.5 && target && cp.y < target.y)) {
        best = d; target = { id: c.id, rewardId: c.rewardId, x: cp.x, y: cp.y };
      }
    }
    const inRange = !!target && best <= GAME_CONFIG.grabRange;
    const success = inRange && Math.random() < s.settings.successProbability;
    const stopY = inRange && target ? target.y - L.carryOffset : L.clawMissY;
    const fromY = clawRef.current.y;

    // 1~2. 하강 / 접근
    await tween(T.descend, easeInOut, (v) => patch({ y: lerp(fromY, stopY, v) }), A);
    await sleep(T.settle);
    // 3. 닫힘
    await tween(T.close, easeInOut, (v) => patch({ grip: v }), A);

    if (inRange && target && success) {
      // 4~6. 붙잡고 상승 → 배출구로 이동
      dispatch({ type: 'SET_PHASE', phase: 'CLAW_RETURNING' });
      setCarryId(target.id);
      await tween(T.ascend, easeInOut, (v) => patch({ y: lerp(stopY, L.clawRestY, v) }), A);
      const fx = clawRef.current.x;
      await tween(T.carry, easeInOut, (v) => patch({ x: lerp(fx, L.outletX, v) }), A);
      await sleep(150);
      // 7. 열리며 떨어뜨림
      const dropY = clawRef.current.y + L.carryOffset;
      setCarryId(null);
      setOffsets((o) => ({ ...o, [target!.id]: { x: L.outletX, y: dropY } }));
      void tween(T.release, easeInOut, (v) => patch({ grip: 1 - v }), A);
      await tween(T.drop, easeIn, (v) => setOffsets((o) => ({ ...o, [target!.id]: { x: L.outletX, y: lerp(dropY, L.outletCapsuleY, v) } })), A);
      await tween(220, easeOutBounce, (v) => setOffsets((o) => ({ ...o, [target!.id]: { x: L.outletX, y: L.outletCapsuleY - 10 * (1 - v) } })), A);
      await sleep(T.afterDrop);
      if (!A()) return;
      // 8. 개봉 화면으로 (하트 차감 없음)
      busy.current = false;
      dispatch({ type: 'CAPTURE', capsuleId: target.id, rewardId: pickReward(target.rewardId, Object.values(stateRef.current.saved)) });
      setOffsets({});
      return;
    }

    // ---- 실패 ----
    dispatch({ type: 'SET_PHASE', phase: 'CLAW_RETURNING' });
    dispatch({ type: 'FAIL' }); // 하트 1개 차감 (실패 시에만, 1회)
    if (inRange && target) {
      // 잡았다가 중간에 놓침
      const t = target;
      setCarryId(t.id);
      const upY = stopY - 60;
      await tween(500, easeOut, (v) => patch({ y: lerp(stopY, upY, v) }), A);
      setCarryId(null);
      setOffsets((o) => ({ ...o, [t.id]: { x: t.x, y: upY + L.carryOffset } }));
      void tween(350, easeInOut, (v) => patch({ grip: 1 - v * 0.6 }), A);
      void tween(T.ascend, easeInOut, (v) => patch({ y: lerp(upY, L.clawRestY, v) }), A);
      await tween(520, easeOutBounce, (v) => setOffsets((o) => ({ ...o, [t.id]: { x: t.x, y: lerp(upY + L.carryOffset, t.y, v) } })), A);
      setOffsets((o) => { const n = { ...o }; delete n[t.id]; return n; });
      await sleep(Math.max(0, T.ascend - 520));
    } else {
      // 빈손으로 상승
      await tween(T.ascend, easeInOut, (v) => patch({ y: lerp(stopY, L.clawRestY, v) }), A);
    }
    await tween(T.release, linear, (v) => patch({ grip: clawRef.current.grip * (1 - v) }), A);
    patch({ grip: 0, y: L.clawRestY });
    await sleep(200);
    if (!A()) return;

    busy.current = false;
    if (stateRef.current.hearts <= ENDING_CONFIG.triggerHearts) dispatch({ type: 'ENDING_ARRIVE' });
    else dispatch({ type: 'SET_PHASE', phase: 'MACHINE_IDLE' });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, isAlive, patch]);

  // ---- 키보드 (데스크톱) ----
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.key === 'ArrowLeft' || e.key === 'a') press(-1);
      else if (e.key === 'ArrowRight' || e.key === 'd') press(1);
      else if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowDown') { e.preventDefault(); void grab(); }
    };
    const up = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'a', 'ArrowRight', 'd'].includes(e.key)) setDir(0);
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [press, grab]);

  const interactive = ['MACHINE_IDLE', 'CLAW_MOVING'].includes(state.phase);
  const controlsOff = !interactive || state.hearts <= 0;
  const outletActive = carryId !== null || Object.keys(offsets).length > 0;
  const carry = carryId ? { id: carryId, x: claw.x, y: claw.y + L.carryOffset } : null;

  return (
    <div className="machine" data-phase={state.phase}>
      <AssetImage src={ASSETS.machine.background} fallback={<div className="machine-bg-placeholder" />} className="fill" fit="cover" />

      {/* 기계 프레임 (machine.png 가 있으면 대체) */}
      <AssetImage
        src={ASSETS.machine.machine}
        className="abs"
        style={rectStyle(L.machineImage)}
        fallback={
          <>
            <div className="m-frame" style={rectStyle(L.frame)} />
            <div className="m-strip" style={rectStyle(L.topStrip)} />
            <div className="m-glass-back" style={rectStyle(L.glass)} />
            <div className="m-floor" style={{ left: L.glass.x + 14, width: L.glass.w - 28, top: L.floorY }} />
            <div className={`m-outlet ${outletActive ? 'active' : ''}`} style={rectStyle(L.outlet)} />
            <div className="m-divider" style={{ left: L.glass.x, width: L.glass.w, top: L.dividerY }} />
          </>
        }
      />

      <CapsuleContainer offsets={offsets} carry={carry} />
      <ClawController x={claw.x} y={claw.y} grip={claw.grip} />

      {/* 유리 반사 (캡슐/집게 앞) */}
      <div className="glass-shine" style={rectStyle(L.glass)} />

      <MachineControls disabled={controlsOff} grabDisabled={controlsOff} onDir={press} onGrab={() => void grab()} />

      <div className="hud-left">
        <button
          type="button"
          className={`collection-btn ${collectedCount === totalCount ? 'complete' : ''}`}
          aria-label="보관함"
          disabled={state.phase !== 'MACHINE_IDLE' && state.phase !== 'GAME_OVER'}
          onClick={() => dispatch({ type: 'OPEN_COLLECTION' })}
        >
          <AssetImage src={ASSETS.ui.collection} fallback={<PlaceholderCollectionIcon />} />
          <span className="badge">{totalCount - collectedCount}</span>
        </button>
      </div>
      <HeartDisplay />
      {state.lastSavedId && state.phase === 'MACHINE_IDLE' && <div key={state.lastSavedId} className="saved-sparkle" />}
    </div>
  );
}

/** fixedRewards=false 이면 뽑을 때마다 보상 결정(이미 저장한 보상은 설정에 따라 제외) */
function pickReward(fixedId: string, savedRewards: string[]): string {
  if (GAME_CONFIG.fixedRewards) return fixedId;
  const pool = REWARDS.filter((r) => GAME_CONFIG.allowDuplicateRewards || !savedRewards.includes(r.id));
  const list = pool.length ? pool : REWARDS;
  return list[Math.floor(Math.random() * list.length)].id;
}
