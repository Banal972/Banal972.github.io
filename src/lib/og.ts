import fs from "node:fs";
import path from "node:path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

import { SITE } from "~/consts";

const WIDTH = 1200;
const HEIGHT = 630;

// 번들되면 import.meta.url 이 dist 안쪽을 가리키므로, 빌드 실행 위치(프로젝트 루트) 기준으로 읽는다.
const readFont = (name: string) =>
  fs.readFileSync(path.join(process.cwd(), "src/assets/fonts", name));

// 빌드 한 번에 36장을 그리므로 폰트는 모듈 로드 시 한 번만 읽는다.
const fonts = [
  {
    name: "Pretendard",
    data: readFont("Pretendard-Regular.otf"),
    weight: 400 as const,
    style: "normal" as const,
  },
  {
    name: "Pretendard",
    data: readFont("Pretendard-Bold.otf"),
    weight: 700 as const,
    style: "normal" as const,
  },
];

/** satori 는 JSX 대신 이 모양의 객체를 받는다. .ts 파일이라 헬퍼로 만든다. */
const h = (
  type: string,
  style: Record<string, unknown>,
  children?: unknown,
) => ({
  type,
  props: { style, children },
});

interface OgOptions {
  title: string;
  category?: string;
  /** 카테고리 색상 hue. 카드 썸네일과 같은 값을 쓴다. */
  hue?: number;
  meta?: string;
}

export async function renderOgImage({
  title,
  category,
  hue = 250,
  meta,
}: OgOptions) {
  const tree = h(
    "div",
    {
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      padding: "72px 80px",
      backgroundColor: "#0e0f13",
      // 사이트 카드 썸네일과 같은 색 규칙을 써서 브랜드 일관성을 맞춘다.
      // satori 는 `hsl(h s% l% / a)` 슬래시 문법을 못 읽으므로 hsla 쉼표 문법을 쓴다.
      backgroundImage: `radial-gradient(1100px 700px at 92% -12%, hsla(${hue}, 84%, 56%, 0.62) 0%, hsla(${hue}, 84%, 56%, 0) 62%), radial-gradient(820px 560px at -10% 112%, hsla(${(hue + 40) % 360}, 78%, 50%, 0.38) 0%, hsla(${(hue + 40) % 360}, 78%, 50%, 0) 64%)`,
      fontFamily: "Pretendard",
      color: "#ffffff",
    },
    [
      h(
        "div",
        {
          display: "flex",
          alignItems: "center",
          gap: "16px",
          fontSize: 26,
          fontWeight: 700,
          color: `hsla(${hue}, 92%, 80%, 1)`,
        },
        category ?? SITE.title,
      ),
      h(
        "div",
        {
          display: "flex",
          fontSize: title.length > 40 ? 62 : 74,
          fontWeight: 700,
          lineHeight: 1.28,
          letterSpacing: "-0.035em",
          // satori 는 line-clamp 를 지원하지 않아 컨테이너 높이로 잘라낸다.
          maxHeight: 320,
          overflow: "hidden",
        },
        title,
      ),
      h(
        "div",
        {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 26,
          color: "rgba(255,255,255,0.68)",
        },
        [
          h(
            "div",
            { display: "flex", fontWeight: 700, color: "#ffffff" },
            SITE.title,
          ),
          h("div", { display: "flex" }, meta ?? SITE.tagline),
        ],
      ),
    ],
  );

  const svg = await satori(tree as never, {
    width: WIDTH,
    height: HEIGHT,
    fonts,
  });

  return new Resvg(svg, { fitTo: { mode: "width", value: WIDTH } })
    .render()
    .asPng();
}

export const ogResponse = (png: Uint8Array) =>
  new Response(png as BodyInit, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
