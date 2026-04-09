import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EmptyState } from "@/components/empty-state";
import { ProgramFilters } from "@/components/program-filters";
import { SiteShell } from "@/components/site-shell";
import { SubjectCard } from "@/components/subject-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getProgramBySlug } from "@/lib/data";
import { getSubjectCategory } from "@/lib/subject-groups";

type PageProps = {
  params: Promise<{ programSlug: string }>;
  searchParams: Promise<{
    q?: string;
    semester?: string;
    credits?: string;
    hasContent?: string;
    sort?: string;
    subjectType?: string;
    season?: string;
    hasPrerequisite?: string;
    hasCode?: string;
    category?: string;
  }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { programSlug } = await params;
  const program = await getProgramBySlug(programSlug);

  if (!program) return {};

  return {
    title: `${program.name} tárgyak`,
    description: `${program.name} tárgylista, féléves bontással és tantervi szűrőkkel.`
  };
}

export default async function ProgramPage({ params, searchParams }: PageProps) {
  const { programSlug } = await params;
  const filters = await searchParams;
  const program = await getProgramBySlug(programSlug, filters);

  if (!program) notFound();

  const visibleSubjects = filters.category
    ? program.subjects.filter((subject) => getSubjectCategory(subject.name) === filters.category)
    : program.subjects;

  const requiredSubjects = visibleSubjects.filter((subject) => subject.subjectType === "REQUIRED");
  const electiveSubjects = visibleSubjects.filter((subject) => subject.subjectType === "REQUIRED_ELECTIVE");

  const semesterGroups = Array.from(
    requiredSubjects.reduce((map, subject) => {
      const semester = subject.recommendedSemester ?? 0;
      const current = map.get(semester) ?? [];
      current.push(subject);
      map.set(semester, current);
      return map;
    }, new Map<number, typeof requiredSubjects>())
  ).sort((a, b) => a[0] - b[0]);

  const electiveGroups = {
    FALL: electiveSubjects.filter((subject) => subject.subjectSeason === "FALL"),
    SPRING: electiveSubjects.filter((subject) => subject.subjectSeason === "SPRING"),
    ANY: electiveSubjects.filter((subject) => subject.subjectSeason === "ANY")
  };
  const electiveSections = [
    { label: "Őszi félév", subjects: electiveGroups.FALL },
    { label: "Tavaszi félév", subjects: electiveGroups.SPRING },
    { label: "Nincs félévhez kötve", subjects: electiveGroups.ANY }
  ];

  const categoryCounts = Array.from(
    visibleSubjects.reduce((map, subject) => {
      const category = getSubjectCategory(subject.name);
      map.set(category, (map.get(category) ?? 0) + 1);
      return map;
    }, new Map<string, number>())
  ).sort((a, b) => b[1] - a[1]);

  const averageCredits = visibleSubjects.length
    ? (visibleSubjects.reduce((sum, subject) => sum + (subject.credits ?? 0), 0) / visibleSubjects.length).toFixed(1)
    : "0";

  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Card className="overflow-hidden border-border/80 bg-gradient-to-br from-card via-card to-secondary/20">
          <CardContent className="p-8">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-4">
                <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
                  {program.faculty.university.name} • {program.faculty.name}
                </p>
                <div>
                  <h1 className="font-heading text-4xl font-bold sm:text-5xl">{program.name}</h1>
                  <p className="mt-3 max-w-2xl text-muted-foreground">
                    Félév, tárgytípus, szezon és előfeltétel szerint rendezett tárgylista. Úgy raktam össze, hogy gyorsan lásd, merre van sok anyag és hol kell jobban készülni.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_1fr_1fr]">
              <div className="rounded-[30px] border border-border/70 bg-primary px-6 py-6 text-primary-foreground">
                <p className="text-xs uppercase tracking-[0.18em] text-primary-foreground/70">Szak összkép</p>
                <p className="mt-3 font-heading text-[clamp(2rem,4vw,3rem)] font-bold leading-[0.95]">{visibleSubjects.length}</p>
                <p className="mt-2 text-sm text-primary-foreground/80">Ennyi tárgy látszik a jelenlegi szűrőid alapján.</p>
              </div>
              <div className="rounded-[30px] border border-border/70 bg-background/70 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Kötelező / választható</p>
                <p className="mt-3 font-heading text-[clamp(1.8rem,3vw,2.4rem)] font-bold">{requiredSubjects.length} / {electiveSubjects.length}</p>
                <p className="mt-2 text-sm text-muted-foreground">Kötelező és kötelezően választható tárgyak aránya.</p>
              </div>
              <div className="rounded-[30px] border border-border/70 bg-secondary/35 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Átlag kredit</p>
                <p className="mt-3 font-heading text-[clamp(1.8rem,3vw,2.4rem)] font-bold">{averageCredits}</p>
                <p className="mt-2 text-sm text-muted-foreground">A jelenleg listázott tárgyak átlagos kreditértéke.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8">
          <ProgramFilters defaults={filters} />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <Card>
            <CardContent className="flex flex-wrap items-center gap-3 p-5">
              <Badge>{visibleSubjects.length} tárgy látható</Badge>
              <Badge variant="outline">Kötelező: {requiredSubjects.length}</Badge>
              <Badge variant="outline">Köt. választható: {electiveSubjects.length}</Badge>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-wrap items-center gap-3 p-5">
              {categoryCounts.slice(0, 6).map(([category, count]) => (
                <Badge key={category} variant="secondary">
                  {category}: {count}
                </Badge>
              ))}
            </CardContent>
          </Card>
        </div>

        {program.subjects.length ? (
          <div className="mt-8 space-y-12">
            {semesterGroups.length ? (
              <section className="space-y-6">
                <div>
                  <h2 className="font-heading text-3xl font-semibold">Kötelező tárgyak</h2>
                  <p className="mt-2 text-sm text-muted-foreground">A kötelező törzsanyag félévek szerint rendezve.</p>
                </div>
                {semesterGroups.map(([semester, subjects]) => (
                  <section key={semester} className="space-y-4">
                    <div>
                      <h3 className="font-heading text-2xl font-semibold">{semester}. félév</h3>
                      <p className="text-sm text-muted-foreground">
                        {subjects.length} tárgy • {Array.from(new Set(subjects.map((subject) => getSubjectCategory(subject.name)))).join(", ")}
                      </p>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                      {subjects.map((subject) => (
                        <SubjectCard key={subject.id} subject={subject} />
                      ))}
                    </div>
                  </section>
                ))}
              </section>
            ) : null}

            {electiveSubjects.length ? (
              <section className="space-y-6">
                <div>
                  <h2 className="font-heading text-3xl font-semibold">Kötelezően választható tárgyak</h2>
                  <p className="mt-2 text-sm text-muted-foreground">Szezonális bontásban, hogy gyorsabban át lehessen látni a kínálatot.</p>
                </div>
                {electiveSections.map((section) =>
                  section.subjects.length ? (
                    <section key={section.label} className="space-y-4">
                      <div>
                        <h3 className="font-heading text-2xl font-semibold">{section.label}</h3>
                        <p className="text-sm text-muted-foreground">{section.subjects.length} tárgy</p>
                      </div>
                      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {section.subjects.map((subject) => (
                          <SubjectCard key={subject.id} subject={subject} />
                        ))}
                      </div>
                    </section>
                  ) : null
                )}
              </section>
            ) : null}
          </div>
        ) : (
          <div className="mt-8">
            <EmptyState title="Nincs találat" description="Erre a keresésre most nem találtam tárgyat ezen a szakon." />
          </div>
        )}
      </div>
    </SiteShell>
  );
}
