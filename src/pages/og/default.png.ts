import type { APIRoute } from "astro";

import { renderOgImage, ogResponse } from "~/lib/og";
import { SITE } from "~/consts";

/** 글이 아닌 페이지(홈·목록·소개)가 함께 쓰는 기본 소셜 이미지 */
export const GET: APIRoute = async () => {
  const png = await renderOgImage({
    title: SITE.tagline,
    category: SITE.title,
    hue: 250,
    meta: SITE.description.slice(0, 40),
  });

  return ogResponse(png);
};
