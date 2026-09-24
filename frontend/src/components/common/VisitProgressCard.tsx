import { Link } from 'react-router-dom';
import { useExhibitionStore } from '../../stores/exhibitionStore';
import { useVisitProgressStore } from '../../stores/visitProgressStore';
import { useVisitProgress } from '../../hooks/useVisitProgress';
import { StatusBadge } from './StatusBadge';

interface VisitProgressCardProps {
  /** 当前打开的作品 ID（漫游页传入，用于高亮与就地切换） */
  currentArtworkId?: string;
  /** 漫游页传入后，清单条目改为就地切换作品 */
  onSelectArtwork?: (artworkId: string) => void;
}

/**
 * 整场展览的参观进度：按展厅顺序列出作品清单、已看 / 总数与下一件作品。
 * 未开始 / 已结束的展览只可浏览，清单可点但不记录进度。
 */
export function VisitProgressCard({ currentArtworkId, onSelectArtwork }: VisitProgressCardProps) {
  const exhibition = useExhibitionStore((state) =>
    state.exhibitions.find((item) => item.id === state.activeExhibitionId),
  );
  const resetProgress = useVisitProgressStore((state) => state.resetProgress);
  const { groups, viewedIds, viewedCount, totalCount, browseOnly, nextStop } = useVisitProgress(currentArtworkId);

  if (!exhibition || totalCount === 0) return null;

  const percent = Math.round((viewedCount / totalCount) * 100);
  const allViewed = viewedCount === totalCount;

  return (
    <article className="panel p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-muted)]">Visit progress</p>
          <h3 className="mt-1 text-lg font-semibold">{exhibition.title}</h3>
        </div>
        <StatusBadge status={exhibition.status} />
      </div>

      <div className="mt-3 h-1.5 w-full bg-black/10">
        <div className="h-full bg-moss transition-all" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-2 text-xs text-[var(--color-muted)]">
        已看 <strong className="text-[var(--color-ink)]">{viewedCount}</strong> / {totalCount} 件（{percent}%）
        {browseOnly && <> · 该展览当前仅可浏览，进度不计入</>}
      </p>

      <ol className="mt-3 space-y-3">
        {groups.map((group) => (
          <li key={group.room.id}>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
              展厅 {group.roomOrder} · {group.room.name}
            </p>
            <ul className="mt-1.5 space-y-1">
              {group.stops.map((stop) => {
                const viewed = viewedIds.has(stop.artwork.id);
                const active = stop.artwork.id === currentArtworkId;
                const label = (
                  <>
                    <span className={`mr-2 inline-block w-8 shrink-0 ${viewed ? 'text-moss' : 'text-[var(--color-muted)]'}`}>
                      {viewed ? '✓' : `${stop.order}.`}
                    </span>
                    <span className={viewed ? 'text-[var(--color-muted)] line-through decoration-moss/60' : ''}>
                      {stop.artwork.title}
                    </span>
                    <span className="ml-2 text-xs text-[var(--color-muted)]">{stop.artwork.artistName}</span>
                  </>
                );
                const className = `flex w-full items-center rounded-sm px-2 py-1 text-left text-sm ${
                  active ? 'bg-[var(--color-accent)]/10 font-semibold' : 'hover:bg-black/5'
                }`;
                return (
                  <li key={stop.artwork.id}>
                    {onSelectArtwork ? (
                      <button type="button" className={`focus-ring ${className}`} onClick={() => onSelectArtwork(stop.artwork.id)}>
                        {label}
                      </button>
                    ) : (
                      <Link className={`focus-ring ${className} block`} to={`/artwork/${stop.artwork.id}`}>
                        {label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ol>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-[var(--color-line)] pt-3">
        {allViewed ? (
          <span className="text-xs text-moss">恭喜，本场展览的作品已全部看完。</span>
        ) : nextStop ? (
          onSelectArtwork ? (
            <button
              type="button"
              className="focus-ring text-xs text-[var(--color-accent)] underline-offset-2 hover:underline"
              onClick={() => onSelectArtwork(nextStop.artwork.id)}
            >
              下一件：{nextStop.artwork.title}（{nextStop.room.name}）
            </button>
          ) : (
            <Link className="focus-ring text-xs text-[var(--color-accent)] underline-offset-2 hover:underline" to={`/artwork/${nextStop.artwork.id}`}>
              下一件：{nextStop.artwork.title}（{nextStop.room.name}） →
            </Link>
          )
        ) : (
          <span />
        )}
        {!browseOnly && viewedCount > 0 && (
          <button
            type="button"
            className="focus-ring text-xs text-[var(--color-muted)] underline-offset-2 hover:text-[var(--color-accent)] hover:underline"
            onClick={() => resetProgress(exhibition.id)}
          >
            重置进度
          </button>
        )}
      </div>
    </article>
  );
}
