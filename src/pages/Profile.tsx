import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { Photo, Profile } from '@/stores/galleryStore';
import { useSession } from '@/contexts/SessionContext';
import PhotoCard from '@/components/PhotoCard';
import PhotoDetail from '@/components/PhotoDetail';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';

const PHOTOS_PER_PAGE = 12;

const Profile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  const fetchProfileAndPhotos = useCallback(async (currentPage: number) => {
    if (!userId || !currentUser) return;
    
    if (currentPage === 0) setLoading(true);
    else setLoadingMore(true);

    try {
      if (currentPage === 0) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', userId)
          .single();
        if (profileError) throw profileError;
        setProfile(profileData);
      }

      const from = currentPage * PHOTOS_PER_PAGE;
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
        .eq("user_id", currentUser.id);
      if (likesError) throw likesError;
      const likedPhotoIds = new Set(likesData?.map(like => like.photo_id) || []);

      const newPhotos = (photosData || []).map(p => ({ ...p, user_has_liked: likedPhotoIds.has(p.id) }));

      setPhotos(prev => currentPage === 0 ? newPhotos : [...prev, ...newPhotos]);
      setPage(currentPage + 1);
      setHasMore(newPhotos.length === PHOTOS_PER_PAGE);

    } catch (error) {
      console.error("Error fetching profile data:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [userId, currentUser]);

  useEffect(() => {
    fetchProfileAndPhotos(0);
  }, [fetchProfileAndPhotos]);

  const observer = useRef<IntersectionObserver>();
  const lastPhotoElementRef = useCallback((node: HTMLDivElement) => {
    if (loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchProfileAndPhotos(page);
      }
    });
    if (node) observer.current.observe(node);
  }, [loadingMore, hasMore, page, fetchProfileAndPhotos]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col items-center space-y-4">
          <Skeleton className="h-24 w-24 rounded-full" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="columns-2 sm:columns-3 gap-4 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const uploaderName = profile?.full_name || "Anonymous";
  const uploaderInitial = uploaderName.charAt(0).toUpperCase();

  return (
    <>
      <div className="space-y-8">
        <div className="flex flex-col items-center text-center space-y-2">
          <Avatar className="h-24 w-24 border-4 border-bright-gold">
            <AvatarImage src={profile?.avatar_url || undefined} alt={uploaderName} />
            <AvatarFallback className="text-4xl">{uploaderInitial}</AvatarFallback>
          </Avatar>
          <h1 className="text-3xl font-bold text-dark-leaf-green">{uploaderName}'s Gallery</h1>
        </div>

        {photos.length === 0 ? (
          <p className="text-center text-neutral-gray pt-8">This user hasn't shared any photos yet.</p>
        ) : (
          <div className="columns-2 sm:columns-3 gap-4 space-y-4">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                ref={index === photos.length - 1 ? lastPhotoElementRef : null}
                className="cursor-pointer"
                onClick={() => setSelectedPhoto(photo)}
              >
                <PhotoCard photo={photo} />
              </div>
            ))}
          </div>
        )}
        {loadingMore && (
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
    </>
  );
};

export default Profile;