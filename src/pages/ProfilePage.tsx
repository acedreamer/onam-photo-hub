import { useRef, useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { Photo, Profile } from '@/stores/galleryStore';
import { useSession } from '@/contexts/SessionContext';
import PhotoCard from '@/components/PhotoCard';
import PhotoDetail from '@/components/PhotoDetail';
import EditProfileDialog from '@/components/EditProfileDialog';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, Edit } from 'lucide-react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

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
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: profile, isLoading: isLoadingProfile, refetch: refetchProfile } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, bio')
        .eq('id', userId!)
        .single();
      if (error) throw error;
      return data as Profile;
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

  const observer = useRef<IntersectionObserver>();
  const lastPhotoElementRef = useCallback((node: HTMLDivElement) => {
    if (isFetchingNextPage) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    });
    if (node) observer.current.observe(node);
  }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

  if (isLoadingProfile || isLoadingPhotos) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col items-center space-y-4">
          <Skeleton className="h-24 w-24 rounded-full" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="columns-2 sm:columns-3 gap-4 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const uploaderName = profile?.full_name || "Anonymous";
  const uploaderInitial = uploaderName.charAt(0).toUpperCase();
  const isOwnProfile = currentUser?.id === userId;

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

        {photos.length === 0 ? (
          <p className="text-center text-neutral-gray pt-8">This user hasn't shared any photos yet.</p>
        ) : (
          <div className="columns-2 sm:columns-3 gap-4 space-y-4">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                ref={index === photos.length - 1 ? lastPhotoElementRef : null}
                className="cursor-pointer animate-fade-in-up"
                style={{ animationDelay: `${Math.min(index * 75, 1000)}ms` }}
                onClick={() => setSelectedPhoto(photo)}
              >
                <PhotoCard photo={photo} />
              </div>
            ))}
          </div>
        )}
        {isFetchingNextPage && (
          <div className="flex justify-center items-center mt-8">
            <Loader2 className="h-8 w-8 animate-spin text-dark-leaf-green" />
          </div>
        )}
      </div>

      <Dialog open={!!selectedPhoto} onOpenChange={(isOpen) => !isOpen && setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl bg-ivory">
          {selectedPhoto && <PhotoDetail photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />}
        </DialogContent>
      </Dialog>

      {isOwnProfile && profile && (
        <EditProfileDialog
          profile={profile}
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onProfileUpdate={() => refetchProfile()}
        />
      )}
    </>
  );
};

export default ProfilePage;