import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BookMarked,
  ChevronRight,
  FileText,
  GraduationCap,
  Lightbulb,
  MessageSquare,
  Settings,
  Shield,
  TrendingUp,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { hu } from "date-fns/locale";

import { EmptyState } from "@/components/empty-state";
import { SiteShell } from "@/components/site-shell";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getProfileData } from "@/lib/data";
import { getCurrentUser } from "@/lib/session";

type ActivityItem =
  | { id: string; createdAt: Date; subject: { name: string; slug: string }; kind: "review"; preview: string }
  | { id: string; createdAt: Date; subject: { name: string; slug: string }; kind: "resource"; preview: string }
  | { id: string; createdAt: Date; subject: { name: string; slug: string }; kind: "tip"; preview: string };

const KIND_META = {
  review:   { label: "Review",     icon: MessageSquare, color: "bg-blue-500/15 text-blue-600 dark:text-blue-400" },
  resource: { label: "Forrás",     icon: FileText,      color: "bg-green-500/15 text-green-600 dark:text-green-400" },
  tip:      { label: "Vizsgatipp", icon: Lightbulb,     color: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
};

export default async function ProfilePage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  const profile = await getProfileData(currentUser.id);
  if (!profile) redirect("/login");

  const totalContributions = profile.reviews.length + profile.resources.length + profile.examTips.length;

  const activityFeed: ActivityItem[] = [
    ...profile.reviews.map((item) => ({ id: item.id, createdAt: item.createdAt, subject: item.subject, kind: "review" as const, preview: item.title })),
    ...profile.resources.map((item) => ({ id: item.id, createdAt: item.createdAt, subject: item.subject, kind: "resource" as const, preview: item.title })),
    ...profile.examTips.map((item) => ({ id: item.id, createdAt: item.createdAt, subject: item.subject, kind: "tip" as const, preview: item.content.slice(0, 90) })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 8);

  const requiredSubjects = (profile.program?.subjects ?? []).filter((s) => s.subjectType === "REQUIRED");
  const requiredElectiveSubjects = (profile.program?.subjects ?? []).filter((s) => s.subjectType === "REQUIRED_ELECTIVE");
  const progressMap = Object.fromEntries(profile.progressEntries.map((e) => [e.subjectId, e.status] as const));

  // Credit calculation includes both REQUIRED and REQUIRED_ELECTIVE subjects
  const completedSubjects = requiredSubjects.filter((s) => progressMap[s.id] === "COMPLETED");
  const completedElectiveSubjects = requiredElectiveSubjects.filter((s) => progressMap[s.id] === "COMPLETED");
  const inProgressSubjects = requiredSubjects.filter((s) => progressMap[s.id] === "IN_PROGRESS");
  const completedCredits = [...completedSubjects, ...completedElectiveSubjects].reduce((sum, s) => sum + (s.credits ?? 0), 0);
  const totalRequiredCredits = [...requiredSubjects, ...requiredElectiveSubjects].reduce((sum, s) => sum + (s.credits ?? 0), 0);
  const creditPct = totalRequiredCredits > 0 ? Math.round((completedCredits / totalRequiredCredits) * 100) : 0;

  const joinDate = new Intl.DateTimeFormat("hu-HU", { year: "numeric", month: "long" }).format(profile.createdAt);

  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        {/* ── BENTO GRID ────────────────────────────────────── */}
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">

          {/* ── Bio card (large, top-left) ── */}
          <Card className="col-span-full overflow-hidden border-border/60 bg-gradient-to-br from-card via-card to-secondary/20 md:col-span-2 lg:col-span-2">
            <CardContent className="p-7">
              {/* avatar row */}
              <div className="flex items-start gap-5">
                <Avatar name={profile.name} image={profile.image} className="h-20 w-20 shrink-0 rounded-3xl text-lg" />
                <div className="min-w-0 flex-1 space-y-1">
                  <h1 className="font-heading text-2xl font-bold leading-tight sm:text-3xl">{profile.name}</h1>
                  <p className="text-sm text-muted-foreground">@{profile.username}</p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {profile.role === "ADMIN" && <Badge className="bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30">Admin</Badge>}
                    {profile.role === "MODERATOR" && <Badge className="bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30">Moderátor</Badge>}
                    {profile.university && <Badge variant="outline">{profile.university.name}</Badge>}
                  </div>
                </div>
              </div>

              {/* bio */}
              <p className="mt-5 text-sm leading-7 text-muted-foreground">
                {profile.bio || "Még nincs bio. A beállításoknál tudod megadni, mi jellemez téged leginkább."}
              </p>

              {/* info rows */}
              <div className="mt-5 space-y-2 divide-y divide-border/50">
                <div className="flex items-center justify-between pb-2">
                  <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <GraduationCap className="h-3.5 w-3.5" /> Szak
                  </span>
                  <span className="text-xs font-semibold text-foreground">
                    {profile.program?.name ?? "Nincs beállítva"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Shield className="h-3.5 w-3.5" /> Tag óta
                  </span>
                  <span className="text-xs font-semibold text-foreground">{joinDate}</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <TrendingUp className="h-3.5 w-3.5" /> Hozzájárulás
                  </span>
                  <span className="text-xs font-semibold text-foreground">{totalContributions} tartalom</span>
                </div>
              </div>

              {/* quick actions */}
              <div className="mt-6 flex flex-wrap gap-2">
                <Link
                  href="/profile/settings"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border/60 bg-background/60 px-3 py-2 text-xs font-medium transition-colors hover:border-primary/40 hover:bg-muted"
                >
                  <Settings className="h-3.5 w-3.5" /> Beállítások
                </Link>
                <Link
                  href="/profile/progress"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border/60 bg-background/60 px-3 py-2 text-xs font-medium transition-colors hover:border-primary/40 hover:bg-muted"
                >
                  <TrendingUp className="h-3.5 w-3.5" /> Haladás
                </Link>
                <Link
                  href="/profile/sessions"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border/60 bg-background/60 px-3 py-2 text-xs font-medium transition-colors hover:border-primary/40 hover:bg-muted"
                >
                  <Shield className="h-3.5 w-3.5" /> Sessionök
                </Link>
                {(profile.role === "ADMIN" || profile.role === "MODERATOR") && (
                  <Link
                    href="/admin/reports"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 px-3 py-2 text-xs font-medium text-purple-600 transition-colors hover:bg-purple-500/15 dark:text-purple-400"
                  >
                    <Shield className="h-3.5 w-3.5" /> Moderáció
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          {/* ── Stat tiles ── */}
          {[
            { label: "Review",        value: profile.reviews.length,   icon: MessageSquare, accent: "bg-blue-500/10 border-blue-500/20",    iconColor: "text-blue-500" },
            { label: "Forrás",        value: profile.resources.length, icon: FileText,      accent: "bg-green-500/10 border-green-500/20",   iconColor: "text-green-500" },
            { label: "Vizsgatipp",    value: profile.examTips.length,  icon: Lightbulb,     accent: "bg-amber-500/10 border-amber-500/20",   iconColor: "text-amber-500" },
            { label: "Mentett tárgy", value: profile.bookmarks.length, icon: BookMarked,    accent: "bg-primary/10 border-primary/20",       iconColor: "text-primary" },
          ].map((stat) => (
            <Card key={stat.label} className={`border ${stat.accent} bg-card/60`}>
              <CardContent className="flex flex-col gap-4 p-6">
                <div className={`w-fit rounded-2xl p-2.5 ${stat.accent}`}>
                  <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
                <div>
                  <p className="font-heading text-4xl font-bold">{stat.value}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* ── Kredit progress card ── */}
          <Card className="col-span-full border-border/60 md:col-span-2 lg:col-span-2">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Kredithaladás</p>
                  <p className="mt-0.5 font-heading text-xl font-bold">{profile.program?.name ?? "Szak nincs beállítva"}</p>
                </div>
                <div className="text-right">
                  <p className="font-heading text-3xl font-bold">{creditPct}%</p>
                  <p className="text-xs text-muted-foreground">{completedCredits} / {totalRequiredCredits} kredit</p>
                </div>
              </div>

              {/* progress bar */}
              <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${creditPct}%` }}
                />
              </div>

              {/* sub-stats */}
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { label: "Teljesítve",    value: completedSubjects.length,         sub: "tárgy" },
                  { label: "Folyamatban",   value: inProgressSubjects.length,        sub: "tárgy" },
                  { label: "Köt. vál. telj.", value: completedElectiveSubjects.length, sub: "tárgy" },
                ].map((s) => (
                  <div key={s.label} className="rounded-2xl border border-border/60 bg-background/60 p-3 text-center">
                    <p className="font-heading text-2xl font-bold">{s.value}</p>
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>

              <Link
                href="/profile/progress"
                className="mt-4 flex items-center justify-end gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Részletes haladás <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </CardContent>
          </Card>

          {/* ── Activity feed ── */}
          <Card className="col-span-full border-border/60 lg:col-span-2">
            <CardContent className="p-6">
              <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Legfrissebb aktivitás</p>

              {activityFeed.length === 0 ? (
                <EmptyState
                  title="Még nincs aktivitás"
                  description="Ha írsz review-t, tippet vagy feltöltesz forrást, itt rögtön látni fogod."
                />
              ) : (
                <div className="space-y-2">
                  {activityFeed.map((item) => {
                    const meta = KIND_META[item.kind];
                    const Icon = meta.icon;
                    return (
                      <Link
                        key={item.id}
                        href={`/subjects/${item.subject.slug}`}
                        className="flex items-start gap-3 rounded-2xl border border-border/50 bg-background/50 p-3.5 transition-colors hover:border-primary/30 hover:bg-card/80"
                      >
                        <div className={`mt-0.5 shrink-0 rounded-xl p-1.5 ${meta.color}`}>
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-sm font-semibold">{item.subject.name}</p>
                            <span className="shrink-0 text-[10px] text-muted-foreground">
                              {formatDistanceToNow(item.createdAt, { addSuffix: true, locale: hu })}
                            </span>
                          </div>
                          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{item.preview}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Bookmarks ── */}
          {profile.bookmarks.length > 0 && (
            <Card className="col-span-full border-border/60">
              <CardContent className="p-6">
                <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Mentett tárgyak</p>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {profile.bookmarks.slice(0, 8).map((bm) => (
                    <Link
                      key={bm.id}
                      href={`/subjects/${bm.subject.slug}`}
                      className="flex items-center gap-3 rounded-2xl border border-border/50 bg-background/50 p-3 transition-colors hover:border-primary/30 hover:bg-card/80"
                    >
                      <BookMarked className="h-4 w-4 shrink-0 text-primary" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{bm.subject.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{bm.subject.program.name}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </SiteShell>
  );
}
