import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';

import { SITE } from '~/consts';
import {
  categoryLabel,
  excerpt,
  getPosts,
  postUrl,
  primaryCategory,
  renderedHtml,
} from '~/lib/posts';

/**
 * Chirpy 시절과 같은 `/feed.xml` 주소를 유지한다.
 * 리더에서 바로 읽을 수 있도록 요약이 아니라 본문 전체를 담는다.
 */
export const GET: APIRoute = async (context) => {
  const site = context.site ?? new URL(SITE.url);
  const posts = await getPosts();
  const abs = (path: string) => new URL(path, site).href;

  return rss({
    title: `${SITE.title} — ${SITE.tagline}`,
    description: SITE.description,
    site,
    // atom:link self 는 피드 검증기가 요구하는 항목이다.
    xmlns: { atom: 'http://www.w3.org/2005/Atom', content: 'http://purl.org/rss/1.0/modules/content/' },
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: excerpt(post, 200),
      link: postUrl(post),
      // 태그와 카테고리가 겹쳐 같은 값이 두 번 나가지 않게 한 번 걸러낸다.
      categories: [...new Set([categoryLabel(primaryCategory(post)), ...post.data.tags])],
      author: `${SITE.author.email} (${SITE.author.name})`,
      customData: [
        `<content:encoded><![CDATA[${renderedHtml(post, site)}]]></content:encoded>`,
        `<enclosure url="${abs(post.data.heroImage ?? `/og/${post.id}.png`)}" type="image/png" length="0" />`,
      ].join(''),
    })),
    customData: [
      `<language>${SITE.lang}</language>`,
      `<atom:link href="${abs('/feed.xml')}" rel="self" type="application/rss+xml" />`,
      `<managingEditor>${SITE.author.email} (${SITE.author.name})</managingEditor>`,
      `<webMaster>${SITE.author.email} (${SITE.author.name})</webMaster>`,
      `<lastBuildDate>${(posts[0]?.data.date ?? new Date()).toUTCString()}</lastBuildDate>`,
      `<image><url>${abs(SITE.author.avatar)}</url><title>${SITE.title}</title><link>${abs('/')}</link></image>`,
    ].join(''),
  });
};
