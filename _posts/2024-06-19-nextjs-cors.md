---
title: Next.js에서 cors 우회 하는 법
date: 2024-06-19
categories: [Discover, Nextjs]
tags: [Discover,Nextjs]
---

#### 개요

React일 경우 저는 http-middleware-proxy을 이용한 방법을 자주 사용했습니다. Next.js에서는 다른 방식을 사용해야 했습니다.

<br/>

#### 해결방안

next.js에서는 next.config.mjs에서 rewrites을 추가해서 해당 주소로 요청을 보낼 때 cors 우회를 할 수 있었습니다.

```
/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites(){
        return [
            {
                source: '/api/:path*',
                destination: `요청주소/:path*`,
            },
        ]
    }
};

export default nextConfig;
```

이렇게 하면 /api로 요청을 보낼때 우회해서 요청을 보내주게 됩니다.