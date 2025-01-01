---
title: Expo에서 아코디언을 만들어보자
date: 2024-10-12
categories: [Discover, native]
tags: [Discover]
---

#### 개요

Expo 프로젝트에서 고객센터 페이지를 만들다가 **Q.질문입니다. ↓** 를 누르면 해당 답변 내용이 나오는 애니메이션 있으면 사용자 경험에 좋을것 같아
아코디언을 만들수있는지 알아보았습니다.

알아보면서 여러 라이브러리를 찾게 되었지만 React Native에서 지원해주는 **LayoutAnimation**를 사용하는 편이 아무래도 더 좋을것 같다는 생각이들어
해당 API를 사용해서 아코디언을 만들게 되었습니다.

<br/>

#### 필요한 API

[React Native DOCS - API](https://reactnative.dev/docs/accessibilityinfo) 여기서 React Native에서 지원해주는 API를 볼 수 있는데
**LayoutAnimation**를 사용해서 만들어볼려고 합니다.

- **LayoutAnimation란?**
    - LayoutAnimation는 레이아웃이 변경 시에 자연스러운 애니메이션 효과를 제공하는 API입니다.

<br/>

#### 아코디언 UI

```tsx
const [isOpen, setIsOpen] = useState(false);
<View>
    <TouchableOpacity>
        <Text>Q.질문입니다.</Text>
    </TouchableOpacity>
    {
        isOpen && <Text>답변입니다. 답변입니다. 답변입니다. 답변입니다. 답변입니다. 답변입니다. 답변입니다. 답변입니다.</Text>
    }
</View>
```
> 해당 UI는 예시로 든것이며 실제로는 제대로 나오지 않을수 있습니다.

<br/>

#### LayoutAnimation 적용하기
```tsx
    const [isOpen, setIsOpen] = useState(false);
    
    const toggleAccordion = ()=>{
        LayoutAnimation.configureNext({
            duration: 300,
            update: {
                property: LayoutAnimation.Properties.opacity,
                type: LayoutAnimation.Types.easeInEaseOut,
            },
            delete: {
                property: LayoutAnimation.Properties.opacity,
                type: LayoutAnimation.Types.easeInEaseOut,
            },
        });
        setIsOpen(!isOpen)
    }

    <View>
        <TouchableOpacity onPress={toggleAccordion}>
            <Text>Q.질문입니다.</Text>
        </TouchableOpacity>
        {
            isOpen && <Text>답변입니다. 답변입니다. 답변입니다. 답변입니다. 답변입니다. 답변입니다. 답변입니다. 답변입니다.</Text>
        }
    </View>
```

`LayoutAnimation`는 기본적으로 `Properties`,`Types`,`linear` 등 여러가지 **Properties**를 가지고 있습니다.

제가 사용할건 `Properties`와 `Types`만 사용할 예정입니다. `Properties`에는 `opacity`이 들어가있고 `Types`에는 `easeInEaseOut`가 들어가 있습니다.

해당 부분을 `configureNext`메서드를 통해 `config`을 설정해줄수 있는데 `duartion`을 설정해주고 **layout**이 `update` 되거나 `delete`될때 어떻게 애니메이션이 들어가면 좋을지 설정해주면 변동되는 애니메이션 부분에 `LayoutAnimation` 애니메이션을 구현해줍니다.

이렇게 할경우 애니메이션이 작동되게 됩니다.

`LayoutAnimation.configureNext`는 뷰 계층에 있는 모든 레이아웃에 변화에 애니메이션을 적용하게 됩니다.
즉 `isOpen &&` 부분에 있는 `<Text></Text>`에 변동이 생기기 때문에 그 부분에 적용이 되는거죠

<br/>

#### 참고
https://reactnative.dev/docs/layoutanimation#configurenext