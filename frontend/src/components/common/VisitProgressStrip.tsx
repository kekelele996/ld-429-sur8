import { Link } from 'react-router-dom';
import { useRecordVisit, useVisitProgress } from '../../hooks/useVisitProgress';
import type { Artwork } from '../../types';
import { StatusBadge } from './StatusBadge';

interface VisitProgressStripProps {
  artwork: Artwork;
  /** 在漫游页传入时，下一件作品改为切换当前作品而不是跳转详情页 */
  onSelectArtwork?: (artworkId: string) => void;
}

/**
 * 作品上的参观进度条：显示已看数量 / 总数与下一件作品。
 * 作品详情页与漫游信息卡共用；未开始 / 已结束的展览只提示可浏览，不记录进度。
 */
export function VisitProgressStrip({ artwork, onSelectArtwork }: VisitProgressStripProps) {
  useRecordVisit(artwork);
  const { exhibitionId, status, browseOnly, stops, viewedIds, viewedCount, totalCount, currentStop, nextStop } =
    useVisitProgress(artwork.id);

  // 作品不属于当前选定展览的参观清单时不展示进度
  if (!exhibitionId || !currentStop) return null;

  const alreadyViewed = viewedIds.has(artwork.id);

  const renderNext = () => {
    if (!nextStop) {
      return <span className="text-xs text-moss">这是最后一件，全部作品已看完。</span>;
    }
    const label = `下一件：${nextStop.order}/${totalCount} ${nextStop.artwork.title}`;
    if (onSelectArtwork) {
      return (
        <button
          type="button"
          className="focus-ring text-xs text-[var(--color-accent)] underline-offset-2 hover:underline"
          onClick={() => onSelectArtwork(nextStop.artwork.id)}
        >
          {label}
        </button>
      );
    }
    return (
      <Link className="focus-ring text-xs text-[var(--color-accent)] underline-offset-2 hover:underline" to={`/artwork/${nextStop.artwork.id}`}>
        {label} →
      </Link>
    );
  };

  return (
    <div className="mt-4 border-t border-[var(--color-line)] pt-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-[var(--color-muted)]">
          第 {currentStop.order}/{totalCount} 件 · {currentStop.room.name}
        </span>
        <StatusBadge status={status} />
      </div>
      <div className="mt-2 h-1.5 w-full bg-black/10">
        <div className="h-full bg-moss transition-all" style={{ width: `${totalCount ? (viewedCount / totalCount) * 100 : 0}%` }} />
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="text-xs">
          已看 <strong>{viewedCount}</strong> / {totalCount} 件
          {alreadyViewed && <span className="ml-2 text-[var(--color-muted)]">（本件已看，不重复计数）</span>}
        </span>
        {browseOnly ? <span className="text-xs text-[var(--color-muted)]">浏览模式，进度不计入</span> : renderNext()}
      </div>
    </div>
  );
}
