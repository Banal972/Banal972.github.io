import { SITE } from "~/consts";
import {
  categoryLabel,
  excerpt,
  postUrl,
  primaryCategory,
  slugify,
  type Post,
} from "~/lib/posts";

const abs = (path: string) => new URL(path, SITE.url).href;

const PERSON_ID = abs("/#person");
const SITE_ID = abs("/#website");

/** 사이트 전역 그래프. 홈에서 한 번만 내보낸다. */
export function siteSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": PERSON_ID,
        name: SITE.author.name,
        url: SITE.url,
        image: abs(SITE.author.avatar),
        sameAs: [SITE.author.github],
        jobTitle: "프론트엔드 개발자",
      },
      {
        "@type": "WebSite",
        "@id": SITE_ID,
        url: SITE.url,
        name: SITE.title,
        description: SITE.description,
        inLanguage: SITE.lang,
        publisher: { "@id": PERSON_ID },
      },
      {
        "@type": "Blog",
        "@id": abs("/#blog"),
        url: SITE.url,
        name: SITE.title,
        description: SITE.description,
        inLanguage: SITE.lang,
        author: { "@id": PERSON_ID },
      },
    ],
  };
}

interface Crumb {
  name: string;
  path: string;
}

const breadcrumb = (items: Crumb[]) => ({
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: item.name,
    item: abs(item.path),
  })),
});

/** 글 상세. BlogPosting + 빵부스러기를 한 그래프로 묶는다. */
export function postSchema(post: Post) {
  const category = primaryCategory(post);
  const url = abs(postUrl(post));
  const image = abs(post.data.heroImage ?? `/og/${post.id}.png`);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${url}#article`,
        headline: post.data.title.slice(0, 110),
        description: excerpt(post, 150),
        url,
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        datePublished: post.data.date.toISOString(),
        dateModified: (post.data.updated ?? post.data.date).toISOString(),
        image,
        inLanguage: SITE.lang,
        articleSection: categoryLabel(category),
        keywords: post.data.tags.join(", "),
        author: {
          "@type": "Person",
          "@id": PERSON_ID,
          name: SITE.author.name,
          url: SITE.url,
        },
        publisher: {
          "@type": "Person",
          "@id": PERSON_ID,
          name: SITE.author.name,
          url: SITE.url,
        },
        isPartOf: { "@id": abs("/#blog") },
      },
      breadcrumb([
        { name: "홈", path: "/" },
        {
          name: categoryLabel(category),
          path: `/categories/${slugify(category)}/`,
        },
        { name: post.data.title, path: postUrl(post) },
      ]),
    ],
  };
}

/** 카테고리·태그·아카이브 같은 목록 페이지 */
export function collectionSchema(options: {
  name: string;
  description: string;
  path: string;
  crumbs: Crumb[];
  posts: Post[];
}) {
  const { name, description, path, crumbs, posts } = options;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${abs(path)}#collection`,
        url: abs(path),
        name,
        description,
        inLanguage: SITE.lang,
        isPartOf: { "@id": SITE_ID },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: posts.length,
          itemListElement: posts.slice(0, 20).map((post, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: abs(postUrl(post)),
            name: post.data.title,
          })),
        },
      },
      breadcrumb(crumbs),
    ],
  };
}

/** 소개 페이지 */
export function profileSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": abs("/about/#profile"),
        url: abs("/about/"),
        name: `${SITE.author.name} 소개`,
        inLanguage: SITE.lang,
        isPartOf: { "@id": SITE_ID },
        mainEntity: { "@id": PERSON_ID },
      },
      {
        "@type": "Person",
        "@id": PERSON_ID,
        name: SITE.author.name,
        url: SITE.url,
        image: abs(SITE.author.avatar),
        sameAs: [SITE.author.github],
      },
      breadcrumb([
        { name: "홈", path: "/" },
        { name: "소개", path: "/about/" },
      ]),
    ],
  };
}
