"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { createCommentAction } from "@/actions/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { commentSchema } from "@/lib/validators";

export function CommentForm({ subjectId }: { subjectId: string }) {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [pending, startTransition] = useTransition();
  const form = useForm({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      subjectId,
      content: ""
    }
  });

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((values) =>
        startTransition(async () => {
          const result = await createCommentAction(values);
          setMessage(result.message);
          setStatus(result.success ? "success" : "error");
          if (result.success) form.reset({ subjectId, content: "" });
        })
      )}
    >
      <Input type="hidden" {...form.register("subjectId")} />
      <Textarea {...form.register("content")} placeholder="Kérdésed van? Itt mehet a gyors beszélgetés." className="min-h-[90px]" />
      <p className="text-xs text-destructive">{String(form.formState.errors.content?.message ?? "")}</p>
      <Button disabled={pending}>{pending ? "Küldés..." : "Komment küldése"}</Button>
      {message ? (
        <p
          className={`rounded-2xl px-4 py-3 text-sm ${
            status === "success" ? "bg-secondary text-secondary-foreground" : "bg-destructive/10 text-destructive"
          }`}
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
