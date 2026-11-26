import type { CSSProperties } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCase } from '../hooks/useCases';
import { useDocumentTitle, useReadingProgress } from '../hooks/usePageEffects';
import { useCopyLink } from '../hooks/useCopyLink';
import { getAdjacentCases } from '../services/caseRepository';
import { getContentType, getProfession } from '../data/taxonomy';
import type { ContentBlock } from '../types/case';
import { ArrowRight, ArrowUpRight, CheckIcon, CopyIcon } from '../components/Icon';
import { NotFoundPage } from './NotFoundPage';

function BlockRenderer({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case 'heading':
      return (
        <section className="article-section">
          {block.kicker && <p className="article-section__kicker mono">{block.kicker}</p>}
          <h2>{block.text}</h2>
        </section>
      );
    case 'paragraph':
      return <p className="article-paragraph">{block.text}</p>;
    case 'image':
      return (
        <figure className={`article-figure${block.layout === 'inset' ? ' article-figure--inset' : ''}`}>
          <img src={block.image.src} alt={block.image.alt} loading="lazy" />
          {(block.image.caption || block.image.alt) && (
            <figcaption>{block.image.caption ?? block.image.alt}</figcaption>
          )}
        </figure>
      );
    case 'quote':
      return (
        <blockquote className="article-quote">
          <p>{block.text}</p>
          {block.attribution && <cite className="mono">{block.attribution}</cite>}
        </blockquote>
      );
    case 'list':
      return (
        <div className="article-list-wrap">
          {block.items.map((item, index) => (
            <div className="article-list-item" key={item}>
              <span className="mono">{String(index + 1).padStart(2, '0')}</span>
              <p>{item}</p>
            </div>
          ))}
        </div>
      );
    default:
      return null;
  }
}

