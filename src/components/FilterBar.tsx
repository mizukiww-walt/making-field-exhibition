import type { CaseFilters, CaseStudy } from '../types/case';
import {
  getContentTypeFacets,
  getProfessionFacets,
  getToolFacets,
} from '../services/caseFilters';
import { CloseIcon, GridIcon, ListIcon, SearchIcon, SlidersIcon } from './Icon';

interface FilterBarProps {
  cases: CaseStudy[];
  filters: CaseFilters;
  searchValue: string;
  resultCount: number;
  view: 'grid' | 'list';
  onSearchChange(value: string): void;
  onFilterChange(key: 'profession' | 'tool' | 'contentType', value: string): void;
  onClear(): void;
  onViewChange(view: 'grid' | 'list'): void;
}

function FilterGroup({
  label,
  options,
  active,
  onSelect,
}: {
  label: string;
  options: Array<{ id: string; label: string; count: number }>;
  active?: string;
  onSelect(value: string): void;
}) {
  return (
    <div className="filter-group">
      <div className="filter-group__label mono">
        <SlidersIcon size={14} />
        <span>{label}</span>
      </div>
      <div className="filter-chips" role="group" aria-label={label}>
        <button
          type="button"
          className={`filter-chip${!active ? ' is-active' : ''}`}
          aria-pressed={!active}
          onClick={() => onSelect('')}
        >
          全部
        </button>
        {options.map((option) => (
          <button
            type="button"
            key={option.id}
            className={`filter-chip${active === option.id ? ' is-active' : ''}`}
            aria-pressed={active === option.id}
            disabled={option.count === 0}
            onClick={() => onSelect(option.id)}
          >
            {option.label}
            <span className="filter-chip__count">{option.count}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function FilterBar({
  cases,
  filters,
  searchValue,
  resultCount,
  view,
  onSearchChange,
  onFilterChange,
  onClear,
  onViewChange,
}: FilterBarProps) {
  const professionFacets = getProfessionFacets(cases);
  const contentTypeFacets = getContentTypeFacets(cases);
  const toolFacets = getToolFacets(cases);
  const hasFilters = Boolean(
    filters.profession || filters.tool || filters.contentType || filters.query,
  );

  return (
    <section className="filter-bar" aria-label="筛选案例">
      <div className="filter-search-row">
        <label className="search-field">
          <SearchIcon size={22} />
          <span className="sr-only">搜索案例</span>
          <input
            type="search"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="搜索标题、作者、工具或标签…"
            autoComplete="off"
          />
          {searchValue && (
            <button
              type="button"
              className="search-clear"
              onClick={() => onSearchChange('')}
              aria-label="清空搜索"
            >
              <CloseIcon size={17} />
            </button>
          )}
        </label>
        <div className="filter-search-meta">
          <span className="mono">
            {String(resultCount).padStart(2, '0')} 个结果
          </span>
          {hasFilters && (
            <button className="clear-filters" type="button" onClick={onClear}>
              清除筛选 <CloseIcon size={13} />
            </button>
          )}
        </div>
        <div className="view-toggle" role="group" aria-label="视图切换">
          <button
            type="button"
            className={view === 'grid' ? 'is-active' : ''}
            aria-pressed={view === 'grid'}
            onClick={() => onViewChange('grid')}
            aria-label="网格视图"
          >
            <GridIcon size={17} />
          </button>
          <button
            type="button"
            className={view === 'list' ? 'is-active' : ''}
            aria-pressed={view === 'list'}
            onClick={() => onViewChange('list')}
            aria-label="列表视图"
          >
            <ListIcon size={18} />
          </button>
        </div>
      </div>

      <div className="filter-groups">
        <FilterGroup
          label="专业"
          options={professionFacets}
          active={filters.profession}
          onSelect={(value) => onFilterChange('profession', value)}
        />
        <FilterGroup
          label="内容类型"
          options={contentTypeFacets}
          active={filters.contentType}
          onSelect={(value) => onFilterChange('contentType', value)}
        />
        <FilterGroup
          label="工具"
          options={toolFacets}
          active={filters.tool}
          onSelect={(value) => onFilterChange('tool', value)}
        />
      </div>

      <p className="filter-footnote mono">
        <span className="status-dot" aria-hidden="true" />
        本地关键词检索 · 检索接口已预留 AI / 语义搜索
      </p>
    </section>
  );
}
