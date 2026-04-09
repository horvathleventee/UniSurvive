import Link from "next/link";
import { redirect } from "next/navigation";

import { EmptyState } from "@/components/empty-state";
import { ModerationReportActions } from "@/components/moderation-report-actions";
import { SiteShell } from "@/components/site-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getModerationReports, getReportStats } from "@/lib/data";
import { getCurrentUser } from "@/lib/session";

type PageProps = {
  searchParams: Promise<{
    status?: "OPEN" | "REVIEWED" | "RESOLVED";
    q?: string;
  }>;
};

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
      ? [report.targetLabel, report.reason, report.user.username, report.targetType, report.targetPreview ?? ""].join(" ").toLowerCase().includes(filters.q.toLowerCase())
      : true;

    return matchesStatus && matchesQuery;
  });

  const statusLinks = [
    { label: "Nyitott", value: "OPEN", count: stats.openReports },
    { label: "Átnézve", value: "REVIEWED", count: stats.reviewedReports },
    { label: "Lezárt", value: "RESOLVED", count: stats.resolvedReports }
  ] as const;

  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 space-y-3">
          <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">Moderáció</p>
          <h1 className="font-heading text-4xl font-bold">Report inbox</h1>
          <p className="max-w-2xl text-muted-foreground">
            Itt lehet átnézni a beérkező jelentéseket, szűrni őket státusz szerint, és rögtön látni azt is, mi az érintett tartalom rövid előnézete.
          </p>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <Link href="/admin/audit">
            <Badge variant="outline">Audit log</Badge>
          </Link>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Nyitott</p><p className="mt-2 font-heading text-4xl font-bold">{stats.openReports}</p></CardContent></Card>
          <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Átnézve</p><p className="mt-2 font-heading text-4xl font-bold">{stats.reviewedReports}</p></CardContent></Card>
          <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Lezárt</p><p className="mt-2 font-heading text-4xl font-bold">{stats.resolvedReports}</p></CardContent></Card>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <Link href="/admin/reports">
            <Badge variant={!filters.status ? "default" : "outline"}>Mindegyik</Badge>
          </Link>
          {statusLinks.map((link) => (
            <Link key={link.value} href={`/admin/reports?status=${link.value}`}>
              <Badge variant={filters.status === link.value ? "default" : "outline"}>
                {link.label}: {link.count}
              </Badge>
            </Link>
          ))}
        </div>

        <form className="mb-8 rounded-[28px] border border-border/80 bg-card/80 p-5 shadow-soft">
          <div className="grid gap-4 md:grid-cols-[1fr_220px_auto]">
            <div className="space-y-2">
              <label className="text-sm font-medium">Keresés reportok között</label>
              <Input name="q" defaultValue={filters.q ?? ""} placeholder="Pl. review cím, indok, felhasználónév..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Státusz</label>
              <select name="status" defaultValue={filters.status ?? ""} className="flex h-11 w-full rounded-2xl border border-border bg-card/80 px-4 py-2 text-sm">
                <option value="">Mindegyik</option>
                <option value="OPEN">Nyitott</option>
                <option value="REVIEWED">Átnézve</option>
                <option value="RESOLVED">Lezárt</option>
              </select>
            </div>
            <div className="flex items-end gap-3">
              <button type="submit" className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground">
                Szűrés
              </button>
              <Link href="/admin/reports" className="inline-flex h-11 items-center justify-center rounded-full border border-border px-5 text-sm font-medium">
                Törlés
              </Link>
            </div>
          </div>
        </form>

        <div className="space-y-4">
          {filteredReports.length ? (
            filteredReports.map((report) => (
              <Card key={report.id}>
                <CardHeader className="gap-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">{report.targetType}</Badge>
                        <Badge variant={report.status === "OPEN" ? "default" : report.status === "REVIEWED" ? "secondary" : "outline"}>
                          {report.status === "OPEN" ? "Nyitott" : report.status === "REVIEWED" ? "Átnézve" : "Lezárt"}
                        </Badge>
                        <Badge variant="outline">{report.targetState}</Badge>
                      </div>
                      <CardTitle>{report.targetLabel}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Jelentette: @{report.user.username} •{" "}
                        {new Intl.DateTimeFormat("hu-HU", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        }).format(report.createdAt)}
                      </p>
                      <p className="text-sm text-foreground/90">{report.reason}</p>
                      {report.targetPreview ? (
                        <div className="rounded-2xl border border-border/70 bg-background/70 p-4 text-sm text-muted-foreground">
                          <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Target preview</p>
                          <p>{report.targetPreview}</p>
                        </div>
                      ) : null}
                      {report.targetPath ? (
                        <Link href={report.targetPath} className="text-sm font-medium text-primary underline-offset-4 hover:underline">
                          Érintett tartalom megnyitása
                        </Link>
                      ) : null}
                    </div>
                    <ModerationReportActions reportId={report.id} status={report.status} />
                  </div>
                </CardHeader>
              </Card>
            ))
          ) : (
            <EmptyState title="Nincs ilyen report" description="A most beállított szűrőkre nem találtam beérkezett jelentést." />
          )}
        </div>
      </div>
    </SiteShell>
  );
}
