import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BookmarkButton } from "@/components/bookmark-button";
import { CommentList } from "@/components/comment-list";
import { EmptyState } from "@/components/empty-state";
import { ExamTipCard } from "@/components/exam-tip-card";
import { CommentForm } from "@/components/forms/comment-form";
import { ExamTipForm } from "@/components/forms/exam-tip-form";
import { ResourceForm } from "@/components/forms/resource-form";
import { ReviewForm } from "@/components/forms/review-form";
import { ReportButton } from "@/components/report-button";
import { RatingBadge } from "@/components/rating-badge";
import { ResourceCard } from "@/components/resource-card";
import { ReviewCard } from "@/components/review-card";
import { SiteShell } from "@/components/site-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSubjectBySlug } from "@/lib/data";
import { getCurrentUser } from "@/lib/session";
import { getSubjectCategory } from "@/lib/subject-groups";

type PageProps = {
  params: Promise<{ subjectSlug: string }>;
};

function getWorkloadLabel(difficulty: number, signals: number) {
  if (difficulty >= 8 || signals >= 12) return "Magas terhelés";
  if (difficulty >= 5 || signals >= 6) return "Közepes terhelés";
  return "Jól menedzselhető";
}

function getStudyTimeLabel(difficulty: number, credits: number | null) {
  if (difficulty >= 8 || (credits ?? 0) >= 6) return "Heti 8-12 óra";
  if (difficulty >= 5 || (credits ?? 0) >= 4) return "Heti 4-7 óra";
  return "Heti 2-4 óra";
}

function getPassStrategy(difficulty: number, reviewCount: number, hasPrerequisite: boolean) {
  if (difficulty >= 8) return "Ne hagyd az utolsó hétre, és már félév közben építs saját gyakorló rutint.";
  if (hasPrerequisite) return "Az előfeltétel anyagát is tartsd melegen, mert valószínűleg arra épít a tárgy.";
  if (reviewCount >= 3) return "Használd ki a review-kat és a tippeket, itt már van elég közösségi kapaszkodó.";
  return "Haladj heti ritmusban, és minél előbb gyűjts saját jegyzetet a ZH-khoz.";
}

function getQuestionFocus(subjectName: string, topTip: string | null) {
  if (topTip) return topTip;
  if (/adatb[aá]zis/i.test(subjectName)) return "Valószínűleg a lekérdezések, relációk és gyakorlati mintapéldák a legfontosabbak.";
  if (/matematika|anal[ií]zis|diszkr[eé]t/i.test(subjectName)) return "Definíciók, tételek és a tipikus bizonyítási sémák lehetnek a legfontosabbak.";
  if (/programoz[aá]s|algoritmus/i.test(subjectName)) return "Gyakorlófeladatokra és önálló kódolásra érdemes építeni, nem csak elolvasni az anyagot.";
  return "A korábbi tapasztalatok alapján a gyakorlati fókusz és a visszatérő mintafeladatok megfogása a legjobb stratégia.";
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { subjectSlug } = await params;
  const subject = await getSubjectBySlug(subjectSlug);
  if (!subject) return {};

  return {
    title: subject.name,
    description: `${subject.name} tárgyoldal hallgatói tapasztalatokkal, tantervi adatokkal és ZH tippekkel.`
  };
}

