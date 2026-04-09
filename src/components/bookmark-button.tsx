"use client";

import { useState, useTransition } from "react";
import { Bookmark } from "lucide-react";

import { toggleBookmarkAction } from "@/actions/social";
import { Button } from "@/components/ui/button";

export function BookmarkButton({
  subjectId,
  initialBookmarked
}: {
  subjectId: string;
  initialBookmarked: boolean;
}) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant={bookmarked ? "secondary" : "outline"}
      onClick={() =>
        startTransition(async () => {
          const result = await toggleBookmarkAction({ subjectId });
          if (result.success) {
            setBookmarked((current) => !current);
          }
        })
      }
      disabled={pending}
    >
      <Bookmark className="mr-2 h-4 w-4" />
      {bookmarked ? "Mentve" : "Bookmark"}
    </Button>
  );
}
