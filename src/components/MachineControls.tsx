import type { ReactNode } from 'react';
import { ASSETS } from '../config/assets';
import { MACHINE_LAYOUT as L } from '../config/layout';
import { AssetImage } from './AssetImage';
import { PlaceholderArrow } from './placeholders';

interface Props {
  disabled: boolean;
  grabDisabled: boolean;
  onDir: (d: -1 | 0 | 1) => void;
  onGrab: () => void;
}

function CircleButton(props: {
  pos: { cx: number; cy: number; r: number };
  className: string;
  label: string;
  src: string;
  fallback: ReactNode;
  disabled: boolean;
  down: () => void;
  up?: () => void;
}) {
  const { pos } = props;
  return (
    <button
      type="button"
      aria-label={props.label}
      className={`mbtn ${props.className}`}
      disabled={props.disabled}
      style={{ left: pos.cx - pos.r, top: pos.cy - pos.r, width: pos.r * 2, height: pos.r * 2 }}
      onPointerDown={(e) => { e.preventDefault(); (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId); props.down(); }}
      onPointerUp={() => props.up?.()}
      onPointerCancel={() => props.up?.()}
      onLostPointerCapture={() => props.up?.()}
      onContextMenu={(e) => e.preventDefault()}
    >
      <AssetImage src={props.src} fallback={props.fallback} className="btn-img" />
    </button>
  );
}

/** 좌/우 이동(누르고 있는 동안), 뽑기 버튼. 터치·마우스 지원 (키보드는 ClawMachineScreen). */
export function MachineControls({ disabled, grabDisabled, onDir, onGrab }: Props) {
  return (
    <>
      <CircleButton pos={L.controls.left} className="left" label="왼쪽으로" src={ASSETS.machine.buttonLeft}
        fallback={<span className="btn-face"><PlaceholderArrow dir="left" /></span>}
        disabled={disabled} down={() => onDir(-1)} up={() => onDir(0)} />
      <CircleButton pos={L.controls.right} className="right" label="오른쪽으로" src={ASSETS.machine.buttonRight}
        fallback={<span className="btn-face"><PlaceholderArrow dir="right" /></span>}
        disabled={disabled} down={() => onDir(1)} up={() => onDir(0)} />
      <CircleButton pos={L.controls.grab} className="grab" label="뽑기" src={ASSETS.machine.buttonGrab}
        fallback={<span className="btn-face"><PlaceholderArrow dir="grab" /></span>}
        disabled={grabDisabled} down={onGrab} />
    </>
  );
}
