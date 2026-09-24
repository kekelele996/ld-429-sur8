import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { ExhibitionStatus } from '../types/enums';
import type { ProgressMap } from '../types';

interface VisitProgressState {
  /** 按展览 ID 索引的参观进度 */
  progress: ProgressMap;
  /**
   * 记录一次作品查看：同一件重复打开不会增加数量。
   * 只有进行中的展览允许改变进度，未开始 / 已结束的展览只可浏览。
   */
  markArtworkViewed: (exhibitionId: string, artworkId: string, status: ExhibitionStatus) => void;
  /** 清空某场展览的参观进度（重新开始） */
  resetProgress: (exhibitionId: string) => void;
}

export const useVisitProgressStore = create<VisitProgressState>()(
  persist(
    (set) => ({
      progress: {},
      markArtworkViewed: (exhibitionId, artworkId, status) => {
        if (status !== ExhibitionStatus.Active || !exhibitionId) return;
        set((state) => {
          const record = state.progress[exhibitionId] ?? { exhibitionId, viewedArtworkIds: [], updatedAt: '' };
          if (record.viewedArtworkIds.includes(artworkId)) {
            // 已看过的作品重复打开：不增加数量，也不更新数据
            return state;
          }
          return {
            progress: {
              ...state.progress,
              [exhibitionId]: {
                exhibitionId,
                viewedArtworkIds: [...record.viewedArtworkIds, artworkId],
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },
      resetProgress: (exhibitionId) =>
        set((state) => {
          if (!state.progress[exhibitionId]) return state;
          const progress = { ...state.progress };
          delete progress[exhibitionId];
          return { progress };
        }),
    }),
    {
      name: 'virtual-gallery-visit-progress',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ progress: state.progress }),
    },
  ),
);
