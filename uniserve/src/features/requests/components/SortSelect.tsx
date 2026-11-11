import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SortOrder } from "../hooks/useRequestListState";

export function SortSelect({
  value,
  onChange,
}: {
  value: SortOrder;
  onChange: (value: SortOrder) => void;
}) {
  return (
    <Select value={value} onValueChange={(next) => onChange(next as SortOrder)}>
      <SelectTrigger aria-label="Sort by date" className="sm:w-44">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="newest">Newest first</SelectItem>
        <SelectItem value="oldest">Oldest first</SelectItem>
      </SelectContent>
    </Select>
  );
}
