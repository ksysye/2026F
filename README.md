# 2026F
## myETL → Google Calendar 동기화 (2026-2)

1. `python3 sweep.py` — myETL 일정 수집, `events.json` 갱신, `calendar_state.json`과 비교해 `new` / `changed` / `unchanged` / `past` 표시.
   (`--download`: 파일 내려받기, 토큰은 `CANVAS_API_TOKEN`, `CANVAS_BASE_URL` 환경변수)
2. `new`는 캘린더에 생성, `changed`는 `event_id`로 수정, 등록 후 `calendar_state.json`에 `{key: {hash, event_id}}` 기록.
3. 규칙: 제목 `[과목명] 항목`, 하루 전 팝업 알림, Asia/Seoul. 색상 물리학 2=9, 조선해양공학의 이해=7, 역사와 역사 재현=6.
4. 종일 일정은 UTC 자정(`2026-10-05T00:00:00Z`, `timeZone: UTC`)으로 넣어야 날짜가 밀리지 않음.
5. 공지에서 읽은 일정은 `events.json`에 `"source": "announcement"`로 추가하면 재수집 때 보존됨.

필요한 네트워크 허용: myetl.snu.ac.kr, kr.object.gov-ncloudstorage.com

## 개인 비서 사이트 (Artifact, 비공개)

- URL: https://claude.ai/artifact/KSzjBTwWeSkxaUSupxGXeH (소스 `site/index.html`, 수정 후 같은 경로로 게시하면 URL 유지)
- 페이지: 오늘 / 주간 계획 / 캘린더(추가·수정·삭제) / 성적 / 과목별(요약·과제 안내·메모)
- 데이터는 사이트 DB(`ArtifactData`)에 있음 (페이지 소스에 넣지 않음):
  - `items/<id>`: course, title, kind(assignment|exam|class|event|todo), start(ISO +09:00), allDay, done, note, source, `gcalId`(Google 캘린더 이벤트 id), `dirty`(사이트에서 고쳐 캘린더 반영 대기), `deleted`(소프트 삭제)
  - `courses/<key>`: name, order, grading, note, sections[], guides[], files[]  (key: phys2, physlab, math2, mathex, hist, bio, ship)
  - `plans/<id>`: week(월요일 날짜), course, text, done, order
  - `grades/<key>`: canvasScore, estimate, summary, components[], entries[], link (myETL에서 조회한 값, 쓰기 없음)
  - `notes/<key>`: 사용자 메모. `meta/briefing`: syncedAt, gradesAt, suggestions[]
- "캘린더 동기화" 요청 시: `dirty:true` 항목을 Google 캘린더에 생성/수정/삭제(`deleted:true`)한 뒤 `dirty`를 해제하고 `gcalId`를 기록
- 성적은 myETL에서 읽기만 한다. 제출·성적·댓글 수정 같은 쓰기 작업은 하지 않는다.
