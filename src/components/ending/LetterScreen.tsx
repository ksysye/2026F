import { useEffect, useState } from 'react';
import { ENDING_CONFIG } from '../../config/endingConfig';
import { ENDING_TIMING as T } from '../../config/timing';

type Step = 'show' | 'closing' | 'fade';

/** 엔딩 2단계: 분홍 배경 위에 메시지가 문단별로 차례로 나타남 → 마침 → 글 사라짐 → 페이드 → onFinish */
export function LetterScreen({ onFinish }: { onFinish: () => void }) {
  const [step, setStep] = useState<Step>('show');
  const [ready, setReady] = useState(false);
  const S = ENDING_CONFIG.letterStyle;
  const text = ENDING_CONFIG.finalMessage.trim() ? ENDING_CONFIG.finalMessage : ENDING_CONFIG.placeholderMessage;
  const paragraphs = text.split(/\n\s*\n/);

  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), paragraphs.length * S.paragraphDelay + 1200);
    return () => clearTimeout(t);
  }, [paragraphs.length, S.paragraphDelay]);

  const finish = () => {
    setStep('closing');
    window.setTimeout(() => setStep('fade'), T.letterClose);
    window.setTimeout(onFinish, T.letterClose + T.fadeOut);
  };

  return (
    <div
      className={`overlay letter-screen step-${step}`}
      style={{
        ['--letter-font' as string]: S.fontFamily,
        ['--letter-size' as string]: S.fontSize,
        ['--letter-lh' as string]: S.lineHeight,
        ['--letter-color' as string]: S.color,
        ['--letter-align' as string]: S.textAlign,
        ['--letter-bg' as string]: S.backgroundImage ? `url(${S.backgroundImage}) center/cover` : S.background,
        ['--close-ms' as string]: `${T.letterClose}ms`,
        ['--fade-ms' as string]: `${T.fadeOut}ms`,
      }}
    >
      <div className="message" data-testid="letter-text">
        {paragraphs.map((para, i) => (
          <p key={i} style={{ animationDelay: `${i * S.paragraphDelay + 600}ms` }}>{para}</p>
        ))}
      </div>
      <button type="button" className={`pill primary finish ${ready ? 'ready' : ''}`} data-testid="finish" onClick={finish} disabled={!ready || step !== 'show'}>
        {ENDING_CONFIG.finishButtonText}
      </button>
      <div className="blackout" />
    </div>
  );
}
