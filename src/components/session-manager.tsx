"use client";

import { useState, useTransition } from "react";

import { revokeOtherSessionsAction, revokeSessionAction } from "@/actions/session";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type SessionItem = {
  id: string;
  isCurrent: boolean;
  createdAt: Date;
  lastUsedAt: Date;
  expiresAt: Date;
  userAgent: string | null;
  ipAddress: string | null;
};

export function SessionManager({
  sessions
}: {
  sessions: SessionItem[];
}) {
  const [message, setMessage] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function revokeSession(sessionId: string) {
    setPendingId(sessionId);
    startTransition(async () => {
      const result = await revokeSessionAction({ sessionId });
      setMessage(result.message);
      setPendingId(null);
    });
  }

  function revokeOthers() {
    setPendingId("others");
    startTransition(async () => {
      const result = await revokeOtherSessionsAction();
      setMessage(result.message);
      setPendingId(null);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="outline" disabled={pendingId === "others"} onClick={revokeOthers}>
          Minden másik eszköz kijelentkeztetése
        </Button>
      </div>

      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}

      <div className="space-y-3">
        {sessions.map((session) => (
          <div key={session.id} className="rounded-[26px] border border-border bg-card/80 p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <Badge variant={session.isCurrent ? "default" : "outline"}>{session.isCurrent ? "Jelenlegi eszköz" : "Másik session"}</Badge>
                  <Badge variant="outline">Utolsó használat: {new Intl.DateTimeFormat("hu-HU", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(session.lastUsedAt)}</Badge>
                </div>
                <p className="text-sm font-medium text-foreground">{session.userAgent || "Ismeretlen böngésző / eszköz"}</p>
                <p className="text-sm text-muted-foreground">
                  IP: {session.ipAddress || "ismeretlen"} • Létrejött: {new Intl.DateTimeFormat("hu-HU", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(session.createdAt)}
                </p>
                <p className="text-xs text-muted-foreground">Lejárat: {new Intl.DateTimeFormat("hu-HU", { year: "numeric", month: "short", day: "numeric" }).format(session.expiresAt)}</p>
              </div>

              {!session.isCurrent ? (
                <Button type="button" variant="outline" disabled={pendingId === session.id} onClick={() => revokeSession(session.id)}>
                  Kijelentkeztetés erről az eszközről
                </Button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
