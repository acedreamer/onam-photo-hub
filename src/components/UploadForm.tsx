import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useGalleryStore } from "@/stores/galleryStore";
import { showSuccess, showError } from "@/utils/toast";
import { ImageUp, Upload, X } from "lucide-react";
import CategoryChips from "./CategoryChips";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSession } from "@/contexts/SessionContext";
import { supabase } from "@/integrations/supabase/client";

interface UploadFormProps {
  onUploadComplete: () => void;
}

const UploadForm = ({ onUploadComplete }: UploadFormProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addPhoto = useGalleryStore((state) => state.addPhoto);
  const { user } = useSession();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      const newFiles = Array.from(selectedFiles);
      for (const file of newFiles) {
        if (!file.type.startsWith("image/")) {
          setError("Please select only valid image files.");
          resetSelection();
          return;
        }
      }
      setFiles(newFiles);
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setPreviews(newPreviews);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (files.length === 0 || !category || !user) {
      setError("Please select at least one photo and choose a category.");
      return;
    }

    setIsUploading(true);
    
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        const { data: uploadData, error: functionError } = await supabase.functions.invoke(
          'cloudinary-upload',
          { body: formData }
        );

        if (functionError) throw functionError;
        if (!uploadData.secure_url || !uploadData.public_id) {
          throw new Error("Cloudinary upload did not return a valid URL or public ID.");
        }

        const { data: newPhoto, error: insertError } = await supabase
          .from('photos')
          .insert({
            user_id: user.id,
            image_url: uploadData.secure_url,
            caption,
            category,
            cloudinary_public_id: uploadData.public_id,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        
        if (newPhoto) {
          addPhoto(newPhoto);
        }
      }

      const successMessage = files.length > 1 
        ? `🎉 ${files.length} Onam memories have been shared!`
        : "🎉 Your Onam memory has been shared!";
      showSuccess(successMessage);
      onUploadComplete();
    } catch (err: any) {
      console.error("Upload failed:", err);
      const errorMessage = err.message || "An unknown error occurred during upload.";
      showError(`Upload failed: ${errorMessage}`);
      setError(`Upload failed: ${errorMessage}`);
    } finally {
      setIsUploading(false);
    }
  };

  const resetSelection = () => {
    previews.forEach(url => URL.revokeObjectURL(url));
    setFiles([]);
    setPreviews([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    return () => {
      previews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previews]);

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-dark-leaf-green">Share Your Moments</h2>
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        multiple
      />

      {previews.length > 0 ? (
        <div className="relative">
          <div className="grid grid-cols-3 gap-2 w-full aspect-square rounded-lg overflow-y-auto border-2 border-dashed border-gray-300 p-2">
            {previews.map((src, index) => (
              <div key={index} className="relative aspect-square">
                <img src={src} alt={`Preview ${index + 1}`} className="w-full h-full object-cover rounded-md" />
              </div>
            ))}
          </div>
          <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-8 w-8" onClick={resetSelection}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div 
          className="w-full aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageUp className="h-12 w-12 mb-2" />
          <span className="font-medium">Click to select photos</span>
        </div>
      )}

      <Textarea
        placeholder="Add a caption for all photos... (optional)"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        className="resize-none"
        disabled={previews.length === 0}
      />

      <div>
        <p className="text-sm font-medium text-neutral-gray mb-2 text-center">Select a category</p>
        <CategoryChips 
          value={category}
          onValueChange={setCategory}
          disabled={previews.length === 0}
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button 
        type="submit" 
        className="w-full bg-dark-leaf-green hover:bg-dark-leaf-green/90" 
        disabled={isUploading || files.length === 0 || !category}
      >
        {isUploading ? "Sharing..." : `Share ${files.length} Photo${files.length > 1 ? 's' : ''}`}
        {!isUploading && <Upload className="h-4 w-4 ml-2" />}
      </Button>
    </form>
  );
};

export default UploadForm;