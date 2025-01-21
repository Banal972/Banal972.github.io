---
title: Next.js에서 React-Query를 사용하지 않아도 되는 이유
date: 2024-11-08
categories: [Discover, Nextjs]
tags: [Discover,Nextjs]
---

### 개요
React 프로젝트를 진행하면서 대부분 서버 패칭과 캐싱, 동기화 등 여러 작업을 좀 편리하게 하고 무한스크롤을 구현할때 대부분 많이 사용했었습니다.
하지만 Next.js에서는 기본 fetch api을 자체적인 영구 캐싱 및 재검증을 할 수 있도록 확장 시켜두었습니다.
해당 부분을 이용해서 굳이 무한 스크롤이나 클라이언트 사이드에서 꼭 필요한게 아니라면 React-Query를 쓰지 않아도 될것 같습니다.

<br/>

### fetch 파악하기

fetch는 기본적을 `fetch(resource,option)`을 사용합니다.
fetch api의 옵션은 method, headers, body, mode, credentials, cache 등 여러가지가 존재하는데

Next.js에서는 cache를 사용해서 데이터 캐시와 상호 작용하는 방식을 구성할 수 있습니다.
`fetch(resource, { cache: 'force-cache' | 'no-store' })`
no-store는 기본값 입니다. Next.js의 캐시를 찾지 않고 모든 요청에 대한 리소스를 가져오고 캐시로 업데이트를 하지 않습니다.
force-cache는 데이터 캐시에서 일치하는 요청을 찾고 일치하는 항목이 있고 새 항목인 경우 캐시를 반환 해줍니다.

또한 options의 next옵션 안에 revalidate을 이용해서 리소스 캐시 수명을 설정 할 수 있습니다.
`fetch(resource, { next: { revalidate: false | 0 | number } })`
revalidate을 false로 설정하면 리소스를 무기한으로 캐시합니다.
0은 리소스가 캐시되지 않도록 설정합니다.
number로 입력하면 리소스의 캐시 수명이 최대 n초을 설정 할 수 있습니다.

next옵션 안에는 tags를 지정할수 도 있습니다.
`fetch(resource, { next: { tags: ['collection'] } })`
리소스의 태그를 설정하고, 재검증태그를 통해서 필요에 따라 데이터를 재검증할 수 있습니다.



이 옵션들을 통해 react-query을 사용하지 않고 fetch-api를 통해서 데이터를 캐싱,검증등을 할 수 있었습니다.

<br/>

### searchParams을 이용하여 fetch로 목록 검색과 필터링 구현

next.js에서는 layout과,page 같이 지정된 역할을 하는 파일이 존재합니다.
layout과 page에서는 searchParams을 받아올수 있고 해당 받아온 searchParams을 통해 데이터의 필터링을 구현할 수 있었습니다.
```tsx
const HomePage = async ({ searchParams }: DefaultSearchParams) => {

    const params = await searchParams;
    const q = params?.q || '';
    const page = params?.page || 1;

    const queryString = new URLSearchParams({q,page}).toString(); 

    const res = await fetch(`api주소?${queryString}`{
        headers : {
            'Content-Type': 'Application/json',
        },
    });
    ...
```
이렇게 queryString을 만들어서 필터링을 만들 수 있습니다.

<br/>

### 그렇다면 검색 input을 통한 searchParams을 어떻게 구성할 수 있을까?
```tsx
const searchParams = useSearchParams();
const pathname = usePathname();
const { replace } = useRouter();

const handleSearch = handleSubmit((value) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
        params.set('q', value);
    } else {
        params.delete('q');
    }
    replace(`${pathname}?${params.toString()}`, { scroll: false });
});

<input type="text" onChange={(e)=>{handleSearch(e.target.value)}} />
```
이렇게 작성할 수 있으며 replace의 옵션으로 scroll : false을 넣어주면 라우터가 변동되었을때 스크롤을 맨위로 올려주는것을 막을 수 있었습니다.

<br/>

### 그렇다면 꼭 fetch-api를 사용해야만 하는건가
Next.js 문서에서도 fetch-api에 최적화가 되어있다고 하지만 클라이언트 사이드에서 불러오는 상황이라면 react-query와 useSWR을 사용하는것이 좋을 수도 있다고 적혀있었습니다.
결국 어떠한 프로젝트를 할 경우 그 프로젝트에 맞게 작성을 하는것이 좋을것 같습니다.