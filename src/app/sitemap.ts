// src/app/sitemap.ts
import { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import { absoluteUrl } from '@/lib/url';

const URL = absoluteUrl();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Fetch all published posts and non-deleted projects
  const posts = await db.post.findMany({
    where: { published: true, isDeleted: false },
    select: { slug: true, updatedAt: true },
  });

  const projects = await db.project.findMany({
    where: { isDeleted: false },
    select: { slug: true, updatedAt: true },
  });

  // 2. Map fetched data to the sitemap format
  const postUrls = posts.map(post => ({
    url: `${URL}/blog/${post.slug}`,
    lastModified: post.updatedAt,
  }));

  const projectUrls = projects.map(project => ({
    // Assuming you create a projects/[slug] page
    url: `${URL}/projects/${project.slug}`,
    lastModified: project.updatedAt,
  }));
  
  // 3. Add your static page URLs
  const staticUrls = [
    { url: URL, lastModified: new Date() },
    { url: `${URL}/about`, lastModified: new Date() },
    { url: `${URL}/contact`, lastModified: new Date() },
    { url: `${URL}/projects`, lastModified: new Date() },
    { url: `${URL}/blog`, lastModified: new Date() },
    { url: `${URL}/resume`, lastModified: new Date() },
  ];

  // 4. Combine and return all URLs
  return [...staticUrls, ...postUrls, ...projectUrls];
}