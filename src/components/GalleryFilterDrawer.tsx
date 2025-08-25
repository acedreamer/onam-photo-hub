import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Filter, Sparkles, TrendingUp } from "lucide-react";
import CategoryChips from "./CategoryChips";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";

interface GalleryFilterDrawerProps {
  categories: readonly string[];
  filterCategory: string;
  onFilterChange: (value: string) => void;
  sortBy: 'created_at' | 'likes';
  onSortChange: (value: 'created_at' | 'likes') => void;
}

const GalleryFilterDrawer = ({
  categories,
  filterCategory,
  onFilterChange,
  sortBy,
  onSortChange,
}: GalleryFilterDrawerProps) => {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filter & Sort
        </Button>
      </DrawerTrigger>
      <DrawerContent className="bg-ivory">
        <div className="mx-auto w-full max-w-md p-4">
          <DrawerHeader className="text-center">
            <DrawerTitle>Filter Gallery</DrawerTitle>
            <DrawerDescription>
              Choose a category and sort order to find the perfect photos.
            </DrawerDescription>
          </DrawerHeader>
          <div className="space-y-6 py-4">
            <div>
              <p className="text-sm font-medium text-neutral-gray mb-3 text-center">
                Filter by Category
              </p>
              <CategoryChips
                categories={categories}
                value={filterCategory}
                onValueChange={onFilterChange}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-gray mb-3 text-center">
                Sort by
              </p>
              <div className="flex justify-center">
                <ToggleGroup
                  type="single"
                  value={sortBy}
                  onValueChange={onSortChange}
                  className="bg-gray-100 dark:bg-card p-1 rounded-lg"
                >
                  <ToggleGroupItem
                    value="created_at"
                    className="px-3 py-1 text-sm data-[state=on]:bg-background data-[state=on]:shadow"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Recent
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="likes"
                    className="px-3 py-1 text-sm data-[state=on]:bg-background data-[state=on]:shadow"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Most Liked
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default GalleryFilterDrawer;