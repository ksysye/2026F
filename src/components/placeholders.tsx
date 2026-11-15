import type { RewardDef } from '../game/types';

/** 실제 에셋이 오기 전까지 쓰는 임시 그래픽(SVG). 시안의 검정 라인 아트 스타일. */
const INK = '#111';

export function PlaceholderKey() {
  return (
    <svg viewBox="0 0 60 120" width="100%" height="100%">
      <rect x="26" y="4" width="8" height="82" rx="4" fill="#fff" />
      <circle cx="30" cy="98" r="16" fill="#fff" />
      <circle cx="30" cy="98" r="7" fill="#fde7f1" />
    </svg>
  );
}

export function PlaceholderLock({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 120 140" width="100%" height="100%" overflow="visible">
      <path d="M34 62 V40 a26 26 0 0 1 52 0 V62" fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round"
        style={{ transform: open ? 'translateY(-14px)' : 'none', transition: 'transform .5s' }} />
      <rect x="14" y="58" width="92" height="74" rx="10" fill="#fff" />
    </svg>
  );
}

/** 캡슐: 위쪽 검정 + 흰 점, 아래쪽 흰색, 검정 외곽선 */
export function PlaceholderCapsule(_props: { color?: string }) {
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <circle cx="50" cy="50" r="46" fill="#fff" />
      <path d="M4 50 A46 46 0 0 1 96 50 Z" fill={INK} />
      <circle cx="50" cy="30" r="5.5" fill="#fff" />
      <circle cx="50" cy="50" r="46" fill="none" stroke={INK} strokeWidth="5" />
      <line x1="4" y1="50" x2="96" y2="50" stroke={INK} strokeWidth="5" />
    </svg>
  );
}

const line = { stroke: INK, strokeWidth: 4, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

/** 보상(메시지) 아이콘: 편지 / 초대장 / 쪽지 / 엽서 */
export function PlaceholderReward({ reward }: { reward: RewardDef; index?: number }) {
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" overflow="visible">
      {reward.shape === 'letter' && (
        <g>
          <rect x="8" y="22" width="84" height="58" rx="8" fill="#fff" {...line} />
          <path d="M9 24 L50 58 L91 24 Z" fill={INK} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
          <circle cx="50" cy="56" r="8" fill="#fff" {...line} />
          <circle cx="50" cy="56" r="2.2" fill={INK} />
        </g>
      )}
      {reward.shape === 'invitation' && (
        <g>
          <rect x="22" y="6" width="56" height="88" rx="9" fill="#fff" {...line} />
          <rect x="29" y="14" width="42" height="72" rx="5" fill="none" stroke={INK} strokeWidth="2.5" strokeDasharray="1 5" strokeLinecap="round" />
          <rect x="22" y="42" width="56" height="14" fill={INK} />
          <circle cx="50" cy="49" r="8" fill="#fff" {...line} />
        </g>
      )}
      {reward.shape === 'note' && (
        <g>
          <path d="M22 8 H62 L80 26 V92 H22 Z" fill="#fff" {...line} />
          <path d="M62 8 V26 H80 Z" fill={INK} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
          {[48, 60, 72].map((y) => (
            <line key={y} x1="32" y1={y} x2="66" y2={y} stroke={INK} strokeWidth="2.5" strokeDasharray="1 5" strokeLinecap="round" />
          ))}
        </g>
      )}
      {reward.shape === 'postcard' && (
        <g>
          <rect x="6" y="20" width="88" height="60" rx="6" fill="#fff" {...line} />
          <rect x="62" y="28" width="22" height="22" rx="2" fill={INK} />
          <circle cx="73" cy="39" r="3" fill="#fff" />
          <line x1="44" y1="30" x2="44" y2="70" stroke={INK} strokeWidth="2.5" strokeDasharray="1 5" strokeLinecap="round" />
          <line x1="52" y1="60" x2="82" y2="60" stroke={INK} strokeWidth="3" strokeLinecap="round" />
          <line x1="52" y1="68" x2="76" y2="68" stroke={INK} strokeWidth="3" strokeLinecap="round" />
          <line x1="16" y1="36" x2="30" y2="36" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
}

const HEART = ['.XX...XX.', 'XXXX.XXXX', 'XXXXXXXXX', 'XXXXXXXXX', '.XXXXXXX.', '..XXXXX..', '...XXX...', '....X....'];

/** 도트(픽셀) 하트 */
export function PlaceholderHeart({ color = INK }: { color?: string }) {
  return (
    <svg viewBox="0 0 9 8" width="100%" height="100%">
      {HEART.flatMap((row, y) =>
        [...row].map((c, x) => (c === 'X' ? <circle key={`${x}-${y}`} cx={x + 0.5} cy={y + 0.5} r="0.46" fill={color} /> : null)),
      )}
    </svg>
  );
}

/** 보관함 버튼: 3x3 도트 */
export function PlaceholderCollectionIcon() {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%">
      {[5, 12, 19].flatMap((x) => [5, 12, 19].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r="2" fill={INK} />))}
    </svg>
  );
}

export function PlaceholderArrow({ dir }: { dir: 'left' | 'right' | 'grab' }) {
  if (dir === 'grab') {
    return (
      <svg viewBox="0 0 120 20" height="22" style={{ overflow: 'visible' }}>
        {[8, 20, 32].map((x) => <circle key={x} cx={x} cy="10" r="2.6" fill="#fff" />)}
        <path d="M60 3 V15 M54 10 L60 16 L66 10 M53 19 H67" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {[88, 100, 112].map((x) => <circle key={x} cx={x} cy="10" r="2.6" fill="#fff" />)}
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width="40%" height="40%">
      <path d={dir === 'left' ? 'M15 4l-8 8 8 8' : 'M9 4l8 8-8 8'} fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** 집게 임시 그래픽(라인 아트). grip: 0(열림) → 1(닫힘). 허브 중심 = (23,6). */
export function PlaceholderClaw({ grip }: { grip: number }) {
  const out = 17 - grip * 9; // 팔 바깥 정도
  const tipX = 4 + grip * 11;
  const armL = `M18 10 Q${23 - out - 6} 24 ${tipX} 38`;
  const armR = `M28 10 Q${23 + out + 6} 24 ${46 - tipX} 38`;
  return (
    <svg viewBox="0 0 46 52" width="100%" height="100%" overflow="visible">
      {[armL, armR].map((d) => (
        <g key={d} fill="none" strokeLinecap="round">
          <path d={d} stroke="#fff" strokeWidth="5" />
          <path d={d} stroke={INK} strokeWidth="2" />
        </g>
      ))}
      <rect x="15" y="0" width="16" height="12" rx="4" fill="#fff" stroke={INK} strokeWidth="2" />
      <circle cx="23" cy="6" r="1.6" fill={INK} />
    </svg>
  );
}

export function EnvelopeIcon({ size = 64 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size * 0.75, position: 'relative' }}>
      <PlaceholderReward reward={{ id: 'x', name: '', description: '', color: INK, shape: 'letter', message: '', sender: '', photos: [] }} />
    </div>
  );
}
