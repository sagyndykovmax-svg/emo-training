import type { MetadataRoute } from 'next';

const SITE = 'https://emo-training.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE}/train`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE}/authenticity`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${SITE}/progress`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE}/account`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE}/faq`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE}/facs`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE}/physiognomy-vs-science`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    // /share/result is intentionally excluded — it's parametrized for sharing,
    // not a standalone discoverable page; OG meta is generated per-link.
  ];
}
