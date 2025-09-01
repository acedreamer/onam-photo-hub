import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/SessionContext';
import { showError, showSuccess } from '@/utils/toast';
import type { Photo } from '@/stores/galleryStore';

// Helper function to optimistically update a photo in the React Query cache
const updatePhotoInQueryData = (
  queryClient: QueryClient,
  photoId: string,
  updateFn: (photo: Photo) => Partial<Photo>
) => {
  queryClient.setQueriesData({ queryKey: ['photos'] }, (oldData: any) => {
    if (!oldData || !oldData.pages) return oldData;

    return {
      ...oldData,
      pages: oldData.pages.map((page: any) => ({
        ...page,
        data: page.data.map((photo: Photo) =>
          photo.id === photoId ? { ...photo, ...updateFn(photo) } : photo
        ),
      })),
    };
  });
};

export const usePhotoMutations = () => {
  const queryClient = useQueryClient();
  const { user } = useSession();

  const toggleLikeMutation = useMutation({
    mutationFn: async ({ photoId, userHasLiked }: { photoId: string; userHasLiked: boolean }) => {
      if (!user) throw new Error('User not authenticated');
      if (userHasLiked) {
        const { error } = await supabase.from('likes').delete().match({ user_id: user.id, photo_id: photoId });
        if (error) throw error;
      } else {
        const { error } = await supabase.from('likes').insert({ user_id: user.id, photo_id: photoId });
        if (error) throw error;
      }
    },
    onMutate: async ({ photoId }) => {
      await queryClient.cancelQueries({ queryKey: ['photos'] });
      const previousPhotos = queryClient.getQueriesData({ queryKey: ['photos'] });

      updatePhotoInQueryData(queryClient, photoId, (photo) => ({
        user_has_liked: !photo.user_has_liked,
        likes: photo.user_has_liked ? photo.likes - 1 : photo.likes + 1,
      }));

      return { previousPhotos };
    },
    onError: (err, variables, context) => {
      showError('Could not update like.');
      if (context?.previousPhotos) {
        queryClient.setQueriesData({ queryKey: ['photos'] }, context.previousPhotos);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['photos'] });
    },
  });

  const removePhotoMutation = useMutation({
    mutationFn: async ({ photoId, cloudinaryPublicId }: { photoId: string; cloudinaryPublicId: string }) => {
        const { error: functionError } = await supabase.functions.invoke('cloudinary-delete', {
            body: { public_id: cloudinaryPublicId },
        });
        if (functionError) throw new Error(`Cloudinary delete failed: ${functionError.message}`);

        const { error: dbError } = await supabase.from('photos').delete().match({ id: photoId });
        if (dbError) throw dbError;
    },
    onSuccess: () => {
        showSuccess("Photo deleted by admin.");
        queryClient.invalidateQueries({ queryKey: ['photos'] });
    },
    onError: (error: any) => {
        showError(`Could not delete photo: ${error.message}`);
    }
  });

  return { toggleLikeMutation, removePhotoMutation };
};