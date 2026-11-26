import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dataPath = path.join(root, 'src', 'data', 'cases.json');
const publicDir = path.join(root, 'public');

const allowedProfessions = new Set([
  'architecture',
  'digital-media',
  'visual-communication',
  'product-design',
]);
const allowedContentTypes = new Set([
  'digital-fabrication',
  'research',
  'interactive-installation',
  'data-narrative',
]);
const allowedBlocks = new Set(['heading', 'paragraph', 'image', 'quote', 'list']);

const errors = [];
const warnings = [];
const seenIds = new Set();
const seenSlugs = new Set();

function fail(message) {
  errors.push(message);
}

function checkImage(image, context) {
  if (!image || typeof image !== 'object') {
    fail(`${context}: 缺少图片对象`);
    return;
  }
  if (!image.src) fail(`${context}: 缺少 src`);
  if (!image.alt) fail(`${context}: 缺少 alt`);
  if (image.src) {
    const imagePath = path.join(publicDir, image.src.replace(/^\//, ''));
    if (!fs.existsSync(imagePath)) {
      fail(`${context}: 图片文件不存在 ${image.src}`);
    }
  }
}

if (!fs.existsSync(dataPath)) {
  console.error(`未找到数据文件：${dataPath}`);
  process.exit(1);
}

let data;
try {
  data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
} catch (error) {
  console.error(`cases.json 解析失败：${error.message}`);
  process.exit(1);
}

if (!Array.isArray(data.cases) || data.cases.length === 0) {
  fail('cases 必须是非空数组');
}

const cases = Array.isArray(data.cases) ? data.cases : [];
const professionCounts = new Map();
const contentTypeCounts = new Map();
let imageCount = 0;

for (const [index, item] of cases.entries()) {
  const label = `案例 ${index + 1}${item?.slug ? ` (${item.slug})` : ''}`;

  for (const field of ['id', 'slug', 'title', 'subtitle', 'year', 'summary']) {
    if (!item?.[field]) fail(`${label}: 缺少字段 ${field}`);
  }

  if (item?.schemaVersion !== 1) fail(`${label}: schemaVersion 必须为 1`);
  if (item?.id && seenIds.has(item.id)) fail(`${label}: id 重复`);
  if (item?.slug && seenSlugs.has(item.slug)) fail(`${label}: slug 重复`);
  if (item?.id) seenIds.add(item.id);
  if (item?.slug) seenSlugs.add(item.slug);

  if (!allowedProfessions.has(item?.profession)) {
    fail(`${label}: 未知 profession "${item?.profession}"`);
  } else {
    professionCounts.set(item.profession, (professionCounts.get(item.profession) ?? 0) + 1);
  }

  if (!allowedContentTypes.has(item?.contentType)) {
    fail(`${label}: 未知 contentType "${item?.contentType}"`);
  } else {
    contentTypeCounts.set(item.contentType, (contentTypeCounts.get(item.contentType) ?? 0) + 1);
  }

  if (!Array.isArray(item?.authors) || item.authors.length === 0) {
    fail(`${label}: authors 必须是非空数组`);
  }
  if (!Array.isArray(item?.tools) || item.tools.length === 0) {
    fail(`${label}: tools 必须是非空数组`);
  }
  if (!Array.isArray(item?.tags) || item.tags.length === 0) {
    fail(`${label}: tags 必须是非空数组`);
  }
  if (!Number.isFinite(item?.readingMinutes) || item.readingMinutes <= 0) {
    fail(`${label}: readingMinutes 必须为正数`);
  }

  checkImage(item?.cover, `${label} cover`);
  if (item?.cover?.src) imageCount += 1;

  if (!Array.isArray(item?.blocks) || item.blocks.length < 2) {
    fail(`${label}: blocks 至少需要 2 个内容区块`);
  } else {
    for (const [blockIndex, block] of item.blocks.entries()) {
      const context = `${label} blocks[${blockIndex}]`;
      if (!allowedBlocks.has(block?.type)) {
        fail(`${context}: 未知区块类型 "${block?.type}"`);
        continue;
      }
      if (block.type === 'image') {
        checkImage(block.image, `${context} image`);
        if (block.image?.src) imageCount += 1;
      }
      if (block.type === 'list' && (!Array.isArray(block.items) || block.items.length === 0)) {
        fail(`${context}: list.items 不能为空`);
      }
      if (
        ['heading', 'paragraph', 'quote'].includes(block.type) &&
        typeof block.text !== 'string'
      ) {
        fail(`${context}: 缺少 text`);
      }
    }
  }

  if (item?.gallery) {
    if (!Array.isArray(item.gallery)) {
      fail(`${label}: gallery 必须是数组`);
    } else {
      for (const [galleryIndex, image] of item.gallery.entries()) {
        checkImage(image, `${label} gallery[${galleryIndex}]`);
        if (image?.src) imageCount += 1;
      }
    }
  }

  if (item?.demo) {
    warnings.push(`${label}: 当前为演示数据`);
  }
}

console.log(`内容文件：${path.relative(root, dataPath)}`);
console.log(`案例数量：${cases.length}`);
console.log(`图片引用：${imageCount}`);
console.log(
  `专业分布：${[...professionCounts.entries()].map(([key, value]) => `${key}=${value}`).join(', ')}`,
);
console.log(
  `内容类型：${[...contentTypeCounts.entries()].map(([key, value]) => `${key}=${value}`).join(', ')}`,
);

if (warnings.length > 0) {
  console.log('\n提示：');
  for (const warning of warnings) console.log(`  - ${warning}`);
}

if (errors.length > 0) {
  console.error(`\n发现 ${errors.length} 个问题：`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log('\n内容校验通过。');
