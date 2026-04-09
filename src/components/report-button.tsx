"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { Flag, X } from "lucide-react";

import { reportAction } from "@/actions/social";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const presets = [
  "Spam vagy értelmetlen tartalom",
  "Bántó vagy sértő hangnem",
  "Félrevezető vagy hibás információ",
  "Nem ide való tartalom"
];

export function ReportButton({
  targetId,
  targetType
}: {
  targetId: string;
  targetType: "REVIEW" | "NOTE_RESOURCE" | "EXAM_TIP" | "COMMENT" | "SUBJECT";
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [pending, startTransition] = useTransition();

  const isValid = useMemo(() => reason.trim().length >= 6, [reason]);

  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function submitReport() {
    if (!isValid) return;

    startTransition(async () => {
      const result = await reportAction({
        targetId,
        targetType,
        reason: reason.trim()
      });

      setMessage(result.message);
      setStatus(result.success ? "success" : "error");

      if (result.success) {
        setOpen(false);
        setReason("");
      }
    });
  }

  const dialog = open ? (
    <div className="fixed inset-0 z-[9999] bg-slate-950/55 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div className="flex min-h-screen items-center justify-center p-4 sm:p-6" onClick={(event) => event.stopPropagation()}>
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-dialog-title"
          className="w-full max-w-xl overflow-hidden rounded-[32px] border border-border/80 bg-background shadow-[0_40px_120px_rgba(15,23,42,0.28)]"
        >
          <div className="flex items-start justify-between gap-4 border-b border-border/70 px-6 py-5">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Moderáció</p>
              <h3 id="report-dialog-title" className="mt-2 font-heading text-2xl font-semibold">
                Miért jelentéd ezt?
              </h3>
              <p className="mt-2 max-w-lg text-sm text-muted-foreground">
                Válassz egy gyors okot, vagy írj rövid indoklást. Igyekeztünk ezt most tényleg gyorsra és letisztultra venni.
              </p>
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-5 px-6 py-5">
            <div className="rounded-[24px] border border-border/70 bg-card/60 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Gyors okok</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {presets.map((preset) => (
                  <Button key={preset} type="button" variant="outline" size="sm" onClick={() => setReason(preset)}>
                    {preset}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Indoklás</label>
              <Textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Pl. félrevezető tárgyinfó, spam, személyeskedő stílus..."
                className="min-h-[180px] rounded-[24px]"
              />
              <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                <span>Minimum 6 karakter.</span>
                <span>{reason.trim().length} / 280</span>
              </div>
            </div>

            {message ? (
              <p
                className={`rounded-2xl px-4 py-3 text-sm ${
                  status === "success" ? "bg-secondary text-secondary-foreground" : "bg-destructive/10 text-destructive"
                }`}
              >
                {message}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap justify-end gap-3 border-t border-border/70 px-6 py-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Mégse
            </Button>
            <Button type="button" disabled={!isValid || pending} onClick={submitReport}>
              {pending ? "Küldés..." : "Jelentés elküldése"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <Flag className="mr-2 h-4 w-4" />
        Jelentés
      </Button>
      {typeof document !== "undefined" ? createPortal(dialog, document.body) : null}
    </>
  );
}
