import type { Photo } from "@/stores/galleryStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Tag, Heart, Trash2, Download } from "lucide-react";
import { format } from "date-fns";
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
import { useState } from "react";
import { usePhotoMutations } from "@/hooks/usePhotoMutations";

interface PhotoDetailProps {
  photo: Photo;
  onClose: () => void;
}

const PhotoDetail = ({ photo, onClose }: PhotoDetailProps) => {
  const { user, isAdmin } = useSession();
  const { toggleLikeMutation, removePhotoMutation } = usePhotoMutations();
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = () => {
    if (!user) return;
    if (!photo.user_has_liked) {
      setIsLiking(true);
    }
    toggleLikeMutation.mutate({ photoId: photo.id, userHasLiked: !!photo.user_has_liked });
  };

  const handleDelete = async () => {
    if (photo.cloudinary_public_id) {
      removePhotoMutation.mutate({ photoId: photo.id, cloudinaryPublicId: photo.cloudinary_public_id });
      onClose();
    } else {
      showError("Cannot delete photo: Cloudinary ID is missing.");
      onClose();
    }
  };

  const getDownloadUrl = (imageUrl: string) => {
    if (!imageUrl.includes('/upload/')) {
      return imageUrl;
    }
    const parts = imageUrl.split('/upload/');
    const transformation = 'fl_attachment';
    return `${parts[0]}/upload/${transformation}/${parts[1]}`;
  };

  const uploaderName = photo.profiles?.full_name || "Anonymous";
  const uploaderInitial = uploaderName.charAt(0).toUpperCase();

  return (
    <div className="flex flex-col md:flex-row gap-6 p-2">
      <div className="md:w-2/3 flex items-center justify-center">
        <img 
          src={photo.image_url} 
          alt={photo.caption || 'Onam photo'} 
          className="w-full h-auto object-contain rounded-lg max-h-[75vh]" 
          onContextMenu={(e) => e.preventDefault()}
        />
      </div>
      <div className="md:w-1/3 flex flex-col space-y-4 pt-4">
        <Link to={`/profile/${photo.user_id}`} onClick={onClose}>
          <div className="flex items-center space-x-3 group mb-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={photo.profiles?.avatar_url || undefined} alt={uploaderName} />
              <AvatarFallback>{uploaderInitial}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-neutral-gray group-hover:text-dark-leaf-green transition-colors">{uploaderName}</p>
              <p className="text-xs text-gray-500">View Profile</p>
            </div>
          </div>
        </Link>

        {photo.caption && (
          <div>
            <p className="text-neutral-gray">{photo.caption}</p>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Tag className="h-5 w-5 text-gray-500" />
          <Badge variant="secondary" className="bg-dark-leaf-green/20 text-dark-leaf-green">{photo.category}</Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-gray-500" />
          <span className="text-sm text-neutral-gray">
            {format(new Date(photo.created_at), "MMMM d, yyyy")}
          </span>
        </div>
        <div className="flex items-center space-x-2 pt-2">
          <Button variant="ghost" size="icon" onClick={handleLike} className="group rounded-full relative">
            {isLiking && (
              <div 
                className="absolute inset-0 rounded-full bg-red-500 animate-like-burst"
                onAnimationEnd={() => setIsLiking(false)}
              />
            )}
            <Heart className={cn(
              "h-6 w-6 text-gray-500 group-hover:text-red-500 transition-colors z-10",
              photo.user_has_liked ? "fill-red-500 text-red-500" : "group-hover:fill-red-500",
              isLiking && "animate-like-pop"
            )} />
          </Button>
          <span className="text-base font-medium text-neutral-gray">
            {photo.likes || 0} {photo.likes === 1 ? 'like' : 'likes'}
          </span>
        </div>

        {photo.allow_download && (
          <div className="pt-2">
            <a href={getDownloadUrl(photo.image_url)} download>
              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download Photo
              </Button>
            </a>
          </div>
        )}

        {isAdmin && (
          <div className="pt-4 mt-auto border-t">
             <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Photo (Admin)
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the photo.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Yes, delete photo
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoDetail;