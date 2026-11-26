import type { ContentTypeId, ProfessionId } from '../types/case';

export interface TaxonomyItem {
  id: string;
  label: string;
  shortLabel?: string;
  description: string;
}

export const PROFESSIONS: Array<TaxonomyItem & { id: ProfessionId }> = [
  {
    id: 'architecture',
    label: '建筑与空间',
    shortLabel: '建筑',
    description: '以空间、结构与材料为对象的计算性设计与实体建造。',
  },
  {
    id: 'digital-media',
    label: '数字媒体艺术',
    shortLabel: '数字媒体',
    description: '围绕声音、影像、传感器与实时系统的交互实践。',
  },
  {
    id: 'visual-communication',
    label: '视觉传达',
    shortLabel: '视觉传达',
    description: '把数据、文本与图像转译为新的阅读和感知方式。',
  },
  {
    id: 'product-design',
    label: '产品与工业设计',
    shortLabel: '产品设计',
    description: '面向制造、使用与可持续性的数字产品实验。',
  },
];

export const CONTENT_TYPES: Array<TaxonomyItem & { id: ContentTypeId }> = [
  {
    id: 'digital-fabrication',
    label: '数字建造',
    description: '从数字模型走向材料、节点与真实尺度的建造过程。',
  },
  {
    id: 'research',
    label: '研究实验',
    description: '以问题为起点，通过模拟、样件与测试推进的设计研究。',
  },
  {
    id: 'interactive-installation',
    label: '交互装置',
    description: '由传感器、声音、影像或空间反馈共同构成的体验。',
  },
  {
    id: 'data-narrative',
    label: '数据叙事',
    description: '以数据为材料，建立可阅读、可感知的叙事结构。',
  },
];

/**
 * 工具筛选的推荐顺序。案例中出现但未在此列出的工具会自动追加，
 * 便于后续内容导入器直接写入新的工具名称。
 */
export const CORE_TOOLS = [
  'Rhino',
  'Grasshopper',
  'Kangaroo Physics',
  'Clay 3D Printing',
  'TouchDesigner',
  'D3.js',
  'Figma',
] as const;

export const professionMap = new Map(PROFESSIONS.map((item) => [item.id, item]));
export const contentTypeMap = new Map(CONTENT_TYPES.map((item) => [item.id, item]));

export function getProfession(id: ProfessionId) {
  return professionMap.get(id) ?? PROFESSIONS[0];
}

export function getContentType(id: ContentTypeId) {
  return contentTypeMap.get(id) ?? CONTENT_TYPES[0];
}
