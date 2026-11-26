import rawCaseFile from '../data/cases.json';
import type { CaseFile, CaseStudy } from '../types/case';

export interface CaseRepository {
  listCases(): Promise<CaseStudy[]>;
  getCaseBySlug(slug: string): Promise<CaseStudy | null>;
}

const caseFile = rawCaseFile as unknown as CaseFile;
const curatedCases = [...caseFile.cases].sort((a, b) => {
  if (Boolean(a.featured) !== Boolean(b.featured)) return a.featured ? -1 : 1;
  return a.id.localeCompare(b.id);
});

/**
 * 本地 JSON 数据源。
 *
 * 未来接入数据库时，只需实现同样的 CaseRepository 接口，
 * 页面和筛选逻辑无需改动。例如：
 *   export const apiCaseRepository: CaseRepository = { ... }
 */
export const localCaseRepository: CaseRepository = {
  async listCases() {
    return curatedCases;
  },

  async getCaseBySlug(slug) {
    return curatedCases.find((item) => item.slug === slug) ?? null;
  },
};

let casesPromise: Promise<CaseStudy[]> | null = null;

/** 共享一次读取，避免同一页面内重复加载。 */
export function loadAllCases() {
  if (!casesPromise) {
    casesPromise = localCaseRepository.listCases();
  }
  return casesPromise;
}

export function getAdjacentCases(cases: CaseStudy[], slug: string) {
  const index = cases.findIndex((item) => item.slug === slug);
  if (index < 0) return { previous: null, next: null };
  return {
    previous: index > 0 ? cases[index - 1] : cases[cases.length - 1] ?? null,
    next: index < cases.length - 1 ? cases[index + 1] : cases[0] ?? null,
  };
}

export function getCaseFileMeta() {
  return {
    schemaVersion: caseFile.schemaVersion,
    updatedAt: caseFile.updatedAt,
  };
}
