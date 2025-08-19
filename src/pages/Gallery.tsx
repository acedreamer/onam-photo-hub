import { useEffect, useState } from "react";
import { useGalleryStore, type Photo } from "@/stores/galleryStore";
import PhotoCard from "@/components/PhotoCard";
import PhotoDetail from "@/components/PhotoDetail";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";
import { Skeleton } from "@/components/ui/skeleton";

const Gallery = () => {
  const { photos, setPhotos } = useGalleryStore();
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const { user } = useSession();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPhotos = async () => {
      if (!user) return;
      setIsLoading(true);

      try {
        const { data: photosData, error: photosError } = await supabase
          .from("photos")
          .select("*")
          .order("created_at", { ascending: false });

        if (photosError) throw photosError;

        const { data: likesData, error: likesError } = await supabase
          .from("likes")
          .select("photo_id")
          .eq("user_id", user.id);

        if (likesError) throw likesError;

        const likedPhotoIds = new Set(likesData?.map(like => like.photo_id) || []);
        setPhotos(photosData || [], likedPhotoIds);
      } catch (error) {
        console.error("Error fetching gallery data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPhotos();
  }, [user, setPhotos]);

  return (
    <>
      <div>
        <h1 className="text-4xl font-bold text-dark-leaf-green mb-8 text-center">Community Gallery</h1>
        
        {isLoading ? (
          <div className="columns-2 sm:columns-3 gap-4 space-y-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="break-inside-avoid">
                <Skeleton className="w-full h-40 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center text-neutral-gray mt-16 flex flex-col items-center">
            <div className="w-full max-w-xs sm:max-w-sm mx-auto mb-8">
              <img 
                src="/pookalam-detailed.svg" 
                alt="Pookalam illustration" 
                className="w-full h-auto animate-spin-slow text-neutral-gray"
                onError={(e) => { e.currentTarget.src = '/placeholder.svg'; e.currentTarget.onerror = null; }}
              />
            </div>
            <h2 className="text-2xl font-semibold text-neutral-gray">The Gallery Awaits!</h2>
            <p className="text-neutral-gray mt-2">Be the first to share a vibrant Onam moment.</p>
          </div>
        ) : (
          <div className="columns-2 sm:columns-3 gap-4 space-y-4">
            {photos.map((photo) => (
              <div key={photo.id} className="cursor-pointer" onClick={() => setSelectedPhoto(photo)}>
                <PhotoCard photo={photo} />
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!selectedPhoto} onOpenChange={(isOpen) => !isOpen && setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl bg-ivory">
          {selectedPhoto && (
            <>
              <DialogHeader className="sr-only">
                <DialogTitle>Photo Details: {selectedPhoto.category}</DialogTitle>
                <DialogDescription>
                  {selectedPhoto.caption || `An Onam celebration photo in the ${selectedPhoto.category} category.`}
                </DialogDescription>
              </DialogHeader>
              <PhotoDetail photo={selectedPhoto} />
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Gallery;