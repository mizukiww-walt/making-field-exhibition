# 交付与部署手册

本文档面向两类接收者：

- **内容 / 开发协作者**：拿到源码，在本地继续修改和提交。
- **展览负责人 / 运维人员**：拿到静态站包，部署成可公开访问的网址。

项目当前是纯前端静态站，不需要数据库、环境变量或后端服务。所有内容在 `src/data/cases.json` 与 `public/media/cases/` 中。

---

## 0. 交付物清单

建议每次交付同时准备两个压缩包：

| 文件 | 给谁 | 用途 |
| --- | --- | --- |
| `making-field-v0.1-source.zip` | 开发 / 内容成员 | 完整源码，可继续开发 |
| `making-field-v0.1-static.zip` | 托管平台 / 运维 | 已构建的 `dist` 静态文件，可直接上传 |
| `SHA256SUMS.txt` | 接收方 | 校验文件完整性 |
| `README.md` | 所有人 | 本地运行、内容维护说明 |
| `docs/deployment.md` | 接收方 / 运维 | 本文档 |
| `docs/content-model.md` | 开发 / 内容成员 | 字段、数据库与 AI 扩展说明 |

不要直接把整个项目目录（含 `node_modules`）压缩给别人，体积大且可能包含本机路径。使用本文第 2 节的打包命令。

---

## 1. 发布前检查

在项目根目录执行：

```bash
node -v
pnpm -v
pnpm install --frozen-lockfile
pnpm check
pnpm build
pnpm preview
```

要求：

- Node.js **20 LTS**（项目有 `.nvmrc`，Netlify 也已固定 Node 20）。
- pnpm **11.x**；Netlify 配置固定为 `11.28.5`。项目同时保留了 pnpm 9/10 的构建脚本许可配置。
- `pnpm check` 输出“内容校验通过”。
- `pnpm build` 生成 `dist/`。
- `pnpm preview` 后，至少手动打开：
  - `/`
  - `/cases`
  - `/cases/waterdrop-bamboo`
  - `/cases/caadira-green-wall`
  - 在详情页刷新一次，确认不会 404。

### 内容与版权确认

上线前确认：

- [ ] 两个演示案例（`echo-atlas`、`paper-climate`）是否要替换为正式内容。
- [ ] PDF 来源案例已获得作者与指导教师授权。
- [ ] 作者姓名、专业、年份、工具链准确。
- [ ] 封面与正文图片没有隐私信息、未授权肖像或敏感场地信息。
- [ ] 页脚版权年份、项目名称、联系邮箱/公众号等替换为真实信息。
- [ ] 如果要限制访问，先确认内容不适合完全公开。

> 当前项目没有登录和权限系统。静态网站一旦公开，知道链接的人就能访问全部内容；需要限制访问时，使用 Cloudflare Access、机构 SSO 或带鉴权的反向代理。

---

## 2. 生成交付包

### 2.1 源码包

先确认 `dist/` 已是最新构建，然后执行 PowerShell：

```powershell
pnpm build
New-Item -ItemType Directory -Force release

Compress-Archive -Force `
  -Path src, public, scripts, docs, .gitignore, .nvmrc, index.html, package.json, pnpm-lock.yaml, pnpm-workspace.yaml, README.md, netlify.toml, vercel.json, tsconfig.json, tsconfig.app.json, tsconfig.node.json, vite.config.ts `
  -DestinationPath release\making-field-v0.1-source.zip
```

说明：

- 不包含 `node_modules`、`dist`、`release`；
- 保留 `pnpm-lock.yaml`，保证接收方安装到相同版本；
- 保留 `pnpm-workspace.yaml`，其中包含 `allowBuilds`，避免 pnpm 11 拦截 esbuild 安装脚本；
- 保留部署配置 `netlify.toml`、`vercel.json`、`public/_redirects`。

### 2.2 静态站包

```powershell
Compress-Archive -Force `
  -Path dist\* `
  -DestinationPath release\making-field-v0.1-static.zip
```

关键：压缩的是 `dist` **里面的内容**，不是把 `dist` 文件夹本身放进压缩包。解压后第一层应该直接看到：

```text
index.html
assets/
media/
favicon.svg
_redirects
```

### 2.3 校验和

```powershell
Get-FileHash release\*.zip -Algorithm SHA256 |
  ForEach-Object { "$($_.Hash)  $($_.Path)" } |
  Set-Content release\SHA256SUMS.txt
```

