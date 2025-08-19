import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

interface CategoryChipsProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  categories: readonly string[];
}

const CategoryChips = ({ value, onValueChange, disabled, categories }: CategoryChipsProps) => {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={onValueChange}
      className="flex flex-wrap justify-center gap-2"
      disabled={disabled}
    >
      {categories.map((category) => (
        <ToggleGroupItem
          key={category}
          value={category}
          className={cn(
            "border border-gray-300 rounded-full px-4 py-2 text-sm transition-all duration-200 ease-in-out",
            "data-[state=on]:bg-bright-gold data-[state=on]:text-dark-leaf-green data-[state=on]:shadow-md data-[state=on]:border-bright-gold",
            "hover:bg-gray-100",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {category}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
};

export default CategoryChips;