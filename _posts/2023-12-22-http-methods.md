---
title: HTTP 메서드에 대해서
date: 2023-12-22
categories: [Etc]
tags: [Etc]
---

### HTTP 메서드에 대해서
HTTP 메서드는 웹브라우저(클라이언트) 와 웹 서버간의 이루어지는 요청(request)과 응답(response) 데이터를 전송하는 방식입니다.
서버가 어떤 방식으로 동작할지 지정하는 요청(request)을 보내는 행동 이라고 보면 됩니다.

<br/>
<br/>

### HTTP 메서드의 종류
HTTP 메서드는 총 9가지를 가지고 있는데 그중에서 5개를 자주 사용합니다.
오늘은 자주 사용하는 메서드 들에서 알아볼려고 합니다.

<br/>

**자주 사용하는 메서드**
- GET : 리소스 조회
- POST : 데이터 추가 및 등록
- PUT : 리소스 덮어쓰기, 없으면 생성
- PATCH : 리소스 일부 수정
- DELETE : 리소스 삭제

<br/>

**그외 메서드**
- HEAD : GET와 같은 동작을 하지만 body부분을 제외
- CONNECT : 리소스로 식별되는 터널을 맺음
- OPTIONS : 리소스의 통신을 설정 할때 사용
- TRACE : 리소스의 경로를 따라 look-back 테스트


<br/>
<hr/>

### GET
GET는 특정한 리소스를 가져올때 사용됩니다.

GET 요청은 멱등성을 지니고 있습니다.

<div style={backgroundColor : "#fff", padding : 12, border : "1px solid #ddd", fontSize : 14}>***멱등성***
멱등성은 동일한 요청을 한 번 보내는 것과 여러 번 연속으로 보내는 것이 같은 효과를 지니고, 서버의 상태도 동일하게 남은 상태를 의미 합니다.</div>

GET요청으로 서버에게 데이터를 전달할 경우엔 쿼리스트링을 사용합니다.

예를 들어 구글에 검색을 할경우
<!-- ![240903-014045](/posts/http-methods/240903-014045.png) -->

search?q=%EA%B2
이렇게 들어가는것을 볼수있을겁니다.

이부분이 쿼리스트링입니다.

<br/>
<br/>

### POST
POST는 서버로 데이터를 전송합니다.
POST 요청은 HTML 양식을 통해서 서버에 전송하고, 서버에 변경사항을 만들어줍니다.
body를 통해 서버로 요청 데이터를 전달해줍니다.

POST는 멱등성을 지니지 않습니다.

<br/>
<br/>

### PUT
PUT은 새로운 리소스를 생성하거나, 대상 리소스를 대체합니다.

PUT도 GET과 동일하게 멱등성을 지니고 있습니다.


<br/>
<br/>

### PATCH
PATCH는 리소스의 부분적인 수정을 할때 사용합니다.
대부분 PUT과 PATCH를 자주 헷갈려하는데 PUT는 전체를 바꾸고 PATCH는 부분을 바꾼다고 생각하면 편합니다.

PATCH는 기본적으로 멱등성을 가지지 않는데 PUT과 같은 방식으로 사용하게되면 멱등성을 지니게도 할 수 있습니다.


<br/>
<br/>

### DELETE
DELETE는 이름처럼 리소스를 삭제할때 사용합니다.

DELETE도 멱등성을 가지고 있습니다.

<br/>
<br/>

### 정리
HTTP 메서드 자체에는 기능을 가지고 있습니다. 
개발자가 해당 메서드를 이용해서 동작을 구현해줘야합니다.

그렇다면 왜 HTTP 메서드가 존재하냐면 리소스와 행위를 분리하기 위해서 사용하는것 입니다.
URL에 해당 행위를 지정해서 보내는것 보다

- /read-card-list

HTTP 메서드를 이용해서 구분하게끔 설계해서 유지보수하기 편하게 작성하는것 입니다.

- /card GET