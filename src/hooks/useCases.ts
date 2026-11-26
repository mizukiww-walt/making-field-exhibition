import { useEffect, useState } from 'react';
import type { CaseStudy } from '../types/case';
import { loadAllCases } from '../services/caseRepository';

interface CasesState {
  cases: CaseStudy[];
  status: 'loading' | 'ready' | 'error';
}

export function useCases(): CasesState {
  const [state, setState] = useState<CasesState>({ cases: [], status: 'loading' });

  useEffect(() => {
    let active = true;

    loadAllCases()
      .then((cases) => {
        if (active) setState({ cases, status: 'ready' });
      })
      .catch(() => {
        if (active) setState({ cases: [], status: 'error' });
      });

    return () => {
      active = false;
    };
  }, []);

  return state;
}

export function useCase(slug: string | undefined) {
  const { cases, status } = useCases();
  return {
    cases,
    status,
    caseStudy: slug ? cases.find((item) => item.slug === slug) ?? null : null,
  };
}
