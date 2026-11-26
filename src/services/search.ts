import type { CaseStudy } from '../types/case';
import { getContentType, getProfession } from '../data/taxonomy';

export interface CaseSearchProvider {
  id: string;
  label: string;
  search(cases: CaseStudy[], query: string): CaseStudy[];
}

function normalize(value: string) {
  return value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[，。；：、/\\_\-—–·|()[\]{}"'“”‘’]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function compact(value: string) {
  return normalize(value).replace(/\s+/g, '');
}

function getBodyText(item: CaseStudy) {
  return item.blocks
    .map((block) => {
      if (block.type === 'paragraph' || block.type === 'heading') return block.text;
      if (block.type === 'quote') return block.text;
      if (block.type === 'list') return block.items.join(' ');
      return block.image.caption ?? '';
    })
    .join(' ');
}

function createSearchDocument(item: CaseStudy) {
  const fields = [
    {
      weight: 12,
      text: [item.title, item.titleEn ?? '', item.subtitle].join(' '),
    },
    {
      weight: 8,
      text: item.tags.join(' '),
    },
    {
      weight: 7,
      text: item.tools.join(' '),
    },
    {
      weight: 6,
      text: item.authors.map((author) => `${author.name} ${author.role ?? ''}`).join(' '),
    },
    {
      weight: 5,
      text: item.summary,
    },
    {
      weight: 3,
      text: [getProfession(item.profession).label, getContentType(item.contentType).label].join(' '),
    },
    {
      weight: 1,
      text: getBodyText(item),
    },
  ];

  return fields.map((field) => ({
    weight: field.weight,
    normal: normalize(field.text),
    compact: compact(field.text),
  }));
}

/**
 * 轻量本地关键词检索。
 *
 * 这是一个可替换的 SearchProvider：后续可以新增
 * semanticSearchProvider / aiSearchProvider，在同一个接口下接入向量检索
 * 或后端 AI 服务，页面无需关心检索实现。
 */
export const localKeywordSearchProvider: CaseSearchProvider = {
  id: 'local-keyword',
  label: '本地关键词检索',
  search(cases, query) {
    const normalizedQuery = normalize(query);
    if (!normalizedQuery) return [...cases];

    const tokens = normalizedQuery.split(' ').filter(Boolean);
    const compactTokens = tokens.map((token) => token.replace(/\s+/g, ''));
    const scored = cases.map((item, order) => {
      const document = createSearchDocument(item);
      let total = 0;
      let matchedTokens = 0;

      for (const token of tokens) {
        const compactToken = token.replace(/\s+/g, '');
        let tokenScore = 0;

        for (const field of document) {
          if (field.normal.includes(token) || field.compact.includes(compactToken)) {
            tokenScore = Math.max(tokenScore, field.weight);
          }
        }

        // 对较长的拉丁词做一个简单的错字容忍：按字符重合度给低权重。
        if (!tokenScore && /^[a-z0-9]{4,}$/.test(token)) {
          const characters = [...token];
          const fuzzyFields = document.filter((field) => {
            const hits = characters.filter((character) => field.normal.includes(character)).length;
            return hits / characters.length >= 0.8;
          });
          tokenScore = fuzzyFields.length > 0 ? 1.5 : 0;
        }

        if (tokenScore > 0) {
          matchedTokens += 1;
          total += tokenScore;
        }
      }

      const searchableEverything = document.map((field) => field.compact).join(' ');
      const allTokensMatch = compactTokens.every((token) => searchableEverything.includes(token));

      return {
        item,
        order,
        score: allTokensMatch ? total + 20 : matchedTokens === tokens.length ? total : 0,
      };
    });

    return scored
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score || a.order - b.order)
      .map((entry) => entry.item);
  },
};

export function searchCases(cases: CaseStudy[], query: string) {
  return localKeywordSearchProvider.search(cases, query);
}
