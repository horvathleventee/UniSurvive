import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { SessionManager } from "@/components/session-manager";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getProfileData, getUserSessionOverview } from "@/lib/data";
import { getCurrentSessionToken, getCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Sessionök",
  description: "Kezeld, milyen eszközökön vagy bejelentkezve, és nézd át az érzékeny fiókműveletek naplóját."
};

function getAuditLabel(action: string) {
  switch (action) {
    case "PROFILE_UPDATED":
      return "Profil frissítve";
    case "PASSWORD_CHANGED":
      return "Jelszó megváltoztatva";
    case "SESSION_REVOKED":
      return "Session visszavonva";
    case "OTHER_SESSIONS_REVOKED":
      return "Más eszközök kijelentkeztetve";
    default:
      return action;
  }
}

export default async function ProfileSessionsPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  const currentToken = await getCurrentSessionToken();
  const [profile, sessionOverview] = await Promise.all([getProfileData(currentUser.id), getUserSessionOverview(currentUser.id, currentToken)]);
  if (!profile) redirect("/login");

  const sessions = sessionOverview.sessions as Array<{
    id: string;
    isCurrent: boolean;
    createdAt: Date;
    lastUsedAt?: Date | null;
    expiresAt: Date;
    userAgent: string | null;
    ipAddress: string | null;
  }>;

  const auditLogs = sessionOverview.auditLogs as Array<{
    id: string;
    action: string;
    targetType: string | null;
    targetId: string | null;
    createdAt: Date;
  }>;

  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">Biztonság</p>
            <h1 className="font-heading text-4xl font-bold">Sessionök és fiókműveletek</h1>
            <p className="max-w-2xl text-muted-foreground">
              Itt látod, milyen eszközökön vagy bejelentkezve, és vissza tudsz vonni sessionöket. Alul a saját érzékeny fiókműveleteid auditnaplója is látszik.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/profile">
              <Button variant="outline">Vissza a profilhoz</Button>
            </Link>
            <Link href="/profile/settings">
              <Button>Beállítások</Button>
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Aktív sessionök</p><p className="mt-2 font-heading text-4xl font-bold">{sessions.length}</p></CardContent></Card>
          <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Jelenlegi eszköz</p><p className="mt-2 font-heading text-4xl font-bold">{sessions.filter((session) => session.isCurrent).length}</p></CardContent></Card>
          <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Audit események</p><p className="mt-2 font-heading text-4xl font-bold">{auditLogs.length}</p></CardContent></Card>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Card>
            <CardHeader>
              <CardTitle>Aktív bejelentkezések</CardTitle>
              <CardDescription>Ha ismeretlen eszközt látsz, érdemes azonnal visszavonni a sessiont és jelszót cserélni.</CardDescription>
            </CardHeader>
            <CardContent>
              <SessionManager
                sessions={sessions.map((session) => ({
                  id: session.id,
                  isCurrent: session.isCurrent,
                  createdAt: session.createdAt,
                  lastUsedAt: session.lastUsedAt ?? session.createdAt,
                  expiresAt: session.expiresAt,
                  userAgent: session.userAgent,
                  ipAddress: session.ipAddress
                }))}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Saját auditnapló</CardTitle>
              <CardDescription>A profil- és biztonsági műveletek itt időrendben látszanak.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {auditLogs.length ? (
                auditLogs.map((log) => (
                  <div key={log.id} className="rounded-[24px] border border-border/70 bg-card/80 p-4">
                    <p className="font-medium">{getAuditLabel(log.action)}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {new Intl.DateTimeFormat("hu-HU", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      }).format(log.createdAt)}
                    </p>
                    {log.targetType || log.targetId ? (
                      <p className="mt-2 text-xs text-muted-foreground">
                        {log.targetType ?? "Nincs target"} {log.targetId ? `• ${log.targetId}` : ""}
                      </p>
                    ) : null}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Még nincs audit esemény ezen a fiókon.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </SiteShell>
  );
}
