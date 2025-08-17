import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";

const UploadFab = () => {
  return (
    <Button
      className="fixed bottom-20 right-6 h-16 w-16 rounded-full bg-kasavu-gold shadow-lg hover:bg-kasavu-gold/90 z-50"
      aria-label="Upload Photo"
    >
      <Camera className="h-8 w-8 text-white" />
    </Button>
  );
};

export default UploadFab;