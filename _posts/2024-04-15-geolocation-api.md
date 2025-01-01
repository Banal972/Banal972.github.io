---
title: Geolocation API을 이용해서 현재 위치를 가져와보자
date: 2024-04-15
categories: [Discover, react]
tags: [Discover]
---

#### 개요

최근 팀프로젝트를 진행하던 도중 카카오맵을 이용하다 현재위치를 가져와야 하는 상황이 발생했고

Geolocation API을 통해 React에서 현재 위치를 가져올수 있었습니다.

Geolocation API는 브라우저에서 지원해주는 웹 애플리케이션 위치 정보 API입니다.

<br/>

#### 개념

navigator라는 프로퍼티 안에 geolocation을 사용하면 됩니다.

navigator.geolocation을 사용하게 되면 해당 사이트에 접속할 때

![241019-041058](/posts/geolocation-api/241019-041058.png)

이렇게 사용자에게 요청을 하게 됩니다.

허용을 눌렀을 경우 사용할 수 있게 되는거죵

<br/>

#### 사용법

```
const [location,setLocation] = useState(); // 좌표를 넣어둘 state
const [err,setErr] = useState(); // 에러를 넣어둘 state

useEffect(()=>{

	const { geolocation } = navigator; // navigator의 geolocation을 가져옵니다.
    
    if(!geolocation){
    	// geolocation을 가져올수 없으면 에러를 보냅니다.
        setErr({code : 0, message : "오류가 발생했습니다."});
    }
    
},[])
```

useState()을 통해 좌표를 넣어둘 state와 err을 담아줄 state을 생성해 뒀습니다.

사용자에게 위치정보를 가져올 건지 요청을 하는 부분입니다.

geolocation를 생성했을 경우 **getCurrentPosition()과** **watchPostion()**을 사용할 수 있습니다.

**getCurrentPosition()**는 현재위치를 가져올 때 사용하는 함수입니다.

**watchPostion()**는 위치가 변동되었을 때 자동으로 위치를 반환해 주는 함수입니다.

지금은 **getCurrentPosition()**만 사용해 볼 예정입니다.

<br/>

#### getCurrentPosition()

```
  useEffect(() => {
    const { geolocation } = navigator; // navigator의 geolocation을 가져옵니다.

    if (!geolocation) {
      // geolocation 을 가져올수 없으면 에러를 보냅니다.
      setErr({ code: 0, message: "오류가 발생했습니다." });
    }

    /*
      geolocation의 getCurrentPosition함수를 통해 현재위치를 가져옵니다.
      getCurrentPosition는 argument가 총 3개가 들어갑니다.
      getCurrentPosition(성공,실패,옵션);
    */
    geolocation.getCurrentPosition(성공함수, 실패함수, 옵션);
  }, []);
```

**getCurrentPosition**()는 3개의 인자(argument)를 전달할 수 있습니다.

성공함수는 **getCurrentPosition**을 성공적으로 잘 가져왔을 때를 작성하며

실패함수는 **getCurrentPosition**을 가져오는데 실패하거나 오류가 발생했을 때 작성합니다.

옵션은 **getCurrentPosition**의 방식을 넣어줄 수 있습니다.

<br/>

#### 성공함수

```
function 성공함수(pos) {
    /*
    성공했을때 반환되는 값은 총 2개 입니다.
    위치를 저장하고 있는 coords
    위치가 검색된 시간을 나타내는 timestamp
  */
    const { coords } = pos;
    setLocation(coords);
}
```

성공함수는 위치정보가 담긴 매개변수(**parameter**)를 받아올 수 있습니다.

매개변수는 총 2개를 반환해 주는데 위치 좌표를 저장하고 있는 **coords**, 위치가 검색된 시간을 나타내주는 **timestamp입니다.**

#### 실패함수

```
function 실패함수(error) {
    /*
      에러가 발생했을때는 code 값 과 message을 반환해줍니다.
      code는 오류 코드를 반환합니다.
      예를 들어 1은 페이지에 권한이 없는것
      https://developer.mozilla.org/en-US/docs/Web/API/GeolocationPositionError/code 에러코드는 이곳에 정리가 되어있습니다.
      message는 사용자가 알아보기 쉽게 문자열로 나타내줍니다.
    */
    setErr(error);
}
```

