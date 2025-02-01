---
title: Expo SDK 52 Map 마커 오류 해결법
date: 2025-02-02
categories: [Discover, React, Native]
tags: [Discove, React, Native]
---

### 개요
Expo SDK 52 버전에서 MapView안에 Map Marker를 띄울때 처음엔 문제가 없지만 재랜더링 되거나
변동이 생길경우 앱 충돌이 나면서 앱이 꺼져버리거나 오류가 발생하는 경우가 생겼습니다.

이는 Expo SDK 51에는 없었던 오류 였고 Expo SDK 52로 업데이트 되면서 생긴 문제였습니다.

<br/>

### 문제 해결법

Expo SDK 52에는 `newArchEnabled`라는 새로운 옵션이 생겼는데 
`newArchEnabled`는 JSI 기반으로 동작하여 성능을 향상 시키는 옵션을 제공한다고 합니다.

성능 향상을 위해서 Expo SDK 52에서는 `newArchEnabled`를 true로 해서 사용하라고 권장을 하는데

react-native-maps에서는 아직 이 새로운 아키텍처와 충돌이 발생해서 생기는 오류로 발견되었습니다.

해당 오류를 해결하기 위해서는 `newArchEnabled`을 false로 해주면 Marker에 대한 오류가 발생하지 않게 됩니다.

```json
{
  "expo": {
    "newArchEnabled": false,
  }
}
```

[참고 이슈](https://github.com/react-native-maps/react-native-maps/issues/5206)