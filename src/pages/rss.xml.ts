import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';

import { SITE } from '~/consts';
import { excerpt, getPosts, postUrl } from '~/lib/posts';

export const GET: APIRoute = async (context) => {
  const posts = await getPosts();

  return rss({
    title: `${SITE.title} — ${SITE.tagline}`,
    description: SITE.description,
    site: context.site ?? SITE.url,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: excerpt(post, 200),
      link: postUrl(post),
      categories: [...post.data.categories, ...post.data.tags],
    })),
    customData: `<language>ko</language>`,
  });
};
