import { useState, useCallback, useMemo } from 'react';
import KakaoMap from '../components/map/KakaoMap';
import Header from '../components/layout/Header';
import CategoryFilter from '../components/filter/CategoryFilter';
import MapControls from '../components/map/MapControls';
import CongestionLegend from '../components/congestion/CongestionLegend';
import CongestionRankCard from '../components/congestion/CongestionRankCard';
import RankingBottomSheet from '../components/congestion/RankingBottomSheet';
import AlternativeLocationBanner from '../components/map/AlternativeLocationBanner';
import { useMapControls } from '../hooks/useMapControls';
import { useTopRankings } from '../hooks/useTopRankings';
import { useAlternativeLocations } from '../hooks/useAlternativeLocations';
import { LOCATION_MAP } from '../data/locations';
import type { AlternativeLocation } from '../types/map';
import type { PlaceMarker } from '../types/congestion';

type AlternativeState = {
  sourceMarker: PlaceMarker;
  locations: AlternativeLocation[];
} | null;

const HomePage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSourceMarker, setSelectedSourceMarker] = useState<PlaceMarker | null>(null);
  const [searchFocus, setSearchFocus] = useState<{ areaCode: string; nonce: number } | null>(null);
  const { setMap, zoomIn, zoomOut, locate, panTo, userLocation } = useMapControls();
  // top3 랭킹은 한 번만 fetch해서 데스크탑 카드 2개와 모바일 바텀시트가 같이 사용.
  // 각 컴포넌트가 자체 fetch하면 동일 endpoint를 4번 호출하게 됨.
  const rankings = useTopRankings(3);

  // 마커 클릭 시점에 1회 fetch가 아니라 hook 안에서 폴링하도록 위임해, 사용자가 카드를
  // 띄워둔 동안 백엔드 갱신(5분)을 따라잡는다. 응답 스키마에 시각 정보가 없어 hook 내부는
  // adaptive가 아닌 5분 고정 폴링으로 fallback.
  const altResult = useAlternativeLocations(selectedSourceMarker?.areaCode ?? null);

  const alternativeState = useMemo<AlternativeState>(() => {
    if (!selectedSourceMarker) return null;
    if (altResult.status !== 'success') return null;
    return { sourceMarker: selectedSourceMarker, locations: altResult.data };
  }, [selectedSourceMarker, altResult]);

  const handleSearchSelect = useCallback(
    (areaCode: string) => {
      const loc = LOCATION_MAP.get(areaCode);
      if (loc) panTo(loc.latitude, loc.longitude);
      setSelectedCategory('all');
      setSelectedSourceMarker(null);
      setSearchFocus({ areaCode, nonce: Date.now() });
    },
    [panTo],
  );

  const handleAlternativeRequest = useCallback((sourceMarker: PlaceMarker) => {
    setSelectedSourceMarker(sourceMarker);
  }, []);

  const handleAlternativeClose = useCallback(() => {
    setSelectedSourceMarker(null);
  }, []);

  return (
    <div className="flex flex-col w-full h-dvh">
      <Header onSearchSelect={handleSearchSelect} />
      <div className="relative flex-1 overflow-hidden">
        <KakaoMap
          selectedCategory={selectedCategory}
          alternativeLocations={alternativeState?.locations ?? []}
          sourceMarker={alternativeState?.sourceMarker ?? null}
          onAlternativeRequest={handleAlternativeRequest}
          onMapReady={setMap}
          userLocation={userLocation}
          bounceTarget={searchFocus}
        />
        {alternativeState && (
          <AlternativeLocationBanner
            sourceName={alternativeState.sourceMarker.name}
            count={alternativeState.locations.length}
            onClose={handleAlternativeClose}
          />
        )}
        <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
        <MapControls onZoomIn={zoomIn} onZoomOut={zoomOut} onLocate={locate} />
        <CongestionLegend />
        <CongestionRankCard
          type="busiest"
          initialRatio={{ x: 1, y: 0.13 }}
          entries={rankings.busiest}
          loading={rankings.loading}
          error={rankings.error}
        />
        <CongestionRankCard
          type="relaxed"
          initialRatio={{ x: 1, y: 0.4 }}
          entries={rankings.relaxed}
          loading={rankings.loading}
          error={rankings.error}
        />
        <RankingBottomSheet
          busiest={rankings.busiest}
          relaxed={rankings.relaxed}
          loading={rankings.loading}
          error={rankings.error}
        />
      </div>
    </div>
  );
};

export default HomePage;
