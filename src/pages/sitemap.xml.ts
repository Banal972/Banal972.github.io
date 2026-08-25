import type { APIRoute } from 'astro';
import { countBy, getPosts, postCategories, postUrl, slugify } from '~/lib/posts';

/**
 * Chirpy 는 `/sitemap.xml` 을 만들었고 그 주소가 구글·네이버 서치 도구에 이미 제출돼 있다.
 * @astrojs/sitemap 은 `/sitemap-index.xml` 로 나가기 때문에, 주소를 지키려고 직접 만든다.
 */
export const GET: APIRoute = async ({ site }) => {
  const base = (site ?? new URL('https://banal972.github.io')).origin;
  const posts = await getPosts();

  const latest = posts[0]?.data.date;
  const entries: { path: string; lastmod?: Date }[] = [
    { path: '/', lastmod: latest },
    { path: '/categories/', lastmod: latest },
    { path: '/tags/', lastmod: latest },
    { path: '/archives/', lastmod: latest },
    { path: '/about/' },
    ...posts.map((post) => ({
      path: postUrl(post),
      lastmod: post.data.updated ?? post.data.date,
    })),
    ...countBy(posts, postCategories).map((c) => ({ path: `/categories/${slugify(c.name)}/` })),
    ...countBy(posts, (p) => p.data.tags).map((t) => ({ path: `/tags/${slugify(t.name)}/` })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(({ path, lastmod }) => {
    const loc = new URL(path, base).href;
    const mod = lastmod ? `<lastmod>${lastmod.toISOString().slice(0, 10)}</lastmod>` : '';
    return `  <url><loc>${loc}</loc>${mod}</url>`;
  })
  .join('\n')}
</urlset>
`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
