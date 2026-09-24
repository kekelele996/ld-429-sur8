import { Link } from 'react-router-dom';
import type { Exhibition } from '../../types';
import { useArtworkStore } from '../../stores/artworkStore';
import { useProgressStore } from '../../stores/progressStore';
import { useRoomStore } from '../../stores/roomStore';
import { buildExhibitionArtworkList, canTrackProgress } from '../../utils/exhibitionProgress';
import { StatusBadge } from './StatusBadge';

export function ExhibitionCard({ exhibition }: { exhibition: Exhibition }) {
  const artworks = useArtworkStore((state) => state.artworks);
  const selectExhibition = useProgressStore((state) => state.selectExhibition);
  const viewedCount = useProgressStore((state) => (state.viewedByExhibition[exhibition.id] ?? []).length);
  const selectRoom = useRoomStore((state) => state.selectRoom);

  const totalCount = buildExhibitionArtworkList(exhibition, artworks).length;
  const trackable = canTrackProgress(exhibition);

  const enterExhibition = () => {
    selectExhibition(exhibition.id);
    const firstRoomId = exhibition.roomIds[0];
    if (firstRoomId) selectRoom(firstRoomId);
  };

  return (
    <article className="group border border-[var(--color-line)] bg-[var(--color-panel)]">
      <Link to="/gallery" className="block focus-ring" onClick={enterExhibition}>
        <img src={exhibition.coverUrl} alt={exhibition.title} className="aspect-[16/9] w-full object-cover grayscale-[20%] transition group-hover:grayscale-0" />
        <div className="p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-[var(--color-muted)]">策展人：{exhibition.curator}</p>
            <StatusBadge status={exhibition.status} />
          </div>
          <h3 className="mt-4 text-3xl font-semibold">{exhibition.title}</h3>
          <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">{exhibition.description}</p>
          <p className="mt-4 text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
            {trackable ? `已看 ${viewedCount} / ${totalCount} 件` : '仅可浏览，不记录进度'}
          </p>
        </div>
      </Link>
    </article>
  );
}
