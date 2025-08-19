import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';

export type Photo = {
  id: string;
  user_id: string;
  image_url: string;
  caption: string | null;
  category: string;
  likes: number;
  created_at: string;
  user_has_liked?: boolean;
};

type GalleryState = {
  photos: Photo[];
  setPhotos: (photos: Photo[], likedPhotoIds: Set<string>) => void;
  addPhoto: (photo: Photo) => void;
  toggleLike: (photoId: string, userId: string) => void;
};

export const useGalleryStore = create<GalleryState>((set, get) => ({
  photos: [],
  setPhotos: (photos, likedPhotoIds) => {
    const photosWithLikeStatus = photos.map(photo => ({
      ...photo,
      user_has_liked: likedPhotoIds.has(photo.id),
    }));
    set({ photos: photosWithLikeStatus.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) });
  },
  addPhoto: (photo) => {
    const newPhoto = { ...photo, user_has_liked: false };
    set((state) => ({ photos: [newPhoto, ...state.photos] }));
  },
  toggleLike: async (photoId, userId) => {
    const { photos } = get();
    const photo = photos.find(p => p.id === photoId);
    if (!photo) return;

    // Optimistic UI update
    const originalPhotoState = { ...photo };
    const updatedPhotos = photos.map(p =>
      p.id === photoId
        ? {
            ...p,
            likes: p.user_has_liked ? p.likes - 1 : p.likes + 1,
            user_has_liked: !p.user_has_liked,
          }
        : p
    );
    set({ photos: updatedPhotos });

    try {
      if (originalPhotoState.user_has_liked) {
        // Unlike the photo
        const { error } = await supabase
          .from('likes')
          .delete()
          .match({ user_id: userId, photo_id: photoId });
        if (error) throw error;
      } else {
        // Like the photo
        const { error } = await supabase
          .from('likes')
          .insert({ user_id: userId, photo_id: photoId });
        if (error) throw error;
      }
    } catch (error) {
      console.error("Failed to toggle like:", error);
      showError("Could not update like. Please try again.");
      // Revert optimistic update on failure
      set({ photos: photos.map(p => p.id === photoId ? originalPhotoState : p) });
    }
  },
}));