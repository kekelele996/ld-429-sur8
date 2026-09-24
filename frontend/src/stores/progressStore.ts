import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ExhibitionStatus } from '../types/enums';
import { exhibitions } from '../api/mockGallery';
import { useArtworkStore } from './artworkStore';
import { useExhibitionStore } from './exhibitionStore';
import { buildExhibitionArtworkList, canTrackProgress } from '../utils/exhibitionProgress';

interface ProgressState {
  /** 当前选定参观的展览，从展览卡进入时更新。 */
  activeExhibitionId: string;
  /** 每个展览各自累计的已看作品（有序、去重）。 */
  viewedByExhibition: Record<string, string[]>;
  selectExhibition: (exhibitionId: string) => void;
  markArtworkViewed: (artworkId: string) => void;
}

const defaultExhibitionId = exhibitions.find((item) => item.status === ExhibitionStatus.Active)?.id ?? '';

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      activeExhibitionId: defaultExhibitionId,
      viewedByExhibition: {},
      selectExhibition: (exhibitionId) => set({ activeExhibitionId: exhibitionId }),
      markArtworkViewed: (artworkId) => {
        const { activeExhibitionId, viewedByExhibition } = get();
        const exhibition = useExhibitionStore.getState().exhibitions.find((item) => item.id === activeExhibitionId);
        // 未开始 / 已结束的展览只允许浏览，不改变进度
        if (!exhibition || !canTrackProgress(exhibition)) return;
        const ordered = buildExhibitionArtworkList(exhibition, useArtworkStore.getState().artworks);
        if (!ordered.some((artwork) => artwork.id === artworkId)) return;
        const viewed = viewedByExhibition[activeExhibitionId] ?? [];
        // 同一件作品重复打开不增加数量
        if (viewed.includes(artworkId)) return;
        set({ viewedByExhibition: { ...viewedByExhibition, [activeExhibitionId]: [...viewed, artworkId] } });
      },
    }),
    { name: 'gallery-visit-progress' },
  ),
);
