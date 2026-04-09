"use client";

import { useTransition } from "react";

import { hideReportedTargetAction, setReportStatusAction } from "@/actions/moderation";
import { Button } from "@/components/ui/button";

export function ModerationReportActions({
  reportId,
  status
}: {
  reportId: string;
  status: "OPEN" | "REVIEWED" | "RESOLVED";
}) {
  const [pending, startTransition] = useTransition();

  function updateStatus(nextStatus: "OPEN" | "REVIEWED" | "RESOLVED") {
    startTransition(async () => {
      await setReportStatusAction({ reportId, status: nextStatus });
    });
  }

  function hideTarget() {
    startTransition(async () => {
      await hideReportedTargetAction({ reportId });
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {status !== "REVIEWED" ? (
        <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => updateStatus("REVIEWED")}>
          Átnézve
        </Button>
      ) : null}
      {status !== "RESOLVED" ? (
        <Button type="button" size="sm" variant="secondary" disabled={pending} onClick={() => updateStatus("RESOLVED")}>
          Lezárás
        </Button>
      ) : null}
      <Button type="button" size="sm" variant="destructive" disabled={pending} onClick={hideTarget}>
        Rejtés / intézkedés
      </Button>
    </div>
  );
}
