import type { Photo } from "@/stores/galleryStore";
import { useGalleryStore } from "@/stores/galleryStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Tag, Heart } from "lucide-react";
import { format } from "date-fns";

interface PhotoDetailProps {
  photo: Photo;
}

const PhotoDetail = ({ photo }: PhotoDetailProps) => {
  const addLike = useGalleryStore((state) => state.addLike);

  const handleLike = () => {
    addLike(photo.id);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 p-2">
      <div className="md:w-2/3 flex items-center justify-center">
        <img 
          src={photo.src} 
          alt={photo.caption} 
          className="w-full h-auto object-contain rounded-lg max-h-[75vh]" 
        />
      </div>
      <div className="md:w-1/3 flex flex-col space-y-4 pt-4">
        <div>
          <h3 className="text-xl font-bold text-dark-leaf-green mb-2">Details</h3>
          <p className="text-neutral-gray">{photo.caption}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Tag className="h-5 w-5 text-gray-500" />
          <Badge variant="secondary" className="bg-dark-leaf-green/20 text-dark-leaf-green">{photo.category}</Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-gray-500" />
          <span className="text-sm text-neutral-gray">
            {format(new Date(photo.createdAt), "MMMM d, yyyy 'at' h:mm a")}
          </span>
        </div>
        <div className="flex items-center space-x-2 pt-2">
          <Button variant="ghost" size="icon" onClick={handleLike} className="group rounded-full">
            <Heart className="h-6 w-6 text-gray-500 group-hover:text-red-500 group-hover:fill-red-500 transition-colors" />
          </Button>
          <span className="text-base font-medium text-neutral-gray">
            {photo.likes || 0} {photo.likes === 1 ? 'like' : 'likes'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PhotoDetail;