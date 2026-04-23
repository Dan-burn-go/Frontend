import { useState } from 'react';
import KakaoMap from '../components/map/KakaoMap';
import Header from '../components/layout/Header';
import CategoryFilter from '../components/filter/CategoryFilter';
import MapControls from '../components/map/MapControls';
import CongestionLegend from '../components/congestion/CongestionLegend';

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
      </div>
    </div>
  );
};

export default HomePage;
