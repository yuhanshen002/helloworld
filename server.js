// server.js —— Node.js HTTP 服务器
// 作用：监听 3000 端口，把 public/index.html 返回给浏览器，并处理服务器时间接口

const http = require('http');
const fs = require('fs');
const path = require('path');

// 端口号（可通过环境变量 PORT 覆盖）
const PORT = process.env.PORT || 3000;

// 静态资源根目录：项目下的 public 文件夹
const PUBLIC_DIR = path.join(__dirname, 'public');

// 根据扩展名返回对应的 MIME 类型，告诉浏览器如何解析文件
function getContentType(filePath) {
  const ext = path.extname(filePath);
  switch (ext) {
    case '.html':
      return 'text/html; charset=utf-8';
    case '.css':
      return 'text/css; charset=utf-8';
    case '.js':
      return 'application/javascript; charset=utf-8';
    case '.json':
      return 'application/json; charset=utf-8';
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    default:
      return 'application/octet-stream';
  }
}

// 创建 HTTP 服务器
const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // ---- 路由 1：/api/time —— 返回当前服务器时间（JSON） ----
  if (pathname === '/api/time') {
    const now = new Date();
    const timeData = {
      iso: now.toISOString(),
      local: now.toString(),
      unix: Date.now()
    };
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(timeData));
    return;
  }

  // ---- 路由 2：静态文件 —— 默认返回首页 index.html ----
  let filePath = pathname === '/' ? path.join(PUBLIC_DIR, 'index.html')
                                  : path.join(PUBLIC_DIR, pathname);

  // 防止路径穿越（禁止访问 public 目录以外的文件）
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden');
    return;
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // 文件不存在 -> 404
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found');
      } else {
        // 其他错误 -> 500
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('500 Internal Server Error');
      }
      return;
    }

    // 读取成功，按 MIME 类型返回
    let body = content;

    // 针对首页：把服务器当前时间直接注入 HTML（__SERVER_TIME__ 占位符）
    // 这样即使前端 JS 的 /api/time 请求失败，页面也能显示一个真实的时间，不会被覆盖
    if (filePath === path.join(PUBLIC_DIR, 'index.html')) {
      const serverNow = new Date().toString();
      body = body.toString().replace(/__SERVER_TIME__/g, serverNow);
    }

    res.writeHead(200, { 'Content-Type': getContentType(filePath) });
    res.end(body);
  });
});

// 启动服务器并监听端口
server.listen(PORT, () => {
  console.log(`✅ HelloWorld 网站已启动`);
  console.log(`   请用浏览器访问：http://localhost:${PORT}`);
  console.log(`   服务器时间接口：http://localhost:${PORT}/api/time`);
});
