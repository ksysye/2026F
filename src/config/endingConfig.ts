/**
 * 엔딩(메시지 도착) 설정
 * finalMessage 에 실제 편지 내용을 입력하세요. 비어 있으면 placeholderMessage 가 표시됩니다.
 * 글꼴/색/종이 배경은 letterStyle 에서 바꿉니다. (이미지 사용 시 paperImage)
 */
export const ENDING_CONFIG = {
  /** 이 하트 수 이하가 되면 엔딩 시작 */
  triggerHearts: 0,

  arrivalMessage: '메세지 창이 도착했습니다!',

  /** 추후 실제 메시지 입력 (줄바꿈은 \n) */
  finalMessage: '',
  placeholderMessage: '여기에 전하고 싶은 메시지가 들어갑니다.\n\n(개발자: src/config/endingConfig.ts 의 finalMessage 를 수정하세요.)',

  messageButtonText: '메시지 확인하기',
  finishButtonText: '마침',

  /**
   * false(기본): '마침' 후 별도 종료 화면 없이 앱으로 돌아와 보관함 등을 구경할 수 있음(뽑기는 불가, 재시작/충전 없음).
   * true: 버튼 없는 최종 엔딩 화면에서 종료.
   */
  showEndingScreen: false,

  /** 최종 엔딩 화면 문구 (showEndingScreen=true 일 때) */
  endingText: '끝',

  allowUserRestart: false,
  allowUserReset: false,
  persistEnding: true,

  letterStyle: {
    fontFamily: "'Nanum Pen Script','Gamja Flower','Apple SD Gothic Neo','Noto Sans KR',system-ui,sans-serif",
    fontSize: '17px',
    lineHeight: '1.7',
    color: '#5b4636',
    textAlign: 'left' as 'left' | 'center',
    paperBackground: '#fffaf0',
    /** 편지지 이미지 (예: assets/ending/paper.png). null이면 위 색상 사용 */
    paperImage: null as string | null,
  },
} as const;
