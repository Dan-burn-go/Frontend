import { useState, useCallback } from 'react';
import KakaoMap from '../components/map/KakaoMap';
import Header from '../components/layout/Header';
import CategoryFilter from '../components/filter/CategoryFilter';
import MapControls from '../components/map/MapControls';
import CongestionLegend from '../components/congestion/CongestionLegend';
import CongestionRankCard from '../components/congestion/CongestionRankCard';
import AlternativeLocationBanner from '../components/map/AlternativeLocationBanner';
import { fetchAlternativeLocations } from '../api/mapApi';
import type { AlternativeLocation } from '../types/map';
import type { PlaceMarker } from '../types/congestion';

type AlternativeState = {
  sourceMarker: PlaceMarker;
  locations: AlternativeLocation[];
} | null;

const HomePage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [alternativeState, setAlternativeState] = useState<AlternativeState>(null);

  const handleAlternativeRequest = useCallback(async (sourceMarker: PlaceMarker) => {
    const locations = await fetchAlternativeLocations(sourceMarker.areaCode).catch(() => []);
    setAlternativeState({ sourceMarker, locations });
  }, []);

  const handleAlternativeClose = useCallback(() => {
    setAlternativeState(null);
  }, []);

  return (
    <div className="flex flex-col w-full h-dvh">
      <Header />
      <div className="relative flex-1 overflow-hidden">
        <KakaoMap
          selectedCategory={selectedCategory}
          alternativeLocations={alternativeState?.locations ?? []}
          sourceMarker={alternativeState?.sourceMarker ?? null}
          onAlternativeRequest={handleAlternativeRequest}
        />
        {alternativeState && (
          <AlternativeLocationBanner
            sourceName={alternativeState.sourceMarker.name}
            count={alternativeState.locations.length}
            onClose={handleAlternativeClose}
          />
        )}
        <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
        <MapControls onZoomIn={() => {}} onZoomOut={() => {}} onLocate={() => {}} />
        <CongestionLegend />
        <CongestionRankCard type="busiest" initialRatio={{ x: 1, y: 0.13 }} />
        <CongestionRankCard type="relaxed" initialRatio={{ x: 1, y: 0.4 }} />
      </div>
    </div>
  );
};

export default HomePage;
