import { useEffect } from 'react';

export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} · 造物现场` : '造物现场 · 常设数字展览';
  }, [title]);
}

export function useReadingProgress(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    const progress = document.querySelector<HTMLElement>('[data-reading-progress]');
    const article = document.querySelector<HTMLElement>('[data-article]');
    if (!progress || !article) return;

    const update = () => {
      const total = article.offsetHeight - window.innerHeight + 240;
      const scrolled = window.scrollY - article.offsetTop + 160;
      const percent = total > 0 ? Math.min(1, Math.max(0, scrolled / total)) : 0;
      progress.style.transform = `scaleX(${percent})`;
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [enabled]);
}
