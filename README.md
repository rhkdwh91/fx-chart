# fx-chart

fx-chart는 D3.js를 기반으로 한 강력하고 유연한 차트 라이브러리입니다. 다양한 차트 유형을 지원하며, 사용자 정의가 용이한 인터페이스를 제공합니다.

## 특징

- D3.js 기반의 고성능 차트 렌더링
- 다양한 차트 유형 지원 (라인, 바, 파이, 스캐터 등)
- 반응형 디자인으로 모바일 환경 지원
- 사용자 정의 가능한 스타일링 옵션
- 애니메이션 효과 지원

## 설치

npm을 사용하여 fx-chart를 설치할 수 있습니다:

```bash
npm install fx-chart
```

## 사용법

fx-chart를 사용하는 기본적인 예제입니다:

```jsx
"use client";

import { Bar } from "fx-chart";

export default function App() {
    return (
        <div>
            <Bar
                data={[
                    { name: "H1", value: 1 },
                    { name: "H2", value: 2 },
                    { name: "H3", value: 2 },
                    { name: "H4", value: 2 },
                    { name: "H5", value: 2 },
                ]}
            />
        </div>
    );
}

```

## API 문서

자세한 API 문서는 [여기](https://klog.pe.kr)에서 확인할 수 있습니다.

## 기여하기

프로젝트에 기여하고 싶으시다면 CONTRIBUTING.md 파일을 참조해 주세요.

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 LICENSE 파일을 참조하세요.