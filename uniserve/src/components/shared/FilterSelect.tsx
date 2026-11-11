import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { REQUEST_STATUSES, STATUS_LABELS } from "@/lib/constants";
import type { RequestStatus } from "@/types/domain";

const ALL = "all";

interface FilterSelectProps<T extends string> {
  value: T | undefined;
  onChange: (value: T | undefined) => void;
  options: ReadonlyArray<{ value: T; label: string }>;
  allLabel: string;
  ariaLabel: string;
}

export function FilterSelect<T extends string>({
  value,
  onChange,
  options,
  allLabel,
  ariaLabel,
}: FilterSelectProps<T>) {
  return (
    <Select
      value={value ?? ALL}
      onValueChange={(next) => onChange(next === ALL ? undefined : (next as T))}
    >
      <SelectTrigger aria-label={ariaLabel} className="sm:w-44">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{allLabel}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

const STATUS_OPTIONS = REQUEST_STATUSES.map((status) => ({
  value: status,
  label: STATUS_LABELS[status],
}));

export function StatusFilter({
  value,
  onChange,
}: {
  value: RequestStatus | undefined;
  onChange: (value: RequestStatus | undefined) => void;
}) {
  return (
    <FilterSelect
      value={value}
      onChange={onChange}
      options={STATUS_OPTIONS}
      allLabel="All statuses"
      ariaLabel="Filter by status"
    />
  );
}
