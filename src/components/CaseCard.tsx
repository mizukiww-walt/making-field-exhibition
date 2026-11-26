import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import type { CaseStudy } from '../types/case';
import { getContentType, getProfession } from '../data/taxonomy';
import { ArrowUpRight } from './Icon';

interface CaseCardProps {
  caseStudy: CaseStudy;
  index: number;
  priority?: boolean;
}

export function CaseCard({ caseStudy, index, priority = false }: CaseCardProps) {
  const profession = getProfession(caseStudy.profession);
  const contentType = getContentType(caseStudy.contentType);

  return (
    <article
      className="case-card"
      style={{ '--card-accent': caseStudy.accent ?? 'var(--accent)' } as CSSProperties}
    >
      <Link className="case-card__link" to={`/cases/${caseStudy.slug}`}>
        <div className="case-card__media">
          <img
            src={caseStudy.cover.src}
            alt={caseStudy.cover.alt}
            loading={priority ? 'eager' : 'lazy'}
          />
          <span className="case-card__index mono">
            {String(index + 1).padStart(2, '0')}
          </span>
          {caseStudy.demo && <span className="case-card__demo">演示</span>}
          <span className="case-card__open" aria-hidden="true">
            查看案例 <ArrowUpRight size={16} />
          </span>
        </div>

        <div className="case-card__body">
          <div className="case-card__meta mono">
            <span>{profession.shortLabel ?? profession.label}</span>
            <span>{contentType.label}</span>
            <span>{caseStudy.year}</span>
          </div>
          <h3 className="case-card__title">
            {caseStudy.title}
            {caseStudy.titleEn && <em>{caseStudy.titleEn}</em>}
          </h3>
          <p className="case-card__subtitle">{caseStudy.subtitle}</p>
          <div className="case-card__footer">
            <span>
              {caseStudy.authors
                .slice(0, 2)
                .map((author) => author.name)
                .join(' / ')}
              {caseStudy.authors.length > 2 ? ' 等' : ''}
            </span>
            <span className="mono">{caseStudy.readingMinutes} MIN</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
