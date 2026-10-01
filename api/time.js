// api/time.js —— Vercel Serverless Function
// 作用：Vercel 上替代本地 server.js 的 /api/time 路由，返回当前服务器时间。
// Vercel 会把这个文件映射到 https://<站点>.vercel.app/api/time
// （本地开发仍用 server.js 的 /api/time，二者返回结构保持一致。）

module.exports = function handler(req, res) {
  const now = new Date();
  res.status(200).json({
    iso: now.toISOString(),
    local: now.toString(),
    unix: Date.now()
  });
};
