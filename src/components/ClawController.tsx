import { ASSETS } from '../config/assets';
import { MACHINE_LAYOUT as L } from '../config/layout';
import { AssetImage } from './AssetImage';
import { PlaceholderClaw } from './placeholders';

/** 레일 + 줄 + 집게. (x, y) = 집게 허브 위치. 줄은 레일에서 허브까지 이어짐. */
export function ClawController({ x, y, grip }: { x: number; y: number; grip: number }) {
  const closed = grip > 0.5;
  const w = L.claw.w, h = L.claw.h;
  return (
    <>
      <div className="rail" style={{ left: L.railX.min, width: L.railX.max - L.railX.min, top: L.railY - 0.75 }} />
      <div className="cable" style={{ left: x - 0.75, top: L.railY, height: Math.max(0, y - L.railY - 6) }} />
      <div className="carriage" style={{ left: x - 15, top: L.railY - 8 }} />
      <div className="claw" style={{ left: x - w / 2, top: y - 6, width: w, height: h }} data-claw-x={x.toFixed(1)} data-claw-y={y.toFixed(1)}>
        <AssetImage
          src={closed ? ASSETS.machine.clawClosed : ASSETS.machine.claw}
          fallback={
            closed ? (
              <AssetImage src={ASSETS.machine.claw} fallback={<PlaceholderClaw grip={grip} />} />
            ) : (
              <PlaceholderClaw grip={grip} />
            )
          }
        />
      </div>
    </>
  );
}
