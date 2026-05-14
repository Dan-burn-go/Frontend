import { ExternalLink } from 'lucide-react';
import type { CultureEvent } from '../../types/map';

interface Props {
  event: CultureEvent;
}

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};

const CultureEventCard = ({ event }: Props) => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col">
      <div className="h-36 bg-gray-100 overflow-hidden shrink-0">
        <img
          src={event.mainImg}
          alt={event.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.visibility = 'hidden';
          }}
        />
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <span className="text-xs text-blue-500 bg-blue-50 rounded-full px-2.5 py-0.5 w-fit">
          {event.codename}
        </span>
        <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
          {event.title}
        </p>
        <p className="text-xs text-gray-400">{event.place}</p>
        <p className="text-xs text-gray-500">
          {formatDate(event.startDate)} ~ {formatDate(event.endDate)}
        </p>
        {event.useFee && <p className="text-xs text-gray-500">요금: {event.useFee}</p>}
        <a
          href={event.orgLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto pt-2 flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 transition-colors w-fit"
        >
          자세히 보기
          <ExternalLink size={11} />
        </a>
      </div>
    </div>
  );
};

export default CultureEventCard;
