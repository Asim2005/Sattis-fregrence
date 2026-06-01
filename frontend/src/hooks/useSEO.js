import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_NAME = 'Sattis';
const DEFAULT_DESCRIPTION =
  'Sattis offers premium luxury fragrances and perfumes for men, women, and unisex. Shop online with Cash on Delivery and EasyPaisa across Pakistan.';
const BASE_URL = 'https://sattis.com';

function setMeta(attr, key, content) {
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/**
 * Sets page <title>, meta description, Open Graph, Twitter Card, robots, and canonical.
 * @param {object} opts
 * @param {string}  [opts.title]       Page title (appended with "| Sattis"). Omit for homepage default.
 * @param {string}  [opts.description] Meta description. Falls back to site default.
 * @param {boolean} [opts.noindex]     Set true for private/transactional pages.
 * @param {string}  [opts.ogImage]     Absolute URL of OG image.
 * @param {string}  [opts.ogType]      OG type (default: "website").
 */
export default function useSEO({ title, description, noindex = false, ogImage, ogType = 'website' } = {}) {
  const { pathname } = useLocation();

  const fullTitle = title
    ? `${title} | ${SITE_NAME}`
    : `${SITE_NAME} — Luxury Fragrances & Perfumes in Pakistan`;
  const desc = description || DEFAULT_DESCRIPTION;
  const canonical = `${BASE_URL}${pathname}`;

  useEffect(() => {
    document.title = fullTitle;

    setMeta('name', 'description', desc);
    setMeta('name', 'robots', noindex ? 'noindex,nofollow' : 'index,follow');

    // Open Graph
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', desc);
    setMeta('property', 'og:type', ogType);
    setMeta('property', 'og:url', canonical);
    setMeta('property', 'og:site_name', SITE_NAME);
    if (ogImage) setMeta('property', 'og:image', ogImage);

    // Twitter Card
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', desc);
    if (ogImage) setMeta('name', 'twitter:image', ogImage);

    // Canonical link
    let canon = document.querySelector('link[rel="canonical"]');
    if (!canon) {
      canon = document.createElement('link');
      canon.setAttribute('rel', 'canonical');
      document.head.appendChild(canon);
    }
    canon.setAttribute('href', canonical);
  }, [fullTitle, desc, noindex, canonical, ogImage, ogType]);
}
