import os, shutil, sys
def find_chrome():
    for c in [os.environ.get("CHROME"), shutil.which("google-chrome"), shutil.which("chromium"), shutil.which("chrome"), shutil.which("msedge"),
              r"C:\Program Files\Google\Chrome\Application\chrome.exe", r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
              r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
              "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"]:
        if c and os.path.exists(c): return c
    sys.exit("No Chrome/Edge found. Set the CHROME env var to the browser executable.")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGE = os.path.join(ROOT, "out", "study-hub.html")
WORK = os.path.join(ROOT, "work"); os.makedirs(WORK, exist_ok=True)
def wrapped(extra_head="", extra_tail=""):
    # the page is a fragment: it MUST be wrapped in a doctype or the browser uses quirks mode and CSS misbehaves
    body = open(PAGE, encoding="utf-8").read()
    if extra_tail:
        i = body.rindex("</script>") + len("</script>"); body = body[:i] + extra_tail + body[i:]
    path = os.path.join(WORK, "test.html")
    open(path, "w", encoding="utf-8").write('<!doctype html><html lang="ar"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' + extra_head + "</head><body>" + body + "</body></html>")
    return "file:///" + path.replace("\\", "/")
