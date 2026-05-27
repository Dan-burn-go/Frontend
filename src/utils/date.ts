// 서울 실시간 도시데이터 API의 populationTime 포맷("YYYY-MM-DD HH:MM")을
// "YYYY년 M월 D일 HH시 MM분" 형태로 변환한다. 파싱 실패 시 원본 반환.
export const formatPopulationTime = (populationTime: string): string => {
  const match = populationTime.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/);
  if (!match) return populationTime;
  const [, year, month, day, hour, minute] = match;
  return `${year}년 ${Number(month)}월 ${Number(day)}일 ${hour}시 ${minute}분`;
};

// "YYYY-MM-DD HH:MM" → "HH:MM"
export const extractPopulationHourMinute = (populationTime: string): string =>
  populationTime.slice(11, 16);
