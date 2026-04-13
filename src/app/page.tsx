import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  BookMarked,
  GraduationCap,
  Lightbulb,
  MessageSquare,
  Search,
  Sparkles,
  TrendingUp,
  Users,
  FileText,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { hu } from "date-fns/locale";

import { SearchBar } from "@/components/search-bar";
import { SiteShell } from "@/components/site-shell";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getPlatformStats, getRecentReviews, getUniversities } from "@/lib/data";
import { getCurrentUser } from "@/lib/session";

export default async function HomePage() {
  const [stats, recentReviews, universities, currentUser] = await Promise.all([
    getPlatformStats(),
    getRecentReviews(4),
    getUniversities(),
    getCurrentUser(),
  ]);

  const totalContent = stats.reviews + stats.resources + stats.examTips;

  return (
    <SiteShell>
      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-br from-primary/5 via-background to-secondary/20 px-4 pb-20 pt-20 sm:px-6 lg:px-8">
        {/* decorative blobs */}
        <div className="pointer-events-none absolute -top-32 right-0 h-[520px] w-[520px] rounded-full bg-primary/8 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-[360px] w-[360px] rounded-full bg-secondary/30 blur-[100px]" />

        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            {/* copy */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-2 text-sm font-medium text-primary">
                <Sparkles className="h-4 w-4" />
                Tárgytúlélő eszköztár magyar egyetemistáknak
              </div>

              <div className="space-y-5">
                <h1 className="font-heading text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
                  Túlélni az egyetemet?{" "}
                  <span className="text-primary/70">Kezdd itt.</span>
                </h1>
                <p className="max-w-xl text-lg leading-8 text-muted-foreground">
                  Notes, ZH tippek, valódi tapasztalatok egy helyen. Pár másodperc alatt megtudod, mire számíts egy tárgynál.
                </p>
              </div>

              <div className="max-w-lg">
                <SearchBar />
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href="/universities">
                  <Button size="lg">
                    Böngészd a tárgyakat
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                {!currentUser && (
                  <Link href="/register">
                    <Button variant="outline" size="lg">
                      Saját fiók
                    </Button>
                  </Link>
                )}
                {currentUser && (
                  <Link href="/profile">
                    <Button variant="outline" size="lg">
                      Profilom
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* stat grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Tárgy az adatbázisban", value: stats.subjects, icon: BookOpen, color: "bg-primary text-primary-foreground" },
                { label: "Hallgatói vélemény", value: stats.reviews, icon: MessageSquare, color: "bg-secondary text-secondary-foreground" },
                { label: "Vizsgatipp", value: stats.examTips, icon: Lightbulb, color: "bg-accent text-accent-foreground" },
                { label: "Megosztott forrás", value: stats.resources, icon: FileText, color: "bg-muted text-muted-foreground" },
              ].map((stat) => (
                <Card key={stat.label} className="overflow-hidden">
                  <CardContent className="flex flex-col gap-3 p-5">
                    <div className={`inline-flex w-fit rounded-2xl p-2.5 ${stat.color}`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-heading text-3xl font-bold">{stat.value.toLocaleString("hu-HU")}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-20 px-4 py-20 sm:px-6 lg:px-8">

        {/* ── HOW IT WORKS ─────────────────────────────────── */}
        <section>
          <div className="mb-12 text-center">
            <h2 className="font-heading text-4xl font-bold">Hogyan működik?</h2>
            <p className="mt-3 text-muted-foreground">Négy egyszerű lépés, amitől nem lesz több meglepetés vizsgán</p>
          </div>

          {/* step connector */}
          <div className="relative mb-10 hidden items-center md:flex">
            <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-border" />
            <div className="relative flex w-full justify-between">
              {["1", "2", "3", "4"].map((n) => (
                <div key={n} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-background text-sm font-bold text-primary">
                  {n}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            {[
              {
                step: "1. lépés",
                title: "Tárgy megkeresése",
                desc: "Keress tárgynév, kód vagy szak szerint az összes elérhető curriculum-ban.",
                icon: Search,
              },
              {
                step: "2. lépés",
                title: "Tapasztalatok olvasása",
                desc: "Valódi hallgatók véleménye: miből kérdez, mennyire szívatós és mire figyelj.",
                icon: BookOpen,
              },
              {
                step: "3. lépés",
                title: "Felkészülés tippekkel",
                desc: "Vizsgatippek, összefoglalók és linkek egy helyen — időt spórolsz a kereséssel.",
                icon: Lightbulb,
              },
              {
                step: "4. lépés",
                title: "Haladás követése",
                desc: "Jelöld be, mit teljesítettél, mit tanulsz épp és mit tervezel — szemeszterenkénti bontásban.",
                icon: TrendingUp,
              },
            ].map((item) => (
              <Card key={item.title} className="border-border/60">
                <CardContent className="space-y-4 p-6">
                  <Badge variant="outline" className="font-mono text-xs">
                    {item.step}
                  </Badge>
                  <div className="rounded-2xl bg-secondary p-3 w-fit">
                    <item.icon className="h-5 w-5 text-secondary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* flow diagram */}
          <div className="mt-10 rounded-[2rem] border border-border/60 bg-card/60 p-8">
            <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr]">
              <div className="space-y-3">
                {[
                  { label: "Tárgy keresése" },
                  { label: "Tapasztalatok" },
                  { label: "Saját haladás" },
                  { label: "Közösség" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center gap-2 rounded-2xl border border-border/60 bg-background px-4 py-3 text-sm font-medium">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    {row.label}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-primary/30 bg-primary/10">
                  <GraduationCap className="h-7 w-7 text-primary" />
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { label: "Jobb vizsgafelkészülés" },
                  { label: "Azonnali tippek" },
                  { label: "Kredit-áttekintés" },
                  { label: "Kapcsolatok a közösséggel" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center gap-2 rounded-2xl border border-border/60 bg-background px-4 py-3 text-sm font-medium">
                    <div className="h-2 w-2 rounded-full bg-secondary-foreground/60" />
                    {row.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURES ─────────────────────────────────────── */}
        <section>
          <div className="mb-12 text-center">
            <h2 className="font-heading text-4xl font-bold">Amire szükséged van</h2>
            <p className="mt-3 text-muted-foreground">Az összes funkció, amit egy komoly hallgató megérdemel</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Gyors tárgykeresés",
                desc: "Tárgynév, kód vagy szak alapján pár másodperc alatt megtalálod, amit keresel.",
                icon: Search,
                highlight: true,
              },
              {
                title: "Valódi vélemények",
                desc: "Nem marketing — miből kérdez, mennyire szívatós, milyen a tanár.",
                icon: MessageSquare,
                highlight: false,
              },
              {
                title: "Vizsgára hangolva",
                desc: "Vizsgatippek és fókuszpontok, amiket korábbi hallgatók gyűjtöttek össze.",
                icon: Lightbulb,
                highlight: false,
              },
              {
                title: "Szemeszter-tervező",
                desc: "Kövesd nyomon a haladásod: tervezett, folyamatban, teljesített státuszokkal.",
                icon: TrendingUp,
                highlight: false,
              },
              {
                title: "Mentett tárgyak",
                desc: "Bookmarkold a tárgyakat, amiket szeretnél elolvasni vagy nyomon követni.",
                icon: BookMarked,
                highlight: false,
              },
              {
                title: "Közösségi tartalom",
                desc: "Szavazz, kommentelj és járulj hozzá a közös tudástárhoz.",
                icon: Users,
                highlight: false,
              },
            ].map((feature) => (
              <Card
                key={feature.title}
                className={feature.highlight ? "border-primary/30 bg-primary text-primary-foreground" : "border-border/60"}
              >
                <CardContent className="space-y-4 p-6">
                  <div className={`inline-flex rounded-2xl p-3 ${feature.highlight ? "bg-primary-foreground/15" : "bg-secondary"}`}>
                    <feature.icon className={`h-5 w-5 ${feature.highlight ? "text-primary-foreground" : "text-secondary-foreground"}`} />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-semibold">{feature.title}</h3>
                    <p className={`mt-2 text-sm leading-7 ${feature.highlight ? "text-primary-foreground/75" : "text-muted-foreground"}`}>
                      {feature.desc}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ── RECENT ACTIVITY + UNIVERSITIES ───────────────── */}
        <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          {/* recent reviews */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading text-2xl font-bold">Friss vélemények</h2>
                <p className="text-sm text-muted-foreground">Amit a közösség mostanában megosztott</p>
              </div>
              <Link href="/universities">
                <Button variant="outline" size="sm">
                  Összes <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {recentReviews.length === 0 && (
                <Card>
                  <CardContent className="py-10 text-center text-sm text-muted-foreground">
                    Még nincs vélemény. Légy az első!
                  </CardContent>
                </Card>
              )}
              {recentReviews.map((review) => (
                <Link key={review.id} href={`/subjects/${review.subject.slug}`}>
                  <Card className="cursor-pointer transition-colors hover:border-primary/30 hover:bg-card/80">
                    <CardContent className="flex items-start gap-4 p-5">
                      <Avatar name={review.user.name} image={review.user.image} className="h-10 w-10 shrink-0 text-sm" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold">{review.user.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {review.subject.name}
                          </Badge>
                        </div>
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{review.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground/60">
                          {formatDistanceToNow(review.createdAt, { addSuffix: true, locale: hu })}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* university list */}
          <div className="space-y-6">
            <div>
              <h2 className="font-heading text-2xl font-bold">Egyetemek</h2>
              <p className="text-sm text-muted-foreground">Elérhető intézmények a platformon</p>
            </div>

            <div className="space-y-3">
              {universities.map((university) => {
                const programCount = university.faculties.reduce((sum, f) => sum + f.programs.length, 0);
                return (
                  <Link key={university.id} href={`/universities/${university.slug}`}>
                    <Card className="cursor-pointer transition-colors hover:border-primary/30 hover:bg-card/80">
                      <CardContent className="flex items-center gap-4 p-5">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-heading font-bold text-sm">
                          {university.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold">{university.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {university.faculties.length} kar · {programCount} szak
                          </p>
                        </div>
                        <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground/50" />
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>

            <Card className="border-dashed">
              <CardContent className="flex flex-col gap-3 p-5 text-center">
                <p className="text-sm font-medium">Hiányzik az egyetemedek?</p>
                <p className="text-xs text-muted-foreground">
                  Hamarosan bővül az adatbázis. Addig is böngészd a meglévőket!
                </p>
                <Link href="/universities">
                  <Button variant="outline" size="sm" className="w-full">
                    Böngészés
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────── */}
        {!currentUser && (
          <section className="rounded-[2rem] border border-border/60 bg-gradient-to-br from-primary/8 via-background to-secondary/20 p-10 text-center">
            <div className="mx-auto max-w-2xl space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-2 text-sm font-medium text-primary">
                <Users className="h-4 w-4" />
                {stats.users.toLocaleString("hu-HU")} hallgató már csatlakozott
              </div>
              <h2 className="font-heading text-4xl font-bold">
                Csatlakozz a közösséghez
              </h2>
              <p className="text-muted-foreground">
                Ossz meg tapasztalatokat, segíts másoknak és kövesd a saját haladásodat ingyen.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/register">
                  <Button size="lg">
                    Regisztráció — ingyenes
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg">
                    Már van fiókom
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        )}

      </div>
    </SiteShell>
  );
}

