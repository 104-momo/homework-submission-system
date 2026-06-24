# 部署指南

## 方案：Cloudflare Pages + Supabase

### 第一步：创建 Supabase 项目

1. 访问 [Supabase 控制台](https://supabase.com/dashboard)
2. 点击 "New Project" 创建新项目
3. 填写项目名称、设置密码、选择区域（推荐选 Singapore 或 Tokyo）
4. 等待项目创建完成（约 2 分钟）

### 第二步：执行建表 SQL

1. 在 Supabase 控制台左侧菜单点击 "SQL Editor"
2. 点击 "New query" 新建查询
3. 复制 `supabase/schema.sql` 中的所有内容粘贴进去
4. 点击 "Run" 执行
5. 看到 "Success" 表示建表成功

### 第三步：获取 API 密钥

1. 在 Supabase 控制台左侧菜单点击 "Settings" → "API"
2. 复制以下两个值：
   - **Project URL** （类似 `https://xxxx.supabase.co`）
   - **anon public** 密钥
3. 不要用 `service_role` 密钥，那是服务端用的

### 第四步：配置本地环境变量

编辑项目根目录下的 `.env` 文件：

```
VITE_SUPABASE_URL=https://你的项目url.supabase.co
VITE_SUPABASE_ANON_KEY=你的anon公钥
```

### 第五步：本地测试

```bash
cd /Users/taozi/Desktop/trae
npm run dev
```

打开 http://localhost:5173 测试功能是否正常。

### 第六步：登录 Cloudflare

```bash
wrangler login
```

浏览器会自动打开，登录你的 Cloudflare 账号并授权。

### 第七步：部署到 Cloudflare Pages

```bash
cd /Users/taozi/Desktop/trae
wrangler pages deploy dist --project-name=homework-system
```

首次部署会提示：
- 选择账号 → 选你的 Cloudflare 账号
- 选择项目 → 选择已有的或创建新项目

部署成功后会显示你的网站地址，类似：
```
https://homework-system.pages.dev
```

### 第八步：在 Cloudflare Pages 配置环境变量

1. 登录 Cloudflare 控制台
2. 进入 "Workers & Pages" → 找到你的项目
3. 点击 "Settings" → "Environment variables"
4. 添加两个环境变量：
   - `VITE_SUPABASE_URL` = 你的 Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = 你的 anon 公钥
5. 重新部署一次让环境变量生效

### 后续更新部署

修改代码后，重新构建并部署：

```bash
npm run build
wrangler pages deploy dist
```

### 常见问题

**Q: 部署后数据不同步？**
A: 检查环境变量是否配置正确，确保 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY 都设置了。

**Q: 怎么删除项目？**
A: 在 Cloudflare Pages 控制台的项目设置里可以删除项目。

**Q: Supabase 免费额度够用吗？**
A: 免费版有 500MB 数据库空间，小班级使用完全足够。
