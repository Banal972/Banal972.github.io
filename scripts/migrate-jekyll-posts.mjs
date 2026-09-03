#!/usr/bin/env node
/**
 * Chirpy(_posts) → Astro content collection(src/content/blog) 변환.
 *
 * 핵심 제약: 기존 URL `/posts/<slug>/` 를 그대로 유지해야 한다.
 * Jekyll 의 `:title` 은 "날짜를 뗀 파일명"을 대소문자 보존한 채 슬러그화한 값이라,
 * 여기서도 같은 규칙으로 파일명을 만든다. (검증은 scripts/verify-slugs.mjs)
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "_posts");
const OUT = path.join(ROOT, "src/content/blog");

/** Chirpy 시절 대소문자가 섞여 들어간 분류를 하나로 정규화 */
const CATEGORY_ALIAS = {
  discover: "Discover",
  react: "React",
  nextjs: "Nextjs",
  native: "Native",
  expo: "Expo",
  flutter: "Flutter",
  javascript: "Javascript",
  "functional-programming": "Functional-programming",
  "design-pattren": "Design-pattren",
  blog: "Blog",
  books: "Books",
  etc: "Etc",
};

export function jekyllSlug(filename) {
  return path
    .basename(filename, ".md")
    .replace(/^\d{4}-\d{2}-\d{2}-/, "")
    .replace(/[^A-Za-z0-9._-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * kramdown 은 `</div>` 다음 줄부터 다시 마크다운으로 읽지만,
 * CommonMark 는 빈 줄이 나올 때까지 HTML 블록으로 취급해 뒤 문단을 통째로 삼킨다.
 * 블록 태그 앞뒤에 빈 줄을 넣어 기존 글이 그대로 렌더링되게 맞춘다.
 */
const BLOCK_TAG =
  /(?:div|details|summary|figure|center|blockquote|iframe|video|picture|img|table)/
    .source;

export function normalizeHtmlBlocks(body) {
  const lines = body.split("\n");
  const out = [];
  let inFence = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;

    if (!inFence) {
      const prev = out.at(-1);
      const opensBlock = new RegExp(`^\\s*<${BLOCK_TAG}[\\s>/]`).test(line);
      if (opensBlock && prev?.trim() && !prev.trimStart().startsWith("<"))
        out.push("");
    }

    out.push(line);

    if (!inFence) {
      const next = lines[i + 1];
      const closesBlock = new RegExp(`^\\s*</${BLOCK_TAG}>\\s*$`).test(line);
      if (closesBlock && next?.trim()) out.push("");
    }
  }

  return out.join("\n");
}

const splitList = (raw) =>
  raw
    .replace(/^\[|\]$/g, "")
    .split(",")
    .map((s) => s.trim().replace(/^["']|["']$/g, ""))
    .filter(Boolean);

const normalize = (name) => CATEGORY_ALIAS[name.toLowerCase()] ?? name;

const yamlList = (items) =>
  `[${items.map((i) => JSON.stringify(i)).join(", ")}]`;

function convert(file) {
  const raw = fs.readFileSync(path.join(SRC, file), "utf8");
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) throw new Error(`frontmatter 없음: ${file}`);
  const [, fm, body] = m;

  const field = (key) =>
    fm.match(new RegExp(`^${key}:\\s*(.+)$`, "m"))?.[1]?.trim() ?? "";

  const title = field("title").replace(/^["']|["']$/g, "");
  const date = field("date").replace(/^["']|["']$/g, "") || file.slice(0, 10);
  const categories = splitList(field("categories")).map(normalize);
  const tags = splitList(field("tags")).map(normalize);

  const out = [
    "---",
    `title: ${JSON.stringify(title)}`,
    `date: ${date.slice(0, 10)}`,
    `categories: ${yamlList(categories)}`,
    `tags: ${yamlList(tags)}`,
    "---",
    "",
    normalizeHtmlBlocks(body.replace(/^\n+/, "")),
  ].join("\n");

  return { slug: jekyllSlug(file), out };
}

if (process.argv[1] === import.meta.filename) {
  fs.mkdirSync(OUT, { recursive: true });
  const files = fs.readdirSync(SRC).filter((f) => f.endsWith(".md"));
  for (const file of files) {
    const { slug, out } = convert(file);
    fs.writeFileSync(path.join(OUT, `${slug}.md`), out);
    console.log(`${file}  →  ${slug}.md`);
  }
  console.log(`\n${files.length}편 변환 완료`);
}
