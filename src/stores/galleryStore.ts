import { create } from 'zustand';

export type Photo = {
  id: string;
  src: string;
  caption: string;
  category: string;
  createdAt: string;
  likes: number;
};

type GalleryState = {
  photos: Photo[];
  addPhoto: (photo: Photo) => void;
  addPhotos: (photos: Photo[]) => void;
  addLike: (photoId: string) => void;
};

export const useGalleryStore = create<GalleryState>((set) => ({
  photos: [],
  addPhoto: (photo) => set((state) => ({ photos: [photo, ...state.photos] })),
  addPhotos: (newPhotos) => set((state) => ({ photos: [...newPhotos.reverse(), ...state.photos] })),
  addLike: (photoId) => set((state) => ({
    photos: state.photos.map((photo) =>
      photo.id === photoId ? { ...photo, likes: (photo.likes || 0) + 1 } : photo
    ),
  })),
}));