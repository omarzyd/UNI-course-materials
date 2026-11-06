()=>{
 const out=[],LTR=".m,.mb,.mono,.ltr,svg,[dir=ltr],input,.pipe,.picked,.gtab,.mat,.kbd,.tg,.pad,.trj,.seq,.tally,.hist,.pg,.rg,.hist2,.chips2,.stat .v,code";
 const lat=/[A-Za-z0-9γεπλΩμ]/, op=/^[\s ]*[=≈<>≤≥×+−\/→·]/, opEnd=/[=≈<>≤≥×+−\/→·][\s ]*$/;
 const isLat=el=>el&&el.nodeType===1&&lat.test(el.textContent)&&(el.matches("bdi,.m,.ltr,.mono,sub,sup,b,i,span,strong,code")||el.matches(LTR));
 document.querySelectorAll(".chapter").forEach(ch=>{
  const w=document.createTreeWalker(ch,NodeFilter.SHOW_TEXT);let n;
  while((n=w.nextNode())){
   const p=n.parentElement;if(!p||p.closest(LTR)||p.closest("script,style"))continue;
   const t=n.nodeValue;if(!t.trim())continue;
   const prev=n.previousSibling,next=n.nextSibling;
   const bad=(op.test(t)&&isLat(prev))||(opEnd.test(t)&&isLat(next))||(/^[\s ]*[\])]?[\s ]*$/.test(t)&&false);
   const glue=(isLat(prev)&&/^[A-Za-z0-9(]/.test(t))||(isLat(next)&&/[A-Za-z0-9)]$/.test(t)&&next.nodeName!=="BDI");
   if(bad||glue){const sc=p.closest(".scene,.chead");out.push((sc?sc.id||"head":"?")+" | "+(bad?"OP":"GLUE")+" | "+p.textContent.replace(/\s+/g," ").trim().slice(0,110))}
  }});
 return [...new Set(out)].join("\n")||"clean";
}
