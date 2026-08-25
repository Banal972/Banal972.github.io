import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({
    base: './src/content/blog',
    pattern: '**/*.md',
    // 기본 generateId 는 파일명을 소문자 슬러그로 바꾼다.
    // 그러면 `/posts/sprintDay/` 같은 기존 URL 이 깨지므로 파일명을 그대로 쓴다.
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    /** 수정일. 없으면 목록에서 date 를 쓴다. */
    updated: z.coerce.date().optional(),
    /** 비워두면 본문 앞부분에서 자동 생성한다. */
    description: z.string().optional(),
    categories: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    /** `/assets/img/...` 처럼 public 기준 절대 경로 */
    heroImage: z.string().optional(),
    heroAlt: z.string().optional(),
    draft: z.boolean().default(false),
    /** 홈 상단 고정 */
    pin: z.boolean().default(false),
  }),
});

export const collections = { blog };
