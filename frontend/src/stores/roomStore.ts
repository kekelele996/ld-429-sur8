import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { GalleryRoom } from '../types';
import { rooms } from '../api/mockGallery';

interface RoomState {
  rooms: GalleryRoom[];
  selectedRoomId: string;
  updateWallColor: (roomId: string, color: string) => void;
  selectRoom: (roomId: string) => void;
}

export const useRoomStore = create<RoomState>()(
  persist(
    (set) => ({
      rooms,
      selectedRoomId: rooms[0]?.id ?? '',
      updateWallColor: (roomId, color) =>
        set((state) => ({
          rooms: state.rooms.map((room) => (room.id === roomId ? { ...room, wallColor: color } : room)),
        })),
      selectRoom: (roomId) => set({ selectedRoomId: roomId }),
    }),
    {
      name: 'virtual-gallery-selected-room',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ selectedRoomId: state.selectedRoomId }),
    },
  ),
);
