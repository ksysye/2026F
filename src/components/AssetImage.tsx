import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';

interface Props {
  src?: string | null;
  /** 이미지가 없거나 로드 실패 시 보여줄 임시 그래픽 */
  fallback?: ReactNode;
  className?: string;
  style?: CSSProperties;
  fit?: 'contain' | 'cover';
}

/** 실제 에셋이 있으면 이미지를, 없으면 fallback(임시 그림)을 표시. 컨테이너 크기를 가득 채움. */
export function AssetImage({ src, fallback, className, style, fit = 'contain' }: Props) {
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>(src ? 'loading' : 'error');
  useEffect(() => setStatus(src ? 'loading' : 'error'), [src]);
  return (
    <div className={`asset ${className ?? ''}`} style={style}>
      {status === 'error' && fallback}
      {src && status !== 'error' && (
        <img
          src={src}
          alt=""
          draggable={false}
          style={{ objectFit: fit, opacity: status === 'ok' ? 1 : 0 }}
          onLoad={() => setStatus('ok')}
          onError={() => setStatus('error')}
        />
      )}
    </div>
  );
}
