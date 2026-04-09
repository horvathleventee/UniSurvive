import Link from "next/link";
import { redirect } from "next/navigation";

import { EmptyState } from "@/components/empty-state";
import { SiteShell } from "@/components/site-shell";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getProfileData } from "@/lib/data";
import { getCurrentUser } from "@/lib/session";

type ActivityItem =
  | { id: string; createdAt: Date; subject: { name: string; slug: string }; kind: "review"; preview: string }
  | { id: string; createdAt: Date; subject: { name: string; slug: string }; kind: "resource"; preview: string }
  | { id: string; createdAt: Date; subject: { name: string; slug: string }; kind: "tip"; preview: string };

function getActivityLabel(kind: ActivityItem["kind"]) {
  switch (kind) {
    case "review":
      return "Review";
    case "resource":
      return "Forrás";
    case "tip":
      return "Vizsgatipp";
  }
}

export default async function ProfilePage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  const profile = await getProfileData(currentUser.id);
  if (!profile) redirect("/login");

  const totalContributionCount = profile.reviews.length + profile.resources.length + profile.examTips.length;
  const activityFeed: ActivityItem[] = [
    ...profile.reviews.map((item) => ({ id: item.id, createdAt: item.createdAt, subject: item.subject, kind: "review" as const, preview: item.title })),
    ...profile.resources.map((item) => ({ id: item.id, createdAt: item.createdAt, subject: item.subject, kind: "resource" as const, preview: item.title })),
    ...profile.examTips.map((item) => ({ id: item.id, createdAt: item.createdAt, subject: item.subject, kind: "tip" as const, preview: item.content.slice(0, 96) }))
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 10);

  const requiredSubjects = (profile.program?.subjects ?? []).filter((subject) => subject.subjectType === "REQUIRED");
  const requiredElectiveSubjects = (profile.program?.subjects ?? []).filter((subject) => subject.subjectType === "REQUIRED_ELECTIVE");
  const progressMap = Object.fromEntries(profile.progressEntries.map((entry) => [entry.subjectId, entry.status] as const));
  const completedSubjects = requiredSubjects.filter((subject) => progressMap[subject.id] === "COMPLETED");
  const inProgressSubjects = requiredSubjects.filter((subject) => progressMap[subject.id] === "IN_PROGRESS");
  const completedCredits = completedSubjects.reduce((sum, subject) => sum + (subject.credits ?? 0), 0);
  const totalRequiredCredits = requiredSubjects.reduce((sum, subject) => sum + (subject.credits ?? 0), 0);
  const remainingCredits = Math.max(totalRequiredCredits - completedCredits, 0);

  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Card className="overflow-hidden border-border/80 bg-gradient-to-br from-card via-card to-secondary/20">
          <CardContent className="p-8">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-5">
                <Avatar name={profile.name} image={profile.image} className="h-24 w-24 text-xl" />
                <div className="space-y-4">
                  <div>
                    <h1 className="font-heading text-4xl font-bold sm:text-5xl">{profile.name}</h1>
                    <p className="mt-1 text-lg text-muted-foreground">@{profile.username}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profile.university ? <Badge variant="outline">{profile.university.name}</Badge> : null}
                    {profile.program ? <Badge variant="outline">{profile.program.name}</Badge> : null}
                    <Badge>Tag {new Intl.DateTimeFormat("hu-HU").format(profile.createdAt)}</Badge>
                    {profile.role === "ADMIN" || profile.role === "MODERATOR" ? (
                      <Link href="/admin/reports">
                        <Badge>Moderáció</Badge>
                      </Link>
                    ) : null}
                  </div>
                  <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                    {profile.bio || "Itt követheted a saját aktivitásaidat, a mentett tárgyaidat és a szakodhoz tartozó haladást."}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap gap-3 lg:justify-end">
                <Link href="/profile/settings">
                  <Button>Profil szerkesztése</Button>
                </Link>
                <Link href="/profile/progress">
                  <Button variant="outline">Haladás</Button>
                </Link>
                <Link href="/profile/sessions">
                  <Button variant="outline">Sessionök</Button>
                </Link>
              </div>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_1fr_1fr]">
              <div className="rounded-[30px] border border-border/70 bg-primary px-6 py-6 text-primary-foreground">
                <p className="text-xs uppercase tracking-[0.18em] text-primary-foreground/70">Profil összkép</p>
                <p className="mt-3 font-heading text-[clamp(2rem,4vw,3rem)] font-bold leading-[0.95]">{totalContributionCount}</p>
                <p className="mt-2 text-sm text-primary-foreground/80">Ennyi saját review, forrás és vizsgatipp építi már a profilodat.</p>
              </div>
              <div className="rounded-[30px] border border-border/70 bg-background/70 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Mentett tárgyak</p>
                <p className="mt-3 font-heading text-[clamp(1.8rem,3vw,2.4rem)] font-bold">{profile.bookmarks.length}</p>
                <p className="mt-2 text-sm text-muted-foreground">Saját későbbre félrerakott tárgylistád.</p>
              </div>
              <div className="rounded-[30px] border border-border/70 bg-secondary/35 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Vizsgatippek</p>
                <p className="mt-3 font-heading text-[clamp(1.8rem,3vw,2.4rem)] font-bold">{profile.examTips.length}</p>
                <p className="mt-2 text-sm text-muted-foreground">Rövid, hasznos kapaszkodók a tárgyoldalakhoz.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 grid gap-6 md:grid-cols-4">
          <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Review-k</p><p className="font-heading text-4xl font-bold">{profile.reviews.length}</p></CardContent></Card>
          <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Feltöltött források</p><p className="font-heading text-4xl font-bold">{profile.resources.length}</p></CardContent></Card>
          <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Vizsgatippek</p><p className="font-heading text-4xl font-bold">{profile.examTips.length}</p></CardContent></Card>
          <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Bookmarkok</p><p className="font-heading text-4xl font-bold">{profile.bookmarks.length}</p></CardContent></Card>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Card>
            <CardHeader className="border-b border-border/60 bg-gradient-to-r from-accent/35 via-transparent to-secondary/20">
              <CardTitle>Haladás és biztonság</CardTitle>
              <CardDescription>A nagy tracker külön oldalon van, a session és audit nézet pedig külön security blokkot kapott.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 p-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-[26px] border border-border/70 bg-background/70 p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Kész kötelező kreditek</p>
                  <p className="mt-3 font-heading text-3xl font-bold">{completedCredits}</p>
                </div>
                <div className="rounded-[26px] border border-border/70 bg-background/70 p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Folyamatban</p>
                  <p className="mt-3 font-heading text-3xl font-bold">{inProgressSubjects.length}</p>
                </div>
                <div className="rounded-[26px] border border-border/70 bg-background/70 p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Még kell</p>
                  <p className="mt-3 font-heading text-3xl font-bold">{remainingCredits}</p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-[26px] border border-border/70 bg-background/70 p-5">
                  <p className="text-sm text-muted-foreground">Kötelező tárgyak</p>
                  <p className="mt-2 font-heading text-3xl font-bold">{requiredSubjects.length}</p>
                </div>
                <div className="rounded-[26px] border border-border/70 bg-background/70 p-5">
                  <p className="text-sm text-muted-foreground">Köt. választhatók</p>
                  <p className="mt-2 font-heading text-3xl font-bold">{requiredElectiveSubjects.length}</p>
                </div>
                <div className="rounded-[26px] border border-border/70 bg-background/70 p-5">
                  <p className="text-sm text-muted-foreground">Session security</p>
                  <p className="mt-2 font-heading text-3xl font-bold">Aktív</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Saját aktivitás</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {activityFeed.length ? (
                activityFeed.map((item) => (
                  <Link key={item.id} href={`/subjects/${item.subject.slug}`} className="block rounded-[26px] border border-border bg-card/80 p-4 transition-colors hover:border-primary/40">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">{getActivityLabel(item.kind)}</Badge>
                      <p className="text-xs text-muted-foreground">
                        {new Intl.DateTimeFormat("hu-HU", { year: "numeric", month: "short", day: "numeric" }).format(item.createdAt)}
                      </p>
                    </div>
                    <p className="mt-3 font-medium">{item.subject.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.preview}</p>
                  </Link>
                ))
              ) : (
                <EmptyState title="Még nincs aktivitás" description="Ha írsz review-t, tippet vagy feltöltesz forrást, itt rögtön látni fogod." />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </SiteShell>
  );
}
