import type { APIRoute, GetStaticPaths } from "astro";

import { renderOgImage, ogResponse } from "~/lib/og";
import {
  categoryHue,
  categoryLabel,
  formatDate,
  getPosts,
  primaryCategory,
  type Post,
} from "~/lib/posts";

/** 글마다 소셜 공유용 이미지를 빌드 타임에 그린다. 기존 글에는 대표 이미지가 없어서 필요하다. */
export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getPosts();
  return posts.map((post) => ({ params: { slug: post.id }, props: { post } }));
};

export const GET: APIRoute<{ post: Post }> = async ({ props }) => {
  const { post } = props;
  const category = primaryCategory(post);

  const png = await renderOgImage({
    title: post.data.title,
    category: categoryLabel(category),
    hue: categoryHue(category),
    meta: formatDate(post.data.date),
  });

  return ogResponse(png);
};
