import type { APIRoute } from 'astro';
import { countBy, getPosts, postCategories, postUrl, slugify } from '~/lib/posts';

/**
 * Chirpy 는 `/sitemap.xml` 을 만들었고 그 주소가 구글·네이버 서치 도구에 이미 제출돼 있다.
 * @astrojs/sitemap 은 `/sitemap-index.xml` 로 나가기 때문에, 주소를 지키려고 직접 만든다.
 */
export const GET: APIRoute = async ({ site }) => {
  const base = (site ?? new URL('https://banal972.github.io')).origin;
  const posts = await getPosts();

  const newestIn = (list: typeof posts) =>
    list.reduce<Date | undefined>((newest, p) => {
      const d = p.data.updated ?? p.data.date;
      return !newest || d > newest ? d : newest;
    }, undefined);

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
    // 목록 페이지의 lastmod 는 "그 목록에 속한 가장 최근 글" 이어야 정확하다.
    // 전부 같은 날짜로 채우면 구글이 lastmod 자체를 신뢰하지 않는다.
    ...countBy(posts, postCategories).map((c) => ({
      path: `/categories/${slugify(c.name)}/`,
      lastmod: newestIn(posts.filter((p) => postCategories(p).includes(c.name))),
    })),
    ...countBy(posts, (p) => p.data.tags).map((t) => ({
      path: `/tags/${slugify(t.name)}/`,
      lastmod: newestIn(posts.filter((p) => p.data.tags.includes(t.name))),
    })),
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
