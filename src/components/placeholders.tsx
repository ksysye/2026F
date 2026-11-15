import type { RewardDef } from '../game/types';

/** 실제 에셋이 오기 전까지 쓰는 임시 그래픽(SVG). */

export function PlaceholderKey() {
  return (
    <svg viewBox="0 0 60 120" width="100%" height="100%">
      <defs>
        <linearGradient id="kg" x1="0" x2="1">
          <stop offset="0" stopColor="#ffe28a" />
          <stop offset="1" stopColor="#f2b134" />
        </linearGradient>
      </defs>
      <rect x="26" y="4" width="8" height="82" rx="4" fill="url(#kg)" stroke="#b9801a" strokeWidth="2" />
      <rect x="34" y="12" width="10" height="7" rx="2" fill="url(#kg)" stroke="#b9801a" strokeWidth="2" />
      <rect x="34" y="26" width="14" height="7" rx="2" fill="url(#kg)" stroke="#b9801a" strokeWidth="2" />
      <circle cx="30" cy="98" r="16" fill="url(#kg)" stroke="#b9801a" strokeWidth="2" />
      <circle cx="30" cy="98" r="7" fill="#fff6dc" stroke="#b9801a" strokeWidth="2" />
    </svg>
  );
}

export function PlaceholderLock({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 120 140" width="100%" height="100%" overflow="visible">
      <g style={{ transition: 'transform 500ms cubic-bezier(.3,1.6,.5,1)', transform: open ? 'translateY(-16px) rotate(-18deg)' : 'none', transformOrigin: '90px 62px' }}>
        <path d="M34 62 V40 a26 26 0 0 1 52 0 V62" fill="none" stroke="#c9ccd6" strokeWidth="12" strokeLinecap="round" />
      </g>
      <rect x="14" y="58" width="92" height="74" rx="16" fill="#f7b6c8" stroke="#d27a97" strokeWidth="4" />
      <rect x="22" y="64" width="76" height="14" rx="7" fill="#fff" opacity=".35" />
      <circle cx="60" cy="87" r="9" fill="#7a3d55" />
      <rect x="56" y="90" width="8" height="20" rx="3" fill="#7a3d55" />
    </svg>
  );
}

export function PlaceholderCapsule({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <circle cx="50" cy="50" r="46" fill="#fff8ee" stroke="#6b5a66" strokeWidth="4" />
      <path d="M4 50 A46 46 0 0 1 96 50 Z" fill={color} />
      <circle cx="50" cy="50" r="46" fill="none" stroke="#6b5a66" strokeWidth="4" />
      <rect x="4" y="46" width="92" height="8" fill="#6b5a66" opacity=".85" />
      <ellipse cx="32" cy="28" rx="12" ry="7" fill="#fff" opacity=".55" transform="rotate(-30 32 28)" />
    </svg>
  );
}

export function PlaceholderReward({ reward, index }: { reward: RewardDef; index: number }) {
  const c = reward.color;
  const stroke = '#6b5a66';
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" overflow="visible">
      {reward.shape === 'star' && (
        <polygon points="50,6 62,36 94,38 69,58 78,90 50,72 22,90 31,58 6,38 38,36" fill={c} stroke={stroke} strokeWidth="4" strokeLinejoin="round" />
      )}
      {reward.shape === 'moon' && (
        <path d="M66 10 A42 42 0 1 0 90 66 A34 34 0 1 1 66 10 Z" fill={c} stroke={stroke} strokeWidth="4" strokeLinejoin="round" />
      )}
      {reward.shape === 'flower' && (
        <g stroke={stroke} strokeWidth="4">
          {[0, 72, 144, 216, 288].map((a) => (
            <circle key={a} cx="50" cy="26" r="17" fill={c} transform={`rotate(${a} 50 50)`} />
          ))}
          <circle cx="50" cy="50" r="13" fill="#fff4c9" />
        </g>
      )}
      {reward.shape === 'cloud' && (
        <path d="M26 74 a18 18 0 0 1 2-36 a22 22 0 0 1 42-4 a20 20 0 0 1 4 40 Z" fill={c} stroke={stroke} strokeWidth="4" strokeLinejoin="round" />
      )}
      <text x="50" y="62" textAnchor="middle" fontSize="22" fontWeight="700" fill="#fff" stroke={stroke} strokeWidth="1.5" paintOrder="stroke">
        {String(index + 1).padStart(2, '0')}
      </text>
    </svg>
  );
}

export function PlaceholderHeart() {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%">
      <path d="M12 21s-8-5.2-8-11a4.6 4.6 0 0 1 8-3 4.6 4.6 0 0 1 8 3c0 5.8-8 11-8 11z" fill="#ff6f91" stroke="#c0405f" strokeWidth="1.5" strokeLinejoin="round" />
      <ellipse cx="8" cy="8.5" rx="2" ry="1.2" fill="#fff" opacity=".6" transform="rotate(-30 8 8.5)" />
    </svg>
  );
}

export function PlaceholderCollectionIcon() {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%">
      <rect x="3" y="3" width="8" height="8" rx="2.5" fill="#ffd1dc" stroke="#9a5a6e" strokeWidth="1.5" />
      <rect x="13" y="3" width="8" height="8" rx="2.5" fill="#cfe8ff" stroke="#9a5a6e" strokeWidth="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="2.5" fill="#fff0b8" stroke="#9a5a6e" strokeWidth="1.5" />
      <rect x="13" y="13" width="8" height="8" rx="2.5" fill="#d3f2dc" stroke="#9a5a6e" strokeWidth="1.5" />
    </svg>
  );
}

export function PlaceholderArrow({ dir }: { dir: 'left' | 'right' | 'grab' }) {
  if (dir === 'grab') {
    return (
      <svg viewBox="0 0 24 24" width="55%" height="55%">
        <path d="M12 4v10M7 10l5 6 5-6M6 20h12" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width="55%" height="55%">
      <path d={dir === 'left' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'} fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** 집게 임시 그래픽. grip: 0(열림) → 1(닫힘). 허브는 (50,6). */
export function PlaceholderClaw({ grip }: { grip: number }) {
  const angle = 44 - grip * 36;
  const arm = (side: 1 | -1) => (
    <g transform={`translate(50 14) scale(${side} 1) rotate(${angle})`}>
      <path d="M0 0 L-3 26 Q-5 42 9 48" fill="none" stroke="#9aa3b8" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M0 0 L-3 26 Q-5 42 9 48" fill="none" stroke="#dfe5f2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" overflow="visible">
      {arm(1)}
      {arm(-1)}
      <rect x="40" y="2" width="20" height="16" rx="6" fill="#7e89a6" stroke="#5b6785" strokeWidth="2" />
      <circle cx="50" cy="12" r="3" fill="#dfe5f2" />
    </svg>
  );
}

export function EnvelopeIcon({ size = 64 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 48" width={size} height={size * 0.75}>
      <rect x="3" y="5" width="58" height="38" rx="6" fill="#fff6ea" stroke="#c79a8a" strokeWidth="3" />
      <path d="M5 9 L32 29 L59 9" fill="none" stroke="#c79a8a" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx="32" cy="29" r="5" fill="#ff8fb1" stroke="#d1607f" strokeWidth="2" />
    </svg>
  );
}
