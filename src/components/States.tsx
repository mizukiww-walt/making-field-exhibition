export function CaseGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="case-grid" aria-label="正在加载案例" aria-busy="true">
      {Array.from({ length: count }).map((_, index) => (
        <div className="case-skeleton" key={index}>
          <div className="case-skeleton__media skeleton-shimmer" />
          <div className="case-skeleton__line case-skeleton__line--short skeleton-shimmer" />
          <div className="case-skeleton__line case-skeleton__line--title skeleton-shimmer" />
          <div className="case-skeleton__line skeleton-shimmer" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ onReset }: { onReset(): void }) {
  return (
    <div className="empty-state">
      <p className="eyebrow">NO RESULTS / 暂无结果</p>
      <h3>没有找到符合条件的案例。</h3>
      <p>试试减少筛选条件，或换一个更宽泛的关键词。例如“竹构”“打印”“数据”。</p>
      <button type="button" className="button button--dark" onClick={onReset}>
        重置全部筛选
      </button>
    </div>
  );
}
