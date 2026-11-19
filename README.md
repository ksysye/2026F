# 캡슐 인형 뽑기 (React + TypeScript + Vite)

열쇠 → 자물쇠 해제 → 인형 뽑기 → 캡슐 개봉 → 저장/닫기 → 보관함 → 하트 0 → 메시지 도착 → 편지 → 마침 → 엔딩.

## 실행

```bash
npm install
npm run dev        # 개발 서버 (개발자 패널 사용 가능)
npm run build      # 프로덕션 빌드 (개발자 패널/설정 override 제외)
npm run preview
node scripts/e2e.cjs   # dev 서버 실행 중에 시나리오 테스트(Playwright)
```

조작: 화면 버튼(터치/마우스) 또는 키보드 ←/→(A/D) 이동, Space/Enter 뽑기.

## 구조

```
src/config/   gameConfig(규칙) · endingConfig(메시지/엔딩) · assets(경로) · layout(위치/크기) · timing(애니메이션 시간) · rewards(캡슐↔보상)
src/game/     store(상태머신/reducer) · storage(저장 어댑터) · anim(트윈) · types
src/components/  Intro/Key/Lock · ClawMachineScreen(+HeartDisplay, ClawController, CapsuleContainer, MachineControls)
                 CapsuleOpeningScreen · RewardScreen · CollectionScreen · ending/(MessageArrivalPopup, LetterScreen, EndingScreen)
src/styles/global.css   맨 위 THEME 변수 = 색상
```

## 에셋 교체

`public/assets/` 아래에 같은 이름의 파일을 넣으면 임시 그림이 자동으로 대체됩니다(없으면 코드가 그린 임시 그래픽 표시). 경로/이름은 `src/config/assets.ts`에서 변경.

| 파일 | 용도 |
|---|---|
| intro/background.png, key.png, lock.png | 인트로 (lock은 별도 레이어; 배경에 자물쇠가 포함돼 있으면 lock.png 없이 `INTRO_LAYOUT.lock` 위치만 맞추세요) |
| machine/background.png, machine.png | 배경 / 기계 프레임(스테이지 전체 크기 360×640 비율 권장) |
| machine/claw.png, claw-closed.png(선택) | 집게. 허브(줄 연결점)는 이미지 상단 중앙 |
| machine/button-left/right/grab.png | 조작 버튼 |
| capsules/capsule-01~04.png | 캡슐 (개봉 시 위/아래 반으로 갈라짐) |
| rewards/reward-01~04.png | 보상 |
| ui/heart.png, collection.png | 하트 / 보관함 버튼 |
| animations/capsule-opening.mp4 | 개봉 영상. `ASSETS.animations.capsuleOpening`에 경로 지정 시 사용(실패하면 CSS 연출) |

위치/크기: 열쇠·자물쇠 = `INTRO_LAYOUT`, 집게·캡슐·버튼·배출구 = `MACHINE_LAYOUT` (360×640 가상 좌표, 화면에 맞춰 자동 확대). 시간 = `timing.ts`. 보상 이름/설명 = `rewards.ts`. 편지 글/글꼴/종이 = `endingConfig.ts`.

## 개발자 설정

- 규칙: `src/config/gameConfig.ts` (하트 수, 성공 확률, 캡슐 수, 고정 보상 등). 저장된 게임은 저장된 하트를 유지하므로 즉시 적용하려면 아래 패널에서 초기화.
- **개발자 패널**: `npm run dev` 상태에서 `Ctrl+Shift+D` — 현재/최대/초기 하트, 성공 확률, 하트 초기화, 엔딩 상태 초기화, 전체 데이터 초기화. 프로덕션 빌드에는 패널과 override 읽기가 포함되지 않아 일반 사용자 UI에 관리 기능이 노출되지 않습니다.
- 엔딩: `src/config/endingConfig.ts`의 `finalMessage`에 실제 메시지를 입력.

## 동작 규칙 요약

- 실패 시에만 하트 1개 차감(집게가 닫히는 시점에 확정·저장 → 새로고침으로 되돌리거나 중복 차감 불가). 성공/저장/닫기/보관함은 차감 없음.
- 캡슐 ↔ 보상 고정. 닫기 → 캡슐 복귀(저장 안 됨), 저장 → 기계에서 제거 + 보관함 등록(중복 저장 방지).
- 저장되는 것은 하트·저장 목록·엔딩 종료 여부뿐. 진행 중이던 캡슐은 새로고침 시 AVAILABLE로 복원.
- 하트 0 → 마지막 실패 애니메이션 후 "메세지 창이 도착했습니다!" → 메시지 확인하기 → 편지 → 마침 → 페이드아웃 → 엔딩. 엔딩 이후 재시작/보관함 접근 UI 없음, 새로고침해도 유지, 보관함 데이터는 삭제되지 않음.

## 보안 참고

현재 상태는 localStorage라 브라우저 개발자 도구로 값을 직접 수정할 수 있습니다. 실제 서비스에서 하트·보상을 조작 불가하게 하려면 `src/game/storage.ts`의 `StorageAdapter`를 서버 API로 교체하고 뽑기 판정/하트 차감/설정 변경을 서버에서 권한 검증하세요.

## 엔딩 이후

'마침' 후에는 종료 화면으로 끝나지 않고 앱으로 돌아와 보관함(편지 상세 포함)을 자유롭게 구경할 수 있습니다. 뽑기 조작은 비활성화되고 재시작/하트 충전 UI는 없습니다. 버튼 없는 최종 엔딩 화면을 쓰려면 `ENDING_CONFIG.showEndingScreen = true`.

## 입장 암호 / 배포 (GitHub Pages)

- 배포본(`npm run build`)은 처음에 숫자 암호 화면이 나옵니다. 암호는 `src/config/gateConfig.ts`의 `password`. 개발 서버(`npm run dev`)에서는 꺼집니다. 정적 사이트라 암호가 코드에 들어 있으므로 우연히 열어 보는 것을 막는 용도입니다.
- 배포: 저장소 Settings → Pages → Source 를 "GitHub Actions"로 설정하고 `main`에 푸시하면 `.github/workflows/deploy.yml`이 자동 배포합니다.
