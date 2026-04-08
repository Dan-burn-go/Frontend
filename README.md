# Dan-burn-go Frontend

  > 서울 주요 관광지 122곳의 **실시간 혼잡도**를 지도 위에 시각화하고, AI 기반 혼잡 원인 분석과 대체 장소·교통 경로를 안내하는 React 웹 프론트엔드

  ---

  ## Tech Stack

  ![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black)
  ![TypeScript](https://img.shields.io/badge/TypeScript_5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)
  ![Vite](https://img.shields.io/badge/Vite_7-646CFF?style=flat-square&logo=vite&logoColor=white)
  ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)

  ---

  ## Key Features

  ### 1. 실시간 혼잡도 지도
  - 카카오맵 위에 122개 관광지 혼잡도 마커 시각화
  - 카테고리 필터로 관심 장소 분류 조회
  - 혼잡도 단계(여유 / 보통 / 약간 붐빔 / 붐빔)를 색상 범례로 안내

  ### 2. (도입 예정) 장소 상세 페이지
  - 선택 장소의 현재 혼잡도 수치 및 AI 분석 원인 표시
  - 반경 2km 이내 대체 장소 목록 및 소요 시간 안내
  - 교통 경로(버스) 추천

  ### 3. (도입 예정) 혼잡도 랭킹
  - 혼잡도 기준 실시간 장소 순위 제공

  ---

  ## Project Structure

```
src/
├── api/              # Axios 기반 API 호출 모듈
├── components/
│   ├── congestion/   # 혼잡도 범례, 배지 등 UI 컴포넌트
│   ├── filter/       # 카테고리 필터
│   ├── layout/       # Header 등 공통 레이아웃
│   └── map/          # KakaoMap, MapControls 컴포넌트
├── hooks/            # 커스텀 훅
├── pages/
│   ├── HomePage.tsx      # 메인 지도 페이지 (/)
│   ├── DetailPage.tsx    # 장소 상세 페이지 (/place/:placeId)
│   └── RankingPage.tsx   # 혼잡도 랭킹 페이지 (/ranking)
├── types/            # TypeScript 타입 정의
└── data/             # 정적 데이터
```
## Getting Started

### 설치 및 실행
```
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```
