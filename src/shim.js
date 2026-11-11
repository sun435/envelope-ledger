/* 本地存储：模拟原来 Claude 数据库的接口，数据只存在这台手机里 */
(function(){
  const KEY="envelope-ledger.v1";
  let mem=null;const subs=[];
  function load(){if(mem)return mem;try{const t=localStorage.getItem(KEY);if(t)mem=JSON.parse(t)}catch(e){}
    if(!mem||!mem.records){mem=window.__SEED__?JSON.parse(JSON.stringify(window.__SEED__)):{records:{},docs:{}};save()}return mem}
  function save(){try{localStorage.setItem(KEY,JSON.stringify(mem))}catch(e){const err=new Error("quota");err.code="quota_exceeded";throw err}}
  function notify(){for(const s of subs)s()}
  const rid=()=>Array.from(crypto.getRandomValues(new Uint8Array(15)),b=>"abcdefghijklmnopqrstuvwxyz0123456789"[b%36]).join("");
  const snapCol=name=>({docs:Object.entries(load().records).map(([id,d])=>({id,data:()=>JSON.parse(JSON.stringify(d))}))});
  const snapDoc=path=>{const d=load().docs[path];return {exists:!!d,data:()=>d?JSON.parse(JSON.stringify(d)):undefined}};
  const split=p=>{const i=p.indexOf("/");return [p.slice(0,i),p.slice(i+1)]};
  const db={
    collection(name){return {
      onSnapshot(cb){const f=()=>cb(snapCol(name));subs.push(f);setTimeout(f);return ()=>subs.splice(subs.indexOf(f),1)},
      async add(data){const id=rid();load().records[id]=data;save();notify();return {id}}}},
    doc(path){const [col,id]=split(path),isRec=col==="records13";return {
      onSnapshot(cb){const f=()=>cb(snapDoc(path));subs.push(f);setTimeout(f);return ()=>subs.splice(subs.indexOf(f),1)},
      async set(data){const m=load();if(isRec)m.records[id]=data;else m.docs[path]=data;save();notify()},
      async update(up){const m=load();const cur=isRec?m.records[id]:m.docs[path];if(!cur)throw new Error("not found");Object.assign(cur,up);save();notify()},
      async delete(){const m=load();if(isRec)delete m.records[id];else delete m.docs[path];save();notify()}}}
  };
  window.claude={use:async()=>db};
  /* 备份 */
  window.ledgerBackup={
    dump(){return JSON.stringify({app:"envelope-ledger",version:1,exported:new Date().toISOString(),...load()},null,1)},
    restore(text){const o=JSON.parse(text);if(!o||typeof o.records!=="object"||typeof o.docs!=="object")throw new Error("不是账本的备份文件");
      mem={records:o.records,docs:o.docs};save();notify();return Object.keys(o.records).length}
  };
})();
