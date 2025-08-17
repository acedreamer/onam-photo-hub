import type { Photo } from "@/stores/galleryStore";
import { Badge } from "@/components/ui/badge";
import { Calendar, Tag } from "lucide-react";
import { format } from "date-fns";

interface PhotoDetailProps {
  photo: Photo;
}

const PhotoDetail = ({ photo }: PhotoDetailProps) => {
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
          <h3 className="text-xl font-bold text-leaf-green mb-2">Details</h3>
          <p className="text-gray-700">{photo.caption}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Tag className="h-5 w-5 text-gray-500" />
          <Badge variant="secondary" className="bg-leaf-green/20 text-leaf-green">{photo.category}</Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-gray-500" />
          <span className="text-sm text-gray-600">
            {format(new Date(photo.id), "MMMM d, yyyy 'at' h:mm a")}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PhotoDetail;