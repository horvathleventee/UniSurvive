import Link from "next/link";
import { ArrowRight, BookOpen, Search, Sparkles } from "lucide-react";

import { SearchBar } from "@/components/search-bar";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getUniversities } from "@/lib/data";

export default async function HomePage() {
  const universities = await getUniversities();

  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <section className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-4 py-2 text-sm shadow-soft">
              <Sparkles className="h-4 w-4" />
              Tárgytúlélő eszköztár magyar egyetemistáknak
            </div>
            <div className="space-y-5">
              <h1 className="max-w-3xl font-heading text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
                Túlélni az egyetemet? Kezdd itt.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                Jegyzetek, ZH tippek, tárgytapasztalatok és túlélő infók egy helyen. Gyorsan meg tudod nézni, mire számíts,
                miből kérdeznek és hogyan érdemes nekimenni egy tárgynak.
              </p>
            </div>
            <div className="max-w-xl">
              <SearchBar />
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/universities">
                <Button size="lg">
                  Böngészd a tárgyakat
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" size="lg">
                  Saját fiókot kérek
                </Button>
              </Link>
            </div>
          </div>

          <Card className="overflow-hidden">
            <CardContent className="space-y-6 p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Elérhető egyetemek</p>
                  <p className="font-heading text-4xl font-bold">{universities.length}</p>
                </div>
                <div className="rounded-full bg-accent p-4">
                  <BookOpen className="h-8 w-8 text-accent-foreground" />
                </div>
              </div>
              <div className="space-y-3">
                {universities.map((university) => (
                  <div key={university.id} className="rounded-[26px] border border-border bg-card/80 p-4">
                    <p className="font-medium">{university.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {university.faculties.length} kar • {university.faculties.reduce((sum, faculty) => sum + faculty.programs.length, 0)} szak
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mt-20 grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Gyors tárgykeresés",
              description: "Tárgynév, tárgykód vagy szak alapján pár másodperc alatt megtalálod, amit keresel.",
              icon: Search
            },
            {
              title: "Valódi hallgatói tapasztalatok",
              description: "Nem marketing szöveg, hanem az, amire tényleg kíváncsi vagy: miből kérdez, mennyire szívatós, mire figyelj.",
              icon: Sparkles
            },
            {
              title: "Jegyzetek és tippek egy helyen",
              description: "Linkek, források, vizsga fókuszpontok és rövid túlélő megjegyzések egy központi tárgyoldalon.",
              icon: BookOpen
            }
          ].map((feature, index) => (
            <Card key={feature.title} className={index === 0 ? "border-primary/20" : ""}>
              <CardContent className="space-y-4 p-6">
                <div className={`inline-flex rounded-2xl p-3 ${index === 0 ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                  <feature.icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-heading text-xl font-semibold">{feature.title}</h2>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{feature.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </SiteShell>
  );
}
