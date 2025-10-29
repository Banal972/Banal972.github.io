---
title: Vite, CRA, Next 등 여러 dev 환경에서 proxy가 되는 이유
date: 2025-10-29
categories: [discover]
tags: [discover]
---

개발을 하다 보면 개발(dev) 환경에서 API를 요청할 때  
`proxy` 설정을 하라는 경우를 자주 보게 됩니다.  
하지만 실제 배포(production) 환경에서는 이 `proxy`가 동작하지 않는 경우가 많습니다.

---

### proxy란?
<div style="text-align: left;">
    <img src="/assets/img/post/2025-10-29-why-dev-proxy/image.png" alt="" width="500" />
</div>
직역하자면 **‘대리’** 혹은 **‘중계자’**라는 뜻으로,  
서버와 클라이언트 사이에서 **중간 역할을 하는 존재**를 말합니다.  
즉, 클라이언트의 요청을 대신 서버로 전달하고,  
서버의 응답을 다시 클라이언트로 전달하는 **‘중간자’ 역할**을 하는 서버나 프로그램입니다.

---

## 왜 개발 환경에서만 Proxy가 동작할까?
Vite를 예로 들어보겠습니다.  
Vite는 `vite dev`라는 명령어를 통해 개발 서버(dev server)를 실행합니다.  
이때 Node.js 기반의 **로컬 개발 서버**가 열리고,  
해당 서버를 통해 프론트엔드 애플리케이션을 제공합니다.

여기서 `fetch`나 `axios` 등을 사용해 외부 API를 호출하면  
브라우저 보안 정책으로 인해 **CORS 에러**가 발생합니다.

---

### CORS란?
<div style="text-align: left;">
    <img src="/assets/img/post/2025-10-29-why-dev-proxy/image2.png" alt="" width="500" />
</div>
[출저 : Mmdn]<br/>
**CORS(Cross-Origin Resource Sharing)**는  
**다른 출처(Origin)의 리소스 요청을 허용하거나 차단하는 브라우저의 보안 정책**입니다.  
즉, 한 사이트에서 다른 도메인의 데이터를 요청할 때,  
서버가 이를 허용하지 않으면 브라우저가 요청을 차단합니다.

---

### CORS를 해결하는 방법

CORS 문제를 해결하려면 보통 두 가지 방법이 있습니다.

1. **서버에서 CORS 설정을 허용하기**
2. **개발 환경에서 Proxy 설정을 사용하기**

Vite의 경우 `vite.config.js` 파일에서 다음과 같이 설정할 수 있습니다.

```js
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://jsonplaceholder.typicode.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
    }
  }
})
```
이 설정은 /api로 시작하는 요청을
http://jsonplaceholder.typicode.com으로 프록시하도록 만듭니다.

즉, fetch('/api/posts') 요청을 보내면,
개발 서버가 대신 http://jsonplaceholder.typicode.com/posts로 요청을 전달합니다.

이때 중요한 점은,
브라우저에서 직접 서버로 요청을 보내는 것이 아니라
**개발 서버(Vite dev server)**가 중간에서 요청을 대리한다는 점입니다.

따라서 요청이 브라우저 → 서버가 아니라
서버 → 서버 형태로 전달되어 CORS 에러가 발생하지 않게 되는 것입니다.

---

### Production 환경에서는 왜 안 될까?
Production 환경에서는 개발 서버가 존재하지 않습니다.
즉, 정적 파일(HTML, JS, CSS 등)만 배포되고,
브라우저가 직접 백엔드 서버로 요청을 보내게 됩니다.

이때는 중간에서 요청을 대리해주는 Proxy 서버가 없기 때문에,
CORS 정책을 우회할 수 없습니다.
따라서 서버 측에서 직접 CORS를 허용하도록 설정해야만
요청이 정상적으로 이루어집니다.