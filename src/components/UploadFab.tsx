import { useState } from "react";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import UploadForm from "./UploadForm";

const UploadFab = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <DrawerTrigger asChild>
        <Button
          className="fixed bottom-24 right-4 h-16 w-16 rounded-full bg-bright-gold shadow-xl hover:bg-bright-gold/90 z-50 animate-pulse-slow transition-transform duration-200 ease-in-out hover:scale-110 hover:animate-none border-2 border-dark-leaf-green"
          aria-label="Upload Photo"
        >
          <Camera className="h-8 w-8 text-white" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="bg-ivory">
        <div className="mx-auto w-full max-w-md">
          <div className="max-h-[85vh] overflow-y-auto">
            <UploadForm onUploadComplete={() => setIsDrawerOpen(false)} />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default UploadFab;