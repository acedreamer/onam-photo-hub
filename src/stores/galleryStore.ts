import { create } from 'zustand';

type SortByType = 'created_at' | 'likes';

type GalleryFilterState = {
  filterCategory: string;
  sortBy: SortByType;
  setFilterCategory: (category: string) => void;
  setSortBy: (sortBy: SortByType) => void;
};

export const useGalleryStore = create<GalleryFilterState>((set) => ({
  filterCategory: 'All',
  sortBy: 'created_at',
  setFilterCategory: (category) => set({ filterCategory: category }),
  setSortBy: (sortBy) => set({ sortBy }),
}));

// Export types to be used across the application
export type Profile = {
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
};

export type Photo = {
  id: string;
  user_id: string;
  image_url: string;
  caption: string | null;
  category: string;
  likes: number;
  created_at: string;
  cloudinary_public_id: string | null;
  allow_download: boolean;
  user_has_liked?: boolean;
  profiles: Profile | null;
};