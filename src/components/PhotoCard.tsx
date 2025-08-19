import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Trash2 } from "lucide-react";
import type { Photo } from "@/stores/galleryStore";
import { useGalleryStore } from "@/stores/galleryStore";
import { useSession } from "@/contexts/SessionContext";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PhotoCardProps {
  photo: Photo;
}

const PhotoCard = ({ photo }: PhotoCardProps) => {
  const { user, isAdmin } = useSession();
  const toggleLike = useGalleryStore((state) => state.toggleLike);
  const removePhoto = useGalleryStore((state) => state.removePhoto);

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    toggleLike(photo.id, user.id);
  };

  const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

  const handleConfirmDelete = async () => {
    await removePhoto(photo.id, photo.image_url);
  };

  return (
    <Card className="overflow-hidden break-inside-avoid rounded-2xl shadow-md">
      <CardContent className="p-0 relative">
        <img
          src={photo.image_url}
          alt={photo.caption || 'Onam photo'}
          className="w-full h-auto object-cover"
        />
        <Badge className="absolute top-3 right-3 bg-bright-gold text-dark-leaf-green pointer-events-none">
          {photo.category}
        </Badge>
        {isAdmin && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-3 left-3 h-8 w-8 opacity-80 hover:opacity-100"
                onClick={stopPropagation}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent onClick={stopPropagation}>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the photo. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardContent>
      <CardFooter className="p-3 flex justify-between items-center min-h-[52px]">
        {photo.caption ? (
          <p className="text-sm text-neutral-gray line-clamp-2 flex-1 mr-2">{photo.caption}</p>
        ) : <div className="flex-1" />}
        <div className="flex items-center space-x-1 shrink-0">
            <Button variant="ghost" size="icon" className="h-8 w-8 group" onClick={handleLikeClick}>
                <Heart className={cn(
                  "h-5 w-5 text-gray-400 group-hover:text-red-500 transition-colors",
                  photo.user_has_liked ? "fill-red-500 text-red-500" : "group-hover:fill-red-500"
                )} />
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