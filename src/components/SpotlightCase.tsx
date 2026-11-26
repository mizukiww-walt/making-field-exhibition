import { Link } from 'react-router-dom';
import type { CaseStudy } from '../types/case';
import { getContentType, getProfession } from '../data/taxonomy';
import { ArrowUpRight } from './Icon';

interface SpotlightCaseProps {
  caseStudy: CaseStudy;
  index: number;
}

export function SpotlightCase({ caseStudy, index }: SpotlightCaseProps) {
  const profession = getProfession(caseStudy.profession);
  const contentType = getContentType(caseStudy.contentType);

  return (
    <article className="spotlight-case">
      <Link className="spotlight-case__media" to={`/cases/${caseStudy.slug}`}>
        <img src={caseStudy.cover.src} alt={caseStudy.cover.alt} />
        <span className="spotlight-case__label mono">CURATOR'S PICK</span>
        <span className="spotlight-case__number mono">
          {String(index + 1).padStart(2, '0')} / 04
        </span>
      </Link>

      <div className="spotlight-case__panel">
        <div className="spotlight-case__meta mono">
          <span>{profession.label}</span>
          <span className="meta-dot" aria-hidden="true" />
          <span>{contentType.label}</span>
          <span className="meta-dot" aria-hidden="true" />
          <span>{caseStudy.year}</span>
        </div>
        <h3>
          {caseStudy.title}
          {caseStudy.titleEn && <em>{caseStudy.titleEn}</em>}
        </h3>
        <p>{caseStudy.summary}</p>
        <div className="spotlight-case__authors">
          {caseStudy.authors.map((author) => (
            <span key={author.name}>{author.name}</span>
          ))}
        </div>
        <Link className="text-link text-link--light" to={`/cases/${caseStudy.slug}`}>
          阅读完整案例 <ArrowUpRight size={16} />
        </Link>
        <div className="spotlight-case__tags">
          {caseStudy.tools.slice(0, 4).map((tool) => (
            <span key={tool}>{tool}</span>
          ))}
        </div>
      </div>
    </article>
  );
}
