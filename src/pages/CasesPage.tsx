import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCases } from '../hooks/useCases';
import { filterCases } from '../services/caseFilters';
import type { CaseFilters } from '../types/case';
import { CaseCard } from '../components/CaseCard';
import { FilterBar } from '../components/FilterBar';
import { CaseGridSkeleton, EmptyState } from '../components/States';
import { useDocumentTitle } from '../hooks/usePageEffects';
import { getCaseFileMeta } from '../services/caseRepository';

export function CasesPage() {
  useDocumentTitle('案例索引');
  const { cases, status } = useCases();
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const meta = getCaseFileMeta();

  const filters: CaseFilters = {
    profession: searchParams.get('profession') ?? undefined,
    tool: searchParams.get('tool') ?? undefined,
    contentType: searchParams.get('contentType') ?? undefined,
    query: searchParams.get('q') ?? undefined,
  };

  const filteredCases = useMemo(
    () => filterCases(cases, filters),
    // filters is derived from searchParams; reconstructing it each render is fine for this dataset.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cases, searchParams],
  );

  function updateFilters(next: Partial<CaseFilters>) {
    const params = new URLSearchParams(searchParams);
    const keyMap: Record<string, string> = {
      profession: 'profession',
      tool: 'tool',
      contentType: 'contentType',
      query: 'q',
    };

    Object.entries(next).forEach(([key, value]) => {
      const paramKey = keyMap[key];
      if (!paramKey) return;
      if (value) params.set(paramKey, value);
      else params.delete(paramKey);
    });

    setSearchParams(params, { replace: true });
  }

  function clearFilters() {
    setSearchParams(new URLSearchParams(), { replace: true });
  }

  return (
    <main className="cases-page">
      <header className="index-hero section-shell">
        <div className="index-hero__meta mono">
          <span>INDEX / 案例索引</span>
          <span>UPDATED {meta.updatedAt}</span>
          <span>{String(cases.length).padStart(2, '0')} ENTRIES</span>
        </div>

        <div className="index-hero__main">
          <div className="index-hero__title">
            <p className="eyebrow">BROWSE THE ARCHIVE</p>
            <h1>
              案例
              <span>索引</span>
              <sup>{String(filteredCases.length).padStart(2, '0')}</sup>
            </h1>
          </div>
          <div className="index-hero__intro">
            <p>
              按专业、内容类型与工具浏览，也可以直接搜索标题、作者、标签或方法关键词。
              列表会记住你的筛选条件，链接可以直接分享。
            </p>
            <p className="mono index-hero__hint">
              试试搜索：竹构 / 绿墙 / 3D打印 / 数据
            </p>
          </div>
        </div>

        <div className="index-hero__ghost" aria-hidden="true">
          INDEX
        </div>
      </header>

      <div className="section-shell cases-content">
        <FilterBar
          cases={cases}
          filters={filters}
          searchValue={filters.query ?? ''}
          resultCount={filteredCases.length}
          view={view}
          onSearchChange={(value) => updateFilters({ query: value })}
          onFilterChange={(key, value) => updateFilters({ [key]: value })}
          onClear={clearFilters}
          onViewChange={setView}
        />

        {status === 'loading' && <CaseGridSkeleton />}

        {status === 'error' && (
          <div className="empty-state">
            <p className="eyebrow">LOAD ERROR / 读取失败</p>
            <h3>案例数据暂时无法读取。</h3>
            <p>请检查 `src/data/cases.json` 的格式，或刷新页面重试。</p>
          </div>
        )}

        {status === 'ready' && filteredCases.length === 0 && (
          <EmptyState onReset={clearFilters} />
        )}

        {status === 'ready' && filteredCases.length > 0 && (
          <>
            <div className={`case-grid${view === 'list' ? ' case-grid--list' : ''}`}>
              {filteredCases.map((item, index) => (
                <CaseCard
                  key={item.id}
                  caseStudy={item}
                  index={cases.indexOf(item)}
                  priority={index < 3}
                />
              ))}
            </div>

            <div className="cases-footer-note">
              <p className="mono">
                SHOWING {String(filteredCases.length).padStart(2, '0')} /{' '}
                {String(cases.length).padStart(2, '0')}
              </p>
              <p>
                标注“演示”的条目为结构与交互演示数据，替换 `src/data/cases.json` 后即可成为正式内容。
              </p>
              <button type="button" className="text-link" onClick={clearFilters}>
                回到全部案例
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
