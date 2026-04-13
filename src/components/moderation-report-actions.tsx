"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, Ban, Check, ChevronDown, ChevronUp, Eye, EyeOff, MessageCircle } from "lucide-react";

import {
  hideReportedTargetAction,
  unhideReportedTargetAction,
  setReportStatusAction,
  sendModWarningAction,
  sendModMessageAction,
  tempBanUserAction,
} from "@/actions/moderation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function ModerationReportActions({
  reportId,
  status,
  targetState,
  targetUserId,
  targetUsername,
}: {
  reportId: string;
  status: "OPEN" | "REVIEWED" | "RESOLVED";
  targetState: string;
  targetUserId?: string | null;
  targetUsername?: string | null;
}) {
  const [pending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState(false);
  const [userAction, setUserAction] = useState<"warn" | "message" | "ban" | null>(null);
  const [message, setMessage] = useState("");
  const [banDays, setBanDays] = useState(3);
  const [feedback, setFeedback] = useState<string | null>(null);

  const isHidden = targetState === "REJTETT";

  function updateStatus(nextStatus: "OPEN" | "REVIEWED" | "RESOLVED") {
    startTransition(async () => {
      await setReportStatusAction({ reportId, status: nextStatus });
    });
  }

  function toggleHide() {
    startTransition(async () => {
      if (isHidden) {
        await unhideReportedTargetAction({ reportId });
      } else {
        await hideReportedTargetAction({ reportId });
      }
    });
  }

  function submitUserAction() {
    if (!targetUserId) return;
    setFeedback(null);
    startTransition(async () => {
      let result;
      if (userAction === "warn") {
        result = await sendModWarningAction({ userId: targetUserId, message: message || "Figyelem: tartalmad nem felelt meg a közösségi irányelveknek." });
      } else if (userAction === "message") {
        result = await sendModMessageAction({ userId: targetUserId, message });
      } else if (userAction === "ban") {
        result = await tempBanUserAction({ userId: targetUserId, days: banDays });
      }
      if (result) {
        setFeedback(result.message);
        setUserAction(null);
        setMessage("");
      }
    });
  }

  return (
    <div className="flex flex-col gap-2 min-w-[220px]">
      {/* Status */}
      <div className="flex flex-wrap gap-2">
        {status !== "REVIEWED" && (
          <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => updateStatus("REVIEWED")}>
            Átnézve
          </Button>
        )}
        {status !== "RESOLVED" && (
          <Button type="button" size="sm" variant="secondary" disabled={pending} onClick={() => updateStatus("RESOLVED")}>
            Lezárás
          </Button>
        )}
      </div>

      {/* Hide / Unhide */}
      <Button
        type="button"
        size="sm"
        variant={isHidden ? "outline" : "destructive"}
        disabled={pending}
        onClick={toggleHide}
        className="flex items-center gap-1.5"
      >
        {isHidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
        {isHidden ? "Visszaállítás" : "Elrejtés"}
      </Button>

      {/* User actions panel */}
      {targetUserId && (
        <div className="rounded-xl border border-border/60 bg-background/50 overflow-hidden">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex w-full items-center justify-between px-3 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="font-semibold">@{targetUsername} intézkedés</span>
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>

          {expanded && (
            <div className="border-t border-border/60 p-3 space-y-3">
              {/* Feedback */}
              {feedback && (
                <div className="flex items-center gap-1.5 rounded-lg bg-green-500/10 px-3 py-2 text-xs font-medium text-green-600 dark:text-green-400">
                  <Check className="h-3.5 w-3.5" />
                  {feedback}
                </div>
              )}

              {/* Action selector */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: "warn" as const, label: "Figyelmeztetés", icon: AlertTriangle, color: "text-amber-500" },
                  { id: "message" as const, label: "Üzenet", icon: MessageCircle, color: "text-blue-500" },
                  { id: "ban" as const, label: "Tiltás", icon: Ban, color: "text-red-500" },
                ].map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => setUserAction(userAction === action.id ? null : action.id)}
                    disabled={pending}
                    className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition-all ${
                      userAction === action.id
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    <action.icon className={`h-3 w-3 ${userAction === action.id ? "" : action.color}`} />
                    {action.label}
                  </button>
                ))}
              </div>

              {/* Ban duration */}
              {userAction === "ban" && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-muted-foreground">Tiltás időtartama</label>
                  <select
                    value={banDays}
                    onChange={(e) => setBanDays(Number(e.target.value))}
                    className="w-full rounded-xl border border-border/60 bg-card px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value={1}>1 nap</option>
                    <option value={3}>3 nap</option>
                    <option value={7}>7 nap</option>
                    <option value={30}>30 nap</option>
                    <option value={90}>90 nap</option>
                  </select>
                </div>
              )}

              {/* Message textarea */}
              {(userAction === "warn" || userAction === "message") && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-muted-foreground">
                    {userAction === "warn" ? "Figyelmeztetés szövege (opcionális)" : "Üzenet szövege"}
                  </label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={
                      userAction === "warn"
                        ? "Add meg a figyelmeztető üzenetet..."
                        : "Írj üzenetet a felhasználónak..."
                    }
                    className="min-h-[80px] resize-none rounded-xl text-xs"
                  />
                </div>
              )}

              {/* Submit */}
              {userAction && (
                <Button
                  type="button"
                  size="sm"
                  disabled={pending || (userAction === "message" && !message.trim())}
                  onClick={submitUserAction}
                  className="w-full"
                >
                  {pending
                    ? "Küldés..."
                    : userAction === "warn"
                    ? "Figyelmeztetés küldése"
                    : userAction === "message"
                    ? "Üzenet küldése"
                    : `${banDays} napos tiltás alkalmazása`}
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
