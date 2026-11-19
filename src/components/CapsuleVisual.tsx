import { ASSETS } from '../config/assets';
import { AssetImage } from './AssetImage';
import { PlaceholderCapsule } from './placeholders';

/** 캡슐 그림. part 로 위/아래 반쪽만 잘라 개봉 연출에 사용(이미지·SVG 모두 동일). */
export function CapsuleVisual({ id, color, part = 'full' }: { id: string; color: string; part?: 'full' | 'top' | 'bottom' }) {
  const clip = part === 'top' ? 'inset(0 0 50% 0)' : part === 'bottom' ? 'inset(50% 0 0 0)' : undefined;
  return (
    <div className="fill" style={{ clipPath: clip }}>
      <AssetImage src={ASSETS.capsules[id]} fallback={<PlaceholderCapsule color={color} />} />
    </div>
  );
}
