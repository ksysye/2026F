#!/usr/bin/env python3
"""myETL(Canvas) 스윕: 조회/다운로드 전용 (쓰기 요청 없음).

환경변수: CANVAS_API_TOKEN, CANVAS_BASE_URL
사용:
  python sweep.py collect [--term 2026]     # events.json 생성
  python sweep.py table                     # dry-run 일정 표 출력
  python sweep.py ics                       # 2026F.ics 생성 (UID=고유키, 재가져오기해도 중복 없음)
  python sweep.py download                  # 과목별 폴더로 파일 다운로드 (기존 파일은 건너뜀)
"""
import argparse, json, os, re, sys, urllib.parse, urllib.request, urllib.error
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent
LOG = ROOT / "log.txt"
EVENTS = ROOT / "events.json"
KST = timezone(timedelta(hours=9))


def log(msg):
    with LOG.open("a", encoding="utf-8") as f:
        f.write(f"{datetime.now(KST).isoformat(timespec='seconds')} {msg}\n")
    print("LOG:", msg, file=sys.stderr)


def cfg():
    tok, base = os.environ.get("CANVAS_API_TOKEN"), os.environ.get("CANVAS_BASE_URL")
    if not tok or not base:
        sys.exit("CANVAS_API_TOKEN / CANVAS_BASE_URL 환경변수를 설정하세요.")
    return tok, base.rstrip("/")


def _open(url, tok):
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {tok}"}, method="GET")
    return urllib.request.urlopen(req, timeout=60)


def get_all(path, params=None):
    """GET 전용 페이지네이션 조회. 실패 시 예외."""
    tok, base = cfg()
    q = urllib.parse.urlencode(params or {}, doseq=True)
    url = f"{base}{path}?{q}&per_page=100" if q else f"{base}{path}?per_page=100"
    out = []
    while url:
        with _open(url, tok) as r:
            data = json.load(r)
            link = r.headers.get("Link", "")
        out.extend(data if isinstance(data, list) else [data])
        m = re.search(r'<([^>]+)>;\s*rel="next"', link)
        url = m.group(1) if m else None
    return out


def safe(label, fn, default):
    try:
        return fn()
    except Exception as e:  # 실패해도 계속 진행
        log(f"FAIL {label}: {e}")
        return default


def clean(name):
    return re.sub(r'[\\/:*?"<>|]', "_", name).strip() or "unnamed"


