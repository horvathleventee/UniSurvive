import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { EmptyState } from "@/components/empty-state";
import { ProgressTracker } from "@/components/progress-tracker";
import { SemesterPlanner } from "@/components/semester-planner";
import { SiteShell } from "@/components/site-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getProfileData } from "@/lib/data";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Haladás",
  description: "Kövesd és tervezd a kötelező, valamint kötelezően választható tárgyaidat."
};

function groupBySemester<T extends { recommendedSemester: number | null }>(items: T[]) {
  const groups = new Map<string, T[]>();

  for (const item of items) {
    const key = item.recommendedSemester ? `${item.recommendedSemester}. félév` : "Nincs megadott félév";
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }

  return Array.from(groups.entries()).sort((a, b) => {
    const aValue = Number.parseInt(a[0], 10);
    const bValue = Number.parseInt(b[0], 10);
    if (Number.isNaN(aValue) && Number.isNaN(bValue)) return 0;
    if (Number.isNaN(aValue)) return 1;
    if (Number.isNaN(bValue)) return -1;
    return aValue - bValue;
  });
}

export default async function ProfileProgressPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  const profile = await getProfileData(currentUser.id);
  if (!profile) redirect("/login");

  const subjects = profile.program?.subjects ?? [];
  const requiredSubjects = subjects.filter((subject) => subject.subjectType === "REQUIRED");
  const requiredElectiveSubjects = subjects.filter((subject) => subject.subjectType === "REQUIRED_ELECTIVE");
  const allTrackableSubjects = [...requiredSubjects, ...requiredElectiveSubjects].sort((a, b) => {
    const semesterA = a.recommendedSemester ?? 99;
    const semesterB = b.recommendedSemester ?? 99;
    if (semesterA !== semesterB) return semesterA - semesterB;
    return a.name.localeCompare(b.name, "hu");
  });

  const progressEntries = profile.progressEntries as Array<{
    subjectId: string;
    status: "PLANNED" | "IN_PROGRESS" | "COMPLETED";
    plannedSemester?: number | null;
  }>;

  const progressMap = Object.fromEntries(progressEntries.map((entry) => [entry.subjectId, entry.status] as const));
  const plannedSemesterMap = Object.fromEntries(progressEntries.map((entry) => [entry.subjectId, entry.plannedSemester ?? null] as const));

  const completedRequiredCredits = requiredSubjects
    .filter((subject) => progressMap[subject.id] === "COMPLETED")
    .reduce((sum, subject) => sum + (subject.credits ?? 0), 0);
  const completedElectiveCredits = requiredElectiveSubjects
    .filter((subject) => progressMap[subject.id] === "COMPLETED")
    .reduce((sum, subject) => sum + (subject.credits ?? 0), 0);

  const requiredGroups = groupBySemester(requiredSubjects);
  const requiredElectiveGroups = groupBySemester(requiredElectiveSubjects);

  const plannerSummaryMap = new Map<number, { count: number; credits: number }>();
  for (const subject of allTrackableSubjects) {
    const plannedSemester = plannedSemesterMap[subject.id];
    if (!plannedSemester) continue;

    const current = plannerSummaryMap.get(plannedSemester) ?? { count: 0, credits: 0 };
    plannerSummaryMap.set(plannedSemester, {
      count: current.count + 1,
      credits: current.credits + (subject.credits ?? 0)
    });
  }

  const plannerSummaries = Array.from(plannerSummaryMap.entries())
    .sort((a, b) => a[0] - b[0])
    .slice(0, 6);

  const overloadedSemesters = plannerSummaries.filter(([, summary]) => summary.credits > 32).length;
  const completedSubjectNames = allTrackableSubjects
    .filter((subject) => progressMap[subject.id] === "COMPLETED")
    .map((subject) => subject.name);

  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">Tanulmányi tracker</p>
            <h1 className="font-heading text-4xl font-bold">Hogyan haladok?</h1>
            <p className="max-w-2xl text-muted-foreground">
              Itt már nem csak követni tudod a tárgyaid állapotát, hanem saját félévekbe is be tudod tervezni őket. A tracker a most kiválasztott szakodhoz igazodik.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/profile">
              <Button variant="outline">Vissza a profilhoz</Button>
            </Link>
            <Link href="/profile/settings">
              <Button>Aktív szak beállítása</Button>
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Kötelező tárgyak</p><p className="mt-2 font-heading text-4xl font-bold">{requiredSubjects.length}</p></CardContent></Card>
          <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Köt. választhatók</p><p className="mt-2 font-heading text-4xl font-bold">{requiredElectiveSubjects.length}</p></CardContent></Card>
          <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Kész kötelező kredit</p><p className="mt-2 font-heading text-4xl font-bold">{completedRequiredCredits}</p></CardContent></Card>
          <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Kész választható kredit</p><p className="mt-2 font-heading text-4xl font-bold">{completedElectiveCredits}</p></CardContent></Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Félévtervező 2.0</CardTitle>
            <CardDescription>Saját félévekbe rakhatod a tárgyakat, látod a kreditterhelést, és külön jelzem, ha valamelyik terv túl nehéznek tűnik.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[28px] border border-border/70 bg-background/70 p-5">
                <p className="text-sm text-muted-foreground">Tervbe rakott tárgyak</p>
                <p className="mt-2 font-heading text-3xl font-bold">{Object.values(plannedSemesterMap).filter(Boolean).length}</p>
              </div>
              <div className="rounded-[28px] border border-border/70 bg-background/70 p-5">
                <p className="text-sm text-muted-foreground">Aktív saját félévek</p>
                <p className="mt-2 font-heading text-3xl font-bold">{plannerSummaries.length}</p>
              </div>
              <div className="rounded-[28px] border border-border/70 bg-background/70 p-5">
                <p className="text-sm text-muted-foreground">Túlterhelt félévek</p>
                <p className="mt-2 font-heading text-3xl font-bold">{overloadedSemesters}</p>
              </div>
            </div>

            {plannerSummaries.length ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {plannerSummaries.map(([semester, summary]) => (
                  <div key={semester} className="rounded-[28px] border border-border/70 bg-card/80 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-heading text-2xl font-semibold">{semester}. saját félév</h3>
                      <Badge variant="outline" className={summary.credits > 32 ? "border-amber-500 text-amber-700 dark:text-amber-300" : undefined}>
                        {summary.credits} kredit
                      </Badge>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">{summary.count} tárgy van itt a tervedben.</p>
                  </div>
                ))}
              </div>
            ) : null}

            {allTrackableSubjects.length ? (
              <SemesterPlanner
                subjects={allTrackableSubjects.map((subject) => ({
                  id: subject.id,
                  name: subject.name,
                  slug: subject.slug,
                  code: subject.code,
                  credits: subject.credits,
                  recommendedSemester: subject.recommendedSemester,
                  prerequisites: subject.prerequisites,
                  subjectType: subject.subjectType
                }))}
                initialProgress={progressMap}
                initialPlannedSemesters={plannedSemesterMap}
                completedSubjectNames={completedSubjectNames}
              />
            ) : (
              <EmptyState title="Még nincs tervezhető tárgylista" description="Ha lesz szakhoz kötött tárgylista, itt megjelenik a személyes félévterved." />
            )}
          </CardContent>
        </Card>

        <div className="mt-8 grid gap-8 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Kötelező tárgyak</CardTitle>
              <CardDescription>Félévenként bontva látod az alap törzstárgyakat.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {requiredGroups.length ? (
                requiredGroups.map(([semesterLabel, semesterSubjects]) => (
                  <div key={semesterLabel} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h2 className="font-heading text-xl font-semibold">{semesterLabel}</h2>
                      <Badge variant="outline">{semesterSubjects.length} tárgy</Badge>
                    </div>
                    <ProgressTracker
                      subjects={semesterSubjects.map((subject) => ({
                        id: subject.id,
                        name: subject.name,
                        slug: subject.slug,
                        code: subject.code,
                        credits: subject.credits,
                        recommendedSemester: subject.recommendedSemester
                      }))}
                      initialProgress={progressMap}
                    />
                  </div>
                ))
              ) : (
                <EmptyState title="Még nincs kötelező tárgylista" description="Ha a szakhoz már fel van töltve a teljes curriculum, itt fogod látni." />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kötelezően választható tárgyak</CardTitle>
              <CardDescription>Ezeket is ugyanúgy állapot szerint tudod követni.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {requiredElectiveGroups.length ? (
                requiredElectiveGroups.map(([semesterLabel, semesterSubjects]) => (
                  <div key={semesterLabel} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h2 className="font-heading text-xl font-semibold">{semesterLabel}</h2>
                      <Badge variant="outline">{semesterSubjects.length} tárgy</Badge>
                    </div>
                    <ProgressTracker
                      subjects={semesterSubjects.map((subject) => ({
                        id: subject.id,
                        name: subject.name,
                        slug: subject.slug,
                        code: subject.code,
                        credits: subject.credits,
                        recommendedSemester: subject.recommendedSemester
                      }))}
                      initialProgress={progressMap}
                    />
                  </div>
                ))
              ) : (
                <EmptyState title="Még nincs köt. választható lista" description="Ha ezekhez is van tantervi adat, itt ugyanúgy követheted majd őket." />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </SiteShell>
  );
}
