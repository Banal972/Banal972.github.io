import type { APIRoute } from 'astro';
import { categoryLabel, excerpt, getPosts, postUrl, primaryCategory } from '~/lib/posts';

/** 검색 다이얼로그가 읽어가는 정적 인덱스. 본문은 앞부분만 담아 크기를 억제한다. */
export const GET: APIRoute = async () => {
  const posts = await getPosts();

  const index = posts.map((post) => ({
    url: postUrl(post),
    title: post.data.title,
    category: categoryLabel(primaryCategory(post)),
    date: post.data.date.toISOString().slice(0, 10),
    keywords: [...post.data.categories, ...post.data.tags].join(' '),
    body: excerpt(post, 600),
  }));

  return new Response(JSON.stringify(index), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
