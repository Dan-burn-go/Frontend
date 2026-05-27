// 수도권 도시철도 공식 노선 색상.
// ODSAY 응답의 subPath.lane[0].name(예: "1호선", "신분당선")을 키로 lookup한다.
// 운영사 공식 사인/노선도 가이드 기준 hex.
export const SUBWAY_LINE_COLORS: Record<string, string> = {
  '1호선': '#0052A4',
  '2호선': '#009D3E',
  '3호선': '#EF7C1C',
  '4호선': '#00A5DE',
  '5호선': '#996CAC',
  '6호선': '#CD7C2F',
  '7호선': '#747F00',
  '8호선': '#E6186C',
  '9호선': '#BDB092',
  공항철도: '#0090D2',
  경의중앙선: '#77C4A3',
  경춘선: '#178C72',
  수인분당선: '#FABE00',
  신분당선: '#D4003B',
  우이신설선: '#B7C450',
  서해선: '#81A914',
  김포골드라인: '#A17800',
  신림선: '#6789CA',
  'GTX-A': '#9A6292',
  인천1호선: '#6E98BB',
  인천2호선: '#ED8B00',
  용인경전철: '#509F22',
  의정부경전철: '#FDA600',
};

// 매핑되지 않는 노선의 fallback (violet-500)
export const DEFAULT_SUBWAY_COLOR = '#8B5CF6';

/**
 * ODSAY가 "수도권 1호선" 같은 접두어를 붙여 내려주는데, 서비스 자체가 수도권 기반이라
 * 노출 시 중복임 — 표시 직전 "수도권 " 접두어를 제거한다.
 * 예: "수도권 7호선" → "7호선", "수도권 수인.분당선" → "수인.분당선"
 */
export const cleanSubwayName = (name: string | null | undefined): string | null => {
  if (!name) return null;
  return name.replace(/^수도권\s*/, '').trim();
};

/**
 * 접두어가 붙어 와도 공백 제거 + 부분 일치까지 fallback해서 색을 결정한다.
 */
export const resolveSubwayColor = (name: string | null | undefined): string => {
  if (!name) return DEFAULT_SUBWAY_COLOR;
  const cleaned = name.replace(/\s+/g, '');
  if (SUBWAY_LINE_COLORS[cleaned]) return SUBWAY_LINE_COLORS[cleaned];
  for (const [key, color] of Object.entries(SUBWAY_LINE_COLORS)) {
    if (cleaned.includes(key)) return color;
  }
  return DEFAULT_SUBWAY_COLOR;
};
