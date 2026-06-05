import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DetailPage from './pages/DetailPage';
import RankingPage from './pages/RankingPage';
import HotspotsPage from './pages/HotspotsPage';
import RoutePlannerPage from './pages/RoutePlannerPage';

declare function gtag(...args: unknown[]): void;

const getPageTitle = (pathname: string): string => {
  if (pathname === '/') return '홈';
  if (pathname.startsWith('/place/')) return '장소 상세';
  if (pathname === '/ranking') return '랭킹';
  if (pathname === '/hotspots') return '핫스팟';
  if (pathname === '/route') return '경로 탐색';
  return '단번에';
};

function App() {
  const location = useLocation();

  useEffect(() => {
    if (typeof gtag === 'function') {
      gtag('event', 'page_view', {
        page_path: location.pathname,
        page_title: getPageTitle(location.pathname),
      });
    }
  }, [location.pathname]);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/place/:placeId" element={<DetailPage />} />
      <Route path="/ranking" element={<RankingPage />} />
      <Route path="/hotspots" element={<HotspotsPage />} />
      <Route path="/route" element={<RoutePlannerPage />} />
    </Routes>
  );
}

export default App;
