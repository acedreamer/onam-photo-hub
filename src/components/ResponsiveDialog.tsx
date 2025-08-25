import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Drawer, DrawerContent } from "@/components/ui/drawer";

interface ResponsiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  dialogClassName?: string;
  drawerClassName?: string;
}

const ResponsiveDialog = ({ open, onOpenChange, children, dialogClassName, drawerClassName }: ResponsiveDialogProps) => {
  const isMobile = useIsMobile();

  if (isMobile === null) {
    return null;
  }

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className={drawerClassName}>
          <div className="max-h-[85vh] overflow-y-auto">
            {children}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={dialogClassName}>
        {children}
      </DialogContent>
    </Dialog>
  );
};

export default ResponsiveDialog;