把 `SHA256SUMS.txt` 一起交给接收方。对方可运行：

```powershell
Get-FileHash .\making-field-v0.1-static.zip -Algorithm SHA256
```

核对哈希一致后再部署。

### 2.4 macOS / Linux 打包命令

```bash
zip -r release/making-field-v0.1-source.zip \
  src public scripts docs \
  .gitignore .nvmrc index.html package.json pnpm-lock.yaml pnpm-workspace.yaml \
  README.md netlify.toml vercel.json \
  tsconfig.json tsconfig.app.json tsconfig.node.json vite.config.ts

(cd dist && zip -r ../release/making-field-v0.1-static.zip .)
shasum -a 256 release/*.zip > release/SHA256SUMS.txt
```

---

## 3. 最快上线：Netlify Drop

适合：先给别人看、临时验收、不需要先建 Git 仓库。

### 步骤

1. 本地构建：

   ```bash
   pnpm install --frozen-lockfile
   pnpm check
   pnpm build
   ```

2. 把 `dist` 里的内容压缩成 `making-field-v0.1-static.zip`（见第 2.2 节）。

3. 打开 <https://app.netlify.com/drop>，登录 Netlify。

4. 把 `making-field-v0.1-static.zip` 拖进网页。

5. 等待部署完成，会得到一个 `https://随机名称.netlify.app` 地址。

6. 立即验证：

   - 首页是否正常；
   - `/cases` 是否正常；
   - 直接打开 `/cases/waterdrop-bamboo` 是否正常；
   - 在详情页按 F5 刷新是否仍然正常；
   - 手机宽度是否有横向滚动。

7. 登录后进入 **Site configuration → Change site name**，改成易分享的名称，例如：

   ```text
   making-field-exhibition.netlify.app
   ```

8. 在 **Site overview** 中把该站点加入自己的 Team。免费站点需要认领，否则可能过期。

9. 将最终 URL 发给接收方；如果对方需要更新，按同样步骤重新拖入新的 `dist` 压缩包即可。

### 注意

- Netlify Drop 适合快速交付，不适合多人长期维护。
- 免费套餐有带宽和构建额度限制，展览长期运行建议绑定正式账号并确认套餐。
- 站点默认公开，删除或改名会影响已分享的链接。

---

## 4. 长期维护：GitHub + Netlify（推荐）

适合：多人协作、持续添加案例、需要部署历史和回滚。

### 4.1 建立 GitHub 仓库

在 GitHub 新建空仓库，例如：

```text
making-field-exhibition
```

不要勾选自动生成 README，因为本地已有。然后在项目根目录执行：

```bash
git init
git add .
git commit -m "feat: initial digital exhibition prototype"
git branch -M main
git remote add origin https://github.com/<你的组织>/making-field-exhibition.git
git push -u origin main
```

确认 `.gitignore` 已排除：

```text
node_modules/
dist/
release/
```

### 4.2 连接 Netlify

1. 登录 Netlify，选择 **Add new site → Import an existing project**。
2. 选择 GitHub，授权并选中仓库。
3. 构建设置通常会自动读取 `netlify.toml`，确认：
   - Build command：`pnpm build`
   - Publish directory：`dist`
   - Node：`20`
   - pnpm：`11.28.5`
4. 点击 Deploy。
5. 首次部署完成后，测试第 3 节列出的路由。

以后每次 push 到 `main`，Netlify 自动构建并上线。

### 4.3 团队协作设置

- **GitHub**：把开发/内容成员加入仓库，至少给 Write 权限；负责人保留 Admin。
- **Netlify**：把负责人加入 Team，避免个人账号丢失后无法管理站点。
- **分支策略**：
  - `main` 始终对应当前线上版本；
  - 内容成员在 `content/xxx` 分支提交；
  - 通过 Pull Request 合并，Netlify 会自动生成 Deploy Preview，可先审阅再上线。
- **回滚**：Netlify 的 **Deploys** 页面可以选中某个历史部署并发布；Vercel 也支持 Instant Rollback。

### 4.4 Vercel 替代方案

如果团队更习惯 Vercel：

1. 在 Vercel 选择 **Add New → Project**；
2. 导入同一个 GitHub 仓库；
3. Vercel 会读取 `vercel.json`：
   - Install：`pnpm install --frozen-lockfile`
   - Build：`pnpm build`
   - Output：`dist`
4. 部署完成后测试详情页直接访问与刷新。

> 两个平台任选其一即可，不建议同一站点同时绑定两个平台的自动部署，避免版本来源混淆。

