---
title: A non‐serializable value was detected in an action 오류 해결
date: 2024-06-24
categories: [Discover]
tags: [Discover]
---

#### 개요

커스텀모달이 필요할 것 같아 모달 관련 라이브러리를 사용하지 않고 Redux-toolkit을 이용해서 직접 만들려고 하니 오류가 저를 기쁘게 반겨주었습니다.

```
A non-serializable value was detected in an action, in the path: `payload.Component`. Value: ƒ Login(param) {
    let { isOpen, onClose } = param;
    _s();
    const { register, handleSubmit } = (0,react_hook_form__WEBPACK_IMPORTED_MODULE_6__.useForm)();
    const router = (0,next_navigation_… 
Take a look at the logic that dispatched this action:  
{type: 'modal/open', payload: {…}}
 
(See https://redux.js.org/faq/actions#why-should-type-be-a-string-or-at-least-serializable-why-should-my-action-types-be-constants) 
(To allow non-serializable values see: https://redux-toolkit.js.org/usage/usage-guide#working-with-non-serializable-data)
```

해당 오류


<br/>

#### 왜 이런 오류가 날 반겨줄까

Redux Toolkit은 상태가 직렬화가 가능해야 합니다. React 컴포넌트 같은 경우 직렬화가 불가능한 값이기 때문에 오류가 발생하는 것이며 여기서 직렬화는 redux에서 값을 주고받을 때 값을 string 형태로 변환하고 다시 원래 형태로 돌리는 과정이 필요한데 (JSON stringfy, JSON parse) 컴포넌트는 이것을 할 수 없기 때문에 발생하는 오류입니다.

<br/>

#### 해결방법

해결방법은 2가지가 있습니다.

1.  Store에 함수 및 직렬화가 불가능한 값을 넣지 않는 겁니다. 제일 좋은 방법
2.  middleware을 통해서 직렬화 가능한 값을 체크하는 기능을 꺼주면 됩니다.

저는 middleware을 통한 직렬화 방식을 꺼주는 것을 선택했습니다.

```
export const makeStore = () => {
  return configureStore({
    reducer: {
      modal
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
      serializableCheck: false,
    })
  })
}
```