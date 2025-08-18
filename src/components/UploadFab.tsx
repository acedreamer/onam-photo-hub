import { useState } from "react";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Sheet as UiSheet, 
  SheetTrigger as UiSheetTrigger, 
  SheetContent as UiSheetContent, 
  SheetHeader as UiSheetHeader, 
  SheetTitle as UiSheetTitle, 
  SheetDescription as UiSheetDescription 
} from "@/components/ui/sheet";
import UploadForm from "@/components/UploadForm";

export default function UploadFab() {
  const [isOpen, setIsOpen] = useState(false);

  function handleUploadComplete() {
    setIsOpen(false);
  }

  return (
    <UiSheet open={isOpen} onOpenChange={setIsOpen}>
      <UiSheetTrigger asChild>
        <Button 
          className="fixed bottom-24 right-6 h-16 w-16 rounded-full bg-gradient-to-br from-bright-gold to-kasavu-gold text-dark-leaf-green z-50 animate-ring-glow transition-transform duration-200 ease-in-out hover:scale-110 hover:animate-none border-2 border-ivory"
          aria-label="Upload Photo"
        >
          <Camera size={32} />
        </Button>
      </UiSheetTrigger>
      <UiSheetContent side="bottom" className="rounded-t-2xl bg-ivory border-t-4 border-kasavu-gold">
        <UiSheetHeader className="text-center mb-4">
          <UiSheetTitle className="text-2xl text-dark-leaf-green">Share Your Onam Joy</UiSheetTitle>
          <UiSheetDescription>
            Upload a photo to the community gallery.
          </UiSheetDescription>
        </UiSheetHeader>
        <UploadForm onUploadComplete={handleUploadComplete} />
      </UiSheetContent>
    </UiSheet>
  );
}