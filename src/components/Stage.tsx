import { useLayoutEffect, useState, type ReactNode } from 'react';
import { STAGE } from '../config/layout';

/** 360x640 가상 스테이지를 화면에 맞춰 비율 유지 확대/축소(레터박스). 좌표가 어긋나지 않음. */
export function Stage({ children, backdropImage }: { children: ReactNode; backdropImage?: string | null }) {
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / STAGE.width, window.innerHeight / STAGE.height));
    fit();
    window.addEventListener('resize', fit);
    window.addEventListener('orientationchange', fit);
    return () => {
      window.removeEventListener('resize', fit);
      window.removeEventListener('orientationchange', fit);
    };
  }, []);
  return (
    <div className="viewport">
      <div className="backdrop" style={backdropImage ? { backgroundImage: `url(${backdropImage})` } : undefined} />
      <div
        className="stage"
        style={{
          width: STAGE.width,
          height: STAGE.height,
          transform: `translate(-50%, -50%) scale(${scale})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
