import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useGalleryStore } from "@/stores/galleryStore";
import { showSuccess } from "@/utils/toast";
import { ImageUp, Upload, X } from "lucide-react";
import CategoryChips from "./CategoryChips";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UploadFormProps {
  onUploadComplete: () => void;
}

const UploadForm = ({ onUploadComplete }: UploadFormProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addPhoto = useGalleryStore((state) => state.addPhoto);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith("image/")) {
        setError("Please select a valid image file.");
        resetSelection();
        return;
      }
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!file || !category) {
      setError("Please select a photo and choose a category.");
      return;
    }

    setIsUploading(true);
    
    setTimeout(() => {
      const newPhoto = {
        id: new Date().toISOString(),
        src: URL.createObjectURL(file),
        caption,
        category,
      };
      addPhoto(newPhoto);
      setIsUploading(false);
      showSuccess("🎉 Your Onam memory has been shared!");
      onUploadComplete();
    }, 1500);
  };

  const resetSelection = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-leaf-green">Share Your Moment</h2>
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {preview ? (
        <div className="w-full aspect-square rounded-lg overflow-hidden border-2 border-dashed border-gray-300 relative">
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
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
          <span className="font-medium">Click to select a photo</span>
        </div>
      )}

      <Textarea
        placeholder="Add a caption... (optional)"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        className="resize-none"
        disabled={!preview}
      />

      <div>
        <p className="text-sm font-medium text-gray-700 mb-2 text-center">Select a category</p>
        <CategoryChips 
          value={category}
          onValueChange={setCategory}
          disabled={!preview}
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button 
        type="submit" 
        className="w-full bg-leaf-green hover:bg-leaf-green/90" 
        disabled={isUploading || !file || !category}
      >
        {isUploading ? "Sharing..." : "Share Photo"}
        {!isUploading && <Upload className="h-4 w-4 ml-2" />}
      </Button>
    </form>
  );
};

export default UploadForm;