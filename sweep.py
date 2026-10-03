#!/usr/bin/env python3
"""myETL(Canvas) 스윕: 일정 수집(events.json) + 파일 다운로드(~/2026F/<과목>/...).

읽기 전용(GET)만 사용한다. 토큰은 환경변수에서만 읽는다.
  CANVAS_API_TOKEN, CANVAS_BASE_URL
사용법:
  python3 sweep.py                # 일정 수집 + events.json + dry-run 표
  python3 sweep.py --download     # 위 작업 + 파일 다운로드
  python3 sweep.py --skip-events --download
"""
import argparse
import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

import requests

KST = ZoneInfo("Asia/Seoul")
ROOT = Path(os.environ.get("SWEEP_ROOT", Path.home() / "2026F")).expanduser()
LOG = ROOT / "log.txt"
EVENTS = ROOT / "events.json"
STATE = ROOT / "calendar_state.json"  # 캘린더 등록 후 {key: {hash, calendar_id}} 저장용


def log(msg):
    ROOT.mkdir(parents=True, exist_ok=True)
    with LOG.open("a", encoding="utf-8") as f:
        f.write(f"{datetime.now(KST).isoformat(timespec='seconds')} {msg}\n")
    print(f"[!] {msg}", file=sys.stderr)


class Canvas:
    def __init__(self):
        try:
            self.base = os.environ["CANVAS_BASE_URL"].rstrip("/")
            token = os.environ["CANVAS_API_TOKEN"]
        except KeyError as e:
            sys.exit(f"환경변수 {e.args[0]} 가 필요합니다.")
        self.s = requests.Session()
        self.s.headers["Authorization"] = f"Bearer {token}"

    def get(self, path, **params):
        """페이지네이션을 따라가며 전체 결과를 반환. 실패 시 예외."""
        url = path if path.startswith("http") else f"{self.base}/api/v1{path}"
        params.setdefault("per_page", 100)
        out = []
        while url:
            r = self.s.get(url, params=params, timeout=30)
            r.raise_for_status()
            data = r.json()
            out.extend(data if isinstance(data, list) else [data])
            url = r.links.get("next", {}).get("url")
            params = {}
        return out

    def try_get(self, what, path, **params):
        try:
            return self.get(path, **params)
        except Exception as e:  # 실패해도 계속 진행
            log(f"FAIL {what} {path}: {e}")
            return []


def kst(iso):
    if not iso:
        return None
    return datetime.fromisoformat(iso.replace("Z", "+00:00")).astimezone(KST).isoformat()


def safe(name):
    return re.sub(r'[\\/:*?"<>|]+', "_", name).strip() or "unnamed"


def collect(cv):
    courses = [c for c in cv.try_get("courses", "/courses", enrollment_state="active", include=["term"])
               if c.get("name") and not c.get("access_restricted_by_date")]
    events, files = [], []
    for c in courses:
        cid, cname = c["id"], safe(c["name"])
        def add(kind, item_id, title, due, url, extra=None):
            events.append({"key": f"{cid}-{kind}-{item_id}", "course_id": cid, "course": cname,
                           "kind": kind, "title": title, "due": kst(due), "url": url, **(extra or {})})
        for a in cv.try_get("assignments", f"/courses/{cid}/assignments"):
            if a.get("due_at"):
                add("assignment", a["id"], a["name"], a["due_at"], a.get("html_url"))
        for q in cv.try_get("quizzes", f"/courses/{cid}/quizzes"):
            if q.get("due_at"):
                add("quiz", q["id"], q["title"], q["due_at"], q.get("html_url"))
        for ev in cv.try_get("calendar_events", "/calendar_events", context_codes=[f"course_{cid}"],
                             type="event", start_date="2026-08-01", end_date="2027-01-31"):
            add("event", ev["id"], ev["title"], ev.get("start_at"), ev.get("html_url"),
                {"end": kst(ev.get("end_at"))})
        for an in cv.try_get("announcements", "/announcements", context_codes=[f"course_{cid}"]):
            pass  # 공지는 일정이 아니므로 events에 넣지 않음(필요 시 본문에서 날짜 확인)
        for m in cv.try_get("modules", f"/courses/{cid}/modules", include=["items"]):
            for it in m.get("items", []):
                if it.get("type") == "File" and it.get("content_id"):
                    files.append((cid, cname, it["content_id"], f"모듈:{m.get('name', '')}"))
        for f in cv.try_get("files", f"/courses/{cid}/files"):
            files.append((cid, cname, f["id"], "files"))
        # 과제 설명 속 첨부 파일 링크
        for a in cv.try_get("assignment-files", f"/courses/{cid}/assignments"):
            for fid in re.findall(r"/files/(\d+)", a.get("description") or ""):
                files.append((cid, cname, int(fid), "assignment"))
    return courses, events, files


