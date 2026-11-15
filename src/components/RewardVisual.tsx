import { ASSETS } from '../config/assets';
import { REWARDS } from '../config/rewards';
import type { RewardDef } from '../game/types';
import { AssetImage } from './AssetImage';
import { PlaceholderReward } from './placeholders';

export function RewardVisual({ reward, silhouette }: { reward: RewardDef; silhouette?: boolean }) {
  const idx = REWARDS.findIndex((r) => r.id === reward.id);
  return (
    <div className={`fill ${silhouette ? 'silhouette' : ''}`}>
      <AssetImage src={ASSETS.rewards[reward.id]} fallback={<PlaceholderReward reward={reward} index={idx} />} />
    </div>
  );
}
