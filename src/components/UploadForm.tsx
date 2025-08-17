import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGalleryStore } from "@/stores/galleryStore";
import { showSuccess, showError } from "@/utils/toast";
import { ImageUp, Upload } from "lucide-react";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addPhoto = useGalleryStore((state) => state.addPhoto);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!file || !caption || !category) {
      showError("Please select a photo, add a caption, and choose a category.");
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

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-leaf-green">Share Your Moment</h2>
        <p className="text-gray-600">Select a photo and tell us about it.</p>
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {preview ? (
        <div className="w-full aspect-square rounded-lg overflow-hidden border-2 border-dashed border-gray-300">
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
        </div>
      ) : (
        <Button type="button" variant="outline" className="w-full h-32 border-2 border-dashed" onClick={() => fileInputRef.current?.click()}>
          <ImageUp className="h-8 w-8 mr-2 text-gray-500" />
          <span className="text-gray-600">Select a Photo</span>
        </Button>
      )}

      <Textarea
        placeholder="Add a caption..."
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

      <Button type="submit" className="w-full bg-leaf-green hover:bg-leaf-green/90" disabled={isUploading}>
        {isUploading ? "Sharing..." : "Share Photo"}
        {!isUploading && <Upload className="h-4 w-4 ml-2" />}
      </Button>
    </form>
  );
};

export default UploadForm;