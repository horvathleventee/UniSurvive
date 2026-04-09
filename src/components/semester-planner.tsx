"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";

import { setPlannedSemesterAction, setProgressAction } from "@/actions/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type PlannerStatus = "PLANNED" | "IN_PROGRESS" | "COMPLETED";

type PlannerSubject = {
  id: string;
  name: string;
  slug: string;
  code: string | null;
  credits: number | null;
  recommendedSemester: number | null;
  prerequisites: string | null;
  subjectType: "REQUIRED" | "REQUIRED_ELECTIVE";
};

const planOptions = Array.from({ length: 12 }, (_, index) => index + 1);

export function SemesterPlanner({
  subjects,
  initialProgress,
  initialPlannedSemesters,
  completedSubjectNames
}: {
  subjects: PlannerSubject[];
  initialProgress: Record<string, PlannerStatus>;
  initialPlannedSemesters: Record<string, number | null>;
  completedSubjectNames: string[];
}) {
  const [progress, setProgress] = useState(initialProgress);
  const [plannedSemesters, setPlannedSemesters] = useState(initialPlannedSemesters);
  const [pendingSubjectId, setPendingSubjectId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [, startTransition] = useTransition();

  const plannerGroups = useMemo(() => {
    const grouped = new Map<number, PlannerSubject[]>();

    for (const subject of subjects) {
      const bucket = plannedSemesters[subject.id];
      if (!bucket) continue;
      grouped.set(bucket, [...(grouped.get(bucket) ?? []), subject]);
    }

    return Array.from(grouped.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([semester, semesterSubjects]) => ({
        semester,
        subjects: semesterSubjects.sort((a, b) => a.name.localeCompare(b.name, "hu")),
        totalCredits: semesterSubjects.reduce((sum, subject) => sum + (subject.credits ?? 0), 0)
      }));
  }, [plannedSemesters, subjects]);

  function updatePlannedSemester(subjectId: string, value: string) {
    const plannedSemester = value ? Number(value) : null;
    setPendingSubjectId(subjectId);
    startTransition(async () => {
      const result = await setPlannedSemesterAction({ subjectId, plannedSemester });
      if (result.success) {
        setPlannedSemesters((current) => ({ ...current, [subjectId]: plannedSemester }));
      }
      setFeedback(result.message);
      setPendingSubjectId(null);
    });
  }

  function updateStatus(subjectId: string, status: PlannerStatus) {
    setPendingSubjectId(subjectId);
    startTransition(async () => {
      const result = await setProgressAction({ subjectId, status });
      if (result.success) {
        setProgress((current) => ({ ...current, [subjectId]: status }));
        if (status === "COMPLETED") {
          setPlannedSemesters((current) => ({ ...current, [subjectId]: null }));
        }
      }
      setFeedback(result.message);
      setPendingSubjectId(null);
    });
  }

  return (
    <div className="space-y-6">
      {feedback ? <p className="text-sm text-muted-foreground">{feedback}</p> : null}

      <div className="grid gap-4 xl:grid-cols-2">
        {plannerGroups.length ? (
          plannerGroups.map((group) => (
            <div key={group.semester} className="rounded-[28px] border border-border/70 bg-background/70 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-heading text-2xl font-semibold">{group.semester}. saját félév</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{group.subjects.length} tervezett tárgy</p>
                </div>
                <Badge variant="outline" className={group.totalCredits > 32 ? "border-amber-500 text-amber-700 dark:text-amber-300" : undefined}>
                  {group.totalCredits} kredit
                </Badge>
              </div>
              <div className="mt-4 space-y-3">
                {group.subjects.map((subject) => {
                  const missingPrerequisiteWarning = subject.prerequisites && progress[subject.id] !== "COMPLETED";

                  return (
                    <div key={subject.id} className="rounded-[24px] border border-border/70 bg-card/80 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2">
                          <Link href={`/subjects/${subject.slug}`} className="block text-base font-medium hover:text-primary">
                            {subject.name}
                          </Link>
                          <div className="flex flex-wrap gap-2">
                            {subject.code ? <Badge variant="outline">{subject.code}</Badge> : null}
                            {subject.credits ? <Badge>{subject.credits} kredit</Badge> : null}
                            <Badge variant="outline">{subject.subjectType === "REQUIRED" ? "Kötelező" : "Köt. választható"}</Badge>
                          </div>
                          {missingPrerequisiteWarning ? (
                            <p className="text-xs text-amber-600 dark:text-amber-300">Előfeltétel megadva: {subject.prerequisites}. Ezt a félévterv előtt érdemes ellenőrizni.</p>
                          ) : null}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant={progress[subject.id] === "IN_PROGRESS" ? "default" : "outline"}
                            disabled={pendingSubjectId === subject.id}
                            onClick={() => updateStatus(subject.id, "IN_PROGRESS")}
                          >
                            Folyamatban
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant={progress[subject.id] === "COMPLETED" ? "secondary" : "outline"}
                            disabled={pendingSubjectId === subject.id}
                            onClick={() => updateStatus(subject.id, "COMPLETED")}
                          >
                            Kész
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {group.totalCredits > 32 ? (
                <p className="mt-4 text-sm text-amber-600 dark:text-amber-300">Ez már elég nehéz félévnek tűnik. Érdemes lehet 30-32 kredit alatt maradni.</p>
              ) : null}
            </div>
          ))
        ) : (
          <div className="rounded-[28px] border border-dashed border-border/80 bg-background/60 p-6 xl:col-span-2">
            <h3 className="font-heading text-2xl font-semibold">Még nincs saját félévterved</h3>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Az alábbi listában minden tárgyhoz be tudod állítani, melyik saját félévbe tervezed. Ebből automatikusan összeáll a személyes félévterved.
            </p>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {subjects.map((subject) => (
          <div key={subject.id} className="rounded-[26px] border border-border bg-card/80 p-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="min-w-0 space-y-3">
                <Link href={`/subjects/${subject.slug}`} className="block text-lg font-medium leading-tight hover:text-primary">
                  {subject.name}
                </Link>
                <div className="flex flex-wrap gap-2">
                  {subject.code ? <Badge variant="outline">{subject.code}</Badge> : null}
                  {subject.credits ? <Badge>{subject.credits} kredit</Badge> : null}
                  {subject.recommendedSemester ? <Badge variant="outline">Ajánlott: {subject.recommendedSemester}. félév</Badge> : null}
                  <Badge variant="outline">{subject.subjectType === "REQUIRED" ? "Kötelező" : "Köt. választható"}</Badge>
                </div>
                {subject.prerequisites ? (
                  <p className="text-xs text-muted-foreground">
                    Előfeltétel jelzés: {subject.prerequisites}
                    {completedSubjectNames.length ? " • a kész tárgyaid alapján ezt külön érdemes ellenőrizni." : ""}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-3 md:grid-cols-[180px_auto] xl:min-w-[420px]">
                <select
                  value={plannedSemesters[subject.id] ?? ""}
                  disabled={pendingSubjectId === subject.id || progress[subject.id] === "COMPLETED"}
                  onChange={(event) => updatePlannedSemester(subject.id, event.target.value)}
                  className="flex h-10 w-full rounded-2xl border border-border bg-background/80 px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Nincs tervben</option>
                  {planOptions.map((semester) => (
                    <option key={semester} value={semester}>
                      {semester}. saját félév
                    </option>
                  ))}
                </select>

                <div className="grid grid-cols-3 gap-2 rounded-[24px] border border-border/80 bg-background/80 p-1.5">
                  {[
                    { value: "PLANNED", label: "Később" },
                    { value: "IN_PROGRESS", label: "Folyamatban" },
                    { value: "COMPLETED", label: "Kész" }
                  ].map((option) => {
                    const active = (progress[subject.id] ?? "PLANNED") === option.value;

                    return (
                      <Button
                        key={option.value}
                        type="button"
                        size="sm"
                        variant={active ? (option.value === "COMPLETED" ? "secondary" : "default") : "ghost"}
                        className={active ? "shadow-sm" : "text-foreground/80"}
                        disabled={pendingSubjectId === subject.id}
                        onClick={() => updateStatus(subject.id, option.value as PlannerStatus)}
                      >
                        {option.label}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
