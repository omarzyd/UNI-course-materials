"""Screenshot one view and cut it into readable strips.
usage: python tools/shot.py <hash> [width=1200] [height=6000] [strip=1500]
  hash: home | rl | speech | circ | a lecture id (l3, s2, c2 ...)     output: work/shot_<hash>_<n>.png
Tip: height must be >= the page height or the bottom is cut. Phone check: width 500 (headless Chrome will not go below ~500)."""
import subprocess, sys, os
from _chrome import *
from PIL import Image
h = sys.argv[1]; W = int(sys.argv[2]) if len(sys.argv) > 2 else 1200; H = int(sys.argv[3]) if len(sys.argv) > 3 else 6000; S = int(sys.argv[4]) if len(sys.argv) > 4 else 1500
url = wrapped() + "#" + h; out = os.path.join(WORK, f"shot_{h}.png")
subprocess.run([find_chrome(), "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1", "--virtual-time-budget=5000", f"--window-size={W},{H}", f"--screenshot={out}", url], capture_output=True)
im = Image.open(out); w, hh = im.size; n = 0
for y in range(0, hh, S):
    c = im.crop((0, y, w, min(hh, y + S)))
    if c.getextrema()[0][0] == c.getextrema()[0][1]: continue
    p = os.path.join(WORK, f"shot_{h}_{n}.png"); c.save(p); print(p); n += 1
