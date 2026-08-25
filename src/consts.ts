/** 사이트 전역 설정. UI 손볼 때 여기부터 보면 된다. */
export const SITE = {
  title: "Banal.log",
  tagline: "개발자의 회고록",
  description: "개발하며 마주친 문제와 그 해결 과정을 기록합니다.",
  url: "https://banal972.github.io",
  lang: "ko",
  locale: "ko_KR",
  author: {
    name: "Banal",
    email: "spbabo972@gmail.com",
    avatar: "/assets/img/profile.jpg",
    github: "https://github.com/Banal972",
  },
  postsPerPage: 10, // Chirpy 의 paginate 값과 동일 — /page2/~/page4/ 를 그대로 유지하기 위함
} as const;

/** 사이트 검증 코드 (Chirpy `_includes/head.html` 에서 그대로 옮겨옴) */
export const VERIFICATION = {
  google: "n8GkpWjGn1i35b5XQXpN5r446B6YvW0nw7N6Qcef7Fo",
  naver: "62539551f3bf798f4509e12bf417f4a479576b32",
} as const;

/** Google AdSense. dev 서버에서는 로드하지 않는다. */
export const ADSENSE = {
  client: "ca-pub-2915330933826179",
} as const;


export const NAV = [
  { label: "홈", href: "/" },
  { label: "카테고리", href: "/categories/" },
  { label: "태그", href: "/tags/" },
  { label: "아카이브", href: "/archives/" },
  { label: "소개", href: "/about/" },
] as const;

/**
 * 카드/칩에 쓰는 카테고리 표시 설정.
 * 여기 없는 카테고리는 자동으로 회색 기본값을 쓴다.
 */
export const CATEGORY_META: Record<string, { label: string; hue: number }> = {
  Native: { label: "React Native", hue: 265 },
  Nextjs: { label: "Next.js", hue: 220 },
  React: { label: "React", hue: 199 },
  Foundation: { label: "기초·개념", hue: 160 },
  Blog: { label: "회고·기록", hue: 340 },
  Javascript: { label: "JS · TS", hue: 45 },
  Flutter: { label: "Flutter", hue: 205 },
  Etc: { label: "Etc", hue: 210 },
};
