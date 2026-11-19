import { useCallback, useEffect, useState } from 'react';
import { GATE_CONFIG, rememberGateUnlock } from '../config/gateConfig';

const LEN = GATE_CONFIG.password.length;
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

/** 입장 암호(숫자) 입력 화면 */
export function GateScreen({ onUnlock }: { onUnlock: () => void }) {
  const [value, setValue] = useState('');
  const [wrong, setWrong] = useState(false);
  const [ok, setOk] = useState(false);

  const press = useCallback((k: string) => {
    if (ok) return;
    if (k === '⌫') { setValue((v) => v.slice(0, -1)); return; }
    if (!/^\d$/.test(k)) return;
    setValue((v) => (v.length < LEN ? v + k : v));
  }, [ok]);

  useEffect(() => {
    if (value.length !== LEN) return;
    if (value === GATE_CONFIG.password) {
      setOk(true);
      rememberGateUnlock();
      const t = window.setTimeout(onUnlock, 700);
      return () => clearTimeout(t);
    }
    setWrong(true);
    const t = window.setTimeout(() => { setWrong(false); setValue(''); }, 700);
    return () => clearTimeout(t);
  }, [value, onUnlock]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Backspace') press('⌫'); else press(e.key); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [press]);

  return (
    <div className={`gate ${ok ? 'ok' : ''}`} data-testid="gate">
      <div className={`gate-dots ${wrong ? 'wrong' : ''}`} aria-label="암호 입력">
        {Array.from({ length: LEN }, (_, i) => <i key={i} className={i < value.length ? 'on' : ''} />)}
      </div>
      <div className="gate-pad">
        {KEYS.map((k, i) => (k === '' ? <span key={i} /> : (
          <button key={i} type="button" className="gate-key" aria-label={k === '⌫' ? '지우기' : k} onClick={() => press(k)}>{k}</button>
        )))}
      </div>
    </div>
  );
}
