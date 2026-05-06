import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DetailPage from './pages/DetailPage';
import RankingPage from './pages/RankingPage';
import HotspotsPage from './pages/HotspotsPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/place/:placeId" element={<DetailPage />} />
      <Route path="/ranking" element={<RankingPage />} />
      <Route path="/hotspots" element={<HotspotsPage />} />
    </Routes>
  );
}

export default App;
