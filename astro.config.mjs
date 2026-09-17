// @ts-check
import { defineConfig } from "astro/config";
import { unified } from "@astrojs/markdown-remark";
import remarkCjkFriendly from "remark-cjk-friendly";
import rehypeMermaid from "rehype-mermaid";

export default defineConfig({
  // 커스텀 도메인을 붙이면 이 값만 바꾸면 된다. (src/consts.ts 의 SITE.url 도 같이)
  site: "https://banal972.github.io",

  // Chirpy 시절 URL(`/posts/<slug>/`)을 그대로 유지하기 위한 설정.
  // directory + always 조합이라야 기존 링크가 리다이렉트 없이 살아난다.
  trailingSlash: "always",
  build: { format: "directory" },

  // 카테고리 정리로 없어진 Chirpy 시절 분류들. 색인된 링크를 목록으로 흘려보낸다.
  redirects: {
    "/categories/discover/": "/categories/",
    "/categories/books/": "/categories/blog/",
    "/categories/etc/": "/categories/foundation/",
    "/categories/functional-programming/": "/categories/foundation/",
  },

  markdown: {
    // Astro 7 기본 엔진(Sätteri)은 CommonMark 를 엄격히 따라
    // `**‘대리’**라는` 같은 한글 인접 강조를 볼드로 처리하지 않는다.
    // Jekyll(kramdown) 에서는 렌더링되던 부분이라, remark 파이프라인 + CJK 보정 플러그인을 쓴다.
    processor: unified({
      remarkPlugins: [remarkCjkFriendly],
      // ```mermaid 블록을 빌드 시점에 SVG 로 굽는다. 렌더링에 Playwright(Chromium)가 필요하다.
      // 테마 전환이 data-theme 기반이라 prefers-color-scheme 용 `dark` 옵션 대신 CSS 로 다크 처리한다.
      rehypePlugins: [
        [rehypeMermaid, { strategy: "img-svg", mermaidConfig: { theme: "neutral" } }],
      ],
    }),
    // Shiki 가 mermaid 블록을 먼저 하이라이팅해 버리면 rehype-mermaid 가 찾지 못한다.
    syntaxHighlight: { type: "shiki", excludeLangs: ["math", "mermaid"] },
    shikiConfig: {
      themes: { light: "github-light", dark: "github-dark-dimmed" },
      wrap: false,
    },
  },
});
