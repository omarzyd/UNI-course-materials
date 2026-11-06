/* ---------- shared helpers for Speech + Circuits ---------- */
const TAU=2*Math.PI;
const nf=(x,d=2)=>{if(!isFinite(x))return "∞";const s=(Math.abs(x)<1e-12?0:x).toFixed(d);return s.replace("-","−")};
const nfc=x=>Math.round(x).toLocaleString("en-US");
function rng(seed){let a=seed>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const gauss=r=>{let u=0,v=0;while(!u)u=r();while(!v)v=r();return Math.sqrt(-2*Math.log(u))*Math.cos(TAU*v)};
function path(pts,sx,sy){let d="";for(let i=0;i<pts.length;i++)d+=(i?"L":"M")+sx(pts[i][0]).toFixed(1)+" "+sy(pts[i][1]).toFixed(1);return d}
/* o: {w,h,m:[l,r,t,b],x:[a,b],y:[a,b],xt,yt,xf,yf,xl,yl,zero,body(sx,sy)} */
function plot(o){
  const [l,r,t,b]=o.m||[44,12,14,30],W=o.w,H=o.h;
  const sx=v=>l+(v-o.x[0])/(o.x[1]-o.x[0])*(W-l-r), sy=v=>H-b-(v-o.y[0])/(o.y[1]-o.y[0])*(H-t-b);
  let s=`<svg viewBox="0 0 ${W} ${H}" class="plot" direction="ltr" ${o.label?`role="img" aria-label="${o.label}"`:'aria-hidden="true"'}>`;
  (o.yt||[]).forEach(v=>{s+=`<line x1="${l}" x2="${W-r}" y1="${sy(v).toFixed(1)}" y2="${sy(v).toFixed(1)}" class="gl"/><text x="${l-6}" y="${(sy(v)+4).toFixed(1)}" class="tk" text-anchor="end">${(o.yf||String)(v)}</text>`});
  (o.xt||[]).forEach(v=>{s+=`<line x1="${sx(v).toFixed(1)}" x2="${sx(v).toFixed(1)}" y1="${H-b}" y2="${H-b+4}" class="ax"/><text x="${sx(v).toFixed(1)}" y="${H-b+16}" class="tk" text-anchor="middle">${(o.xf||String)(v)}</text>`});
  if(o.zero!==false){const z=sy(Math.max(o.y[0],Math.min(o.y[1],0)));s+=`<line x1="${l}" x2="${W-r}" y1="${z.toFixed(1)}" y2="${z.toFixed(1)}" class="ax"/>`}
  if(o.xl)s+=`<text x="${W-r}" y="${H-3}" class="tk" text-anchor="end">${o.xl}</text>`;
  if(o.yl)s+=`<text x="${l+4}" y="${t+10}" class="tk">${o.yl}</text>`;
  return s+o.body(sx,sy)+"</svg>";
}
function fft(re,im){
  const n=re.length;
  for(let i=1,j=0;i<n;i++){let bit=n>>1;for(;j&bit;bit>>=1)j^=bit;j^=bit;if(i<j){let t=re[i];re[i]=re[j];re[j]=t;t=im[i];im[i]=im[j];im[j]=t}}
  for(let len=2;len<=n;len<<=1){const a=-TAU/len,wr=Math.cos(a),wi=Math.sin(a),h=len>>1;
    for(let i=0;i<n;i+=len){let cr=1,ci=0;for(let j=0;j<h;j++){const p=i+j,q=p+h,vr=re[q]*cr-im[q]*ci,vi=re[q]*ci+im[q]*cr;re[q]=re[p]-vr;im[q]=im[p]-vi;re[p]+=vr;im[p]+=vi;const tt=cr*wr-ci*wi;ci=cr*wi+ci*wr;cr=tt}}}
}
function mag(x,N){const re=new Float64Array(N),im=new Float64Array(N);for(let i=0;i<Math.min(N,x.length);i++)re[i]=x[i];fft(re,im);const m=new Float64Array(N/2+1);for(let k=0;k<=N/2;k++)m[k]=Math.hypot(re[k],im[k]);return m}
const WIN={rect:(n,L)=>1,hann:(n,L)=>.5-.5*Math.cos(TAU*n/L),hamming:(n,L)=>.54-.46*Math.cos(TAU*n/L)};
/* columns of |X| in dB for a signal */
function stft(x,L,H,N,win="hann"){const cols=[];for(let s=0;s+L<=x.length;s+=H){const f=new Float64Array(L);for(let n=0;n<L;n++)f[n]=x[s+n]*WIN[win](n,L);cols.push(Array.from(mag(f,N),v=>20*Math.log10(v+1e-9)))}return cols}
const MAGMA=[[0,0,4],[40,11,84],[101,21,110],[159,42,99],[212,72,66],[245,125,21],[250,193,39],[252,253,191]];
function cmap(t){t=Math.max(0,Math.min(1,t))*(MAGMA.length-1);const i=Math.min(MAGMA.length-2,Math.floor(t)),f=t-i,a=MAGMA[i],b=MAGMA[i+1];return [a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f,a[2]+(b[2]-a[2])*f]}
/* draw columns (time) × rows (freq, low at bottom) onto a canvas of fixed pixel size */
function heat(cv,cols,lo,hi,rows,r0=0){
  const ctx=cv.getContext("2d"),W=cv.width,H=cv.height,T=cols.length,F=rows||(cols[0].length-r0);
  const img=ctx.createImageData(W,H);
  for(let x=0;x<W;x++){const c=cols[Math.min(T-1,Math.floor(x/W*T))];
    for(let y=0;y<H;y++){const k=r0+Math.min(F-1,Math.floor((H-1-y)/H*F)),v=(c[k]-lo)/(hi-lo),[r,g,b]=cmap(v),p=(y*W+x)*4;img.data[p]=r;img.data[p+1]=g;img.data[p+2]=b;img.data[p+3]=255}}
  ctx.putImageData(img,0,0);
}
const cssv=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
function seg(root,attr,fn){const el=typeof root==="string"?$(root):root;el.addEventListener("click",e=>{const b=e.target.closest("button[data-"+attr+"]");if(!b)return;$$("button",el).forEach(x=>x.setAttribute("aria-pressed",String(x===b)));fn(b.dataset[attr])})}
function bindRange(id,fn){const el=$("#"+id);el.addEventListener("input",fn);return el}
/* per-item multiple choice: items = [[question, [options], correctIndex, why], ...] */
function mcq(rootSel,items){
  const root=$(rootSel),ans={};
  function draw(){
    root.innerHTML=items.map((q,i)=>`<div class="qi"><p>${q[0]}</p><div class="opts">${q[1].map((o,j)=>{let c="";if(ans[i]!=null){if(j===q[2])c="ok";else if(j===ans[i])c="bad"}return `<button type="button" data-q="${i}" data-o="${j}" class="${c}">${o}</button>`}).join("")}</div>${ans[i]!=null?`<p class="fb">${ans[i]===q[2]?"<b class='cR'>صح.</b> ":"<b class='cN'>لأ.</b> "}${q[3]}</p>`:""}</div>`).join("");
    isolate(root);
  }
  root.classList.add("qz");root.addEventListener("click",e=>{const b=e.target.closest("button[data-q]");if(!b)return;ans[b.dataset.q]=+b.dataset.o;draw()});draw();
}