def classify(fobj, origin):
    n = fobj.get("display_name", "").lower()
    if origin == "assignment" or any(k in n for k in ("hw", "assign", "과제", "homework", "pset")):
        return "assignments"
    if any(k in n for k in ("lecture", "lec", "slide", "강의", "ppt", "note", "week", "chapter", "ch")):
        return "lecture_notes"
    if any(k in n for k in ("reading", "paper", "article", "읽기")):
        return "readings"
    return "etc"


def download(cv, files):
    seen, saved, skipped = set(), 0, 0
    for cid, cname, fid, origin in files:
        if (cid, fid) in seen:
            continue
        seen.add((cid, fid))
        try:
            meta = cv.get(f"/files/{fid}")[0]
            sub = classify(meta, origin)
            dest = ROOT / cname / sub / safe(meta["display_name"])
            if dest.exists():  # 덮어쓰지 않고 건너뜀
                skipped += 1
                continue
            dest.parent.mkdir(parents=True, exist_ok=True)
            with cv.s.get(meta["url"], stream=True, timeout=120) as r:
                r.raise_for_status()
                with dest.open("wb") as f:
                    for chunk in r.iter_content(1 << 16):
                        f.write(chunk)
            saved += 1
        except Exception as e:
            log(f"FAIL download file {fid} (course {cid}): {e}")
    return saved, skipped


def diff_against_state(events):
    """calendar_state.json 과 비교해 new/changed/unchanged 로 분류(중복 방지)."""
    state = json.loads(STATE.read_text()) if STATE.exists() else {}
    for e in events:
        h = json.dumps({k: e[k] for k in ("title", "due", "end") if k in e}, sort_keys=True)
        old = state.get(e["key"])
        e["status"] = "new" if not old else ("changed" if old.get("hash") != h else "unchanged")
        e["hash"] = h
    return events


def print_table(events):
    rows = sorted((e for e in events if e["due"]), key=lambda e: e["due"])
    print(f"\n{'마감/시작(KST)':<17} {'상태':<9} 제목")
    for e in rows:
        print(f"{e['due'][:16].replace('T', ' '):<17} {e['status']:<9} [{e['course']}] {e['title']}")
    print(f"\n총 {len(rows)}건 (new {sum(e['status']=='new' for e in rows)}, "
          f"changed {sum(e['status']=='changed' for e in rows)})")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--download", action="store_true")
    ap.add_argument("--skip-events", action="store_true")
    args = ap.parse_args()
    ROOT.mkdir(parents=True, exist_ok=True)
    cv = Canvas()
    courses, events, files = collect(cv)
    print(f"과목 {len(courses)}개, 일정 {len(events)}건, 파일 후보 {len(files)}개")
    if not args.skip_events:
        events = diff_against_state(events)
        EVENTS.write_text(json.dumps(events, ensure_ascii=False, indent=2), encoding="utf-8")
        print_table(events)
    if args.download:
        saved, skipped = download(cv, files)
        print(f"\n다운로드 {saved}개, 기존 파일 건너뜀 {skipped}개")
    if LOG.exists():
        print(f"\n실패 항목은 {LOG} 참고")


if __name__ == "__main__":
    main()
