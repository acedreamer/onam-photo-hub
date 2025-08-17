import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGalleryStore } from "@/stores/galleryStore";
import { showSuccess, showError } from "@/utils/toast";
import { ImageUp, Upload, Camera as CameraIcon, X } from "lucide-react";
import CameraCapture from "./CameraCapture";

const categories = ["Pookalam", "Attire", "Performances", "Sadhya", "Candid"];

interface UploadFormProps {
  onUploadComplete: () => void;
}

const UploadForm = ({ onUploadComplete }: UploadFormProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addPhoto = useGalleryStore((state) => state.addPhoto);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleCaptureComplete = (capturedFile: File) => {
    setFile(capturedFile);
    setPreview(URL.createObjectURL(capturedFile));
    setIsCameraOpen(false);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!file || !category) {
      showError("Please select or capture a photo and choose a category.");
      return;
    }

    setIsUploading(true);
    
    // Simulate upload delay
    setTimeout(() => {
      const newPhoto = {
        id: new Date().toISOString(),
        src: URL.createObjectURL(file),
        caption,
        category,
      };
      addPhoto(newPhoto);
      setIsUploading(false);
      showSuccess("Photo shared successfully!");
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
    <>
      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-leaf-green">Share Your Moment</h2>
          <p className="text-gray-600">Select a photo, or capture one now.</p>
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
          <div className="grid grid-cols-2 gap-4">
            <Button type="button" variant="outline" className="h-32 border-2 border-dashed flex flex-col items-center justify-center" onClick={() => fileInputRef.current?.click()}>
              <ImageUp className="h-8 w-8 mb-2 text-gray-500" />
              <span className="text-gray-600">Select Photo</span>
            </Button>
            <Button type="button" variant="outline" className="h-32 border-2 border-dashed flex flex-col items-center justify-center" onClick={() => setIsCameraOpen(true)}>
              <CameraIcon className="h-8 w-8 mb-2 text-gray-500" />
              <span className="text-gray-600">Capture Photo</span>
            </Button>
          </div>
        )}

        <Textarea
          placeholder="Add a caption... (optional)"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="resize-none"
        />

        <Select onValueChange={setCategory} value={category}>
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button type="submit" className="w-full bg-leaf-green hover:bg-leaf-green/90" disabled={isUploading || !file}>
          {isUploading ? "Sharing..." : "Share Photo"}
          {!isUploading && <Upload className="h-4 w-4 ml-2" />}
        </Button>
      </form>
      {isCameraOpen && (
        <CameraCapture
          onCapture={handleCaptureComplete}
          onClose={() => setIsCameraOpen(false)}
        />
      )}
    </>
  );
};

export default UploadForm;