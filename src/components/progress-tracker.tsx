"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { setProgressAction } from "@/actions/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type ProgressStatus = "PLANNED" | "IN_PROGRESS" | "COMPLETED";

const progressOptions: Array<{
  value: ProgressStatus;
  label: string;
}> = [
  { value: "PLANNED", label: "Még előttem" },
  { value: "IN_PROGRESS", label: "Folyamatban" },
  { value: "COMPLETED", label: "Kész" }
];

export function ProgressTracker({
  subjects,
  initialProgress
}: {
  subjects: Array<{
    id: string;
    name: string;
    slug: string;
    code: string | null;
    credits: number | null;
    recommendedSemester: number | null;
  }>;
  initialProgress: Record<string, ProgressStatus>;
}) {
  const [progress, setProgress] = useState(initialProgress);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function updateStatus(subjectId: string, status: ProgressStatus) {
    setPendingId(subjectId);
    startTransition(async () => {
      const result = await setProgressAction({ subjectId, status });
      if (result.success) {
        setProgress((current) => ({ ...current, [subjectId]: status }));
      }
      setPendingId(null);
    });
  }

  return (
    <div className="space-y-3">
      {subjects.map((subject) => {
        const status = progress[subject.id] ?? "PLANNED";

        return (
          <div key={subject.id} className="rounded-[26px] border border-border bg-card/80 p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0 space-y-3">
                <Link href={`/subjects/${subject.slug}`} className="block text-lg font-medium leading-tight hover:text-primary">
                  {subject.name}
                </Link>
                <div className="flex flex-wrap gap-2">
                  {subject.recommendedSemester ? <Badge variant="outline">{subject.recommendedSemester}. félév</Badge> : null}
                  {subject.credits ? <Badge>{subject.credits} kredit</Badge> : null}
                  {subject.code ? <Badge variant="outline">{subject.code}</Badge> : null}
                </div>
              </div>

              <div className="w-full lg:w-auto">
                <div className="grid grid-cols-1 gap-2 rounded-[24px] border border-border/80 bg-background/80 p-1.5 sm:grid-cols-3">
                  {progressOptions.map((option) => {
                    const active = status === option.value;

                    return (
                      <Button
                        key={option.value}
                        type="button"
                        size="sm"
                        variant={active ? (option.value === "COMPLETED" ? "secondary" : "default") : "ghost"}
                        className={active ? "shadow-sm" : "text-foreground/80"}
                        disabled={pendingId === subject.id}
                        onClick={() => updateStatus(subject.id, option.value)}
                      >
                        {option.label}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
