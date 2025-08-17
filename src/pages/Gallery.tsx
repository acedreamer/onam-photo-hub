import { useState } from "react";
import { useGalleryStore, type Photo } from "@/stores/galleryStore";
import PhotoCard from "@/components/PhotoCard";
import PhotoDetail from "@/components/PhotoDetail";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const Gallery = () => {
  const photos = useGalleryStore((state) => state.photos);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  return (
    <>
      <div>
        <h1 className="text-4xl font-bold text-dark-leaf-green mb-8 text-center">Community Gallery</h1>
        
        {photos.length === 0 ? (
          <div className="text-center text-neutral-gray mt-16 flex flex-col items-center">
            <div className="w-full max-w-xs sm:max-w-sm mx-auto mb-8 p-4">
              <img 
                src="/pookalam.svg" 
                alt="Pookalam illustration" 
                className="w-full h-auto"
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