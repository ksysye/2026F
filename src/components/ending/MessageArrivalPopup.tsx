import { ENDING_CONFIG } from '../../config/endingConfig';
import { EnvelopeIcon } from '../placeholders';
import { useClickGuard, useReady } from '../useReady';

/** 엔딩 1단계: 화면이 어두워지고 "메세지 창이 도착했습니다!" 팝업. (이미지/색은 CSS 변수 및 이 컴포넌트만 교체) */
export function MessageArrivalPopup({ onOpen }: { onOpen: () => void }) {
  const ready = useReady(1800);
  const guard = useClickGuard(800);
  return (
    <div className="overlay dim arrival">
      <div className="arrival-card">
        <div className="arrival-icon"><EnvelopeIcon size={72} /></div>
        <p>{ENDING_CONFIG.arrivalMessage}</p>
        <button type="button" className={`pill primary late ${ready ? 'ready' : ''}`} data-testid="open-message" disabled={!ready} onClick={guard(onOpen)}>
          {ENDING_CONFIG.messageButtonText}
        </button>
      </div>
    </div>
  );
}
