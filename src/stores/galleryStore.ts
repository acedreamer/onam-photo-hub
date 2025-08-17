import { create } from 'zustand';

export type Photo = {
  id: string;
  src: string;
  caption: string;
  category: string;
};

type GalleryState = {
  photos: Photo[];
  addPhoto: (photo: Photo) => void;
};

export const useGalleryStore = create<GalleryState>((set) => ({
  photos: [],
  addPhoto: (photo) => set((state) => ({ photos: [photo, ...state.photos] })),
}));