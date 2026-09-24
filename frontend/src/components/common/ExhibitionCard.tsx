import { useNavigate } from 'react-router-dom';
import type { Exhibition } from '../../types';
import { ExhibitionStatus } from '../../types/enums';
import { useArtworkStore } from '../../stores/artworkStore';
import { useRoomStore } from '../../stores/roomStore';
import { useExhibitionStore } from '../../stores/exhibitionStore';
import { useVisitProgressStore } from '../../stores/visitProgressStore';
import { buildVisitStops } from '../../utils/visitPlan';
import { StatusBadge } from './StatusBadge';

export function ExhibitionCard({ exhibition }: { exhibition: Exhibition }) {
  const navigate = useNavigate();
  const enterExhibition = useExhibitionStore((state) => state.enterExhibition);
  const rooms = useRoomStore((state) => state.rooms);
  const artworks = useArtworkStore((state) => state.artworks);
  const viewedIds = useVisitProgressStore(
    (state) => state.progress[exhibition.id]?.viewedArtworkIds ?? [],
  );

  const stops = buildVisitStops(exhibition, rooms, artworks);
  const totalCount = stops.length;
  const viewedSet = new Set(viewedIds);
  const viewedCount = stops.filter((stop) => viewedSet.has(stop.artwork.id)).length;
  const inProgress = viewedCount > 0 && viewedCount < totalCount;
  const finished = totalCount > 0 && viewedCount === totalCount;
  const browseOnly = exhibition.status !== ExhibitionStatus.Active;

  const handleEnter = () => {
    // 从展览卡进入即选定该展（并定位到第一个展厅），再进入漫游
    enterExhibition(exhibition.id);
    navigate('/gallery');
  };

  return (
    <article className="group border border-[var(--color-line)] bg-[var(--color-panel)]">
      <button type="button" onClick={handleEnter} className="block w-full text-left focus-ring">
        <img
          src={exhibition.coverUrl}
          alt={exhibition.title}
          className="aspect-[16/9] w-full object-cover grayscale-[20%] transition group-hover:grayscale-0"
        />
        <div className="p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-[var(--color-muted)]">策展人：{exhibition.curator}</p>
            <StatusBadge status={exhibition.status} />
          </div>
          <h3 className="mt-4 text-3xl font-semibold">{exhibition.title}</h3>
          <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">{exhibition.description}</p>
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-[var(--color-line)] pt-3 text-xs">
            <span className="text-[var(--color-muted)]">
              {exhibition.roomIds.length} 个展厅 · {totalCount} 件作品，从「
              {rooms.find((room) => room.id === exhibition.roomIds[0])?.name ?? '第一展厅'}」开始
            </span>
            {browseOnly ? (
              <span className="shrink-0 uppercase tracking-[0.16em] text-[var(--color-muted)]">仅浏览 · 不记录进度</span>
            ) : finished ? (
              <span className="shrink-0 text-moss">已看完 · 点击可重游</span>
            ) : inProgress ? (
              <span className="shrink-0 text-[var(--color-accent)]">
                继续参观：已看 {viewedCount}/{totalCount}
              </span>
            ) : (
              <span className="shrink-0 uppercase tracking-[0.16em] text-[var(--color-accent)]">开始参观 →</span>
            )}
          </div>
        </div>
      </button>
    </article>
  );
}
