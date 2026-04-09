import Link from "next/link";
import { redirect } from "next/navigation";

import { SiteShell } from "@/components/site-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminAuditLogs } from "@/lib/data";
import { getCurrentUser } from "@/lib/session";

export default async function AdminAuditPage() {
  const user = await getCurrentUser();

  if (!user || (user.role !== "ADMIN" && user.role !== "MODERATOR")) {
    redirect("/");
  }

  const auditLogs = (await getAdminAuditLogs()) as Array<{
    id: string;
    action: string;
    targetType: string | null;
    targetId: string | null;
    metadata: unknown;
    createdAt: Date;
    actor: { username: string } | null;
  }>;

  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 space-y-3">
          <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">Moderáció</p>
          <h1 className="font-heading text-4xl font-bold">Audit log</h1>
          <p className="max-w-2xl text-muted-foreground">
            Itt látszanak a fontosabb moderációs és fiókbiztonsági események. Ez segít visszanézni, ki mit változtatott.
          </p>
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          <Link href="/admin/reports">
            <Badge variant="outline">Report inbox</Badge>
          </Link>
          <Badge>{auditLogs.length} audit esemény</Badge>
        </div>

        <div className="space-y-4">
          {auditLogs.map((log) => (
            <Card key={log.id}>
              <CardHeader>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{log.action}</Badge>
                      {log.targetType ? <Badge variant="outline">{log.targetType}</Badge> : null}
                    </div>
                    <CardTitle>{log.actor ? `@${log.actor.username}` : "Rendszer"}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {new Intl.DateTimeFormat("hu-HU", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      }).format(log.createdAt)}
                    </p>
                    {log.targetId ? <p className="text-sm text-foreground/90">Target ID: {log.targetId}</p> : null}
                    {log.metadata ? (
                      <pre className="overflow-x-auto rounded-2xl border border-border/70 bg-background/70 p-4 text-xs text-muted-foreground">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    ) : null}
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </SiteShell>
  );
}
