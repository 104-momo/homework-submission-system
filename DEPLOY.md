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

---

## 附录：腾讯云 COS 配置（新用户50GB免费6个月）

如果学生需要上传大文件（如视频），推荐使用腾讯云 COS，国内访问速度快，新用户免费 50GB。

### 注册腾讯云

1. 访问 [腾讯云官网](https://cloud.tencent.com/)
2. 注册账号（需要实名认证）
3. 登录后进入控制台

### 创建存储桶

1. 点击左侧 "对象存储 COS" → "存储桶列表"
2. 点击 "创建存储桶"
3. 填写：
   - **存储桶名称**：自定义，如 `homework-2024`
   - **地域**：选择离你最近的地区，如 `广州`（ap-guangzhou）
   - **访问权限**：选择 `公有读私有写`
4. 点击 "确定"

### 获取密钥

1. 点击右上角头像 → "访问管理" → "密钥管理"
2. 点击 "新建密钥"
3. 保存好 **SecretId** 和 **SecretKey**

### 配置跨域访问（重要）

1. 在存储桶列表中，点击你的存储桶 → "权限管理" → "跨域访问CORS"
2. 点击 "添加规则"
3. 配置：
   - **来源 Origin**：`*`（允许所有来源）
   - **允许 Methods**：`GET, PUT, POST, DELETE, HEAD`
   - **允许 Headers**：`*`
   - **暴露 Headers**：`*`
4. 点击 "保存"

### 配置环境变量

在 Cloudflare Pages 或 `.env` 中添加：

```
VITE_COS_SECRET_ID=你的SecretId
VITE_COS_SECRET_KEY=你的SecretKey
VITE_COS_BUCKET=你的存储桶名称（不含地域后缀）
VITE_COS_REGION=ap-guangzhou（你的地域）
```

---

## 附录：Storj 文件存储配置（150GB 免费）

如果学生需要上传大文件（如视频），推荐使用 Storj 存储，免费 150GB 空间。

### 注册 Storj

1. 访问 [Storj 官网](https://storj.io/)
2. 注册账号（不需要信用卡）
3. 登录后进入控制台

### 创建 Bucket

1. 点击左侧 "Buckets" → "New Bucket"
2. Bucket name 输入：`homework`
3. 点击 "Create Bucket"

### 创建 Access Key

1. 点击左侧 "Access" → "Create S3 Credentials"
2. 输入名称，选择刚才创建的 bucket
3. 点击 "Create Access"
4. 复制以下信息保存好：
   - **Access Key**
   - **Secret Key**
   - **Endpoint**（通常是 `https://gateway.storjshare.io`）

### 配置公共访问

Storj 文件默认是私有的，需要通过 linkshare 生成公开访问链接：

1. 在 bucket 中上传一个测试文件
2. 点击文件 → "Share"
3. 生成 public link
4. 复制链接前缀，类似：
   ```
   https://link.storjshare.io/raw/xxxxx/homework/
   ```
5. 这个就是 `VITE_STORJ_PUBLIC_URL`

### 配置环境变量

在 Cloudflare Pages 或 `.env` 中添加：

```
VITE_STORJ_ACCESS_KEY=你的AccessKey
VITE_STORJ_SECRET_KEY=你的SecretKey
VITE_STORJ_BUCKET=homework
VITE_STORJ_ENDPOINT=https://gateway.storjshare.io
VITE_STORJ_PUBLIC_URL=https://link.storjshare.io/raw/你的公开链接前缀
```

### 优先级说明

系统会优先使用配置好的存储服务：
1. 如果配置了腾讯云 COS → 使用 COS（推荐，国内访问快）
2. 如果配置了 Storj → 使用 Storj（免费空间大）
3. 如果没配置以上但配置了 Supabase → 使用 Supabase Storage
4. 都没配置 → 文件不会真正上传（仅本地演示）
