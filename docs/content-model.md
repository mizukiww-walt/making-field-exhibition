# 内容模型与扩展说明

本文档说明案例数据的字段约定、正文区块、标签体系，以及后续接入数据库、内容导入器和 AI 检索时的推荐路径。

对应代码：

- 类型定义：[`src/types/case.ts`](../src/types/case.ts)
- 内容数据：[`src/data/cases.json`](../src/data/cases.json)
- 字典：[`src/data/taxonomy.ts`](../src/data/taxonomy.ts)
- 数据访问：[`src/services/caseRepository.ts`](../src/services/caseRepository.ts)
- 检索接口：[`src/services/search.ts`](../src/services/search.ts)
- 内容校验：[`scripts/validate-content.mjs`](../scripts/validate-content.mjs)

## 1. 设计原则

1. **内容与展示分离**：JSON 不包含组件、HTML 或样式，页面负责渲染。
2. **字段可迁移**：每个案例都有稳定 `id` 与 `slug`，可直接映射到数据库主键与 URL。
3. **正文结构化**：正文拆为区块，而不是一整段富文本，便于导入、摘要、AI 分块检索和未来换用编辑器。
4. **分类使用 ID**：专业、内容类型使用固定 ID，中文名称在 `taxonomy.ts` 中维护，修改显示名不会破坏数据。
5. **筛选与检索分离**：专业 / 工具 / 内容类型是确定性筛选，关键词与未来的语义检索通过 `CaseSearchProvider` 接入。

## 2. 案例字段

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `schemaVersion` | `1` | 是 | 单条案例的模型版本 |
| `id` | `string` | 是 | 稳定唯一 ID，建议 `case-001` |
| `slug` | `string` | 是 | URL 片段，必须唯一，建议英文短横线 |
| `title` | `string` | 是 | 中文标题 |
| `titleEn` | `string` | 否 | 英文标题，用于详情页的衬线副标题 |
| `subtitle` | `string` | 是 | 一句话说明，不重复摘要 |
| `year` | `string` | 是 | 展示用年份，允许 `2023–2024` |
| `authors` | `Author[]` | 是 | 作者与角色 |
| `profession` | `ProfessionId` | 是 | 专业方向 ID |
| `contentType` | `ContentTypeId` | 是 | 内容类型 ID |
| `tools` | `string[]` | 是 | 工具 / 方法名称，同时用于工具筛选 |
| `tags` | `string[]` | 是 | 内容标签 |
| `summary` | `string` | 是 | 摘要，用于详情页导语与检索 |
| `cover` | `CaseImage` | 是 | 封面图 |
| `featured` | `boolean` | 否 | 是否进入首页推荐 |
| `demo` | `boolean` | 否 | 是否标注为演示条目 |
| `accent` | `string` | 否 | 案例强调色，建议十六进制 |
| `readingMinutes` | `number` | 是 | 预计阅读时长，正整数 |
| `blocks` | `ContentBlock[]` | 是 | 正文区块 |
| `gallery` | `CaseImage[]` | 否 | 文末“图像档案” |
| `links` | `{ label, url }[]` | 否 | 外部链接，预留字段，当前页面未展示 |

### Author

```json
{
  "name": "Ye Chenlong",
  "role": "建筑学 2019"
}
```

`role` 可填写年级、研究方向、导师身份等，不强制拆分。

### CaseImage

```json
{
  "src": "/media/cases/waterdrop/cover.webp",
  "alt": "施工现场中，白色数字线框叠加在弯曲的竹构骨架上",
  "caption": "数字线框与真实竹构在施工现场重合。"
}
```

- `src` 使用 `public/` 下的绝对路径；
- `alt` 必填，描述画面而不是重复标题；
- `caption` 用于图注与图像档案编号。

## 3. 正文区块

`blocks` 是有序数组。渲染逻辑位于 [`CaseDetailPage.tsx`](../src/pages/CaseDetailPage.tsx)。

| `type` | 必填字段 | 用途 |
| --- | --- | --- |
| `heading` | `text`，可选 `kicker` | 章节标题；`kicker` 显示为英文小标 |
| `paragraph` | `text` | 正文段落，纯文本 |
| `image` | `image`，可选 `layout` | 正文插图；`layout` 为 `wide` 或 `inset` |
| `quote` | `text`，可选 `attribution` | 引语 / 策展摘录 |
| `list` | `items`，可选 `ordered` | 编号或项目列表 |

示例：

```json
{
  "type": "image",
  "layout": "wide",
  "image": {
    "src": "/media/cases/example/process.webp",
    "alt": "打印中的黏土砌块",
    "caption": "打印路径决定了砌块内部的空腔。"
  }
}
```

### 为什么不用一整段 HTML？

- 导入器可以从表格、Markdown 或 CMS 字段稳定映射；
- AI 检索可以按段落 / 标题分块，生成更精准的引用；
- 未来可以替换成更丰富的区块，而不破坏旧数据；
- 渲染层可以统一控制图片懒加载、图注、引用样式。

如果未来确实需要自由排版，建议新增 `richText` 区块类型，而不是把 HTML 塞进 `paragraph`。

## 4. 分类字典

当前专业 ID：

| ID | 中文名 |
| --- | --- |
| `architecture` | 建筑与空间 |
| `digital-media` | 数字媒体艺术 |
| `visual-communication` | 视觉传达 |
| `product-design` | 产品与工业设计（暂无案例） |

当前内容类型 ID：

| ID | 中文名 |
| --- | --- |
| `digital-fabrication` | 数字建造 |
| `research` | 研究实验 |
| `interactive-installation` | 交互装置 |
| `data-narrative` | 数据叙事 |

新增专业或内容类型时，需要同时更新：

