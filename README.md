# 단번에 (Dan-burn-go)

> 서울 주요 관광지의 **실시간 혼잡도**를 한눈에 확인하고, AI 분석을 바탕으로 더 나은 장소와 경로를 안내하는 웹 서비스

🔗 **Live**: [goseoul.today](https://goseoul.today)

---

서울에서 어디로 갈지 망설여질 때 도움이 되는 서비스입니다.
지도 위에서 지금 사람이 몰리는 곳과 여유로운 곳을 색으로 구분해 보여주고,
가고 싶은 장소가 붐비면 가까운 대체 장소를, 출발하기 전이라면 도착지의 혼잡도를 미리 알려줍니다.

---

## Tech Stack

![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript_5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite_7-646CFF?style=flat-square&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)

---

## Key Features

### 실시간 혼잡도 지도
- 서울 주요 관광지 **121곳**의 현재 혼잡도를 카카오맵 위에 색상 마커로 표시
- 카테고리(공원·카페·쇼핑·문화) 필터와 키워드 검색으로 원하는 장소를 빠르게 탐색
- 지금 가장 붐비는 곳과 여유로운 곳을 TOP 3로 노출
- 마커를 누르면 반경 2km 이내 덜 붐비는 대체 장소를 즉시 추천

### 장소 상세
- 선택한 장소의 현재 혼잡도, 평균 방문 인원, 갱신 시간을 한 화면에 정리
- AI가 분석한 혼잡 원인과 맥락 제공
- 주변에서 열리고 있는 문화 행사 정보 함께 노출
- 혼잡한 장소라면 가까운 대체 장소를 함께 안내

### 혼잡도 랭킹
- 서울 주요 장소를 혼잡도 높은 순 · 낮은 순으로 정렬한 실시간 순위
- 카테고리, 평균 방문 인원, 혼잡도 단계를 한 카드에 정리
- 검색으로 특정 장소를 랭킹 안에서 바로 찾아갈 수 있음

### 핫스팟 탐색
- 121곳을 사진과 카테고리 태그로 둘러보는 카드 그리드
- 키워드 검색과 카테고리 필터로 원하는 장소를 빠르게 좁혀가기

### 경로 추천
- 출발지와 도착지를 입력하면 도보·버스·지하철을 조합한 경로 안내
- 도착지의 현재 혼잡도를 미리 보고 출발 여부 판단 가능
- 여러 경로 중 가장 빠른 길을 우선 노출, 단계별 타임라인으로 안내

---

## Getting Started

```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수 설정 (.env 파일에 카카오맵 JavaScript 키 입력 — https://developers.kakao.com 에서 발급)
cp .env.example .env

# 3. 개발 서버 실행
npm run dev
```
