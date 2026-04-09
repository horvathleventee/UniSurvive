import { Badge } from "@/components/ui/badge";

export function RatingBadge({
  label,
  value
}: {
  label: string;
  value: number;
}) {
  return (
    <Badge variant="outline" className="px-4 py-2 text-sm">
      {label}: <span className="ml-1 font-semibold">{value.toFixed(1)}/10</span>
    </Badge>
  );
}
