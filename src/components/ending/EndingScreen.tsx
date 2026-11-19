import { ENDING_CONFIG } from '../../config/endingConfig';

/** 최종 엔딩. 버튼 없음: 재시작/충전/보관함 모두 없음. */
export function EndingScreen() {
  return (
    <div className="ending-screen" data-testid="ending">
      <div className="ending-stars" />
      {ENDING_CONFIG.endingText && <p>{ENDING_CONFIG.endingText}</p>}
    </div>
  );
}
