import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import type { Photo } from "@/stores/galleryStore";
import { useGalleryStore } from "@/stores/galleryStore";

interface PhotoCardProps {
  photo: Photo;
}

const PhotoCard = ({ photo }: PhotoCardProps) => {
  const addLike = useGalleryStore((state) => state.addLike);

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the detail view
    addLike(photo.id);
  };

  return (
    <Card className="overflow-hidden break-inside-avoid rounded-2xl shadow-md">
      <CardContent className="p-0 relative">
        <img
          src={photo.src}
          alt={photo.caption}
          className="w-full h-auto object-cover"
        />
        <Badge className="absolute top-3 right-3 bg-bright-gold text-dark-leaf-green pointer-events-none">
          {photo.category}
        </Badge>
      </CardContent>
      <CardFooter className="p-3 flex justify-between items-center min-h-[52px]">
        {photo.caption ? (
          <p className="text-sm text-neutral-gray line-clamp-2 flex-1 mr-2">{photo.caption}</p>
        ) : <div className="flex-1" />}
        <div className="flex items-center space-x-1 shrink-0">
            <Button variant="ghost" size="icon" className="h-8 w-8 group" onClick={handleLikeClick}>
                <Heart className="h-5 w-5 text-gray-400 group-hover:fill-red-500 group-hover:text-red-500 transition-colors" />
            </Button>
            {photo.likes > 0 && (
              <span className="text-sm font-medium text-neutral-gray">{photo.likes}</span>
            )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default PhotoCard;