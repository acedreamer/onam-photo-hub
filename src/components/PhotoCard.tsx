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
import { showError } from "@/utils/toast";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

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
    if (photo.cloudinary_public_id) {
      await removePhoto(photo.id, photo.cloudinary_public_id);
    } else {
      showError("Cannot delete photo: Cloudinary ID is missing.");
    }
  };

  const uploaderName = photo.profiles?.full_name || "Anonymous";
  const uploaderInitial = uploaderName.charAt(0).toUpperCase();

  return (
    <Card className="overflow-hidden break-inside-avoid rounded-2xl shadow-md flex flex-col transition-transform duration-300 ease-in-out hover:scale-[1.02] hover:shadow-xl">
      <CardContent className="p-0 relative">
        <img
          src={photo.image_url}
          alt={photo.caption || 'Onam photo'}
          className="w-full h-auto object-cover"
          onContextMenu={(e) => e.preventDefault()}
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
      <CardFooter className="p-3 flex justify-between items-center mt-auto bg-white/50">
        <Link to={`/profile/${photo.user_id}`} onClick={stopPropagation} className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 group">
            <Avatar className="h-8 w-8">
              <AvatarImage src={photo.profiles?.avatar_url || undefined} alt={uploaderName} />
              <AvatarFallback>{uploaderInitial}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-semibold text-neutral-gray truncate group-hover:text-dark-leaf-green transition-colors">
              {uploaderName}
            </span>
          </div>
        </Link>
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