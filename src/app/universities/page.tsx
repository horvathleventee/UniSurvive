import type { Metadata } from "next";
import Link from "next/link";

import { SiteShell } from "@/components/site-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getUniversities } from "@/lib/data";

export const metadata: Metadata = {
  title: "Egyetemek",
  description: "Böngéssz egyetemek, karok és szakok szerint."
};

export default async function UniversitiesPage() {
  const universities = await getUniversities();
  const totalFaculties = universities.reduce((sum, university) => sum + university.faculties.length, 0);
  const totalPrograms = universities.reduce(
    (sum, university) => sum + university.faculties.reduce((facultySum, faculty) => facultySum + faculty.programs.length, 0),
    0
  );

  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:items-start">
          <div className="space-y-4 rounded-[2rem] border border-border/70 bg-gradient-to-br from-accent/20 via-background to-secondary/20 p-8 shadow-sm sm:p-10">
            <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Katalógus</p>
            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">Egyetemek, karok, szakok egy helyen.</h1>
            <p className="max-w-2xl text-base leading-8 text-muted-foreground">
              Innen indul a teljes böngészés: válassz egy egyetemet, menj tovább a karra, aztán a szakra, és nézd meg a tárgyakhoz gyűjtött közösségi túlélő infókat.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <Card className="rounded-[1.75rem] border-border/70">
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">Egyetem</p>
                <p className="mt-2 font-heading text-3xl font-bold">{universities.length}</p>
              </CardContent>
            </Card>
            <Card className="rounded-[1.75rem] border-border/70">
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">Kar</p>
                <p className="mt-2 font-heading text-3xl font-bold">{totalFaculties}</p>
              </CardContent>
            </Card>
            <Card className="rounded-[1.75rem] border-border/70">
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">Szak</p>
                <p className="mt-2 font-heading text-3xl font-bold">{totalPrograms}</p>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {universities.map((university) => (
            <Link key={university.id} href={`/universities/${university.slug}`}>
              <Card className="h-full rounded-[2rem] border-border/70 transition-all hover:-translate-y-1 hover:shadow-md">
                <CardHeader className="border-b border-border/60 bg-gradient-to-r from-background via-background to-accent/15">
                  <CardTitle>{university.name}</CardTitle>
                  <CardDescription>{university.faculties.length} kar érhető el jelenleg.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {university.faculties.map((faculty) => (
                    <div key={faculty.id} className="rounded-3xl border border-border/70 bg-card/80 p-4">
                      <p className="font-medium">{faculty.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {faculty.programs.length} szak • {faculty.programs.reduce((sum, program) => sum + program._count.subjects, 0)} tárgy
                      </p>
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
