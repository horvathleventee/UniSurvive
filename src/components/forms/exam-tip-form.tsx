"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { createExamTipAction } from "@/actions/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { examTipSchema } from "@/lib/validators";

export function ExamTipForm({ subjectId }: { subjectId: string }) {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [pending, startTransition] = useTransition();
  const form = useForm({
    resolver: zodResolver(examTipSchema),
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
          const result = await createExamTipAction(values);
          setMessage(result.message);
          setStatus(result.success ? "success" : "error");
          if (result.success) form.reset({ subjectId, content: "" });
        })
      )}
    >
      <Input type="hidden" {...form.register("subjectId")} />
      <Textarea {...form.register("content")} placeholder="Pl. SQL joinok, definíciók vagy a legutóbbi gyakorlatok fontosak." />
      <p className="text-xs text-destructive">{String(form.formState.errors.content?.message ?? "")}</p>
      <Button disabled={pending}>{pending ? "Mentés..." : "Tipp hozzáadása"}</Button>
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
