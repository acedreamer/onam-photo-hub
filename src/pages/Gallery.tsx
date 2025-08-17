import { useGalleryStore } from "@/stores/galleryStore";
import PhotoCard from "@/components/PhotoCard";
import { GalleryVerticalEnd } from "lucide-react";

const Gallery = () => {
  const photos = useGalleryStore((state) => state.photos);

  return (
    <div>
      <h1 className="text-3xl font-bold text-leaf-green mb-6 text-center">Community Gallery</h1>
      
      {photos.length === 0 ? (
        <div className="text-center text-gray-500 mt-16 flex flex-col items-center">
          <GalleryVerticalEnd className="h-16 w-16 mb-4 text-gray-400" />
          <p className="text-lg">The gallery is empty.</p>
          <p>Be the first to share a moment!</p>
        </div>
      ) : (
        <div className="columns-2 sm:columns-3 gap-4 space-y-4">
          {photos.map((photo) => (
            <PhotoCard key={photo.id} photo={photo} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Gallery;