def collect(term):
    courses = safe("courses", lambda: get_all("/api/v1/courses", {
        "enrollment_state": "active", "include[]": ["term"]}), [])
    courses = [c for c in courses if c.get("name") and (not term or term in json.dumps(c.get("term") or {}, ensure_ascii=False) + c["name"])]
    events, meta = [], []
    for c in courses:
        cid, cname = c["id"], clean(c["name"])
        print(f"수집: {cname} ({cid})", file=sys.stderr)
        meta.append({"course_id": cid, "course": cname, "term": (c.get("term") or {}).get("name")})

        def add(kind, item_id, title, due, url=None, extra=None):
            events.append({"key": f"{cid}-{kind}-{item_id}", "course_id": cid, "course": cname,
                           "type": kind, "title": title, "due": due, "url": url, **(extra or {})})

        for a in safe(f"{cid} assignments", lambda: get_all(f"/api/v1/courses/{cid}/assignments"), []):
            if a.get("due_at"):
                add("assignment", a["id"], a["name"], a["due_at"], a.get("html_url"))
        for qz in safe(f"{cid} quizzes", lambda: get_all(f"/api/v1/courses/{cid}/quizzes"), []):
            if qz.get("due_at"):
                add("quiz", qz["id"], qz["title"], qz["due_at"], qz.get("html_url"))
        for ev in safe(f"{cid} calendar", lambda: get_all("/api/v1/calendar_events", {
                "context_codes[]": [f"course_{cid}"], "type": "event",
                "start_date": "2026-08-01", "end_date": "2027-01-31"}), []):
            if ev.get("start_at"):
                add("event", ev["id"], ev["title"], ev["start_at"], ev.get("html_url"), {"end": ev.get("end_at")})
        for an in safe(f"{cid} announcements", lambda: get_all("/api/v1/announcements", {
                "context_codes[]": [f"course_{cid}"], "start_date": "2026-08-01", "end_date": "2027-01-31"}), []):
            add("announcement", an["id"], an["title"], None, an.get("html_url"), {"posted": an.get("posted_at")})
        for m in safe(f"{cid} modules", lambda: get_all(f"/api/v1/courses/{cid}/modules", {"include[]": ["items"]}), []):
            for it in m.get("items", []):
                add("module_item", it["id"], f'{m["name"]} / {it["title"]}', None, it.get("html_url"))
        for f in safe(f"{cid} files", lambda: get_all(f"/api/v1/courses/{cid}/files"), []):
            add("file", f["id"], f["display_name"], None, f.get("url"),
                {"filename": f["filename"], "folder_id": f.get("folder_id"), "size": f.get("size"),
                 "updated_at": f.get("updated_at")})
    EVENTS.write_text(json.dumps({"courses": meta, "events": events}, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"events.json: 과목 {len(meta)}개, 항목 {len(events)}개")


def load():
    return json.loads(EVENTS.read_text(encoding="utf-8"))


def dated(d):
    return sorted((e for e in d["events"] if e["due"] and e["type"] in ("assignment", "quiz", "event")),
                  key=lambda e: e["due"])


def kst(s):
    return datetime.fromisoformat(s.replace("Z", "+00:00")).astimezone(KST)


def table():
    print("| # | 마감(KST) | 제목 | 유형 | 키 |\n|---|---|---|---|---|")
    for i, e in enumerate(dated(load()), 1):
        print(f"| {i} | {kst(e['due']):%Y-%m-%d %H:%M} | [{e['course']}] {e['title']} | {e['type']} | {e['key']} |")


def ics():
    lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//2026F sweep//KO", "X-WR-TIMEZONE:Asia/Seoul"]
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    esc = lambda s: s.replace("\\", "\\\\").replace(",", "\\,").replace(";", "\\;").replace("\n", "\\n")
    for e in dated(load()):
        due = kst(e["due"])
        end = kst(e["end"]) if e.get("end") else due
        start = due if e["type"] == "event" else due - timedelta(minutes=30)
        fmt = lambda d: d.strftime("%Y%m%dT%H%M%S")
        lines += ["BEGIN:VEVENT", f"UID:{e['key']}@2026F", f"DTSTAMP:{stamp}",
                  f"DTSTART;TZID=Asia/Seoul:{fmt(start)}", f"DTEND;TZID=Asia/Seoul:{fmt(end if e['type']=='event' else due)}",
                  f"SUMMARY:{esc('[' + e['course'] + '] ' + e['title'])}",
                  f"DESCRIPTION:{esc(e.get('url') or '')}",
                  "BEGIN:VALARM", "ACTION:DISPLAY", "TRIGGER:-P1D", "DESCRIPTION:마감 하루 전", "END:VALARM",
                  "END:VEVENT"]
    lines.append("END:VCALENDAR")
    (ROOT / "2026F.ics").write_text("\r\n".join(lines) + "\r\n", encoding="utf-8")
    print("2026F.ics 생성")


def bucket(filename):
    n = filename.lower()
    if re.search(r"hw|assign|과제|report|problem|pset|lab", n): return "assignments"
    if re.search(r"lec|lecture|slide|note|강의|week|ch\d", n): return "lecture_notes"
    if re.search(r"read|paper|article|ref|논문|교재", n): return "readings"
    return "etc"


def download():
    tok, _ = cfg()
    n_ok = n_skip = n_fail = 0
    for e in load()["events"]:
        if e["type"] != "file" or not e.get("url"):
            continue
        dest = ROOT / e["course"] / bucket(e["filename"]) / clean(e["filename"])
        if dest.exists():
            n_skip += 1
            continue
        try:
            dest.parent.mkdir(parents=True, exist_ok=True)
            with _open(e["url"], tok) as r, dest.open("wb") as f:
                while chunk := r.read(1 << 16):
                    f.write(chunk)
            n_ok += 1
        except Exception as ex:
            dest.unlink(missing_ok=True)
            log(f"FAIL download {e['course']}/{e['filename']}: {ex}")
            n_fail += 1
    print(f"다운로드 {n_ok}, 건너뜀 {n_skip}, 실패 {n_fail}")


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("cmd", choices=["collect", "table", "ics", "download"])
    p.add_argument("--term", default="", help="학기 필터 문자열 (예: 2026)")
    a = p.parse_args()
    {"collect": lambda: collect(a.term), "table": table, "ics": ics, "download": download}[a.cmd]()
