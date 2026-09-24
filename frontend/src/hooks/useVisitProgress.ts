import { useEffect, useMemo } from 'react';
import { useArtworkStore } from '../stores/artworkStore';
import { useExhibitionStore } from '../stores/exhibitionStore';
import { useProgressStore } from '../stores/progressStore';
import { buildExhibitionArtworkList, canTrackProgress, getNextArtwork } from '../utils/exhibitionProgress';

/** 汇总当前选定展览的参观进度：已看数量、总数、下一件作品。 */
export const useVisitProgress = () => {
  const exhibitions = useExhibitionStore((state) => state.exhibitions);
  const artworks = useArtworkStore((state) => state.artworks);
  const activeExhibitionId = useProgressStore((state) => state.activeExhibitionId);
  const viewedByExhibition = useProgressStore((state) => state.viewedByExhibition);

  return useMemo(() => {
    const exhibition = exhibitions.find((item) => item.id === activeExhibitionId);
    if (!exhibition) return null;
    const orderedArtworks = buildExhibitionArtworkList(exhibition, artworks);
    const orderedIds = new Set(orderedArtworks.map((artwork) => artwork.id));
    const viewedIds = (viewedByExhibition[exhibition.id] ?? []).filter((id) => orderedIds.has(id));
    return {
      exhibition,
      orderedArtworks,
      viewedIds,
      viewedCount: viewedIds.length,
      totalCount: orderedArtworks.length,
      nextArtwork: getNextArtwork(orderedArtworks, viewedIds),
      trackable: canTrackProgress(exhibition),
    };
  }, [artworks, exhibitions, activeExhibitionId, viewedByExhibition]);
};

/** 打开作品（详情页或漫游信息卡）时记录已看，重复打开不重复计数。 */
export const useRecordArtworkView = (artworkId?: string) => {
  const markArtworkViewed = useProgressStore((state) => state.markArtworkViewed);

  useEffect(() => {
    if (artworkId) markArtworkViewed(artworkId);
  }, [artworkId, markArtworkViewed]);
};