실패함수는 에러정보가 담긴 매개변수(**parameter**)를 받아올 수 있습니다.

매개변수는 **code와** **message**을 반환해줍니다.

**code**는 오류 코드를 반환해 주며  
예를 들어 1은 해당 웹애플리케이션에 권한이 없을 때 발생합니다.

**message**는 사용자가 알아보기 쉽게 문자열로 나타내줍니다.

<br/>

#### 적용해 보기

```
export default function App() {

	const [location, setLocation] = useState();
  	const [err, setErr] = useState();
    
    function 성공함수(pos: GeolocationPosition) {
    	/*
        	성공했을때 반환되는 값은 총 2개 입니다.
        	위치를 저장하고 있는 coords
        	위치가 검색된 시간을 나타내는 timestamp
      	*/
        const { coords } = pos;
        setLocation(coords);
  	}
    
  	function 실패함수(error: GeolocationPositionError) {
    	/*
      		에러가 발생했을때는 code 값 과 message을 반환해줍니다.
      		code는 오류 코드를 반환합니다.
      		예를 들어 1은 페이지에 권한이 없는것
          	https://developer.mozilla.org/en-US/docs/Web/API/GeolocationPositionError/code 에러코드는 이곳에 정리가 되어있습니다.
          	message는 사용자가 알아보기 쉽게 문자열로 나타내줍니다.
    	*/
        setErr(error);
  	}
    
    useEffect(()=>{
        const { geolocation } = navigator; // navigator의 geolocation을 가져옵니다.

        if (!geolocation) {
          // geolocation 을 가져올수 없으면 에러를 보냅니다.
          setErr({ code: 0, message: "오류가 발생했습니다." });
        }

        /*
          	geolocation의 getCurrentPosition함수를 통해 현재위치를 가져옵니다.
          	getCurrentPosition는 매개변수가 총 3개가 들어갑니다.
      		getCurrentPosition(성공,실패,옵션);
        */
        geolocation.getCurrentPosition(성공함수, 실패함수, 옵션);
    },[])

	return(
    	<div>
          <p>위도 : {location?.latitude}</p>
          <p>적도 : {location?.longitude}</p>
          {err && (
            <p>
              에러 : 에러코드 {err?.code} , 에러메세지 {err?.message}
            </p>
          )}
    	</div>
    )


}
```

![241019-041128](/posts/geolocation-api/241019-041128.png)

그러면 현재위치를 가져올 수 있게 됩니다.

<br/>

#### 옵션

위에서 말했던 것처럼 옵션도 존재합니다.

총 3가지의 옵션을 넣을 수가 있습니다.

**maximumAge**는 캐시 된 이전 위치 정보를 사용할 수 있는 최대 시간을 지정합니다. 이 기능을 사용하면 매번 새로운 위치를 가져올 필요가 없습니다. 기본값은 0입니다.

**timeout**은 현재 위치를 가져올 때까지 기다리는 시간을 의미합니다. 설정한 시간 안에 가져오지 못하면 에러가 발생되게 됩니다. 기본값은 Infinity입니다.

**enableHighAccuracy**는 정확한 위치를 제공할 것인지에 대한 옵션입니다. **true**로 지정할 경우 더 높은 정확도를 가진 위치 정보를 가져오게 되는데 가져오는 속도가 느려집니다. **false**로 설정할 경우 빠른 속도로 정보를 가져올 수 있습니다.  
기본값은 false입니다.

<br/>

#### 전체 코드

<iframe src="https://codesandbox.io/embed/rmdhs4?view=Editor+%2B+Preview&amp;module=%2Fsrc%2FApp.tsx" width="100%" height="500"></iframe>

해당 방식을 이용해서 커스텀훅을 작성하면 좀 더 쉽게 여러 컴포넌트에서 불러올 수 있게 됩니당

참고자료 :)

[https://developer.mozilla.org/en-US/docs/Web/API/Geolocation](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation)