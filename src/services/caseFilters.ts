import type { CaseFilters, CaseStudy, FacetCount } from '../types/case';
import { CORE_TOOLS, CONTENT_TYPES, PROFESSIONS } from '../data/taxonomy';
import { searchCases } from './search';

export function filterCases(cases: CaseStudy[], filters: CaseFilters) {
  let result = cases;

  if (filters.profession) {
    result = result.filter((item) => item.profession === filters.profession);
  }

  if (filters.tool) {
    result = result.filter((item) => item.tools.includes(filters.tool as string));
  }

  if (filters.contentType) {
    result = result.filter((item) => item.contentType === filters.contentType);
  }

  if (filters.query?.trim()) {
    result = searchCases(result, filters.query);
  }

  return result;
}

export function getProfessionFacets(cases: CaseStudy[]): FacetCount[] {
  return PROFESSIONS.map((profession) => ({
    id: profession.id,
    label: profession.label,
    count: cases.filter((item) => item.profession === profession.id).length,
  }));
}

export function getContentTypeFacets(cases: CaseStudy[]): FacetCount[] {
  return CONTENT_TYPES.map((contentType) => ({
    id: contentType.id,
    label: contentType.label,
    count: cases.filter((item) => item.contentType === contentType.id).length,
  }));
}

export function getToolFacets(cases: CaseStudy[]): FacetCount[] {
  const counts = new Map<string, number>();
  for (const item of cases) {
    for (const tool of item.tools) {
      counts.set(tool, (counts.get(tool) ?? 0) + 1);
    }
  }

  const core = CORE_TOOLS.filter((tool) => counts.has(tool));
  const extras = [...counts.keys()]
    .filter((tool) => !core.includes(tool as (typeof CORE_TOOLS)[number]))
    .sort((a, b) => a.localeCompare(b, 'zh-CN'));

  return [...core, ...extras].map((tool) => ({
    id: tool,
    label: tool,
    count: counts.get(tool) ?? 0,
  }));
}

export function countActiveFilters(filters: CaseFilters) {
  return [filters.profession, filters.tool, filters.contentType, filters.query].filter(Boolean).length;
}
