/* =========================================================
   v38 记一笔：支出 / 收入 / 转账；信封横滑，项目横滑，
   账户 / 日期 / 月份是圆角下拉；写备注时计算器收起
   ========================================================= */
const accName=a=>String(a||"").replace("~","·");
const accArtSvg=(a,cls)=>`<svg class="${cls}" viewBox="0 0 60 60" aria-hidden="true">${AC_ART[String(a).includes("~")?"pouch":acArt(a)]}</svg>`;
function lastXfer(){return sorted(S.records.filter(r=>r.kind==="xfer"))[0]}
const _openAdd=openAdd;
openAdd=function(o={}){
  if(o.kind==="xfer"){const l=lastXfer(),acs=S.config.accounts,date=today();
    S.form={kind:"xfer",from:l&&acs.includes(l.from)?l.from:acs[0]||"",to:l&&acs.includes(l.to)?l.to:acs[1]||"",expr:"",date,note:"",err:"",part:(parts()[0]||{}).id,month:date.slice(0,7),item:"",sub:"",tag:"",account:""};
    S.pick=null;S.sheet={type:"add",back:S.sheet&&S.sheet.type!=="add"?S.sheet:null};render();return}
  S.pick=null;_openAdd(o);
  const f=S.form;if(f&&!f.account)f.account=S.config.accounts[0]||"";
};
const _openEdit=openEdit;
openEdit=function(r){
  S.pick=null;
  if(r.kind==="xfer"){S.form={editId:r.id,orig:r,kind:"xfer",from:r.from,to:r.to,expr:r.formula||String(r.amount),date:r.date||today(),note:r.note||"",err:"",part:(parts()[0]||{}).id,month:r.month||"",item:"",sub:"",tag:"",account:""};
    S.sheet={type:"add",back:S.sheet};render();return}
  _openEdit(r);
};
function datePill(f){const [y,m,d]=String(f.date).split("-").map(Number),isT=f.date===today();
  return `<label class="xp"><span class="xd">${d||"?"}</span><span class="xt"><small>${m||"?"}月</small><b>${isT?"今天":"周"+WD[new Date(y,m-1,d).getDay()]}</b></span><u>▾</u><input id="f-date" type="date" value="${esc(f.date)}" aria-label="日期"></label>`}
