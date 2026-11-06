"""Open every view (home, each course tab, every lecture) and report JS errors. Run before every publish.
usage: python tools/check_all.py"""
import subprocess, sys, re, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = open(os.path.join(ROOT, "out", "study-hub.html"), encoding="utf-8").read()
views = ["home", "rl", "speech", "circ"] + re.findall(r'id="ch-([a-z]{1,2}\d+)"', src)
bad = 0
for v in views:
    out = subprocess.run([sys.executable, os.path.join(ROOT, "tools", "probe.py"), os.path.join(ROOT, "tools", "errors.js"), v], capture_output=True, text=True, encoding="utf-8").stdout.strip()
    ok = "errors: []" in out; bad += not ok; print(("OK   " if ok else "FAIL ") + v + "  " + ("" if ok else out))
sys.exit(1 if bad else 0)
