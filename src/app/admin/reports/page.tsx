import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertCircle, BookMarked, CheckCircle2, Clock, FileText, Lightbulb, MessageSquare, User } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { ModerationReportActions } from "@/components/moderation-report-actions";
import { SiteShell } from "@/components/site-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getModerationReports, getReportStats } from "@/lib/data";
import { getCurrentUser } from "@/lib/session";

type PageProps = {
  searchParams: Promise<{
    status?: "OPEN" | "REVIEWED" | "RESOLVED";
    q?: string;
  }>;
};

const TARGET_ICON: Record<string, React.ElementType> = {
  REVIEW: MessageSquare,
  NOTE_RESOURCE: FileText,
  EXAM_TIP: Lightbulb,
  COMMENT: MessageSquare,
  SUBJECT: BookMarked,
  USER: User,
};

const STATUS_META = {
  OPEN:     { label: "Nyitott",  variant: "default",    icon: AlertCircle,   cls: "text-red-500" },
  REVIEWED: { label: "Átnézve", variant: "secondary",   icon: Clock,         cls: "text-amber-500" },
  RESOLVED: { label: "Lezárt",  variant: "outline",     icon: CheckCircle2,  cls: "text-green-500" },
} as const;

export default async function AdminReportsPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();

  if (!user || (user.role !== "ADMIN" && user.role !== "MODERATOR")) {
    redirect("/");
  }

  const filters = await searchParams;
  const [reports, stats] = await Promise.all([getModerationReports(), getReportStats()]);

  const filteredReports = reports.filter((report) => {
    const matchesStatus = filters.status ? report.status === filters.status : true;
    const matchesQuery = filters.q
      ? [report.targetLabel, report.reason, report.user.username, report.targetType, report.targetPreview ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(filters.q.toLowerCase())
      : true;
    return matchesStatus && matchesQuery;
  });

  const fmt = (d: Date) =>
    new Intl.DateTimeFormat("hu-HU", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(d);

  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Moderáció</p>
            <h1 className="mt-1 font-heading text-3xl font-bold">Report inbox</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Beérkező jelzések kezelése — tartalom elrejtés, figyelmeztetés, tiltás.
            </p>
          </div>
          <Link
            href="/admin/audit"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border/60 px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            Audit log →
          </Link>
        </div>

        {/* Stats */}
        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          {[
            { label: "Nyitott", value: stats.openReports, icon: AlertCircle, cls: "text-red-500 bg-red-500/10 border-red-500/20" },
            { label: "Átnézve", value: stats.reviewedReports, icon: Clock, cls: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
            { label: "Lezárt", value: stats.resolvedReports, icon: CheckCircle2, cls: "text-green-500 bg-green-500/10 border-green-500/20" },
          ].map((s) => (
            <Card key={s.label} className={`border ${s.cls.split(" ").slice(1).join(" ")}`}>
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`rounded-xl p-2.5 ${s.cls.split(" ").slice(1).join(" ")}`}>
                  <s.icon className={`h-5 w-5 ${s.cls.split(" ")[0]}`} />
                </div>
                <div>
                  <p className="font-heading text-3xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <form className="mb-6 rounded-2xl border border-border/60 bg-card/60 p-4">
          <div className="flex flex-wrap gap-3 md:flex-nowrap">
            <Input
              name="q"
              defaultValue={filters.q ?? ""}
              placeholder="Keresés tartalom, indok, felhasználónév alapján..."
              className="flex-1 rounded-xl"
            />
            <select
              name="status"
              defaultValue={filters.status ?? ""}
              className="rounded-xl border border-border bg-card px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Minden státusz</option>
              <option value="OPEN">Nyitott</option>
              <option value="REVIEWED">Átnézve</option>
              <option value="RESOLVED">Lezárt</option>
            </select>
            <button
              type="submit"
              className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Szűrés
            </button>
            <Link
              href="/admin/reports"
              className="rounded-xl border border-border/60 px-5 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              Törlés
            </Link>
          </div>
          {/* Status quick-filters */}
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/admin/reports">
              <Badge variant={!filters.status ? "default" : "outline"} className="cursor-pointer">
                Összes ({reports.length})
              </Badge>
            </Link>
            <Link href="/admin/reports?status=OPEN">
              <Badge variant={filters.status === "OPEN" ? "default" : "outline"} className="cursor-pointer">
                Nyitott ({stats.openReports})
              </Badge>
            </Link>
            <Link href="/admin/reports?status=REVIEWED">
              <Badge variant={filters.status === "REVIEWED" ? "default" : "outline"} className="cursor-pointer">
                Átnézve ({stats.reviewedReports})
              </Badge>
            </Link>
            <Link href="/admin/reports?status=RESOLVED">
              <Badge variant={filters.status === "RESOLVED" ? "default" : "outline"} className="cursor-pointer">
                Lezárt ({stats.resolvedReports})
              </Badge>
            </Link>
          </div>
        </form>

        {/* Report cards */}
        <div className="space-y-3">
          {filteredReports.length === 0 ? (
            <EmptyState title="Nincs ilyen report" description="A beállított szűrőkre nem találtam beérkezett jelentést." />
          ) : (
            filteredReports.map((report) => {
              const sm = STATUS_META[report.status];
              const StatusIcon = sm.icon;
              const TargetIcon = TARGET_ICON[report.targetType] ?? FileText;

              return (
                <Card key={report.id} className="border-border/60 bg-card/80 transition-shadow hover:shadow-md">
                  <CardContent className="p-5">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start">

                      {/* Left: content info */}
                      <div className="min-w-0 flex-1 space-y-3">

                        {/* Badges row */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-[11px] font-semibold">
                            <TargetIcon className="h-3 w-3" />
                            {report.targetType.replace("_", " ")}
                          </span>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold border ${
                            report.status === "OPEN" ? "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400" :
                            report.status === "REVIEWED" ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                            "border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400"
                          }`}>
                            <StatusIcon className="h-3 w-3" />
                            {sm.label}
                          </span>
                          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold border ${
                            report.targetState === "REJTETT"
                              ? "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400"
                              : "border-border/60 bg-muted/30 text-muted-foreground"
                          }`}>
                            {report.targetState}
                          </span>
                        </div>

                        {/* Target label */}
                        <div>
                          <p className="font-semibold text-foreground">{report.targetLabel}</p>
                          {report.targetPath && (
                            <Link href={report.targetPath} className="mt-0.5 inline-block text-xs text-primary underline-offset-4 hover:underline">
                              Érintett tartalom megnyitása →
                            </Link>
                          )}
                        </div>

                        {/* Preview */}
                        {report.targetPreview && (
                          <div className="rounded-xl border border-border/50 bg-muted/30 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
                            {report.targetPreview}
                          </div>
                        )}

                        {/* Reason + reporter info */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span>
                            <span className="font-medium text-foreground/80">Indok:</span> {report.reason}
                          </span>
                          <span>
                            Bejelentő: <span className="font-medium">@{report.user.username}</span>
                          </span>
                          <span>{fmt(report.createdAt)}</span>
                        </div>

                        {/* Target user info */}
                        {report.targetUsername && (
                          <div className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-background/60 px-3 py-1.5 text-xs">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span className="font-medium">@{report.targetUsername}</span>
                            <span className="text-muted-foreground">— tartalom szerzője</span>
                          </div>
                        )}
                      </div>

                      {/* Right: actions */}
                      <div className="shrink-0 lg:w-56">
                        <ModerationReportActions
                          reportId={report.id}
                          status={report.status}
                          targetState={report.targetState}
                          targetUserId={report.targetUserId}
                          targetUsername={report.targetUsername}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </SiteShell>
  );
}