function accPill(k,label,a,grow){return `<button class="xp ${grow?"grow":""} ${S.pick===k?"open":""}" data-act="pk" data-v="${k}">${a?accArtSvg(a,"xa"):`<span class="xa"></span>`}<span class="xt"><small>${label}</small><b>${a?esc(accName(a)):"选账户"}</b></span><u>▾</u></button>`}
function pickerHTML(){
  const f=S.form,k=S.pick;if(!k)return "";
  let title="",rows="";
  if(k==="month"){title="算哪个月";rows=cycleMonths().map(m=>`<button class="pk ${f.month===m?"on":""}" data-act="pk-set" data-v="${m}"><b>${cnMonth(m)}</b>${f.month===m?"<em>✓</em>":""}</button>`).join("")}
  else{const cur=k==="from"?f.from:k==="to"?f.to:f.account;
    title=k==="from"?"从哪个账户转出":k==="to"?"转到哪个账户":f.kind==="in"?"进哪个账户":"从哪个账户付";
    const gs=acGroups();
    rows=gs.map(x=>x.g?`<div class="pk-g">${esc(x.g)}</div>`+x.items.map(y=>row(y.a,y.sub,true)).join(""):row(x.a,x.a,false)).join("");
    function row(a,label,sub){const dis=(k==="to"&&a===f.from)||(k==="from"&&a===f.to);
      return `<button class="pk ${sub?"sub":""} ${cur===a?"on":""}" data-act="pk-set" data-v="${esc(a)}" ${dis?"disabled":""}>${sub?"<i></i>":accArtSvg(a,"pi")}<b>${esc(label)}</b><span>${fmt(acctFlow(a).net)}</span>${cur===a?"<em>✓</em>":""}</button>`}}
  return `<div class="pk-dim" data-act="pk-close"></div><div class="pk-sheet"><div class="pk-h">${title}</div><div class="pk-l">${rows}</div></div>`;
}
function addSheet(){
  const f=S.form,xf=f.kind==="xfer",p=part(f.part),it=!xf&&p&&(p.items||[]).find(i=>i.id===f.item);
  const keys=[["7"],["8"],["9"],["÷","op"],["⌫","fn"],["4"],["5"],["6"],["×","op"],["C","fn"],["1"],["2"],["3"],["−","op"],[".","fn"],["0"],["=","op"],["+","op"]];
  const cs=xf?"--c:var(--e7)":cvar(p);
  const envs=parts().filter(x=>!isInbox(x));
  return `<div class="xa-wrap" style="${cs}"><div class="sh-head"><h3>${f.editId?"改一笔":"记一笔"}</h3>${closeBtn()}</div>
  <div class="xseg">${[["out","支出"],["in","收入"],["xfer","转账"]].map(([v,t])=>`<button class="${f.kind===v?"on":""}" data-act="f-kind" data-v="${v}">${t}</button>`).join("")}</div>
  <div class="amt xamt ${f.expr?"":"empty"}" id="amt" aria-live="polite">${amtInner()}</div>
  ${xf?`<div class="xtr"><button class="xtc" data-act="pk" data-v="from" style="--c:var(--e7)">${f.from?accArtSvg(f.from,"xta"):""}<span><small>从</small><b>${esc(accName(f.from)||"选账户")}</b><i>余额 ${fmt(acctFlow(f.from).net)}</i></span></button>
     <button class="xsw" data-act="f-swap" aria-label="对调">⇅</button>
     <button class="xtc" data-act="pk" data-v="to" style="--c:var(--play)">${f.to?accArtSvg(f.to,"xta"):""}<span><small>到</small><b>${esc(accName(f.to)||"选账户")}</b><i>余额 ${fmt(acctFlow(f.to).net)}</i></span></button></div>
     <div class="xps">${datePill(f).replace('class="xp"','class="xp grow"')}</div>`
  :`<div class="xlb">信封</div><div class="xscr">${envs.map(x=>`<button class="xev ${f.part===x.id?"on":""}" style="${cvar(x)}" data-act="f-part" data-v="${x.id}"><svg viewBox="0 0 60 60" aria-hidden="true">${artOf(x)}</svg><b>${esc(x.name)}</b></button>`).join("")}</div>
  ${f.kind==="out"&&p&&(p.items||[]).length?`<div class="xlb">项目</div><div class="xscr">${p.items.map(i=>`<button class="xch ${f.item===i.id?"on":""}" data-act="f-item" data-v="${i.id}">${esc(i.name)}</button>`).join("")}<button class="xch ${!f.item?"on":""}" data-act="f-item" data-v="">不分</button></div>`:""}
  ${f.kind==="out"&&it&&it.subs&&it.subs.length?`<div class="xscr xsub">${it.subs.map(s=>`<button class="xch sm ${f.sub===s.id?"on":""}" data-act="f-sub" data-v="${s.id}">${esc(s.name)}</button>`).join("")}</div>`:""}
  <div class="xps">${accPill("acc",f.kind==="in"?"进哪个账户":"付款账户",f.account,true)}${datePill(f)}${f.kind==="in"?`<button class="xp ${S.pick==="month"?"open":""}" data-act="pk" data-v="month"><span class="xd m">${parseInt(String(f.month).slice(5),10)||"?"}</span><span class="xt"><small>算哪个月</small><b>${cnMonth(f.month)}</b></span><u>▾</u></button>`:""}</div>`}
  <input class="xnote" id="f-note" placeholder="备注" value="${esc(f.note)}" aria-label="备注" enterkeyhint="done">
  <div class="err" id="f-err">${esc(f.err||"")}</div>
  <div class="pad xpad">${keys.map(([k,c])=>`<button class="k ${c||""}" data-act="key" data-k="${k}" aria-label="${k==="⌫"?"退格":k==="C"?"清空":k}">${k}</button>`).join("")}<button class="k go" data-act="save">保存</button></div>
  ${pickerHTML()}</div>`;
}
const _doSave=doSave;
doSave=async function(btn){
  const f=S.form;if(!f||f.kind!=="xfer")return _doSave(btn);
  readForm();const amt=calc(f.expr),err=m=>{f.err=m;const el=document.getElementById("f-err");if(el)el.textContent=m};
  if(isNaN(amt)||!(amt>0))return err("先输入一个大于 0 的金额");
  if(!f.from||!f.to)return err("选好转出和转入的账户");
  if(f.from===f.to)return err("转出和转入不能是同一个账户");
  const ex=String(f.expr).replace(/[+−×÷]+$/,"");
  const rec={kind:"xfer",from:f.from,to:f.to,amount:amt,date:f.date,month:f.date.slice(0,7),note:f.note.trim(),formula:hasOp(ex)?ex:"",created:f.orig?f.orig.created||Date.now():Date.now()};
  if(btn)btn.disabled=true;
  const ok=f.editId?await updateRecord(f.editId,rec):await addRecord(rec);
  if(ok){toast((f.editId?"已更新 · ":"转好了 · ")+accName(f.from)+" → "+accName(f.to)+" "+fmt(amt));goBack()}else if(btn)btn.disabled=false;
};
/* 新动作 */
document.addEventListener("click",ev=>{const t=ev.target.closest("[data-act]");if(!t||!S.form)return;const a=t.dataset.act,f=S.form;
  const stop=()=>{ev.stopImmediatePropagation();ev.preventDefault()};
  if(a==="f-kind"&&t.dataset.v==="xfer"){stop();readForm();if(f.kind==="xfer")return;const l=lastXfer(),acs=S.config.accounts;
    f.kind="xfer";f.err="";f.from=f.from||(l&&acs.includes(l.from)?l.from:f.account||acs[0]||"");f.to=f.to||(l&&acs.includes(l.to)?l.to:acs.find(x=>x!==f.from)||"");render();return}
  if(a==="f-kind"&&f.kind==="xfer"){stop();readForm();const p=part(f.part)||parts().find(x=>!isInbox(x));f.part=p.id;f.kind=t.dataset.v;f.month=f.date.slice(0,7);
    if(f.kind==="out"){f.item=((p.items||[])[0]||{}).id||"";f.sub=firstSub(f)}f.account=lastAcct(p.id,f.kind)||f.from||S.config.accounts[0]||"";render();return}
  if(a==="pk"){stop();readForm();S.pick=S.pick===t.dataset.v?null:t.dataset.v;render();return}
  if(a==="pk-close"){stop();S.pick=null;render();return}
  if(a==="pk-set"){stop();const v=t.dataset.v;if(S.pick==="month")f.month=v;else if(S.pick==="from")f.from=v;else if(S.pick==="to")f.to=v;else f.account=v;S.pick=null;render();return}
  if(a==="f-swap"){stop();readForm();[f.from,f.to]=[f.to,f.from];render();return}
  if(a==="f-part"||a==="f-kind"){setTimeout(()=>{if(S.form&&!S.form.account){S.form.account=S.config.accounts[0]||"";render()}},0)}
},true);
/* 日期改了就刷新那个小框 */
document.addEventListener("change",ev=>{if(ev.target&&ev.target.id==="f-date"&&S.form){readForm();render()}},true);
/* 写备注时：计算器收起，输入框露出来 */
document.addEventListener("focusin",ev=>{if(ev.target&&ev.target.id==="f-note"){const sh=ev.target.closest(".sheet");if(sh)sh.classList.add("typing");setTimeout(()=>ev.target.scrollIntoView({block:"center",behavior:"smooth"}),250)}});
document.addEventListener("focusout",ev=>{if(ev.target&&ev.target.id==="f-note"){const sh=ev.target.closest(".sheet");setTimeout(()=>{if(sh&&document.activeElement!==ev.target)sh.classList.remove("typing")},120)}});
document.addEventListener("keydown",ev=>{if(ev.key==="Enter"&&ev.target&&ev.target.id==="f-note"){ev.preventDefault();ev.target.blur()}});
/* 转账在列表、详情、账户里怎么显示 */
const _recTitle=recTitle;recTitle=function(r){return r.kind==="xfer"?accName(r.from)+" → "+accName(r.to):_recTitle(r)};
const _recSub=recSub;recSub=function(r){return r.kind==="xfer"?(r.note||"转账"):_recSub(r)};
acctFlow=function(a){
  const rs=S.records.filter(r=>((r.kind==="in"||r.kind==="out")&&(r.account||"")===a)||(r.kind==="xfer"&&(r.from===a||r.to===a)));
  const inn=sum(rs.filter(r=>r.kind==="in"||(r.kind==="xfer"&&r.to===a))),out=sum(rs.filter(r=>r.kind==="out"||(r.kind==="xfer"&&r.from===a)));
  return {rs,inn,out,net:r2(inn-out)};
};
const _ledgerLine=ledgerLine;
ledgerLine=function(r,acct){
  if(r.kind!=="xfer")return _ledgerLine(r);
  const out=acct&&acct===r.from,inn=acct&&acct===r.to,title=out?"转到 "+accName(r.to):inn?"从 "+accName(r.from)+" 转来":recTitle(r);
  return `<li><button class="ll xf" style="--c:var(--muted)" data-act="rec" data-id="${esc(r.id)}"><span class="ll-d">${esc(String(r.date).slice(5).replace("-","/"))}</span><span class="ll-dot"></span><span class="ll-t">${esc(title)}${r.note?`<small>${esc(r.note)}</small>`:""}</span><span class="ll-r"></span><span class="ll-a ${inn?"pos":""}">${out?"−":inn?"+":"⇄ "}${fmt(r.amount)}</span></button></li>`;
};
const _recSheet=recSheet;
recSheet=function(){
  const r=S.records.find(x=>x.id===S.sheet.id);if(!r||r.kind!=="xfer")return _recSheet();
  const rows=[["日期",r.date],["从",accName(r.from)],["到",accName(r.to)]];if(r.formula)rows.push(["算式",r.formula]);
  return `<div class="sh-head"><h3>转账</h3>${closeBtn()}</div>
  <div class="stat"><div class="big num">⇄ ${fmt(r.amount)}</div>
  ${r.note?`<p class="memo" style="margin-top:14px">${esc(r.note)}</p>`:""}
  <div style="margin-top:8px">${rows.map(([k,v])=>`<div class="kv"><span>${k}</span><span>${esc(v)}</span></div>`).join("")}</div></div>
  <button class="editbtn" data-act="edit" data-id="${esc(r.id)}">编辑</button><button class="save danger" style="margin-top:10px" data-act="del" data-id="${esc(r.id)}">${S.confirm==="del:"+r.id?"确认删除":"删除"}</button>`;
};
