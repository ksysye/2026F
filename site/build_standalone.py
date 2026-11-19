#!/usr/bin/env python3
"""site/index.html(Artifact용)을 독립 정적 사이트로 만든다.

claude.ai의 db 대신, 데이터 스냅샷 + 브라우저 localStorage에 저장하는 어댑터를 넣는다.
사용법:
  python3 site/build_standalone.py --data <export 폴더> --out docs/index.html            # 공개용(성적 제외)
  python3 site/build_standalone.py --data <export 폴더> --out private.html --grades      # 개인용(성적 포함)
<export 폴더>는 컬렉션별 하위 폴더(items/, courses/, plans/, grades/, meta/)에 문서 JSON이 들어 있는 구조
(ArtifactData list의 out_dir 결과 그대로).
"""
import argparse, glob, json, os, re

SHIM = r"""
<script>
(function () {
  var SNAP = __SNAPSHOT__;
  var KEY = "assistant-2026f-overlay-v1";
  var ov = {};
  try { ov = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { ov = {}; }
  var store = {};
  Object.keys(SNAP).forEach(function (c) { store[c] = {}; Object.keys(SNAP[c]).forEach(function (id) { store[c][id] = SNAP[c][id]; }); });
  Object.keys(ov).forEach(function (p) {
    var a = p.split("/"), c = a[0], id = a[1];
    store[c] = store[c] || {};
    if (ov[p] === null) delete store[c][id]; else store[c][id] = ov[p];
  });
  var subs = [];
  function save() { try { localStorage.setItem(KEY, JSON.stringify(ov)); } catch (e) {} }
  function notify() { subs.slice().forEach(function (f) { f(); }); }
  function snapDoc(c, id) { var d = (store[c] || {})[id]; return { id: id, exists: d !== undefined, data: function () { return d; } }; }
  function sub(fn) { subs.push(fn); setTimeout(fn, 0); return function () { subs = subs.filter(function (x) { return x !== fn; }); }; }
  function docRef(c, id) {
    return {
      id: id, path: c + "/" + id,
      get: function () { return Promise.resolve(snapDoc(c, id)); },
      onSnapshot: function (cb) { return sub(function () { cb(snapDoc(c, id)); }); },
      set: function (d) { store[c] = store[c] || {}; store[c][id] = JSON.parse(JSON.stringify(d)); ov[c + "/" + id] = store[c][id]; save(); notify(); return Promise.resolve(); },
      update: function (d) {
        var cur = (store[c] || {})[id];
        if (!cur) return Promise.reject({ code: "invalid_argument", message: "document does not exist" });
        var nx = JSON.parse(JSON.stringify(cur));
        Object.keys(d).forEach(function (k) { if (d[k] && d[k].__delete__) delete nx[k]; else nx[k] = d[k]; });
        store[c][id] = nx; ov[c + "/" + id] = nx; save(); notify(); return Promise.resolve();
      },
      delete: function () { if (store[c]) delete store[c][id]; ov[c + "/" + id] = null; save(); notify(); return Promise.resolve(); }
    };
  }
  var db = {
    collection: function (c) {
      return {
        onSnapshot: function (cb) { return sub(function () { cb({ docs: Object.keys(store[c] || {}).map(function (id) { return snapDoc(c, id); }) }); }); },
        doc: function (id) { return docRef(c, id); }
      };
    },
    doc: function (path) { var a = path.split("/"); return docRef(a[0], a[1]); }
  };
  window.claude = { use: function (n) { return Promise.resolve(n === "db" ? db : null); } };
  document.addEventListener("DOMContentLoaded", function () {
    var wrap = document.querySelector(".wrap"); if (!wrap) return;
    var reset = document.createElement("button");
    reset.className = "link-btn"; reset.textContent = "이 브라우저에서 고친 내용 모두 지우기";
    reset.onclick = function () { try { localStorage.removeItem(KEY); } catch (e) {} location.reload(); };
    var p = document.createElement("p");
    p.className = "note";
    p.textContent = "스냅샷 기준 화면이에요. 체크·추가·수정한 내용은 이 브라우저에만 저장돼요. ";
    p.append(reset); wrap.append(p);
  });
})();
</script>
"""

def load(d, include_grades):
    snap = {}
    for col in ["items", "courses", "plans", "grades", "meta", "notes"]:
        if col == "grades" and not include_grades: continue
        if col == "notes": continue
        snap[col] = {}
        for f in glob.glob(os.path.join(d, col, "*.json")):
            snap[col][os.path.basename(f)[:-5]] = json.load(open(f, encoding="utf-8"))
    if not include_grades:
        if "meta" in snap and "briefing" in snap["meta"]:
            snap["meta"]["briefing"].pop("gradesAt", None)
        # 과목 요약에 섞여 있는 점수 표현(예: "중간고사 95점")은 공개용에서 제거
        score = re.compile(r"\d+(\.\d+)?\s*점")
        for c in snap.get("courses", {}).values():
            for sec in c.get("sections", []):
                lines = []
                for ln in sec.get("lines", []):
                    kept = [x for x in ln.split(" · ") if not score.search(x)]
                    if kept: lines.append(" · ".join(kept))
                sec["lines"] = lines
    return snap

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--data", required=True); ap.add_argument("--out", required=True)
    ap.add_argument("--grades", action="store_true")
    ap.add_argument("--src", default=os.path.join(os.path.dirname(os.path.abspath(__file__)), "index.html"))
    a = ap.parse_args()
    page = open(a.src, encoding="utf-8").read()
    snap = load(a.data, a.grades)
    shim = SHIM.replace("__SNAPSHOT__", json.dumps(snap, ensure_ascii=False).replace("</", "<\\/"))
    head = '<!doctype html>\n<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
    if not a.grades: head += '<meta name="robots" content="noindex,nofollow">'
    head += '</head><body>\n'
    os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
    open(a.out, "w", encoding="utf-8").write(head + page.replace("<script>\n(function () {\n  var KST", shim + "<script>\n(function () {\n  var KST", 1) + "\n</body></html>\n")
    print("wrote", a.out, "grades" if a.grades else "no-grades", {k: len(v) for k, v in snap.items()})

if __name__ == "__main__":
    main()
