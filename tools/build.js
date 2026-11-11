// 把 ledger.html 拼成离线版 www/index.html
const fs=require("fs"),path=require("path");
const root=path.join(__dirname,"..");
let html=fs.readFileSync(path.join(root,"src/ledger.html"),"utf8");
html=html.replace(/<link[^>]*fonts\.(googleapis|gstatic)[^>]*>/g,"");
const sp=path.join(root,"src/seed.json"),seed=fs.existsSync(sp)?fs.readFileSync(sp,"utf8"):"null";
const inject=`<link rel="stylesheet" href="fonts/fonts.css"><script>window.__SEED__=${seed};</script><script>${fs.readFileSync(path.join(root,"src/shim.js"),"utf8")}</script>`;
html=html.replace("<title>",inject+"<title>");
if(!/^<!doctype/i.test(html))html=`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#F7F2E8"></head><body>`+html+`</body></html>`;
const save='<div class="savebar"><button data-act="close">取消</button><button class="go" data-act="settings-save">保存设置</button></div>`;';
if(html.split(save).length!==2)throw new Error("settings savebar not found exactly once");
html=html.replace(save,'<div class="g-cap">备份</div><div class="g-sec"><button class="g-row g-link" data-act="bk-exp"><span class="g-l">导出备份</span></button><button class="g-row g-link" data-act="bk-imp"><span class="g-l">从备份恢复</span></button></div>'+save);
html=html.replace(/<\/style>(?![\s\S]*<\/style>)/,"</style>")+`<script>${fs.readFileSync(path.join(root,"src/backup.js"),"utf8")}</script>`;
fs.mkdirSync(path.join(root,"www"),{recursive:true});
fs.writeFileSync(path.join(root,"www/index.html"),html);
console.log("www/index.html",(html.length/1024).toFixed(0)+"KB");
