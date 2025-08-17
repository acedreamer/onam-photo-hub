import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Photo } from "@/stores/galleryStore";

interface PhotoCardProps {
  photo: Photo;
}

const PhotoCard = ({ photo }: PhotoCardProps) => {
  return (
    <Card className="overflow-hidden break-inside-avoid">
      <CardContent className="p-0">
        <img src={photo.src} alt={photo.caption} className="w-full h-auto object-cover" />
      </CardContent>
      <CardFooter className="p-4 flex flex-col items-start">
        <Badge variant="secondary" className="mb-2 bg-leaf-green/20 text-leaf-green">{photo.category}</Badge>
        <p className="text-sm text-gray-700">{photo.caption}</p>
      </CardFooter>
    </Card>
  );
};

export default PhotoCard;