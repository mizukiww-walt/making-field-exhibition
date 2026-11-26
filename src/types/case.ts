export type ProfessionId =
  | 'architecture'
  | 'digital-media'
  | 'visual-communication'
  | 'product-design';

export type ContentTypeId =
  | 'digital-fabrication'
  | 'research'
  | 'interactive-installation'
  | 'data-narrative';

export interface Author {
  name: string;
  role?: string;
}

export interface CaseImage {
  src: string;
  alt: string;
  caption?: string;
}

export type ContentBlock =
  | {
      type: 'heading';
      text: string;
      kicker?: string;
    }
  | {
      type: 'paragraph';
      text: string;
    }
  | {
      type: 'image';
      image: CaseImage;
      layout?: 'wide' | 'inset';
    }
  | {
      type: 'quote';
      text: string;
      attribution?: string;
    }
  | {
      type: 'list';
      items: string[];
      ordered?: boolean;
    };

export interface CaseStudy {
  schemaVersion: 1;
  id: string;
  slug: string;
  title: string;
  titleEn?: string;
  subtitle: string;
  year: string;
  authors: Author[];
  profession: ProfessionId;
  contentType: ContentTypeId;
  tools: string[];
  tags: string[];
  summary: string;
  cover: CaseImage;
  featured?: boolean;
  demo?: boolean;
  accent?: string;
  readingMinutes: number;
  blocks: ContentBlock[];
  gallery?: CaseImage[];
  links?: Array<{ label: string; url: string }>;
}

export interface CaseFile {
  schemaVersion: string;
  updatedAt: string;
  cases: CaseStudy[];
}

export interface CaseFilters {
  profession?: string;
  tool?: string;
  contentType?: string;
  query?: string;
}

export interface FacetCount {
  id: string;
  label: string;
  count: number;
}
