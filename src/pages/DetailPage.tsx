import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { CaretLeftIcon } from '@phosphor-icons/react';
import Header from '../components/layout/Header';
import CongestionHeroCard from '../components/detail/CongestionHeroCard';
import AiInsightCard from '../components/detail/AiInsightCard';
import CultureEventsSection from '../components/detail/CultureEventsSection';
import LocationSection from '../components/detail/LocationSection';
import AlternativePlacesSidebar from '../components/detail/AlternativePlacesSidebar';
import CongestionTrendSection from '../components/detail/CongestionTrendSection';
import { fetchCongestionByAreaCode } from '../api/congestionApi';
import { LOCATION_MAP } from '../data/locations';
import { CONGESTION_COLORS, CONGESTION_LEVEL_MAP } from '../types/congestion';
import type { CongestionData, PlaceMarker } from '../types/congestion';

const DetailPage = () => {
  const { placeId } = useParams<{ placeId: string }>();
  const navigate = useNavigate();
  const { state } = useLocation();
  const locationState = state as { marker?: PlaceMarker } | null;
  const [data, setData] = useState<CongestionData | null>(null);
  const [loading, setLoading] = useState(!locationState?.marker);

  const placeInfo = placeId ? LOCATION_MAP.get(placeId) : null;
  const hasMarkerState = !!locationState?.marker;

  useEffect(() => {
    if (!placeId || hasMarkerState) return;
    fetchCongestionByAreaCode(placeId)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [placeId, hasMarkerState]);

  const marker = locationState?.marker ?? null;
  const congestionLevel = marker
    ? marker.congestionLevel
    : data
      ? CONGESTION_LEVEL_MAP[data.congestionLevel]
      : null;
  const color = congestionLevel ? CONGESTION_COLORS[congestionLevel] : '#9ca3af';
  const avgPeople = marker
    ? Math.round((marker.minPeopleCount + marker.maxPeopleCount) / 2)
    : data
      ? Math.round((data.minPeopleCount + data.maxPeopleCount) / 2)
      : 0;
  const populationTime = marker?.populationTime ?? data?.populationTime ?? '';
  const congestionMessage = marker?.congestionMessage ?? data?.congestionMessage ?? '';

  const isUnavailable = !loading && ((!marker && !data) || !placeInfo);
  const isReady = !loading && (marker || data) && placeInfo && congestionLevel;

  return (
    <div className="flex flex-col w-full min-h-dvh bg-slate-50">
      <Header onSearchSelect={(areaCode) => navigate(`/place/${areaCode}`)} />
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-6">
        <button
          onClick={() => navigate('/')}
          className="cursor-pointer group flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-6 transition-colors"
        >
          <CaretLeftIcon
            weight="fill"
            size={16}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          Back to Map
        </button>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0 space-y-6">
            {loading && <div className="bg-white rounded-2xl p-6 shadow-sm animate-pulse h-44" />}

            {isUnavailable && (
              <div className="bg-white rounded-2xl p-6 shadow-sm text-center text-slate-400">
                장소 정보를 불러올 수 없어요.
              </div>
            )}

            {isReady && placeInfo && congestionLevel && (
              <CongestionHeroCard
                placeInfo={placeInfo}
                congestionLevel={congestionLevel}
                color={color}
                avgPeople={avgPeople}
                populationTime={populationTime}
                congestionMessage={congestionMessage}
              />
            )}

            {placeInfo && placeId && <CongestionTrendSection areaCode={placeId} />}

            {placeInfo && placeId && congestionLevel === 'CROWDED' && (
              <AiInsightCard areaCode={placeId} />
            )}

            {placeInfo && (
              <CultureEventsSection
                latitude={placeInfo.latitude}
                longitude={placeInfo.longitude}
              />
            )}

            {placeInfo && (
              <LocationSection
                latitude={placeInfo.latitude}
                longitude={placeInfo.longitude}
                color={color}
              />
            )}
          </div>

          {placeInfo && placeId && congestionLevel !== 'QUIET' && (
            <AlternativePlacesSidebar areaCode={placeId} />
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailPage;
