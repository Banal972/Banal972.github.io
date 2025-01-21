---
title: rn의 bottom-sheet 사용법
date: 2024-10-26
categories: [Discover, Native]
tags: [Discover,Native,Expo]
---

### bottom-sheet

RN 프로젝트를 진행하면서 
<!-- ![241026-030834](/posts/expo-bottom-sheet/241026-030834.png) -->
해당 UI를 구성을 하게 되었고 제스처를 통해서 움직임을 줘야했습니다.


### bottom-sheet 라이브러리

gorhom에서 제작한 bottom-sheet 패키지를 통해서 구성하게 되었습니다.

`yarn add @gorhom/bottom-sheet@^5`를 설치해야하고

그리고 종속성을 가진 패캐지도 설치해줘야합니다.

저는 expo를 사용하기에 expo 기준으로 설치했습니다.

`npx expo install react-native-reanimated react-native-gesture-handler`

bottom-sheet를 만들기 앞서 **react-native-gesture-handler**의 `GestureHandlerRootView`를 사용합니다.

그리고 **@gorhom/bottom-sheet** 에는 기본적으로 `<BottomSheet>` 와 `<BottomSheetView>`라는 컴포넌트를 지원해주는데 이것을 같이 활용해주면 제스처를 통한 애니메이션이 들어간 BottomSheet를 만들 수 있습니다.

```tsx
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';

const App = ()=>{

    const bottomSheetRef = useRef<BottomSheet>(null);

    return (
        <GestureHandlerRootView>
            <BottomSheet
                ref={bottomSheetRef}
            >
                <BottomSheetView>
                    <Text>난 텍스트야</Text>
                </BottomSheetView>
            </BottomSheet>
        </GestureHandlerRootView>
    )

}
```
Ref도 꼭 연결해야 합니다.

### BottomSheet 위에 따라다니는 버튼 만들기
<!-- ![241026-030741](/posts/expo-bottom-sheet/241026-030741.png) -->
이 이미지처럼 위에 따라다니는 버튼이 필요했습니다.

검색을 해도 잘 나오지 않고 여러번 해매다가 겨우 방법을 찾았습니다.

props부분을 읽어보다 [animatedPosition](https://gorhom.dev/react-native-bottom-sheet/props#animatedposition) 라는것을 발견했습니다.

animatedPosition는 내부의 위치 값을 기반으로 콜백되는 애니메이션 값을 가져올 수 있습니다.


저는 해당 `animatedPosition`을 버튼이 자연스럽게 따라올 수 있게 **react-native-reanimated**의 `useSharedValue`를 사용해서 작업했습니다.


```tsx
    const buttonPosition = useSharedValue<number>(0);
    const bottomSheetRef = useRef<BottomSheet>(null);

    const animatedButtonStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: buttonPosition.value }],
    }));

    return (
        <GestureHandlerRootView>
            <Animated.View style={animatedButtonStyle}>
                <Text>따라녀요</Text>
            </Animated.View>
            <BottomSheet
                ref={bottomSheetRef}
                animatedPosition={buttonPosition}
            >
                <BottomSheetView>
                    <Text>난 텍스트야</Text>
                </BottomSheetView>
            </BottomSheet>
        </GestureHandlerRootView>
    )
```

이렇게 작성해서 BottomSheet와 BottomSheet의 따라다니는 버튼을 만들 수 있었습니다.


### 후기
native 프로젝트에서 BottomSheet는 생각보다 많이 사용될것 같아서 집중적으로 좀더 docs를 읽어볼려고 합니다.
props에 굉장히 많은 부분들이 담겨있어 도움이 많이 될것 같고 Modal로도 사용할 수 있기 때문에 확장성이 좋은것 같습니다.