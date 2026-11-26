import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from './Icon';

export function SectionHeading({
  index,
  eyebrow,
  title,
  description,
  link,
}: {
  index: string;
  eyebrow: string;
  title: ReactNode;
  description?: string;
  link?: { label: string; to: string };
}) {
  return (
    <div className="section-heading">
      <div className="section-heading__index mono">{index}</div>
      <div className="section-heading__main">
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      {description && <p className="section-heading__description">{description}</p>}
      {link && (
        <Link className="text-link section-heading__link" to={link.to}>
          {link.label} <ArrowUpRight size={16} />
        </Link>
      )}
    </div>
  );
}
