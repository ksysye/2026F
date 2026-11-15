import { useEffect, useState } from 'react';
import { useGame } from '../game/store';
import { IS_DEV } from '../game/storage';

/**
 * 개발자 전용 패널. 개발 서버(npm run dev)에서만 존재하며 Ctrl+Shift+D 로 열림.
 * 프로덕션 빌드(import.meta.env.DEV=false)에서는 아무것도 렌더하지 않고 설정 override 도 읽지 않습니다.
 */
export function DevPanel() {
  const { state, dispatch } = useGame();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!IS_DEV) return;
    const h = (e: KeyboardEvent) => { if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd') setOpen((o) => !o); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);
  if (!IS_DEV || !open) return null;
  const s = state.settings;
  const num = (label: string, value: number, apply: (n: number) => void, step = 1) => (
    <label>{label}<input type="number" step={step} value={value} onChange={(e) => apply(Number(e.target.value))} /></label>
  );
  return (
    <div className="devpanel" data-testid="devpanel">
      <b>DEV</b>
      {num('현재 하트', state.hearts, (n) => dispatch({ type: 'DEV_SET_HEARTS', hearts: n }))}
      {num('최대 하트', s.maxHearts, (n) => dispatch({ type: 'DEV_SET_SETTINGS', settings: { maxHearts: n } }))}
      {num('초기 하트', s.initialHearts, (n) => dispatch({ type: 'DEV_SET_SETTINGS', settings: { initialHearts: n } }))}
      {num('성공 확률', s.successProbability, (n) => dispatch({ type: 'DEV_SET_SETTINGS', settings: { successProbability: n } }), 0.1)}
      <button onClick={() => dispatch({ type: 'DEV_RESET_HEARTS' })}>하트 초기화</button>
      <button onClick={() => dispatch({ type: 'DEV_RESET_ENDING' })}>엔딩 상태 초기화</button>
      <button onClick={() => { if (confirm('모든 게임 데이터를 초기화할까요?')) dispatch({ type: 'DEV_RESET_ALL' }); }}>게임 데이터 초기화</button>
      <button onClick={() => setOpen(false)}>닫기</button>
    </div>
  );
}
