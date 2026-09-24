import { useEffect } from 'react';
import { useArtworkStore } from '../stores/artworkStore';
import { useExhibitionStore } from '../stores/exhibitionStore';
import { useRoomStore } from '../stores/roomStore';
import { useVisitProgressStore } from '../stores/visitProgressStore';
import { ExhibitionStatus } from '../types/enums';
import type { Artwork } from '../types';
import { buildVisitStops, getNextStop, groupVisitStops, type VisitGroup, type VisitStop } from '../utils/visitPlan';

export interface VisitProgressApi {
  exhibitionId: string;
  status: ExhibitionStatus;
  /** 是否只可浏览（未开始 / 已结束的展览不记录进度） */
  browseOnly: boolean;
  stops: VisitStop[];
  groups: VisitGroup[];
  viewedIds: Set<string>;
  viewedCount: number;
  totalCount: number;
  /** 当前作品在清单中的节点（可能不在清单中） */
  currentStop?: VisitStop;
  /** 下一件作品节点 */
  nextStop?: VisitStop;
  /** 作品是否属于当前展览的参观清单 */
  isInPlan: (artworkId: string) => boolean;
}

/** 组装当前选定展览的参观清单、已看进度与下一件作品 */
export function useVisitProgress(currentArtworkId?: string): VisitProgressApi {
  const exhibitions = useExhibitionStore((state) => state.exhibitions);
  const activeExhibitionId = useExhibitionStore((state) => state.activeExhibitionId);
  const rooms = useRoomStore((state) => state.rooms);
  const artworks = useArtworkStore((state) => state.artworks);
  const progress = useVisitProgressStore((state) => state.progress);

  const exhibition = exhibitions.find((item) => item.id === activeExhibitionId);
  const stops = exhibition ? buildVisitStops(exhibition, rooms, artworks) : [];
  const groups = groupVisitStops(stops);
  const viewedIds = new Set(exhibition ? progress[exhibition.id]?.viewedArtworkIds ?? [] : []);
  const currentStop = stops.find((stop) => stop.artwork.id === currentArtworkId);

  return {
    exhibitionId: exhibition?.id ?? '',
    status: exhibition?.status ?? ExhibitionStatus.Active,
    browseOnly: exhibition ? exhibition.status !== ExhibitionStatus.Active : true,
    stops,
    groups,
    viewedIds,
    viewedCount: stops.filter((stop) => viewedIds.has(stop.artwork.id)).length,
    totalCount: stops.length,
    currentStop,
    nextStop: getNextStop(stops, currentArtworkId),
    isInPlan: (artworkId) => stops.some((stop) => stop.artwork.id === artworkId),
  };
}

/**
 * 打开作品时记录已看（作品详情与漫游信息卡共用）：
 * 只记录当前进行中展览清单内的作品，同一件重复打开不增加数量。
 */
export function useRecordVisit(artwork?: Artwork): void {
  const markArtworkViewed = useVisitProgressStore((state) => state.markArtworkViewed);
  const { exhibitionId, status, browseOnly, stops } = useVisitProgress(artwork?.id);

  const artworkId = artwork?.id;
  const inPlan = Boolean(artworkId && stops.some((stop) => stop.artwork.id === artworkId));

  useEffect(() => {
    if (!artworkId || browseOnly || !inPlan || !exhibitionId) return;
    markArtworkViewed(exhibitionId, artworkId, status);
  }, [artworkId, browseOnly, inPlan, exhibitionId, status, markArtworkViewed]);
}
