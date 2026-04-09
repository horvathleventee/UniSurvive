import { Input } from "@/components/ui/input";

export function SearchBar({ defaultValue = "" }: { defaultValue?: string }) {
  return (
    <form action="/search" className="flex items-center gap-2">
      <Input name="q" defaultValue={defaultValue} placeholder="Keress tárgyra, tárgykódra vagy szakra..." className="bg-card" />
    </form>
  );
}