export function CaseDetailPage() {
  const { slug } = useParams();
  const { cases, status, caseStudy } = useCase(slug);
  useDocumentTitle(caseStudy ? `${caseStudy.title} ${caseStudy.titleEn ?? ''}`.trim() : '案例详情');
  useReadingProgress(Boolean(caseStudy));
  const { copied, copy } = useCopyLink();

  if (status === 'loading') {
    return (
      <main className="detail-loading section-shell" aria-busy="true">
        <div className="detail-loading__line skeleton-shimmer" />
        <div className="detail-loading__title skeleton-shimmer" />
        <div className="detail-loading__title detail-loading__title--short skeleton-shimmer" />
        <div className="detail-loading__cover skeleton-shimmer" />
      </main>
    );
  }

  if (!caseStudy) {
    return <NotFoundPage />;
  }

  const profession = getProfession(caseStudy.profession);
  const contentType = getContentType(caseStudy.contentType);
  const { next } = getAdjacentCases(cases, caseStudy.slug);
  const caseNumber = String(cases.indexOf(caseStudy) + 1).padStart(2, '0');

  return (
    <main
      className="case-detail"
      style={{ '--case-accent': caseStudy.accent ?? 'var(--accent)' } as CSSProperties}
    >
      <div className="reading-progress" aria-hidden="true">
        <span data-reading-progress />
      </div>

      <div className="section-shell">
        <nav className="breadcrumb mono" aria-label="面包屑">
          <Link to="/">首页</Link>
          <span>/</span>
          <Link to="/cases">案例索引</Link>
          <span>/</span>
          <span aria-current="page">{caseStudy.title}</span>
        </nav>

        <header className="case-hero">
          <div className="case-hero__top mono">
            <span>
              CASE {caseNumber} / {caseStudy.year}
            </span>
            <span>{profession.label}</span>
            <span>{contentType.label}</span>
            {caseStudy.demo && <span className="demo-tag">演示条目</span>}
          </div>

          <h1 className="case-hero__title">
            {caseStudy.title}
            {caseStudy.titleEn && <em>{caseStudy.titleEn}</em>}
          </h1>
          <p className="case-hero__subtitle">{caseStudy.subtitle}</p>

          <div className="case-hero__byline">
            <div className="case-hero__authors">
              {caseStudy.authors.slice(0, 3).map((author) => (
                <span key={author.name}>{author.name}</span>
              ))}
              {caseStudy.authors.length > 3 && (
                <span>+{caseStudy.authors.length - 3}</span>
              )}
            </div>
            <div className="case-hero__byline-meta mono">
              <span>{caseStudy.readingMinutes} MIN READ</span>
              <span>{caseStudy.tools.slice(0, 3).join(' · ')}</span>
            </div>
          </div>
        </header>
      </div>

      <figure className="case-cover section-shell">
        <img src={caseStudy.cover.src} alt={caseStudy.cover.alt} />
        <figcaption>
          <span>{caseStudy.cover.caption ?? caseStudy.cover.alt}</span>
          <span className="mono">FIG. 01 / COVER</span>
        </figcaption>
      </figure>

      <div className="case-lead section-shell">
        <p className="eyebrow">ABSTRACT / 摘要</p>
        <p>{caseStudy.summary}</p>
      </div>

      <div className="case-content section-shell">
        <aside className="case-aside">
          <div className="case-aside__block">
            <p className="case-aside__label mono">TEAM / 作者</p>
            {caseStudy.authors.map((author) => (
              <div className="author-row" key={author.name}>
                <span className="author-row__initial" aria-hidden="true">
                  {author.name.slice(0, 1)}
                </span>
                <span>
                  <strong>{author.name}</strong>
                  {author.role && <small>{author.role}</small>}
                </span>
              </div>
            ))}
          </div>

          <dl className="case-facts">
            <div>
              <dt className="mono">专业</dt>
              <dd>{profession.label}</dd>
            </div>
            <div>
              <dt className="mono">内容类型</dt>
              <dd>{contentType.label}</dd>
            </div>
            <div>
              <dt className="mono">年份</dt>
              <dd>{caseStudy.year}</dd>
            </div>
            <div>
              <dt className="mono">工具 / 方法</dt>
              <dd>{caseStudy.tools.join('、')}</dd>
            </div>
          </dl>

          <button type="button" className="share-button" onClick={copy}>
            {copied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
            {copied ? '链接已复制' : '复制本页链接'}
          </button>

          <Link className="back-link mono" to="/cases">
            ← 返回案例索引
          </Link>
        </aside>

        <article className="case-article" data-article>
          {caseStudy.demo && (
            <div className="demo-notice">
              <span className="mono">DEMO CONTENT</span>
              <p>
                本条目为演示数据，用于展示筛选、详情和图片画廊结构。替换
                <code>src/data/cases.json</code> 中的对应对象即可上线正式内容。
              </p>
            </div>
          )}

          {caseStudy.blocks.map((block, index) => (
            <BlockRenderer key={`${block.type}-${index}`} block={block} />
          ))}

          <div className="article-tags">
            <p className="mono">TAGS / 标签</p>
            <div>
              {caseStudy.tags.map((tag) => (
                <Link key={tag} to={`/cases?q=${encodeURIComponent(tag)}`}>
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </article>
      </div>

      {caseStudy.gallery && caseStudy.gallery.length > 0 && (
        <section className="case-gallery section-shell">
          <div className="case-gallery__heading">
            <p className="eyebrow">IMAGE ARCHIVE / 图像档案</p>
            <h2>过程与细部</h2>
            <span className="mono">{String(caseStudy.gallery.length).padStart(2, '0')} PLATES</span>
          </div>
          <div className="case-gallery__grid">
            {caseStudy.gallery.map((image, index) => (
              <figure className={`gallery-item gallery-item--${index % 3}`} key={image.src + index}>
                <img src={image.src} alt={image.alt} loading="lazy" />
                <figcaption>
                  <span>{image.caption ?? image.alt}</span>
                  <span className="mono">PL. {String(index + 1).padStart(2, '0')}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {next && (
        <section className="next-case section-shell">
          <Link to={`/cases/${next.slug}`} className="next-case__link">
            <div className="next-case__copy">
              <p className="eyebrow">NEXT CASE / 下一个案例</p>
              <h2>
                {next.title}
                {next.titleEn && <em>{next.titleEn}</em>}
              </h2>
              <p>{next.subtitle}</p>
              <span className="next-case__cta">
                继续阅读 <ArrowRight size={17} />
              </span>
            </div>
            <div className="next-case__image">
              <img src={next.cover.src} alt="" loading="lazy" />
            </div>
          </Link>
          <Link className="next-case__all mono" to="/cases">
            查看全部案例 <ArrowUpRight size={14} />
          </Link>
        </section>
      )}
    </main>
  );
}
