import type { Metadata } from "next";

import { EmptyState } from "@/components/empty-state";
import { SearchBar } from "@/components/search-bar";
import { SiteShell } from "@/components/site-shell";
import { SubjectCard } from "@/components/subject-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { searchCatalog } from "@/lib/data";
import { getSubjectCategory } from "@/lib/subject-groups";

type PageProps = {
  searchParams: Promise<{ q?: string }>;
};

export const metadata: Metadata = {
  title: "Keresés",
  description: "Keress tárgynévre, tárgykódra vagy szakra a UniSurvive-on."
};

export default async function SearchPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const results = q ? await searchCatalog(q) : [];

  const categoryCounts = Array.from(
    results.reduce((map, subject) => {
      const category = getSubjectCategory(subject.name);
      map.set(category, (map.get(category) ?? 0) + 1);
      return map;
    }, new Map<string, number>())
  ).sort((a, b) => b[1] - a[1]);

  const programs = Array.from(new Set(results.map((subject) => subject.program.name))).slice(0, 5);

  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:items-start">
          <div className="space-y-4 rounded-[2rem] border border-border/70 bg-gradient-to-br from-accent/20 via-background to-secondary/20 p-8 shadow-sm sm:p-10">
            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">Keresés</h1>
            <p className="max-w-2xl text-base leading-8 text-muted-foreground">
              Keress tárgyra, tárgykódra vagy szakra. A találatokat úgy raktam össze, hogy gyorsan lásd, melyik tárgy mennyire élő és mennyi közösségi tartalom van mögötte.
            </p>
            <div className="max-w-2xl">
              <SearchBar defaultValue={q ?? ""} />
            </div>
            {q ? <Badge variant="outline">{results.length} találat erre: {q}</Badge> : null}
          </div>
          <Card className="rounded-[2rem] border-border/70">
            <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Találat</p>
                <p className="mt-2 font-heading text-3xl font-bold">{results.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Érintett szak</p>
                <p className="mt-2 font-heading text-3xl font-bold">{programs.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {q ? (
          results.length ? (
            <div className="space-y-8">
              <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                <Card className="rounded-[1.75rem] border-border/70">
                  <CardContent className="flex flex-wrap items-center gap-3 p-5">
                    <Badge>{results.length} találat</Badge>
                    {programs.map((program) => (
                      <Badge key={program} variant="outline">
                        {program}
                      </Badge>
                    ))}
                  </CardContent>
                </Card>
                <Card className="rounded-[1.75rem] border-border/70">
                  <CardContent className="flex flex-wrap items-center gap-3 p-5">
                    {categoryCounts.slice(0, 5).map(([category, count]) => (
                      <Badge key={category} variant="secondary">
                        {category}: {count}
                      </Badge>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {results.map((subject) => (
                  <SubjectCard key={subject.id} subject={subject} />
                ))}
              </div>
            </div>
          ) : (
            <EmptyState title="Nincs találat" description="Próbálj meg másik tárgynevet, tárgykódot vagy szakot." />
          )
        ) : (
          <EmptyState title="Kezdj el keresni" description="Írj be egy tárgynevet, tárgykódot vagy szakot, és megmutatom a találatokat." />
        )}
      </div>
    </SiteShell>
  );
}
