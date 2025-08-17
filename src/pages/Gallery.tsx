import { useState } from "react";
import { useGalleryStore, type Photo } from "@/stores/galleryStore";
import PhotoCard from "@/components/PhotoCard";
import PhotoDetail from "@/components/PhotoDetail";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { GalleryVerticalEnd } from "lucide-react";

const Gallery = () => {
  const photos = useGalleryStore((state) => state.photos);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  return (
    <>
      <div>
        <h1 className="text-4xl font-bold text-leaf-green mb-8 text-center">Community Gallery</h1>
        
        {photos.length === 0 ? (
          <div className="text-center text-gray-500 mt-24 flex flex-col items-center">
            <GalleryVerticalEnd className="h-20 w-20 mb-6 text-gray-400" />
            <p className="text-xl">The gallery is empty.</p>
            <p className="text-gray-600">Be the first to share a moment!</p>
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
          {selectedPhoto && <PhotoDetail photo={selectedPhoto} />}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Gallery;