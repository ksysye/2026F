# 2026F
## myETL → Google Calendar 동기화 (2026-2)

1. `python3 sweep.py` — myETL 일정 수집, `events.json` 갱신, `calendar_state.json`과 비교해 `new` / `changed` / `unchanged` / `past` 표시.
   (`--download`: 파일 내려받기, 토큰은 `CANVAS_API_TOKEN`, `CANVAS_BASE_URL` 환경변수)
2. `new`는 캘린더에 생성, `changed`는 `event_id`로 수정, 등록 후 `calendar_state.json`에 `{key: {hash, event_id}}` 기록.
3. 규칙: 제목 `[과목명] 항목`, 하루 전 팝업 알림, Asia/Seoul. 색상 물리학 2=9, 조선해양공학의 이해=7, 역사와 역사 재현=6.
4. 종일 일정은 UTC 자정(`2026-10-05T00:00:00Z`, `timeZone: UTC`)으로 넣어야 날짜가 밀리지 않음.
5. 공지에서 읽은 일정은 `events.json`에 `"source": "announcement"`로 추가하면 재수집 때 보존됨.

필요한 네트워크 허용: myetl.snu.ac.kr, kr.object.gov-ncloudstorage.com
