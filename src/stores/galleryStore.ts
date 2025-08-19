import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';

const PHOTOS_PER_PAGE = 12;

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
  user_has_liked?: boolean;
  profiles: Profile | null;
};

type SortByType = 'created_at' | 'likes';

type GalleryState = {
  photos: Photo[];
  page: number;
  hasMore: boolean;
  loading: boolean;
  filterCategory: string;
  sortBy: SortByType;
  fetchPhotos: (userId: string) => Promise<void>;
  setFilterCategory: (category: string, userId: string) => void;
  setSortBy: (sortBy: SortByType, userId: string) => void;
  resetGallery: () => void;
  addPhoto: (photo: Photo) => void;
  toggleLike: (photoId: string, userId: string) => void;
  removePhoto: (photoId: string, cloudinaryPublicId: string) => Promise<void>;
};

export const useGalleryStore = create<GalleryState>((set, get) => ({
  photos: [],
  page: 0,
  hasMore: true,
  loading: false,
  filterCategory: 'All',
  sortBy: 'created_at',
  
  resetGallery: () => set({ photos: [], page: 0, hasMore: true, filterCategory: 'All', sortBy: 'created_at' }),

  setFilterCategory: (category, userId) => {
    set({ filterCategory: category, photos: [], page: 0, hasMore: true });
    get().fetchPhotos(userId);
  },

  setSortBy: (sortBy, userId) => {
    set({ sortBy, photos: [], page: 0, hasMore: true });
    get().fetchPhotos(userId);
  },

  fetchPhotos: async (currentUserId) => {
    const { loading, hasMore, page, filterCategory, sortBy } = get();
    if (loading || !hasMore) return;

    set({ loading: true });

    try {
      const from = page * PHOTOS_PER_PAGE;
      const to = from + PHOTOS_PER_PAGE - 1;

      let query = supabase
        .from("photos")
        .select("*, profiles(full_name, avatar_url)");

      if (filterCategory !== 'All') {
        query = query.eq('category', filterCategory);
      }
      
      query = query.order(sortBy, { ascending: false }).range(from, to);

      const { data: photosData, error: photosError } = await query;
      if (photosError) throw photosError;

      const { data: likesData, error: likesError } = await supabase
        .from("likes")
        .select("photo_id")
        .eq("user_id", currentUserId);

      if (likesError) throw likesError;
      const likedPhotoIds = new Set(likesData?.map(like => like.photo_id) || []);

      const newPhotosWithLikeStatus = (photosData || []).map(photo => ({
        ...photo,
        user_has_liked: likedPhotoIds.has(photo.id),
      }));

      set((state) => ({
        photos: [...state.photos, ...newPhotosWithLikeStatus],
        page: state.page + 1,
        hasMore: newPhotosWithLikeStatus.length === PHOTOS_PER_PAGE,
      }));
    } catch (error: any) {
      console.error("Error fetching photos:", error);
      const errorMessage = error.message || "Could not load more photos.";
      showError(errorMessage);
    } finally {
      set({ loading: false });
    }
  },
  addPhoto: (photo) => {
    const newPhoto = { ...photo, user_has_liked: false };
    set((state) => ({ photos: [newPhoto, ...state.photos] }));
  },
  toggleLike: async (photoId, userId) => {
    const { photos } = get();
    const photo = photos.find(p => p.id === photoId);
    if (!photo) return;

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
        const { error } = await supabase.from('likes').delete().match({ user_id: userId, photo_id: photoId });
        if (error) throw error;
      } else {
        const { error } = await supabase.from('likes').insert({ user_id: userId, photo_id: photoId });
        if (error) throw error;
      }
    } catch (error) {
      console.error("Failed to toggle like:", error);
      showError("Could not update like. Please try again.");
      set({ photos: photos.map(p => p.id === photoId ? originalPhotoState : p) });
    }
  },
  removePhoto: async (photoId, cloudinaryPublicId) => {
    if (!cloudinaryPublicId) {
      showError("Cannot delete this photo: Cloudinary ID is missing.");
      return;
    }

    const originalPhotos = get().photos;
    set((state) => ({
      photos: state.photos.filter((p) => p.id !== photoId),
    }));

    try {
      const { error: functionError } = await supabase.functions.invoke('cloudinary-delete', {
        body: { public_id: cloudinaryPublicId },
      });
      if (functionError) throw new Error(`Cloudinary delete failed: ${functionError.message}`);

      const { error: dbError } = await supabase.from('photos').delete().match({ id: photoId });
      if (dbError) throw dbError;

      showSuccess("Photo deleted by admin.");
    } catch (error: any) {
      console.error("Failed to delete photo:", error);
      showError(`Could not delete photo: ${error.message}`);
      set({ photos: originalPhotos });
    }
  },
}));