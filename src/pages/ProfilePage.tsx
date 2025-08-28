import { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { Photo, Profile } from '@/stores/galleryStore';
import { useSession } from '@/contexts/SessionContext';
import PhotoCard from '@/components/PhotoCard';
import PhotoDetail from '@/components/PhotoDetail';
import EditProfileDialog from '@/components/EditProfileDialog';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, Edit } from 'lucide-react';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { VirtuosoGrid } from 'react-virtuoso';
import { useIsMobile } from '@/hooks/use-mobile';

const PHOTOS_PER_PAGE = 12;

const fetchProfilePhotosPage = async ({ pageParam = 0, userId, currentUserId }: any) => {
  const from = pageParam * PHOTOS_PER_PAGE;
  const to = from + PHOTOS_PER_PAGE - 1;

  const { data: photosData, error: photosError } = await supabase
    .from('photos')
    .select('*, profiles(full_name, avatar_url)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to);
  if (photosError) throw photosError;

  const { data: likesData, error: likesError } = await supabase
    .from("likes")
    .select("photo_id")
    .eq("user_id", currentUserId);
  if (likesError) throw likesError;
  const likedPhotoIds = new Set(likesData?.map(like => like.photo_id) || []);

  const newPhotos = (photosData || []).map(p => ({ ...p, user_has_liked: likedPhotoIds.has(p.id) }));
  
  return { data: newPhotos, nextPage: newPhotos.length === PHOTOS_PER_PAGE ? pageParam + 1 : undefined };
};

const ProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useSession();
  const queryClient = useQueryClient();
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  const { data: profile, isLoading: isLoadingProfile, refetch: refetchProfile } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, bio')
        .eq('id', userId!)
        .single();
      
      if (error && error.code !== 'PGRST116') { // Gracefully handle if profile doesn't exist
        throw error;
      }
      return data as Profile | null;
    },
    enabled: !!userId,
  });

  const {
    data: photosData,
    fetchNextPage,
    hasNextPage,
    isLoading: isLoadingPhotos,
    isFetchingNextPage,
  } = useInfiniteQuery({
      queryKey: ['photos', 'profile', userId],
      queryFn: ({ pageParam }) => fetchProfilePhotosPage({ pageParam, userId, currentUserId: currentUser!.id }),
      getNextPageParam: (lastPage) => lastPage.nextPage,
      enabled: !!userId && !!currentUser,
  });

  const photos = photosData?.pages.flatMap(page => page.data) ?? [];
  const selectedPhoto = photos.find(p => p.id === selectedPhotoId) ?? null;

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoadingProfile || (isLoadingPhotos && !photos.length)) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col items-center space-y-4">
          <Skeleton className="h-24 w-24 rounded-full" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const uploaderName = profile?.full_name || "Anonymous";
  const uploaderInitial = uploaderName.charAt(0).toUpperCase();
  const isOwnProfile = currentUser?.id === userId;

  const ProfileFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <div className="flex justify-center items-center p-8 col-span-2 sm:col-span-3 md:col-span-4">
        <Loader2 className="h-8 w-8 animate-spin text-dark-leaf-green" />
      </div>
    );
  };

  const PhotoDetailView = () => {
    if (!selectedPhoto) return null;
    return <PhotoDetail photo={selectedPhoto} onClose={() => setSelectedPhotoId(null)} />;
  };

  return (
    <>
      <div className="space-y-8">
        <div className="flex flex-col items-center text-center space-y-4">
          <Avatar className="h-24 w-24 border-4 border-bright-gold">
            <AvatarImage src={profile?.avatar_url || undefined} alt={uploaderName} />
            <AvatarFallback className="text-4xl">{uploaderInitial}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold text-dark-leaf-green font-serif">{uploaderName}'s Gallery</h1>
            {profile?.bio && <p className="mt-2 text-neutral-gray max-w-md">{profile.bio}</p>}
          </div>
          {isOwnProfile && (
            <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>

        {photos.length === 0 && !isLoadingPhotos ? (
          <p className="text-center text-neutral-gray pt-8">This user hasn't shared any photos yet.</p>
        ) : (
          <div style={{ height: '60vh' }}>
            <VirtuosoGrid
              totalCount={photos.length}
              endReached={loadMore}
              components={{ Footer: ProfileFooter }}
              itemContent={index => {
                const photo = photos[index];
                return (
                  <div
                    key={photo.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedPhotoId(photo.id)}
                  >
                    <PhotoCard photo={photo} />
                  </div>
                );
              }}
              listClassName="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
            />
          </div>
        )}
      </div>

      {isMobile ? (
        <Drawer open={!!selectedPhoto} onOpenChange={(isOpen) => !isOpen && setSelectedPhotoId(null)}>
          <DrawerContent className="bg-ivory">
            <div className="max-h-[85vh] overflow-y-auto">
              <PhotoDetailView />
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={!!selectedPhoto} onOpenChange={(isOpen) => !isOpen && setSelectedPhotoId(null)}>
          <DialogContent className="max-w-4xl bg-ivory">
            <PhotoDetailView />
          </DialogContent>
        </Dialog>
      )}

      {isOwnProfile && profile && (
        <EditProfileDialog
          profile={profile}
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onProfileUpdate={() => {
            refetchProfile();
            queryClient.invalidateQueries({ queryKey: ['photos', 'profile', userId] });
          }}
        />
      )}
    </>
  );
};

export default ProfilePage;