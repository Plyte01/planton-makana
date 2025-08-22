// src/app/robots.ts
import { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/url';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = absoluteUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}