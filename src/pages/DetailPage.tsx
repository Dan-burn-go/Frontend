import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Users, Clock } from 'lucide-react';
import Header from '../components/layout/Header';
import CultureEventCard from '../components/culture/CultureEventCard';
import { fetchCongestionByAreaCode } from '../api/congestionApi';
import { useCultureEvents } from '../hooks/useCultureEvents';
import { LOCATION_MAP, getLocationImageUrl } from '../data/locations';
import { CATEGORY_NAMES } from '../data/categories';
import { CONGESTION_COLORS, CONGESTION_LABELS, CONGESTION_LEVEL_MAP } from '../types/congestion';
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

  const eventsState = useCultureEvents(placeInfo?.latitude ?? null, placeInfo?.longitude ?? null);

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

  return (
    <div className="flex flex-col w-full min-h-dvh bg-gray-50">
      <Header />
      <div className="max-w-5xl mx-auto w-full px-6 py-6">
        <button
          onClick={() => navigate('/')}
          className="cursor-pointer flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Map
        </button>

        {loading && <div className="bg-white rounded-2xl p-6 shadow-sm animate-pulse h-44" />}

        {!loading && ((!marker && !data) || !placeInfo) && (
          <div className="bg-white rounded-2xl p-6 shadow-sm text-center text-gray-400">
            장소 정보를 불러올 수 없어요.
          </div>
        )}

        {!loading && (marker || data) && placeInfo && congestionLevel && (
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
            <div className="relative bg-gray-100">
              <img
                src={getLocationImageUrl(placeInfo.name)}
                alt={placeInfo.name}
                className="w-full h-56 object-cover"
                onError={(e) => {
                  e.currentTarget.style.visibility = 'hidden';
                }}
              />
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{placeInfo.name}</h1>
                  <div className="flex gap-1.5 mt-2">
                    <span className="text-xs text-gray-500 bg-gray-100 rounded-full px-2.5 py-1">
                      {`#${CATEGORY_NAMES[placeInfo.category]}`}
                    </span>
                  </div>
                </div>
                <span
                  className="text-sm font-bold px-3 py-1.5 rounded-full text-white mt-1 shrink-0"
                  style={{ backgroundColor: color }}
                >
                  {CONGESTION_LABELS[congestionLevel]}
                </span>
              </div>

              {congestionMessage && (
                <p className="mt-4 text-sm text-gray-600 leading-relaxed">{congestionMessage}</p>
              )}

              <div className="flex gap-8 mt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Users size={18} className="text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Current Visitors</p>
                    <p className="text-xl font-bold text-gray-900">{avgPeople.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                    <Clock size={18} className="text-purple-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Updated</p>
                    <p className="text-sm font-medium text-gray-900">{populationTime}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {placeInfo && (
          <div className="mt-6">
            <h2 className="text-base font-bold text-gray-800 mb-3">주변 행사/문화 정보</h2>
            {eventsState.status === 'loading' && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl shadow-sm animate-pulse h-56" />
                ))}
              </div>
            )}
            {eventsState.status === 'error' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm text-center text-gray-400 text-sm">
                행사 정보를 불러올 수 없어요.
              </div>
            )}
            {eventsState.status === 'success' && eventsState.data.length === 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm text-center text-gray-400 text-sm">
                주변 행사/문화 정보가 없어요.
              </div>
            )}
            {eventsState.status === 'success' && eventsState.data.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {eventsState.data.map((event) => (
                  <CultureEventCard key={event.orgLink} event={event} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailPage;
