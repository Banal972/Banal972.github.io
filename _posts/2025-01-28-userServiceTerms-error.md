---
title: Expo 카카오 인앱 로그인 오류 해결
date: 2025-01-28
categories: [Discover, Native]
tags: [Discover,Native]
---

### 문제
카카오 인앱 로그인은 Expo를 지원하지 않고네이티브 모듈만 사용할 수 있는데 Expo의 prebuild 혹은 build를 통해서 Expo Go가 아닌 빌드된 화면에서 개발을 진행할 수 있엇고

https://github.com/crossplatformkorea/react-native-kakao-login 해당 라이브러리가 큰 도움을 주었습니다.

하지만 이렇게 했을 경우 

value of type 'UserServiceTerms' has no member 'id' Refer to "Xcode Logs" below for additional, more detailed logs.

이러한 오류가 나오는것을 확인 할 수 있었습니다.

<br/>

### 문제 해결법

Expo에서 prebuild를 통해서 카카오 로그인을 개발할때 app.js 혹은 app.config.js에서 설정을 할 수 있는데

```
[
"@react-native-seoul/kakao-login",
    {
        "kakaoAppKey": "{{kakao api key}}",
        "overrideKakaoSDKVersion": "2.11.2", // Optional, 
        "kotlinVersion": "1.9.0" // #392
    }
],
```
기본으로 이렇게 넣어야 로그인이 작동 됩니다.

하지만 이렇게 넣을 경우 문제가 발생하는데 이 문제를 해결하기 위해서는 ios 버전에 관련이 있다는것을 확인 했고 overrideKakaoSDKVersion와 버전이 맞지 않아서 생기는 오류라고 생각됩니다.

그래서 특별히 버전을 꼭 이 버전을 사용해야 된다 라는 것이 없다면

overrideKakaoSDKVersion라는 옵션을 삭제하고 build를 해주면 빌드 오류가 나지 않게 됩니다.

생각보다 간단한 오류 였습니다.

<br/>

[참고자료](https://github.com/crossplatformkorea/react-native-kakao-login/pull/405)