export default async function SubjectPage({ params }: PageProps) {
  const { subjectSlug } = await params;
  const currentUser = await getCurrentUser();
  const subject = await getSubjectBySlug(subjectSlug, currentUser?.id);

  if (!subject) notFound();

  const averageDifficulty = subject.averageDifficulty || 0;
  const averageUsefulness = subject.averageUsefulness || 0;
  const category = getSubjectCategory(subject.name);
  const totalSignals = subject.reviews.length + subject.resources.length + subject.examTips.length + subject.comments.length;
  const topReview = [...subject.reviews].sort((a, b) => b.score + b.usefulnessRating - (a.score + a.usefulnessRating))[0] ?? null;
  const topTip = [...subject.examTips].sort((a, b) => b.score - a.score)[0] ?? null;
  const passStrategy = getPassStrategy(averageDifficulty, subject.reviews.length, Boolean(subject.prerequisites));
  const questionFocus = getQuestionFocus(subject.name, topTip?.content ?? null);

  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Link href="/universities" className="hover:text-foreground">Egyetemek</Link>
          <span>/</span>
          <Link href={`/universities/${subject.program.faculty.university.slug}`} className="hover:text-foreground">{subject.program.faculty.university.name}</Link>
          <span>/</span>
          <Link href={`/faculties/${subject.program.faculty.slug}`} className="hover:text-foreground">{subject.program.faculty.name}</Link>
          <span>/</span>
          <Link href={`/programs/${subject.program.slug}`} className="hover:text-foreground">{subject.program.name}</Link>
        </div>

        <Card className="overflow-hidden border-border/80 bg-gradient-to-br from-card via-card to-secondary/25">
          <CardContent className="flex flex-col gap-8 p-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{category}</Badge>
                <Badge variant="outline">{subject.subjectType === "REQUIRED" ? "Kötelező" : "Kötelezően választható"}</Badge>
                {subject.subjectSeason !== "ANY" ? <Badge variant="outline">{subject.subjectSeason === "FALL" ? "Őszi" : "Tavaszi"} tárgy</Badge> : null}
                {subject.code ? <Badge variant="outline">{subject.code}</Badge> : null}
                {subject.credits ? <Badge>{subject.credits} kredit</Badge> : null}
                {subject.recommendedSemester ? <Badge variant="outline">{subject.recommendedSemester}. ajánlott félév</Badge> : null}
              </div>
              <div>
                <h1 className="font-heading text-4xl font-bold sm:text-5xl">{subject.name}</h1>
                <p className="mt-3 max-w-3xl text-muted-foreground">{subject.description}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <RatingBadge label="Átlagos nehézség" value={averageDifficulty} />
                <RatingBadge label="Hasznosság" value={averageUsefulness} />
              </div>
              {subject.prerequisites ? <p className="text-sm text-muted-foreground">Előkövetelmény: <span className="font-medium text-foreground">{subject.prerequisites}</span></p> : null}
            </div>
            <div className="flex w-full max-w-sm flex-col gap-3">
              <div className="flex justify-end">
                <ReportButton targetId={subject.id} targetType="SUBJECT" />
              </div>
              {currentUser ? <BookmarkButton subjectId={subject.id} initialBookmarked={subject.isBookmarked} /> : <Link href="/login"><Button variant="outline" className="w-full">Jelentkezz be a bookmarkhoz</Button></Link>}
              <Link href="#review-form"><Button className="w-full">Írj tapasztalatot</Button></Link>
              <Link href="#resource-form"><Button variant="secondary" className="w-full">Adj hozzá jegyzetet</Button></Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6">
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-border/60 bg-gradient-to-r from-accent/40 via-transparent to-secondary/25">
              <CardTitle>Gyors túlélő dashboard</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 p-6 md:grid-cols-2 2xl:grid-cols-[1.2fr_1fr_1fr_1.1fr]">
              <div className="rounded-[30px] border border-border/70 bg-primary px-6 py-6 text-primary-foreground shadow-sm">
                <p className="text-xs uppercase tracking-[0.18em] text-primary-foreground/70">Összkép</p>
                <p className="mt-3 font-heading text-[clamp(2rem,4vw,3rem)] font-bold leading-[0.95]">{getWorkloadLabel(averageDifficulty, totalSignals)}</p>
                <p className="mt-4 max-w-xs text-sm leading-6 text-primary-foreground/80">
                  {totalSignals} közösségi jel alapján most ez a leggyorsabb olvasat arról, mennyire fogja széthúzni a félévedet.
                </p>
              </div>

              <div className="rounded-[30px] border border-border/70 bg-background/70 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Heti ráfordítás</p>
                <p className="mt-3 font-heading text-[clamp(1.8rem,3vw,2.4rem)] font-bold leading-tight">{getStudyTimeLabel(averageDifficulty, subject.credits)}</p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  MVP becslés a tárgy nehézsége, kreditje és a közösségi aktivitás alapján.
                </p>
              </div>

              <div className="rounded-[30px] border border-border/70 bg-background/70 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Előadás / gyakorlat</p>
                <p className="mt-3 font-heading text-[clamp(1.8rem,3vw,2.4rem)] font-bold leading-tight">{subject.lectureHours ?? 0} / {subject.practiceHours ?? 0} óra</p>
                <p className="mt-2 text-sm text-muted-foreground">{subject.lectureCredits ?? 0} EA kredit • {subject.practiceCredits ?? 0} GY kredit</p>
              </div>

              <div className="rounded-[30px] border border-border/70 bg-secondary/35 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Ajánlott stratégia</p>
                <p className="mt-3 text-base font-medium leading-7 text-foreground">{passStrategy}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <Card>
            <CardHeader><CardTitle>Mire figyelj ennél a tárgynál?</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-3xl border border-border/70 bg-background/70 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Miből kérdezhetnek gyakran</p>
                <p className="mt-2 text-sm leading-7">{questionFocus}</p>
              </div>
              <div className="rounded-3xl border border-border/70 bg-background/70 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Top review</p>
                <p className="mt-2 text-sm leading-7">{topReview ? topReview.title : "Még nincs kiemelhető review ehhez a tárgyhoz."}</p>
              </div>
              <div className="rounded-3xl border border-border/70 bg-background/70 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Top tipp</p>
                <p className="mt-2 text-sm leading-7">{topTip ? topTip.content : "Még nincs kiemelhető ZH/vizsga tipp."}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Tantervi megjegyzés</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-3xl border border-border/70 bg-background/70 p-5">
                <p className="text-sm leading-7">{subject.curriculumNote || "Ehhez a tárgyhoz most még nincs külön tantervi megjegyzés feltöltve."}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid gap-4">
          <Card>
            <CardHeader><CardTitle>Tantervi adatok</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-3xl border border-border/70 bg-background/70 p-5"><p className="text-sm text-muted-foreground">Előadás</p><p className="mt-2 font-heading text-2xl font-bold">{subject.lectureCredits ?? 0} kredit</p><p className="text-sm text-muted-foreground">{subject.lectureHours ?? 0} óra / hét</p></div>
              <div className="rounded-3xl border border-border/70 bg-background/70 p-5"><p className="text-sm text-muted-foreground">Gyakorlat</p><p className="mt-2 font-heading text-2xl font-bold">{subject.practiceCredits ?? 0} kredit</p><p className="text-sm text-muted-foreground">{subject.practiceHours ?? 0} óra / hét</p></div>
              <div className="rounded-3xl border border-border/70 bg-background/70 p-5"><p className="text-sm text-muted-foreground">Szezon</p><p className="mt-2 font-heading text-2xl font-bold">{subject.subjectSeason === "FALL" ? "Őszi" : subject.subjectSeason === "SPRING" ? "Tavaszi" : "Nincs kötés"}</p><p className="text-sm text-muted-foreground">{subject.subjectType === "REQUIRED" ? "Kötelező" : "Kötelezően választható"}</p></div>
              <div className="rounded-3xl border border-border/70 bg-background/70 p-5"><p className="text-sm text-muted-foreground">Átmenési alap</p><p className="mt-2 font-heading text-2xl font-bold">{subject.resources.length + subject.examTips.length > 0 ? "Van kapaszkodó" : "Még épül"}</p><p className="text-sm text-muted-foreground">{subject.resources.length} forrás • {subject.examTips.length} tipp</p></div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-8">
            <section className="space-y-4" id="reviews">
              <div className="flex items-center justify-between"><h2 className="font-heading text-2xl font-semibold">Tapasztalatok</h2><Badge variant="outline">{subject.reviews.length} db</Badge></div>
              {subject.reviews.length ? <div className="space-y-4">{subject.reviews.map((review) => <ReviewCard key={review.id} review={review} />)}</div> : <EmptyState title="Még nincs review" description="Légy az első, aki leírja, mire kell figyelni ennél a tárgynál." />}
            </section>
            <section className="space-y-4" id="resources">
              <div className="flex items-center justify-between"><h2 className="font-heading text-2xl font-semibold">Jegyzetek és források</h2><Badge variant="outline">{subject.resources.length} db</Badge></div>
              {subject.resources.length ? <div className="space-y-4">{subject.resources.map((resource) => <ResourceCard key={resource.id} resource={resource} />)}</div> : <EmptyState title="Még nincs forrás" description="Tölts fel egy hasznos linket vagy saját jegyzetet, hogy élőbb legyen a tárgyoldal." />}
            </section>
            <section className="space-y-4" id="tips">
              <div className="flex items-center justify-between"><h2 className="font-heading text-2xl font-semibold">ZH / Vizsga tippek</h2><Badge variant="outline">{subject.examTips.length} db</Badge></div>
              {subject.examTips.length ? <div className="space-y-4">{subject.examTips.map((tip) => <ExamTipCard key={tip.id} tip={tip} />)}</div> : <EmptyState title="Még nincs tipp" description="Írj pár tömör, konkrét tanácsot arról, miből kérdeztek." />}
            </section>
            <section className="space-y-4" id="comments">
              <div className="flex items-center justify-between"><h2 className="font-heading text-2xl font-semibold">Kommentek / Beszélgetés</h2><Badge variant="outline">{subject.comments.length} db</Badge></div>
              {subject.comments.length ? <CommentList comments={subject.comments} /> : <EmptyState title="Még nincs komment" description="Ha kérdésed van a tárgyról, itt nyiss beszélgetést." />}
            </section>
          </div>
          <div className="space-y-6">
            <Card id="review-form"><CardHeader><CardTitle>Új tapasztalat</CardTitle></CardHeader><CardContent>{currentUser ? <ReviewForm subjectId={subject.id} /> : <EmptyState title="Bejelentkezés szükséges" description="A tapasztalat megírásához előbb lépj be." />}</CardContent></Card>
            <Card id="resource-form"><CardHeader><CardTitle>Jegyzet vagy forrás beküldése</CardTitle></CardHeader><CardContent>{currentUser ? <ResourceForm subjectId={subject.id} /> : <EmptyState title="Bejelentkezés szükséges" description="Forrást csak bejelentkezett felhasználó tud hozzáadni." />}</CardContent></Card>
            <Card><CardHeader><CardTitle>Új ZH / vizsga tipp</CardTitle></CardHeader><CardContent>{currentUser ? <ExamTipForm subjectId={subject.id} /> : <EmptyState title="Bejelentkezés szükséges" description="A tippek beküldéséhez be kell jelentkezned." />}</CardContent></Card>
            <Card><CardHeader><CardTitle>Komment írása</CardTitle></CardHeader><CardContent>{currentUser ? <CommentForm subjectId={subject.id} /> : <EmptyState title="Bejelentkezés szükséges" description="Kommentelni csak bejelentkezés után lehet." />}</CardContent></Card>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
