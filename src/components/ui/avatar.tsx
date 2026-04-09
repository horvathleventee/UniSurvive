import Image from "next/image";

import { cn } from "@/lib/utils";

export function Avatar({
  name,
  image,
  className
}: {
  name: string;
  image?: string | null;
  className?: string;
}) {
  const initials = name
    .split(" ")
    .map((item) => item[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={cn(
        "relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-primary text-sm font-semibold text-primary-foreground",
        className
      )}
    >
      {image ? <Image src={image} alt={`${name} profilképe`} fill className="object-cover" unoptimized /> : initials}
    </div>
  );
}
