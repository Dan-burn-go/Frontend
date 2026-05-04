import { useState } from 'react';
import KakaoMap from '../components/map/KakaoMap';
import Header from '../components/layout/Header';
import CategoryFilter from '../components/filter/CategoryFilter';
import MapControls from '../components/map/MapControls';
import CongestionLegend from '../components/congestion/CongestionLegend';
import CongestionRankCard from '../components/congestion/CongestionRankCard';


const HomePage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  return (
    <div className="flex flex-col w-full h-dvh">
      <Header />
      <div className="relative flex-1 overflow-hidden">
        <KakaoMap selectedCategory={selectedCategory} />
        <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
        <MapControls onZoomIn={() => {}} onZoomOut={() => {}} onLocate={() => {}} />
        <CongestionLegend />
        <CongestionRankCard type="busiest" initialRatio={{ x: 1, y: 0.13 }} />
        <CongestionRankCard type="relaxed" initialRatio={{ x: 1, y: 0.40 }} />
      </div>
    </div>
  );
};

export default HomePage;
