import { useEffect, useState } from 'react';
import { ENDING_CONFIG } from '../../config/endingConfig';
import { ENDING_TIMING as T } from '../../config/timing';

type Step = 'envelope' | 'opening' | 'letter' | 'closing' | 'fade';

/** 엔딩 2단계: 봉투가 열리고 편지가 펼쳐짐 → 마침 → 편지 닫힘 → 페이드아웃 → onFinish */
export function LetterScreen({ onFinish }: { onFinish: () => void }) {
  const [step, setStep] = useState<Step>('envelope');
  const S = ENDING_CONFIG.letterStyle;
  const text = ENDING_CONFIG.finalMessage.trim() ? ENDING_CONFIG.finalMessage : ENDING_CONFIG.placeholderMessage;

  useEffect(() => {
    const a = window.setTimeout(() => setStep('opening'), 350);
    const b = window.setTimeout(() => setStep('letter'), 350 + T.letterOpen);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, []);

  const finish = () => {
    setStep('closing');
    window.setTimeout(() => setStep('fade'), T.letterClose);
    window.setTimeout(onFinish, T.letterClose + T.fadeOut);
  };

  return (
    <div
      className={`overlay dim letter-screen step-${step}`}
      style={{
        ['--letter-font' as string]: S.fontFamily,
        ['--letter-size' as string]: S.fontSize,
        ['--letter-lh' as string]: S.lineHeight,
        ['--letter-color' as string]: S.color,
        ['--letter-align' as string]: S.textAlign,
        ['--paper-bg' as string]: S.paperImage ? `url(${S.paperImage}) center/cover` : S.paperBackground,
        ['--open-ms' as string]: `${T.letterOpen}ms`,
        ['--close-ms' as string]: `${T.letterClose}ms`,
        ['--fade-ms' as string]: `${T.fadeOut}ms`,
      }}
    >
      <div className="envelope">
        <div className="env-back" />
        <div className="paper">
          <div className="paper-text" data-testid="letter-text">{text}</div>
        </div>
        <div className="env-front" />
        <div className="env-flap" />
      </div>
      <button type="button" className="pill primary finish" data-testid="finish" onClick={finish} disabled={step !== 'letter'}>
        {ENDING_CONFIG.finishButtonText}
      </button>
      <div className="blackout" />
    </div>
  );
}
