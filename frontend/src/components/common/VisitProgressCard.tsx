import { Link } from 'react-router-dom';
import type { Artwork, Exhibition } from '../../types';
import { StatusBadge } from './StatusBadge';

interface VisitProgressCardProps {
  exhibition: Exhibition;
  viewedCount: number;
  totalCount: number;
  nextArtwork?: Artwork;
  trackable: boolean;
}

export function VisitProgressCard({ exhibition, viewedCount, totalCount, nextArtwork, trackable }: VisitProgressCardProps) {
  const percent = totalCount === 0 ? 0 : Math.round((viewedCount / totalCount) * 100);
  return (
    <section className="panel p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-muted)]">参观进度</p>
        <StatusBadge status={exhibition.status} />
      </div>
      <h3 className="mt-2 text-xl font-semibold">{exhibition.title}</h3>
      <div className="mt-4 flex items-baseline justify-between text-sm">
        <span>
          已看 <strong className="text-lg">{viewedCount}</strong> / 共 {totalCount} 件
        </span>
        <span className="text-[var(--color-muted)]">{percent}%</span>
      </div>
      <div className="mt-2 h-1.5 border border-[var(--color-line)] bg-[var(--color-bg)]">
        <div className="h-full bg-[var(--color-accent)]" style={{ width: `${percent}%` }} />
      </div>
      {trackable ? (
        <p className="mt-4 text-sm">
          {nextArtwork ? (
            <>
              下一件：
              <Link className="font-semibold underline underline-offset-4 hover:text-[var(--color-accent)]" to={`/artwork/${nextArtwork.id}`}>
                {nextArtwork.title}
              </Link>
              <span className="text-[var(--color-muted)]"> · {nextArtwork.artistName}</span>
            </>
          ) : (
            '全部作品都已看完，可以去看看别的展览。'
          )}
        </p>
      ) : (
        <p className="mt-4 text-sm text-[var(--color-muted)]">本场展览仅可浏览，参观不记录进度。</p>
      )}
    </section>
  );
}
