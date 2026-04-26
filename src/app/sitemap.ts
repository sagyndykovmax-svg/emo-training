import type { MetadataRoute } from 'next';

const SITE = 'https://emo-training.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE}/train`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE}/authenticity`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${SITE}/progress`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
  ];
}
