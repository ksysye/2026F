/* E2E 시나리오 테스트 (dev 서버 필요):  npm run dev  →  node scripts/e2e.cjs [url] */
const { chromium } = require('playwright');
const URL = process.argv[2] || 'http://localhost:5173/';
const KEY = 'capsule-claw-game/v1';
let fails = 0;
const ok = (c, m) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${m}`); if (!c) fails++; };

async function boot(browser, { prob, clear = false, shots } = {}) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 780 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript(({ KEY, prob, clear }) => {
    if (clear && !sessionStorage.getItem('cleared')) { localStorage.clear(); sessionStorage.setItem('cleared', '1'); }
    if (prob !== undefined) localStorage.setItem(KEY + '/dev', JSON.stringify({ successProbability: prob }));
  }, { KEY, prob, clear });
  await page.goto(URL);
  return { ctx, page, errors };
}
const phase = (p) => p.getAttribute('.game-root', 'data-phase');
const waitPhase = (p, ph, t = 20000) => p.waitForSelector(`.game-root[data-phase="${ph}"]`, { timeout: t });
const hearts = (p) => p.locator('.heart.on').count();
const clawX = async (p) => parseFloat(await p.getAttribute('.claw', 'data-claw-x'));
async function moveTo(p, x) {
  for (let i = 0; i < 40; i++) {
    const cx = await clawX(p);
    if (Math.abs(cx - x) < 6) return;
    const k = cx < x ? 'ArrowRight' : 'ArrowLeft';
    await p.keyboard.down(k); await p.waitForTimeout(Math.min(300, Math.abs(cx - x) / 150 * 1000 - 20 > 20 ? Math.abs(cx - x) / 150 * 1000 - 20 : 20)); await p.keyboard.up(k);
    await p.waitForTimeout(40);
  }
}

(async () => {
  const browser = await chromium.launch();

  // ---------- A: 성공 흐름 ----------
  {
    const { page: p, errors } = await boot(browser, { prob: 1, clear: true });
    await p.waitForTimeout(2200);
    await p.screenshot({ path: '/tmp/shots-intro.png' });
    await waitPhase(p, 'MACHINE_IDLE');
    ok(true, '1-2. 인트로(열쇠/자물쇠) 후 인형 뽑기 화면으로 자동 전환');
    ok(await hearts(p) === 3, '초기 하트 3개');
    await p.screenshot({ path: '/tmp/shots-machine.png' });

    await moveTo(p, 90); const x1 = await clawX(p);
    await moveTo(p, 400); const x2 = await clawX(p);
    ok(x1 < 110 && x2 <= 296.01, `3. 집게 좌우 이동 및 범위 제한 (${x1.toFixed(0)} / ${x2.toFixed(0)})`);

    await moveTo(p, 249);
    await p.keyboard.press('Space');
    await p.waitForTimeout(300);
    ok(['CLAW_GRABBING', 'CLAW_RETURNING'].includes(await phase(p)), '집게 작동 중 phase 전환');
    await p.keyboard.press('Space'); // 중복 입력 무시
    await waitPhase(p, 'CAPSULE_OPENING');
    ok(true, '7. 성공 시 캡슐 개봉 애니메이션 진입');
    await p.waitForTimeout(2000); await p.screenshot({ path: '/tmp/shots-opening.png' });
    await waitPhase(p, 'REWARD_REVEAL');
    ok(await hearts(p) === 3, '5. 성공 시 하트 유지');
    const name1 = await p.textContent('.reward-display h2');
    await p.screenshot({ path: '/tmp/shots-reward.png' });
    await p.click('[data-testid=close]');
    await waitPhase(p, 'MACHINE_IDLE');
    ok(await p.locator('[data-capsule=capsule-04]').count() === 1, '10. 닫기 → 캡슐 기계로 복귀');
    ok(await hearts(p) === 3, '닫기 시 하트 차감 없음');
    await p.click('.collection-btn', { force: true }); await waitPhase(p, 'COLLECTION');
    ok((await p.textContent('[data-testid=count]')) === '0/4', '닫기 후 보관함에 미등록 (0/4)');
    await p.click('[data-testid=col-close]'); await waitPhase(p, 'MACHINE_IDLE');

    await moveTo(p, 249); await p.keyboard.press('Space');
    await waitPhase(p, 'REWARD_REVEAL', 30000);
    const name2 = await p.textContent('.reward-display h2');
    ok(name1 === name2, `11. 같은 캡슐 → 같은 보상 (${name1} / ${name2})`);
    await p.click('[data-testid=save]');
    await waitPhase(p, 'MACHINE_IDLE');
    ok(await p.locator('[data-capsule=capsule-04]').count() === 0, '9. 저장 후 캡슐이 기계에서 제거');
    await p.click('.collection-btn', { force: true }); await waitPhase(p, 'COLLECTION');
    ok((await p.textContent('[data-testid=count]')) === '1/4', '8. 저장 → 보관함 1/4');
    await p.click('[data-slot=capsule-04]');
    ok(await p.locator('.detail-page').count() === 1, '보관함 상세 보기');
    await p.screenshot({ path: '/tmp/shots-collection.png' });
    await p.waitForTimeout(700); await p.click('[data-testid=detail-close]');
    await p.waitForTimeout(700); await p.click('[data-testid=col-close]');

    // 새로고침 유지
    await p.reload(); await waitPhase(p, 'MACHINE_IDLE');
    await p.click('.collection-btn', { force: true }); await waitPhase(p, 'COLLECTION');
    ok((await p.textContent('[data-testid=count]')) === '1/4', '12. 새로고침 후에도 보관함 유지');
    await p.waitForTimeout(700); await p.click('[data-testid=col-close]');

    // 16. 나머지 3개 저장 → 수집 완료
    for (const [cap, x] of [['capsule-02', 249], ['capsule-01', 212], ['capsule-03', 286]]) {
      await moveTo(p, x); await p.keyboard.press('Space');
      await waitPhase(p, 'REWARD_REVEAL', 30000);
      await p.click('[data-testid=save]'); await waitPhase(p, 'MACHINE_IDLE');
    }
    await p.click('.collection-btn', { force: true }); await waitPhase(p, 'COLLECTION');
    ok((await p.textContent('[data-testid=count]')) === '4/4' && await p.locator('.collection.complete').count() === 1, '16. 4/4 수집 완료 표시');
    await p.screenshot({ path: '/tmp/shots-complete.png' });
    ok(errors.length === 0, `콘솔 에러 없음 ${errors.join('|')}`);
  }

  // ---------- B: 실패 → 하트 → 엔딩 ----------
  {
    const { page: p, errors } = await boot(browser, { prob: 0, clear: true });
    await waitPhase(p, 'MACHINE_IDLE');
    const rewardsBefore = await p.locator('[data-capsule]').count();
    for (const expected of [2, 1, 0]) {
      await moveTo(p, 249); await p.keyboard.press('Space');
      if (expected > 0) await waitPhase(p, 'MACHINE_IDLE', 30000);
      else await waitPhase(p, 'MESSAGE_ARRIVAL', 30000);
      ok(await hearts(p) === expected, `4. 실패 → 하트 ${expected}개`);
    }
    ok(await p.locator('[data-capsule]').count() === rewardsBefore, '실패 시 캡슐 AVAILABLE 유지');
    ok((await p.textContent('.arrival-card p')) === '메세지 창이 도착했습니다!', '엔딩 팝업 문구 정확');
    await p.screenshot({ path: '/tmp/shots-arrival.png' });
    ok(await p.locator('[data-testid=ending]').count() === 0, '팝업 단계에서는 종료 화면으로 넘어가지 않음');
    await p.keyboard.press('Space'); await p.waitForTimeout(500);
    ok(await phase(p) === 'MESSAGE_ARRIVAL', '13. 하트 0 → 뽑기 불가');

    // 새로고침해도 메시지 단계 복원
    await p.reload(); await waitPhase(p, 'MESSAGE_ARRIVAL');
    ok(true, '하트 0 새로고침 → 엔딩 이어서 진행');
    await p.click('[data-testid=open-message]'); await waitPhase(p, 'MESSAGE_OPEN');
    await p.waitForTimeout(700); await p.screenshot({ path: '/tmp/shots-letter-opening.png' });
    await p.waitForTimeout(2000); await p.screenshot({ path: '/tmp/shots-letter.png' });
    ok((await p.textContent('[data-testid=letter-text]')).includes('karma'), '임시 메시지 표시');
    await p.waitForTimeout(3000);
    ok(await phase(p) === 'MESSAGE_OPEN', '메시지는 자동으로 닫히지 않음');
    await p.click('[data-testid=finish]');
    await p.waitForTimeout(900); await p.screenshot({ path: '/tmp/shots-fade.png' });
    await waitPhase(p, 'GAME_OVER', 8000);
    await p.waitForTimeout(2300);
    ok(await p.locator('.mbtn:not([disabled])').count() === 0 && await p.locator('.collection-btn:not([disabled])').count() === 1, '엔딩 후: 뽑기 불가 + 보관함 열람 가능, 재시작 UI 없음');
    await p.screenshot({ path: '/tmp/shots-ending.png' });
    await p.click('.collection-btn'); await waitPhase(p, 'COLLECTION');
    await p.waitForTimeout(700); await p.click('[data-testid=col-close]'); await waitPhase(p, 'GAME_OVER');
    ok(true, '엔딩 후 보관함 열람 → 닫기 → 둘러보기 상태 복귀');
    await p.reload(); await p.waitForTimeout(1500);
    ok(await phase(p) === 'GAME_OVER', '새로고침해도 종료 상태 유지(자동 재시작 안 됨)');
    ok(errors.length === 0, `콘솔 에러 없음 ${errors.join('|')}`);
  }

  // ---------- C: 개발자 하트 설정 반영 ----------
  {
    const { page: p } = await boot(browser, { prob: 1, clear: true });
    await waitPhase(p, 'MACHINE_IDLE');
    await p.keyboard.press('Control+Shift+D');
    await p.waitForSelector('[data-testid=devpanel]');
    const inputs = p.locator('.devpanel input');
    await inputs.nth(1).fill('5'); // 최대 하트
    await inputs.nth(0).fill('5'); // 현재 하트
    await p.waitForTimeout(200);
    ok(await p.locator('.heart').count() === 5 && await hearts(p) === 5, '15. 개발자가 하트 5로 변경 → UI 반영');
  }

  await browser.close();
  console.log(fails ? `\n${fails} FAILED` : '\nALL PASSED');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