---

## 5. 绑定域名与 HTTPS

### 推荐结构

```text
making-field.example.edu     ← 正式展览
www.making-field.example.edu ← 可选，跳转到主域名
```

### 步骤

1. 在域名服务商购买或申请域名。
2. 在 Netlify/Vercel 的 **Domain management** 添加域名。
3. 按平台提示配置 DNS：
   - 主域名：A / ALIAS 记录；
   - `www`：CNAME 指向平台分配的地址；
   - 或把 DNS 托管给平台。
4. 等待 DNS 生效（通常几分钟到 24 小时）。
5. 开启自动 HTTPS；确认 `http://` 会跳转到 `https://`。
6. 用手机和电脑分别访问正式域名，检查：
   - 首页；
   - 案例筛选；
   - 详情页刷新；
   - 分享链接。

### 交付时应移交

- 域名注册商账号或域名转移授权；
- Netlify/Vercel Team Owner 权限；
- GitHub 组织 Owner / 仓库 Admin；
- DNS 管理权限；
- 当前线上部署地址；
- 最近一次源码版本与静态包哈希。

---

## 6. 部署到学校服务器（Nginx）

适合：校内服务器、内网展览、已有域名和运维支持。

### 6.1 构建并上传

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm build
```

把 `dist/` 内容上传到服务器：

```bash
scp -r dist/* user@server:/var/www/making-field/
```

服务器目录应直接包含 `index.html`、`assets/`、`media/`。

### 6.2 Nginx 配置

```nginx
server {
    listen 80;
    server_name making-field.example.edu;

    root /var/www/making-field;
    index index.html;

    # 带 hash 的构建产物可长期缓存
    location /assets/ {
        try_files $uri =404;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # 案例图片
    location /media/ {
        try_files $uri =404;
        expires 30d;
        add_header Cache-Control "public";
    }

    # HTML 不缓存，保证发布后立即生效
    location = /index.html {
        add_header Cache-Control "no-cache";
    }

    # SPA fallback：直接访问 /cases/xxx 也返回 index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

检查并重载：

```bash
sudo nginx -t
sudo systemctl reload nginx
```

HTTPS：

```bash
sudo certbot --nginx -d making-field.example.edu
```

### 6.3 如果必须部署在子路径

项目默认部署在域名根路径。若必须放到：

```text
https://example.edu/exhibition/
```

需要同时修改：

1. `vite.config.ts` 增加 `base: '/exhibition/'`；
2. `main.tsx` 的 `BrowserRouter` 增加 `basename="/exhibition"`；
3. JSON 中的 `/media/...` 路径需要改为子路径或使用 `import.meta.env.BASE_URL`；
4. Nginx 的 fallback 指向 `/exhibition/index.html`。

这会增加维护成本。优先使用独立子域名 `making-field.example.edu`，保持根路径部署。

---

## 7. Cloudflare Pages（可选）

`public/_redirects` 已包含：

```text
/*    /index.html   200
```

因此也可以：

1. Cloudflare Pages → Connect to Git；
2. Build command：`pnpm build`；
3. Build output directory：`dist`；
4. 部署后测试详情页直接访问与刷新；
5. 绑定自定义域名并开启 HTTPS。

Cloudflare Pages 适合已有 Cloudflare DNS 的团队。不要再手动修改构建产物里的 `_redirects`，它会在每次 `pnpm build` 时从 `public/` 复制。

---

## 8. 内容更新与重新部署

### 日常更新流程

```bash
# 1. 修改内容
# src/data/cases.json
# public/media/cases/<slug>/

# 2. 校验
pnpm validate:content
pnpm check

# 3. 本地预览
pnpm dev
# 检查首页、列表筛选、详情页、手机宽度

# 4. 构建
pnpm build
pnpm preview
```

### 使用 GitHub + Netlify

```bash
git checkout -b content/new-case
git add src/data/cases.json public/media/cases/new-case
git commit -m "content: add new-case"
git push -u origin content/new-case
```

在 GitHub 创建 Pull Request，检查 Netlify Deploy Preview，确认后合并到 `main`，正式站自动更新。

### 使用 Netlify Drop

重新执行第 2.2 节生成新的静态包，拖到同一个站点即可覆盖部署。不要创建新站点，否则链接会变化。

### 回滚

- Netlify：Deploys → 选择旧版本 → Publish deploy。
- Vercel：Deployments → 选择旧版本 → Promote to Production。
- 自建服务器：保留上一版 `dist` 备份，切回目录并 reload Nginx。

---

## 9. 交付验收清单

把下面内容逐项确认后，再发“交付完成”消息：

### 链接与访问

- [ ] 正式 URL 可访问，HTTPS 正常。
- [ ] 首页、案例列表、两个详情页均可打开。
- [ ] 详情页直接刷新不 404。
- [ ] 390px 手机宽度无横向滚动，菜单可打开。
- [ ] 微信 / 飞书内打开链接正常（如使用国内访问，提前测试网络）。
- [ ] 分享链接中的筛选参数可复现结果。

### 源码与权限

- [ ] GitHub 仓库已推送，`main` 为线上版本。
- [ ] 接收方有 GitHub 仓库权限。
- [ ] Netlify/Vercel Team 有至少两名管理员。
- [ ] 域名与 DNS 权限已移交或登记。
- [ ] 静态包与源码包已交付，SHA256 已核对。

### 内容与合规

- [ ] 演示案例已替换或明确标注。
- [ ] PDF 案例已获作者授权。
- [ ] 作者信息、年份、专业、工具准确。
- [ ] 页脚联系信息与版权年份已更新。
- [ ] 图片无隐私与敏感信息。

### 运营

- [ ] 已确定内容更新负责人。
- [ ] 已记录部署步骤与回滚方式。
- [ ] 已约定下一次内容评审时间。

---

## 10. 交付消息模板

```text
主题：造物现场 v0.1 交付与部署说明

你好，

“造物现场”数字展览原型已交付。

线上地址：
https://making-field.example.edu

源码仓库：
https://github.com/<org>/making-field-exhibition

附件：
1. making-field-v0.1-source.zip（源码，解压后 pnpm install && pnpm dev）
2. making-field-v0.1-static.zip（静态站包，可拖入 Netlify Drop）
3. SHA256SUMS.txt（文件校验）
4. README.md / docs/deployment.md / docs/content-model.md

本地启动：
  Node.js 20
  pnpm install
  pnpm dev

部署方式：
  Netlify 已连接 GitHub main 分支，push 后自动部署。
  回滚在 Netlify Deploys 页面选择历史版本。

注意事项：
  - 两个演示案例需要在正式上线前替换。
  - PDF 案例图片版权归原作者，公开传播前请确认授权。
  - 当前无后台和登录，内容更新通过修改 JSON 并重新部署完成。

请查收并确认链接、权限与内容。
```

---

## 11. 常见问题

### 部署后首页正常，详情页刷新 404

缺 SPA fallback。确认：

- Netlify 已读取 `netlify.toml`；
- `dist/_redirects` 存在；
- Vercel 使用 `vercel.json` 的 rewrites；
- Nginx 使用 `try_files $uri $uri/ /index.html`。

### 页面空白，控制台资源 404

通常是把站点部署到了子路径，但构建仍按根路径生成。优先改用独立子域名；否则必须同步修改 `base`、`basename` 和图片路径。

### 构建时提示 esbuild 安装脚本被忽略

本项目在 `pnpm-workspace.yaml` 中已配置：

```yaml
allowBuilds:
  esbuild: true
```

如果平台仍拦截，确认使用 pnpm 11+，或在本地执行：

```bash
pnpm approve-builds
```

### 修改 JSON 后线上没变化

静态站没有后台，必须重新构建并部署。检查是否提交了 `cases.json` 与对应图片，是否触发了新的部署。

### 图片在本地有、线上 404

- 路径大小写不一致；
- 图片没有提交到 Git；
- 使用了 `/media/...` 绝对路径但站点部署在子路径；
- Netlify 构建产物里没有包含 `public/media/`。

### 想加访问密码

纯静态站点没有真正的权限控制。建议：

- 用 Cloudflare Access 保护域名；
- 或放到机构统一认证 / 反向代理之后；
- 不要把敏感内容直接放进公开静态站。

---

## 12. 最短路径总结

如果只需要“今天就把链接给别人”：

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm build
```

压缩 `dist` 内全部内容 → 打开 <https://app.netlify.com/drop> → 拖入 → 得到 URL → 测试 `/cases/waterdrop-bamboo` 刷新 → 发给对方。

如果需要“长期维护 + 多人添加内容”：

1. 推到 GitHub；
2. Netlify 导入仓库；
3. `main` 自动部署；
4. 内容走分支 + Deploy Preview；
5. 绑定正式域名；
6. 按第 9 节交接权限与文档。
