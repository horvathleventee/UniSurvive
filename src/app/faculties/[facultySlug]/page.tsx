import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteShell } from "@/components/site-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getFacultyBySlug } from "@/lib/data";

type PageProps = {
  params: Promise<{ facultySlug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { facultySlug } = await params;
  const faculty = await getFacultyBySlug(facultySlug);

  if (!faculty) return {};

  return {
    title: faculty.name,
    description: `${faculty.name} szakjai és tárgylistái.`
  };
}

export default async function FacultyPage({ params }: PageProps) {
  const { facultySlug } = await params;
  const faculty = await getFacultyBySlug(facultySlug);

  if (!faculty) notFound();

  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:items-start">
          <div className="space-y-4 rounded-[2rem] border border-border/70 bg-gradient-to-br from-secondary/18 via-background to-accent/20 p-8 shadow-sm sm:p-10">
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">{faculty.university.name}</p>
            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">{faculty.name}</h1>
            <p className="max-w-2xl text-base leading-8 text-muted-foreground">
              Innen tudsz továbbmenni a szakokra. A szakoldalakon már féléves bontásban, szűrőkkel és közösségi jelekkel látszanak a tárgyak.
            </p>
          </div>
          <Card className="rounded-[2rem] border-border/70">
            <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Szak</p>
                <p className="mt-2 font-heading text-3xl font-bold">{faculty.programs.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tárgy összesen</p>
                <p className="mt-2 font-heading text-3xl font-bold">
                  {faculty.programs.reduce((sum, program) => sum + program._count.subjects, 0)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {faculty.programs.map((program) => (
            <Link key={program.id} href={`/programs/${program.slug}`}>
              <Card className="h-full rounded-[2rem] border-border/70 transition-all hover:-translate-y-1 hover:shadow-md">
                <CardHeader className="border-b border-border/60 bg-gradient-to-r from-background via-background to-accent/15">
                  <CardTitle>{program.name}</CardTitle>
                  <CardDescription>{program._count.subjects} tárgy jelenleg</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Nyisd meg a szak tárgylistáját, és nézd meg, miből mennyire lehet túlélni a félévet.
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </SiteShell>
  );
}
