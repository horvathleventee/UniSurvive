import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteShell } from "@/components/site-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getUniversityBySlug } from "@/lib/data";

type PageProps = {
  params: Promise<{ universitySlug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { universitySlug } = await params;
  const university = await getUniversityBySlug(universitySlug);

  if (!university) return {};

  return {
    title: university.name,
    description: `${university.name} karai és szakjai a UniSurvive katalógusában.`
  };
}

export default async function UniversityPage({ params }: PageProps) {
  const { universitySlug } = await params;
  const university = await getUniversityBySlug(universitySlug);

  if (!university) notFound();

  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:items-start">
          <div className="space-y-4 rounded-[2rem] border border-border/70 bg-gradient-to-br from-accent/20 via-background to-secondary/20 p-8 shadow-sm sm:p-10">
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Egyetem</p>
            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">{university.name}</h1>
            <p className="max-w-2xl text-base leading-8 text-muted-foreground">
              Válassz kart, aztán menj tovább a szakokra és a hozzájuk tartozó tárgykatalógusra. Itt kezd összeállni az egész egyetemi túlélő térkép.
            </p>
          </div>
          <Card className="rounded-[2rem] border-border/70">
            <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Kar</p>
                <p className="mt-2 font-heading text-3xl font-bold">{university.faculties.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Szak összesen</p>
                <p className="mt-2 font-heading text-3xl font-bold">
                  {university.faculties.reduce((sum, faculty) => sum + faculty.programs.length, 0)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {university.faculties.map((faculty) => (
            <Link key={faculty.id} href={`/faculties/${faculty.slug}`}>
              <Card className="h-full rounded-[2rem] border-border/70 transition-all hover:-translate-y-1 hover:shadow-md">
                <CardHeader className="border-b border-border/60 bg-gradient-to-r from-background via-background to-accent/15">
                  <CardTitle>{faculty.name}</CardTitle>
                  <CardDescription>{faculty.programs.length} szak</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {faculty.programs.map((program) => (
                    <div key={program.id} className="rounded-3xl border border-border/70 bg-card/80 p-4">
                      <p className="font-medium">{program.name}</p>
                      <p className="text-sm text-muted-foreground">{program._count.subjects} tárgy</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </SiteShell>
  );
}
