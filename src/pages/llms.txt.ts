import type { APIRoute } from "astro";

import { SITE } from "~/consts";
import {
  categoryLabel,
  countBy,
  excerpt,
  getPosts,
  postCategories,
  postUrl,
  primaryCategory,
} from "~/lib/posts";

/**
 * llms.txt — AI 크롤러용 사이트 안내.
 * 구글은 이 파일을 무시한다고 공식 문서에 밝혔으므로 구글 랭킹에는 영향이 없다.
 * 다만 다른 AI 검색 서비스가 참고할 수 있고 비용이 거의 없어서 함께 둔다.
 */
export const GET: APIRoute = async ({ site }) => {
  const base = site ?? new URL(SITE.url);
  const abs = (path: string) => new URL(path, base).href;
  const posts = await getPosts();

  const byCategory = new Map<string, typeof posts>();
  for (const post of posts) {
    const key = primaryCategory(post);
    byCategory.set(key, [...(byCategory.get(key) ?? []), post]);
  }

  const sections = countBy(posts, postCategories)
    .map(({ name }) => {
      const list = byCategory.get(name);
      if (!list?.length) return null;
      const lines = list
        .map(
          (post) =>
            `- [${post.data.title}](${abs(postUrl(post))}): ${excerpt(post, 110)}`,
        )
        .join("\n");
      return `## ${categoryLabel(name)}\n\n${lines}`;
    })
    .filter(Boolean);

  const body = `# ${SITE.title}

> ${SITE.tagline}. ${SITE.description}

${SITE.author.name}이 개발하며 마주친 문제와 그 해결 과정을 기록하는 한국어 기술 블로그입니다.
글 ${posts.length}편이 있고, 대부분 실제로 겪은 버그와 그 원인 분석을 다룹니다.

- 작성자: ${SITE.author.name} (${SITE.author.github})
- 언어: 한국어
- 전체 글 목록: ${abs("/archives/")}
- RSS: ${abs("/feed.xml")}
- 사이트맵: ${abs("/sitemap.xml")}

${sections.join("\n\n")}
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
