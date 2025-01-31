---
title: CreateRef을 이용한 Modal 만들기
date: 2025-02-01
categories: [Discover, React, Native]
tags: [Discover,React, Native]
---

### 개요
React-Native에서 모달을 만드는 방식은 여러가지가 있습니다.

Modal 컴포넌트를 이용해서 해당 컴포넌트 안에서 작성을 하거나
Contaxt-API , Zustand 혹은 Jotai 등 여러가지 상태관리 라이브러리를 이용하거나
React.Portal( React-Native 가 아닌 경우 )등 여러가지가 있을겁니다.

저는 이 중에 굳이 해당 UI에서 벗어나서 사용하지 않을것 같아 Modal 컴포넌트를 이용해서 해당 컴포넌트 안에서 작성을 하는것을 선택했습니다.
하지만 UI 안에 PagerView를 사용해서 Screen을 2개를 넣어놨기 때문에 이 Screen에 props로 전달하는게 굉장히 효율성도 떨어지고 이벤트도 따로 또 전달해야한다는게 너무 불편했습니다.

이걸 Context-API로 해결할까 고민하다 그러면 또 Provider랑 Value 만들고 또 그걸 Root에 감싸주고 이 페이지 안에서만 쓰기엔 이것도 좀 아닌것 같아서

여러가지를 고민해봤습니다.

그러다가 문득 React-Native-toastmessage 라이브러리가 떠올랐고 해당 라이브러리는 CreateRef와 Contaxt-API를 조합해서 만든것을 떠올랐습니다.

저는 굳이 Contaxt-API는 사용할 필요없고 CreateRef을 한번 이용해보자 해서 만들어보기로 했습니다.

<br/>

### 구현 방식 과 원리

구현에는 `createRef()`와 `useState()`을 사용했습니다.
```jsx
    const modalRef = createRef();

    const ModalRoot = forwardRef((_,ref))=>{
        const [modalVisible, setModalVisible] = useState(false);
        const show = useCallback(() => setModalVisible(true), []);
        const hide = useCallback(() => setModalVisible(false), []);

        useImperativeHandle(ref, () => ({
            show,
            hide,
        }));

        return(
            <Modal  
                animationType="fade"
                transparent
                visible={modalVisible}
                onRequestClose={hide}
            >
                <View>
                    <Text>난 모달이양</Text>
                    <TouchableOpacity onPress={hide}>
                        <Text>닫기</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        )

    }
```

기본 구성은 이렇게 작성했습니다.

`createRef`는 기본적으로 원래 함수형이 아닌 클래스형에서 사용이 됩니다.
일반적으로는 `useRef`을 사용하지만 외부 참조를 위해서 `createRef`으로 만들어 변수에 담아주었습니다.

`useImperativeHandle`는 `ref`로 노출된 `handle`을 사용자가 직접 정의할 수 있도록 도와주는 React훅 입니다.
저는 `forwardRef`을 이용해서 `ref`를 가져오고 가져온 `ref`를 `useImperativeHandle`에게 전달한 뒤에 `handle`을 저장해주었습니다.

물론 이제 React 19버전에서는 `forwardRef`을 사용하지 않아도 됩니다.

```jsx
    const MyModal = () => <ModalRoot ref={modalRef} />;
    MyModal.show = () => modalRef.current.show();
```

그리고 저는 `MyModal`라는 변수를 마들어서 `ModalRoot`에 ref로 createRef로 만들어둔 ref을 전달했고
어디서든 `MyModal.show()`로 바로 사용할수있게 메서드를 추가해서 보내는 방식으로 사용했습니다.

<br/>

### 실제 사용예

```jsx
    import QuitModal from '@hooks/modal/useQuitModal';
    <View>
        <ScreenOne/>
        <ScreenTwo/>
        <QuitModal />
    </View>
```

그럼 이제 이렇게 QuitModal을 불러와서 적용해주고  ScreenOne, ScreenTwo 안에서는

```jsx
    <View>
        <TouchableOpacity onPress={QuitModal.show}>
            <Text>모달 오픈</Text>
        </TouchableOpacity>
    </View>
```

이렇게 사용하면 어디서든지 불러올수 있게 됩니다.

<br/>

### 기타

처음 사용해보는 방식이라 이렇게 사용해도 되는지는 잘 모르겠지만 createRef을 사용해서 만든 방식으로는 처음이라
흥미로운 도전이라고 생각하고 사용해보고 있습니다.

React19 버전이 나온 이후로는 여기서도 코드를 더 간결하게 할 수 있을것이라고 생각됩니다.