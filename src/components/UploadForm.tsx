import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { showSuccess, showError } from "@/utils/toast";
import { ImageUp, Upload, X } from "lucide-react";
import CategoryChips from "./CategoryChips";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSession } from "@/contexts/SessionContext";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";
import { DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import imageCompression from 'browser-image-compression'; // Import the compression library

interface UploadFormProps {
  onUploadComplete: () => void;
}

const uploadCategories = ["Pookalam", "Attire", "Performances", "Sadhya", "Candid"] as const;

// Ensure these lines are exactly as shown, using import.meta.env.VITE_
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

const UploadForm = ({ onUploadComplete }: UploadFormProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState("");
  const [allowDownload, setAllowDownload] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useSession();
  const queryClient = useQueryClient();

  // --- DEBUGGING LOGS ---
  useEffect(() => {
    console.log("VITE_CLOUDINARY_CLOUD_NAME:", CLOUDINARY_CLOUD_NAME);
    console.log("VITE_CLOUDINARY_UPLOAD_PRESET:", CLOUDINARY_UPLOAD_PRESET);
  }, []);
  // --- END DEBUGGING LOGS ---

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

  const compressImage = async (imageFile: File): Promise<File> => {
    const options = {
      maxSizeMB: 1,           // (max file size in MB)
      maxWidthOrHeight: 1920, // (max width or height in pixels)
      useWebWorker: true,   // (optional) use web worker for faster compression
      fileType: 'image/webp', // (optional) convert to webp for better compression
    };
    try {
      const compressedFile = await imageCompression(imageFile, options);
      console.log(`Original file size: ${imageFile.size / 1024 / 1024} MB`);
      console.log(`Compressed file size: ${compressedFile.size / 1024 / 1024} MB`);
      return compressedFile;
    } catch (error) {
      console.error('Image compression error:', error);
      showError('Failed to compress image. Uploading original.');
      return imageFile; // Fallback to original if compression fails
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (files.length === 0 || !category || !user) {
      setError("Please select at least one photo and choose a category.");
      return;
    }

    // This is where the check happens
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      setError("Cloudinary credentials are not configured. Please check your .env file.");
      return;
    }

    setIsUploading(true);
    
    try {
      for (const file of files) {
        // Compress image on the client-side before uploading
        const compressedFile = await compressImage(file);

        const formData = new FormData();
        formData.append('file', compressedFile); // Upload the compressed file
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        const response = await fetch(CLOUDINARY_URL, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Cloudinary upload failed: ${response.status} ${errorText}`);
        }

        const cloudinaryData = await response.json();
        if (!cloudinaryData.secure_url || !cloudinaryData.public_id) {
          throw new Error("Cloudinary upload did not return a valid URL or public ID.");
        }

        const { error: insertError } = await supabase
          .from('photos')
          .insert({
            user_id: user.id,
            image_url: cloudinaryData.secure_url,
            caption,
            category,
            cloudinary_public_id: cloudinaryData.public_id,
            allow_download: allowDownload,
          });

        if (insertError) throw insertError;
      }

      queryClient.invalidateQueries({ queryKey: ['photos'] });

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
    <>
      <DrawerHeader>
        <DrawerTitle className="text-dark-leaf-green">Share Your Moments</DrawerTitle>
        <DrawerDescription>Select your photos, add a caption, and choose a category.</DrawerDescription>
      </DrawerHeader>
      <form onSubmit={handleSubmit} className="p-4 pt-0 space-y-4">
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
            categories={uploadCategories}
            value={category}
            onValueChange={setCategory}
            disabled={previews.length === 0}
          />
        </div>

        <div className="flex items-center space-x-2 justify-center">
          <Checkbox 
            id="allow-download" 
            checked={allowDownload}
            onCheckedChange={(checked) => setAllowDownload(Boolean(checked))}
            disabled={previews.length === 0}
          />
          <Label htmlFor="allow-download" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Allow others to download this photo
          </Label>
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
    </>
  );
};

export default UploadForm;