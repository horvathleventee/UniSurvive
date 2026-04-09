"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { createResourceAction } from "@/actions/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { resourceSchema } from "@/lib/validators";

export function ResourceForm({ subjectId }: { subjectId: string }) {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [pending, startTransition] = useTransition();
  const form = useForm({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      subjectId,
      title: "",
      description: "",
      url: "",
      type: "ARTICLE" as const
    }
  });

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((values) =>
        startTransition(async () => {
          const result = await createResourceAction(values);
          setMessage(result.message);
          setStatus(result.success ? "success" : "error");
          if (result.success) {
            form.reset({
              subjectId,
              title: "",
              description: "",
              url: "",
              type: "ARTICLE"
            });
          }
        })
      )}
    >
      <Input type="hidden" {...form.register("subjectId")} />
      <div className="space-y-2">
        <label className="text-sm font-medium">Cím</label>
        <Input {...form.register("title")} placeholder="Saját jegyzet / drive link / cikk" />
        <p className="text-xs text-destructive">{String(form.formState.errors.title?.message ?? "")}</p>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Link</label>
        <Input {...form.register("url")} placeholder="https://..." />
        <p className="text-xs text-destructive">{String(form.formState.errors.url?.message ?? "")}</p>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Leírás</label>
        <Textarea {...form.register("description")} placeholder="Mit tartalmaz, miért hasznos?" className="min-h-[100px]" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Típus</label>
        <select
          {...form.register("type")}
          className="flex h-11 w-full rounded-2xl border border-border bg-card/80 px-4 py-2 text-sm"
        >
          <option value="ARTICLE">Cikk</option>
          <option value="PDF">PDF</option>
          <option value="DRIVE">Drive</option>
          <option value="DOC">Doksi</option>
          <option value="OTHER">Egyéb</option>
        </select>
      </div>
      <Button disabled={pending}>{pending ? "Mentés..." : "Forrás hozzáadása"}</Button>
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
