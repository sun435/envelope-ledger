/* 设置页里的「导出备份 / 从备份恢复」 */
(function(){
  const day=()=>{const d=new Date(),p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate())};
  async function exportBackup(){
    const text=ledgerBackup.dump(),name="信封账本备份-"+day()+".json",P=window.Capacitor&&Capacitor.Plugins;
    try{
      if(P&&P.Filesystem&&P.Share){
        const w=await P.Filesystem.writeFile({path:name,data:text,directory:"CACHE",encoding:"utf8"});
        await P.Share.share({title:"信封账本备份",files:[w.uri]});return}
      const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([text],{type:"application/json"}));a.download=name;a.click();
    }catch(e){if(!String(e&&e.message||"").toLowerCase().includes("cancel"))toast("导出没成功："+(e&&e.message||e))}
  }
  function importBackup(){
    const inp=document.createElement("input");inp.type="file";inp.accept="application/json,.json,text/plain,*/*";inp.style.cssText="position:fixed;left:-9999px;opacity:0";document.body.appendChild(inp);
    inp.onchange=async()=>{const f=inp.files&&inp.files[0];inp.remove();if(!f)return;
      try{const txt=await new Promise((ok,no)=>{const r=new FileReader();r.onload=()=>ok(r.result);r.onerror=()=>no(r.error);r.readAsText(f)});const n=ledgerBackup.restore(txt);S.sheet=null;S.draft=null;render();toast("已恢复 "+n+" 笔记录")}
      catch(e){toast("恢复失败："+(e&&e.message||"文件不对"))}};
    inp.click();
  }
  document.addEventListener("click",ev=>{const t=ev.target.closest("[data-act]");if(!t)return;
    if(t.dataset.act==="bk-exp"){ev.stopImmediatePropagation();exportBackup()}
    if(t.dataset.act==="bk-imp"){ev.stopImmediatePropagation();if(S.bkAsk){S.bkAsk=false;importBackup()}else{S.bkAsk=true;t.textContent="会覆盖手机里现在的账，再点一次选文件";setTimeout(()=>{S.bkAsk=false},6000)}}
  },true);
})();
