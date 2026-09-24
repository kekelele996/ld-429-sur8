import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Exhibition } from '../types';
import { exhibitions } from '../api/mockGallery';
import { useRoomStore } from './roomStore';

interface ExhibitionState {
  exhibitions: Exhibition[];
  activeExhibitionId: string;
  /** 从展览卡进入：选定该展，并把漫游定位到该展的第一个展厅 */
  setActiveExhibition: (id: string) => void;
  enterExhibition: (id: string) => void;
}

export const useExhibitionStore = create<ExhibitionState>()(
  persist(
    (set, get) => ({
      exhibitions,
      activeExhibitionId: exhibitions[0]?.id ?? '',
      setActiveExhibition: (id) => set({ activeExhibitionId: id }),
      enterExhibition: (id) => {
        const exhibition = get().exhibitions.find((item) => item.id === id);
        set({ activeExhibitionId: id });
        const firstRoomId = exhibition?.roomIds[0];
        if (firstRoomId) {
          useRoomStore.getState().selectRoom(firstRoomId);
        }
      },
    }),
    {
      name: 'virtual-gallery-active-exhibition',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ activeExhibitionId: state.activeExhibitionId }),
    },
  ),
);
