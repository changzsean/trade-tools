# MEEKA 部署指南（GitHub + Vercel + Cloudflare）

> 项目：Next.js 15 · App Router · TailwindCSS v4
> 目录：`TradeMind Next.js项目/trademind`（Vercel 的 Root Directory 要指到这一层）

---

## 0. 本地先跑通（部署前必做）

```bash
cd "/Users/changzheng/Desktop/企业服务文件/ai外贸网站项目/TradeMind Next.js项目/trademind"
npm install
npm run dev        # http://localhost:3000 检查页面
npm run build      # 构建必须通过再部署
```

验收：首页信息流、/login、/register、/onboarding、随便输错误地址看 404、右上角个人中心下拉、右下角 Meeka 助手。

---

## 1. 推送到 GitHub

> 注意：项目在 iCloud 同步目录里，git 偶尔会遇到文件锁。**建议先把 trademind 目录复制到本地非 iCloud 路径**（如 `~/dev/meeka-web`）再操作，也能显著加快 npm install。

1. 在 GitHub 新建**空仓库**（不要勾选 README），例如 `meeka-web`
2. 初始化并推送：

```bash
cp -R "/Users/changzheng/Desktop/企业服务文件/ai外贸网站项目/TradeMind Next.js项目/trademind" ~/dev/meeka-web
cd ~/dev/meeka-web
git init -b main
git add -A
git commit -m "feat: MEEKA v0.1 首版"
git remote add origin git@github.com:你的用户名/meeka-web.git
git push -u origin main
```

> 用 HTTPS 的话：`git remote add origin https://github.com/你的用户名/meeka-web.git`

---

## 2. Vercel 部署

1. vercel.com → Add New → Project → Import 你的 `meeka-web` 仓库
2. Framework Preset 自动识别 Next.js，无需改构建命令
3. **Root Directory**：如果你推的是 trademind 目录本身则留空；如果推的是外层目录，要设置为 `trademind`
4. 环境变量（接 Supabase 后再加）：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy → 得到 `xxx.vercel.app` 预览域名

以后每次 `git push`，Vercel 自动重新部署；PR 会生成独立预览链接。

---

## 3. Cloudflare 接管域名（DNS + CDN）

推荐架构：**Cloudflare 管 DNS/CDN/防护，Vercel 管托管构建**。

### 3.1 域名进 Cloudflare

1. Cloudflare → Add a Site → 输入域名（如 `meeka.com.cn`）→ Free 计划
2. 按提示到域名注册商处，把 Nameserver 改成 Cloudflare 给的两条
3. 等生效（几分钟到 24 小时）

### 3.2 DNS 记录指向 Vercel

先在 Vercel → Project → Settings → Domains 添加你的域名，然后在 Cloudflare DNS 加：

| 类型 | 名称 | 内容 | 代理 |
|------|------|------|------|
| CNAME | `www` | `cname.vercel-dns.com` | 建议先 DNS only（灰云） |
| A | `@` | `76.76.21.21` | 建议先 DNS only（灰云） |

> 先灰云验证 Vercel 域名生效、HTTPS 正常，再切橙云（Proxied）启用 Cloudflare CDN/防护。
> 切橙云后：Cloudflare SSL/TLS 模式必须设为 **Full (Strict)**，否则会循环重定向。

### 3.3 .com.cn 特别提醒

- 若服务器/CDN 面向中国大陆访问，`.com.cn` 域名依法需要 **ICP 备案**；Vercel 节点在海外，无备案时国内访问可能不稳定
- 过渡方案：先用 `xxx.vercel.app` 或海外域名收集种子用户，备案完成后再切正式域名

### 3.4 Cloudflare 建议开启

- Speed → Auto Minify（HTML/CSS/JS）
- Caching → 静态资源默认缓存即可（`/assets/meeka/*` 带长缓存头）
- Security → Bot Fight Mode（免费档）
- Rules → 如需强制 www→apex 或反向，加 Redirect Rule

---

## 4. 上线检查清单（对应产品文档 §16）

- [ ] `npm run build` 无 TypeScript 报错
- [ ] 一级导航六项：首页/成长/资源/社区/实验室/工作台
- [ ] 右上角：通知、私信、头像、等级、下拉菜单（权限区分）
- [ ] 首页 = 发布入口 + 推荐 Feed + 右栏五模块
- [ ] /login /register /onboarding /not-found 的 IP 按 §7.2 映射
- [ ] 所有 IP 为真透明 PNG，64px 展示用 128px 源图（Retina 清晰）
- [ ] 无蓝色主色、无渐变、无大面积橙色

---

## 5. 后续（第二/三阶段）

- 资源详情、用户主页、创作者中心、通知/私信中心
- Supabase 接入：auth（登录注册真实化）、feed_items / resources / matching_requests 表
- 管理后台 CMS（§12）：先做 资源管理 + 标签管理 + 活动管理 三个最小模块
