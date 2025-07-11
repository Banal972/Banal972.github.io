---
title: 리액트 네이티브 맵뷰 마커 크래시 오류 해결
date: 2025-07-11
categories: [Discover, React, Native]
tags: [Discover, React, Native]
---

### 참고버전
expo 53<br/>
react-native 0.79<br/>
react 19.0.0

### 이슈
이번 프로젝트 같은 경우 Expo 혹은 React-Native로 개발을 하였고 맵뷰 와 마커를 이용해서 해당 위치에 마커를 구성해줘야하는 일이 생겼습니다.<br/>
Expo는 SDK 53, react-Native는 0.79 이상을 사용했습니다.<br/>
MapView는 자연스럽게 나오고 Marker도 동일하게 처음 불러왔을 경우 문제없이 잘 찍히는것을 볼 수 있었습니다. <br/>
하지만 마커를 한번 불러오고 난뒤 다시 맵을 이동하여 새로운 마커를 불러오는 순간 <br/>

```tsx
react-native-maps *** -[__nsarraym insertobject:atindex:]: index 15 beyond bounds [0 .. 5]
```

라는 오류와 함께 앱이 크래시가 나면서 튕기는 현상을 간혹가다 볼 수 있습니다.


### 이슈해결

이 문제는 여러 자료에서 찾아볼 수 있었습니다.<br/>
제가 찾은 해결 방법은 react-native-maps를 다운그레이드 하는 방법이였습니다.<br/>
지금 react-native-maps는 1.24.3 버전까지 나왔지만 Expo에서 크래시가 나는 버전이 있고 크래시가 나지 않는 버전이 있지만<br/>
해당 이슈에서 보면 react-native-maps 1.23.8에서 문제가 해결됐다는 이슈가 종종 보였지만<br/>
저는 1.23.8에서는 동일한 문제가 발생했습니다.<br/>
여기서 expo에는 install을 할때 --fix라는 기능을 지원해주고 있으며 해당 기능은 라이브러리와 비교해서 맞는 버전으로 다운그레이드 혹은 업그레이드를 해줍니다.

```tsx
npx expo install --fix
```

--fix를 해줄경우 저 같은 경우 react-native-maps 1.20.1 을 설치가 되었고 해당 문제로 빌드를 다시 해본결과<br/>
오류를 해결할 수 있었습니다.


#### 참고자료
[https://github.com/react-native-maps/react-native-maps/issues/5345](https://github.com/react-native-maps/react-native-maps/issues/5345)