import { MACHINE_LAYOUT as L } from '../config/layout';
import { CAPSULES } from '../config/rewards';
import { activeCapsules, useGame } from '../game/store';
import { CapsuleVisual } from './CapsuleVisual';

export type Offsets = Record<string, { x: number; y: number }>;

/** 기계 안의 캡슐들. SAVED/IN_PROGRESS 캡슐은 기계에서 제거(숨김)된다. */
export function CapsuleContainer({ offsets, carry }: { offsets: Offsets; carry: { id: string; x: number; y: number } | null }) {
  const { state, capsuleStatus } = useGame();
  return (
    <>
      {activeCapsules().map((c) => {
        if (capsuleStatus(c.id) !== 'AVAILABLE') return null;
        const def = CAPSULES.find((x) => x.id === c.id)!;
        const p = L.capsules[c.id];
        const o = carry?.id === c.id ? carry : offsets[c.id];
        const x = o?.x ?? p.x;
        const y = o?.y ?? p.y;
        const size = L.capsuleSize * p.scale;
        const moving = !!o;
        return (
          <div
            key={c.id}
            data-capsule={c.id}
            className={`capsule ${state.returnedCapsuleId === c.id ? 'returned' : ''}`}
            style={{
              left: x - size / 2, top: y - size / 2, width: size, height: size,
              transform: `rotate(${moving ? 0 : p.rotate}deg)`,
            }}
          >
            <CapsuleVisual id={def.id} color={def.color} />
          </div>
        );
      })}
    </>
  );
}
