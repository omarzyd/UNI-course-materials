"""Run a JS arrow function inside a view and print what it returns (the page's own JS has run).
usage: python tools/probe.py tools/errors.js l3      (JS file contains: ()=>{ ... return "text" })
Used for: JS errors, element positions, overflow checks, RTL audits."""
import subprocess, sys, re, io
from _chrome import *
js = open(sys.argv[1], encoding="utf-8").read(); h = sys.argv[2]
head = "<script>window.__errs=[];addEventListener('error',e=>__errs.push(e.message+' @'+e.lineno))</script>"
tail = '<script>setTimeout(()=>{let out;try{out=(' + js + ')()}catch(e){out="ERR "+e}document.body.insertAdjacentHTML("beforeend","<pre id=dbg>"+String(out).replace(/</g,"[")+"</pre>")},900)</script>'
url = wrapped(head, tail) + "#" + h
r = subprocess.run([find_chrome(), "--headless=new", "--disable-gpu", "--virtual-time-budget=4000", "--window-size=1200,900", "--dump-dom", url], capture_output=True, text=True, encoding="utf-8")
m = re.search(r'<pre id="dbg">(.*?)</pre>', r.stdout, re.S)
sys.stdout.reconfigure(encoding="utf-8"); print(m.group(1) if m else r.stdout[-1500:])
