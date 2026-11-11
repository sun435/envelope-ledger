# 信封账本

手机上的离线记账 App。数据只存在手机里，设置页可以「导出备份 / 从备份恢复」。

- `src/ledger.html`：账本页面
- `src/shim.js`：本地存储
- `src/backup.js`：备份
- `src/seed.json`：第一次打开时带进去的数据
- 推送到 main 后，GitHub Actions 自动打包，APK 在 Releases 里
