import type { Photo } from "@/stores/galleryStore";
import { useGalleryStore } from "@/stores/galleryStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Tag, Heart, Trash2 } from "lucide-react";
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

interface PhotoDetailProps {
  photo: Photo;
  onClose: () => void;
}

const PhotoDetail = ({ photo, onClose }: PhotoDetailProps) => {
  const { user, isAdmin } = useSession();
  const { toggleLike, removePhoto } = useGalleryStore();

  const handleLike = () => {
    if (!user) return;
    toggleLike(photo.id, user.id);
  };

  const handleDelete = async () => {
    if (photo.cloudinary_public_id) {
      await removePhoto(photo.id, photo.cloudinary_public_id);
      onClose();
    } else {
      showError("Cannot delete photo: Cloudinary ID is missing.");
      onClose();
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 p-2">
      <div className="md:w-2/3 flex items-center justify-center">
        <img 
          src={photo.image_url} 
          alt={photo.caption || 'Onam photo'} 
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
            {format(new Date(photo.created_at), "MMMM d, yyyy 'at' h:mm a")}
          </span>
        </div>
        <div className="flex items-center space-x-2 pt-2">
          <Button variant="ghost" size="icon" onClick={handleLike} className="group rounded-full">
            <Heart className={cn(
              "h-6 w-6 text-gray-500 group-hover:text-red-500 transition-colors",
              photo.user_has_liked ? "fill-red-500 text-red-500" : "group-hover:fill-red-500"
            )} />
          </Button>
          <span className="text-base font-medium text-neutral-gray">
            {photo.likes || 0} {photo.likes === 1 ? 'like' : 'likes'}
          </span>
        </div>
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