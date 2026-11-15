import { ASSETS } from '../config/assets';
import { useGame } from '../game/store';
import { AssetImage } from './AssetImage';
import { PlaceholderHeart } from './placeholders';

/** 우측 상단 하트. 최대 하트 수는 설정에 따라 자동 반영. */
export function HeartDisplay() {
  const { state } = useGame();
  return (
    <div className="hearts" aria-label={`하트 ${state.hearts}개`}>
      {Array.from({ length: state.settings.maxHearts }, (_, i) => (
        <div key={i} className={`heart ${i < state.hearts ? 'on' : 'off'}`}>
          <AssetImage src={ASSETS.ui.heart} fallback={<PlaceholderHeart color={i < state.hearts ? '#111' : '#e6a9c2'} />} />
        </div>
      ))}
    </div>
  );
}
