import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import UploadForm from "./UploadForm";

const UploadFab = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <Button
          className="fixed bottom-24 right-6 h-16 w-16 rounded-full bg-kasavu-gold shadow-xl hover:bg-kasavu-gold/90 z-50 animate-pulse-slow transition-transform duration-200 ease-in-out hover:scale-110 hover:animate-none"
          aria-label="Upload Photo"
        >
          <Camera className="h-8 w-8 text-white" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-lg bg-ivory p-0 max-h-[90vh] overflow-y-auto">
        <UploadForm onUploadComplete={() => setIsSheetOpen(false)} />
      </SheetContent>
    </Sheet>
  );
};

export default UploadFab;