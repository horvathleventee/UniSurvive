"use client";

import { useState, useTransition } from "react";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";

import { voteAction } from "@/actions/social";
import { Button } from "@/components/ui/button";

export function VoteButtons({
  targetId,
  targetType,
  score,
  viewerVote
}: {
  targetId: string;
  targetType: "REVIEW" | "NOTE_RESOURCE" | "EXAM_TIP" | "COMMENT";
  score: number;
  viewerVote: number;
}) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  async function handleVote(value: 1 | -1) {
    startTransition(async () => {
      const result = await voteAction({ targetId, targetType, value });
      setMessage(result.message);
    });
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        size="icon"
        variant={viewerVote === 1 ? "default" : "outline"}
        onClick={() => handleVote(1)}
        disabled={pending}
      >
        <ArrowBigUp className="h-4 w-4" />
      </Button>
      <span className="min-w-8 text-center text-sm font-semibold">{score}</span>
      <Button
        type="button"
        size="icon"
        variant={viewerVote === -1 ? "destructive" : "outline"}
        onClick={() => handleVote(-1)}
        disabled={pending}
      >
        <ArrowBigDown className="h-4 w-4" />
      </Button>
      {message ? <span className="sr-only">{message}</span> : null}
    </div>
  );
}
