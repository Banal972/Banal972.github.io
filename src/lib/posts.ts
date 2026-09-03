import { getCollection, type CollectionEntry } from "astro:content";
import { CATEGORY_META } from "~/consts";

export type Post = CollectionEntry<"blog">;

/** 최신순 정렬된 전체 글. 초안은 프로덕션 빌드에서 제외된다. */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection("blog", ({ data }) =>
    import.meta.env.PROD ? !data.draft : true,
  );
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** 홈 정렬: 고정 글이 먼저, 그 다음 최신순 */
export function withPinned(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => Number(b.data.pin) - Number(a.data.pin));
}

export const postUrl = (post: Post) => `/posts/${post.id}/`;

/** 카드에 표시할 대표 카테고리. 글마다 카테고리는 하나뿐이다. */
export function primaryCategory(post: Post): string {
  return post.data.categories[0] ?? "Etc";
}

export const categoryLabel = (name: string) =>
  CATEGORY_META[name]?.label ?? name;
export const categoryHue = (name: string) =>
  CATEGORY_META[name]?.hue ?? hash(name) % 360;

/** Chirpy(Jekyll) 의 태그/카테고리 URL 규칙과 동일하게 맞춘다. */
export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "");
}

/** 문자열 → 안정적인 양의 정수. 썸네일 색/각도를 글마다 고정하는 데 쓴다. */
export function hash(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

const stripMarkdown = (body: string) =>
  body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    // 제목 줄은 통째로 버린다. 남기면 '개요 Expo SDK 52...' 처럼 어색한 요약이 된다.
    .replace(/^\s{0,3}#{1,6}\s+.*$/gm, " ")
    .replace(/^\s{0,3}>\s?/gm, "")
    .replace(/^\s*[-*_]{3,}\s*$/gm, " ")
    .replace(/[*_`~]/g, "")
    .replace(/\s+/g, " ")
    .trim();

/** description 이 있으면 그대로, 없으면 본문 앞부분에서 뽑는다. */
export function excerpt(post: Post, length = 110): string {
  if (post.data.description) return post.data.description;
  const text = stripMarkdown(post.body ?? "");
  if (text.length <= length) return text;
  return `${text.slice(0, length).trimEnd()}…`;
}

/** 한글 기준 분당 약 500자 */
export function readingTime(post: Post): number {
  const text = stripMarkdown(post.body ?? "");
  return Math.max(1, Math.round(text.length / 500));
}

export const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Seoul",
  }).format(date);

export const formatDateShort = (date: Date) =>
  new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Seoul",
  })
    .format(date)
    .replace(/\.$/, "");

export const isoDate = (date: Date) => date.toISOString();

/** 목록 페이지용 집계 */
export function countBy(posts: Post[], pick: (p: Post) => string[]) {
  const map = new Map<string, number>();
  for (const post of posts) {
    for (const key of new Set(pick(post))) {
      map.set(key, (map.get(key) ?? 0) + 1);
    }
  }
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

/** 카테고리가 비어 있는 글은 Etc 로 묶는다. 목록/집계에서 빠지지 않게. */
export const postCategories = (post: Post): string[] =>
  post.data.categories.length > 0 ? post.data.categories : ["Etc"];

/**
 * RSS 본문용 HTML. 콘텐츠 레이어가 빌드 때 렌더해둔 결과를 그대로 쓴다.
 * 리더는 상대 경로를 못 푸니 이미지·링크를 절대 URL 로 바꾼다.
 */
export function renderedHtml(post: Post, site: URL | string): string {
  const html =
    (post as unknown as { rendered?: { html?: string } }).rendered?.html ?? "";
  return html.replace(
    /(src|href)="\/(?!\/)/g,
    (_m, attr) => `${attr}="${new URL("/", site).href}`,
  );
}
