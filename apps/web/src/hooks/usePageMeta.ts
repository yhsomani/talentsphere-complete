import { useEffect } from 'react';

/**
 * Per-page document metadata.
 *
 * The app is a client-rendered SPA, so a single <title>/<meta description> in
 * index.html would leave every route sharing one search-engine snippet. Each
 * page calls this hook to set its own unique, descriptive title and meta
 * description on mount (and restores the base values on unmount).
 */

const BASE_TITLE = 'TalentSphere — Career Operating System';
const BASE_DESCRIPTION =
  'TalentSphere — PWA-first Career Operating System with verified Talent Graph and Evidence Graph';

function setMetaDescription(content: string) {
  let el = document.querySelector<HTMLMetaElement>('meta[name="description"]');
  if (!el) {
    el = document.createElement('meta');
    el.name = 'description';
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function usePageMeta(title: string, description: string) {
  useEffect(() => {
    const previousTitle = document.title;
    const previousDescription =
      document
        .querySelector<HTMLMetaElement>('meta[name="description"]')
        ?.getAttribute('content') ?? BASE_DESCRIPTION;

    // Every route gets a unique, brand-suffixed title + meta description.
    document.title = `${title} | TalentSphere`;
    setMetaDescription(description);

    return () => {
      document.title = previousTitle || BASE_TITLE;
      setMetaDescription(previousDescription);
    };
  }, [title, description]);
}
