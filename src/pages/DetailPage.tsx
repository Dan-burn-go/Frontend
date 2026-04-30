import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Users, Clock } from 'lucide-react';
import Header from '../components/layout/Header';
import { fetchCongestionByAreaCode } from '../api/congestionApi';
import { LOCATION_MAP } from '../data/locations';
import { CATEGORY_LABELS } from '../data/categories';
import { CONGESTION_COLORS, CONGESTION_LABELS, CONGESTION_LEVEL_MAP } from '../types/congestion';
import type { CongestionData, PlaceMarker } from '../types/congestion';

const DetailPage = () => {
  const { placeId } = useParams<{ placeId: string }>();
  const navigate = useNavigate();
  const { state } = useLocation() as { state: { marker?: PlaceMarker } | null };
  const [data, setData] = useState<CongestionData | null>(null);
  const [loading, setLoading] = useState(!state?.marker);

  const placeInfo = placeId ? LOCATION_MAP.get(placeId) : null;
  const hasMarkerState = !!state?.marker;

  useEffect(() => {
    if (!placeId || hasMarkerState) return;
    fetchCongestionByAreaCode(placeId)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [placeId, hasMarkerState]);

  const marker = state?.marker ?? null;
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
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{placeInfo.name}</h1>
                <div className="flex gap-1.5 mt-2">
                  <span className="text-xs text-gray-500 bg-gray-100 rounded-full px-2.5 py-1">
                    {CATEGORY_LABELS[placeInfo.category]}
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
        )}
      </div>
    </div>
  );
};

export default DetailPage;
