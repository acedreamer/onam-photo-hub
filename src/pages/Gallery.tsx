import { useEffect, useRef, useCallback } from "react";
import { useGalleryStore, type Photo } from "@/stores/galleryStore";
import PhotoCard from "@/components/PhotoCard";
import PhotoDetail from "@/components/PhotoDetail";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useSession } from "@/contexts/SessionContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import { useState } from "react";

const Gallery = () => {
  const { photos, fetchPhotos, loading, hasMore, resetGallery } = useGalleryStore();
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const { user } = useSession();
  const [initialLoad, setInitialLoad] = useState(true);

  const observer = useRef<IntersectionObserver>();
  const lastPhotoElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && user) {
        fetchPhotos(user.id);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, user, fetchPhotos]);

  useEffect(() => {
    resetGallery();
    if (user) {
      fetchPhotos(user.id).finally(() => setInitialLoad(false));
    }
    return () => {
      resetGallery();
    };
  }, [user, fetchPhotos, resetGallery]);

  return (
    <>
      <div>
        <h1 className="text-4xl font-bold text-dark-leaf-green mb-8 text-center">Community Gallery</h1>
        
        {initialLoad ? (
          <div className="columns-2 sm:columns-3 gap-4 space-y-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="break-inside-avoid">
                <Skeleton className="w-full h-40 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : photos.length === 0 && !loading ? (
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
        {loading && !initialLoad && (
          <div className="flex justify-center items-center mt-8">
            <Loader2 className="h-8 w-8 animate-spin text-dark-leaf-green" />
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
              <PhotoDetail photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Gallery;