1. `src/types/case.ts` 中的联合类型；
2. `src/data/taxonomy.ts` 中的字典；
3. `scripts/validate-content.mjs` 中的允许值集合。

工具没有固定 ID，使用显示名称。`CORE_TOOLS` 控制工具筛选的推荐顺序，数据里出现的新工具会自动追加到筛选器。

## 5. 数据流

```text
cases.json
   ↓  loadAllCases()（共享一次读取）
CaseRepository
   ↓
useCases() / useCase()
   ↓
filterCases() + searchCases()
   ↓
CasesPage / HomePage / CaseDetailPage
```

未来替换数据源时，只需修改 `loadAllCases()` 使用的仓储实现：

```ts
const repository: CaseRepository = apiCaseRepository;
```

## 6. 迁移到数据库

建议拆表，避免把整个 JSON 塞进一个字段。一种可用的关系结构：

```text
cases
  id, slug, title, title_en, subtitle, year, summary,
  profession_id, content_type_id, cover_src, cover_alt, cover_caption,
  featured, demo, accent, reading_minutes, published_at, updated_at

authors
  id, name, role

case_authors
  case_id, author_id, sort_order

tools
  id, name, slug

case_tools
  case_id, tool_id

tags
  id, name, slug

case_tags
  case_id, tag_id

case_blocks
  id, case_id, type, sort_order, text, kicker, layout, attribution, payload_json

case_images
  id, case_id, block_id, src, alt, caption, sort_order
```

如果使用 PostgreSQL，也可以保留 `blocks` 为 `jsonb`，降低前端迁移成本。推荐：

- `cases`、`professions`、`content_types`、`tools`、`tags` 独立表；
- `blocks` 使用 JSONB 或独立表，取决于是否需要按区块查询；
- 图片使用对象存储 URL，数据库只存路径和元数据；
- 为 `slug`、`profession_id`、`content_type_id`、`published_at` 建立索引。

### API 映射

```ts
type CaseSummary = Omit<CaseStudy, 'blocks'> & { blockCount: number };
type CaseDetail = CaseStudy;
```

列表接口可以只返回摘要字段，详情接口再返回 `blocks` 与 `gallery`，减少列表页载荷。

## 7. 内容导入器

推荐将导入器设计为“字段映射 + 规则校验”，不要直接拼接 HTML。

### 最小导入流程

1. 读取表单 / CSV / 表格行；
2. 生成 `slug`，检查唯一性；
3. 校验专业、内容类型、工具、标签；
4. 上传图片，转换为 WebP，写入 `/media/cases/{slug}/`；
5. 按顺序生成 `blocks`；
6. 生成完整 `CaseStudy`；
7. 运行与 `validate-content.mjs` 相同的规则；
8. 写入数据库或输出 `cases.json`。

### 必填检查

- 标题、摘要、专业、内容类型；
- 至少 1 位作者；
- 至少 1 个工具、1 个标签；
- 封面图与 `alt`；
- 至少 2 个正文区块；
- 所有图片路径可访问。

### 演示数据标记

演示条目必须保留 `"demo": true`，页面会显示“演示条目”提示。替换为正式内容时移除该字段。

## 8. AI 检索接入

当前 `localKeywordSearchProvider` 的评分字段权重：

```text
标题 / 副标题  12
标签            8
工具            7
作者            6
摘要            5
专业 / 内容类型  3
正文            1
```

未来接入 AI 时建议保留“先筛选、再检索”：

1. 专业、工具、内容类型仍然做数据库过滤；
2. 对候选集执行向量检索或 LLM 重排；
3. 返回 `caseId`、匹配段落、置信度与可读的解释；
4. 前端只消费统一的 `CaseStudy[]`，不感知检索实现。

### 检索文档

可为每个案例生成：

```json
{
  "caseId": "case-002",
  "title": "可生长的绿墙",
  "searchText": "标题、摘要、作者、工具、标签、章节标题与段落……",
  "profession": "architecture",
  "contentType": "research",
  "tools": ["Rhino", "Grasshopper", "Clay 3D Printing"],
  "updatedAt": "2026-11-24"
}
```

将 `searchText` 按段落切块、生成 embedding，并在结果中返回命中的正文片段，便于详情页高亮引用。

### 降级策略

- AI 服务超时或失败时回退到本地关键词检索；
- 保留无结果状态与推荐案例；
- 对 AI 返回的案例 ID 做白名单校验，避免编造不存在的案例。

## 9. 图片规范

- 目录：`public/media/cases/{slug}/`
- 格式：WebP，质量 80–88；
- 长边：1600–1800px；
- 封面比例：优先 3:2 或 16:9；
- 文件名：小写英文 + 短横线，如 `model-floor.webp`；
- 每张图必须有 `alt`，正文图建议有 `caption`；
- 低分辨率原图不要强行放大，建议在卡片 / 画廊中使用较小展示宽度。

## 10. 校验与发布

发布前建议执行：

```bash
pnpm check
pnpm build
```

`pnpm check` 包含 TypeScript 与内容校验。生产环境还可以增加：

- 链接可达性检查；
- 图片尺寸与文件体积上限；
- 可访问性检查（alt、标题层级、颜色对比度）；
- 基于 JSON Schema 的 CI 校验；
- 数据库写入事务与 slug 冲突处理。

## 11. 版本演进

| 版本 | 内容 |
| --- | --- |
| v0.1 | 静态原型：本地 JSON、4 个案例、筛选 / 搜索 / 详情 / 响应式 |
| v0.2（建议） | 内容导入脚本、图片上传、JSON Schema 校验 |
| v0.3（建议） | 数据库 + 管理后台、草稿 / 发布状态 |
| v1.0（建议） | 语义检索、推荐、访问统计、多语言 |
