import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Photo } from "@/stores/galleryStore";

interface PhotoCardProps {
  photo: Photo;
}

const PhotoCard = ({ photo }: PhotoCardProps) => {
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
      {photo.caption && (
        <CardFooter className="p-4">
          <p className="text-sm text-neutral-gray line-clamp-2">{photo.caption}</p>
        </CardFooter>
      )}
    </Card>
  );
};

export default PhotoCard;