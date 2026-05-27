import { useState } from 'react';
import { useCultureEvents } from '../../hooks/useCultureEvents';
import CultureEventCard from '../culture/CultureEventCard';
import SectionHeader from './SectionHeader';

const EVENTS_PREVIEW = 6;

interface Props {
  latitude: number;
  longitude: number;
}

const CultureEventsSection = ({ latitude, longitude }: Props) => {
  const state = useCultureEvents(latitude, longitude);
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <SectionHeader title="주변 행사/문화 정보" className="mb-4" />
      {state.status === 'loading' && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm animate-pulse h-56" />
          ))}
        </div>
      )}
      {state.status === 'error' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm text-center text-slate-400 text-sm">
          행사 정보를 불러올 수 없어요.
        </div>
      )}
      {state.status === 'success' && state.data.length === 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm text-center text-slate-400 text-sm">
          주변 행사/문화 정보가 없어요.
        </div>
      )}
      {state.status === 'success' && state.data.length > 0 && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {(expanded ? state.data : state.data.slice(0, EVENTS_PREVIEW)).map((event) => (
              <CultureEventCard key={event.orgLink} event={event} />
            ))}
          </div>
          {!expanded && state.data.length > EVENTS_PREVIEW && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="cursor-pointer mt-6 mx-auto block text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
            >
              +{state.data.length - EVENTS_PREVIEW}개 더 보기
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default CultureEventsSection;
