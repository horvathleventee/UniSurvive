"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { createReviewAction } from "@/actions/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { reviewSchema } from "@/lib/validators";

export function ReviewForm({ subjectId }: { subjectId: string }) {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [pending, startTransition] = useTransition();
  const form = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      subjectId,
      title: "",
      content: "",
      difficultyRating: 5,
      usefulnessRating: 5,
      teacherName: "",
      semesterTaken: "",
      passedFirstTry: false,
      wouldRecommend: true
    }
  });

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((values) =>
        startTransition(async () => {
          const result = await createReviewAction(values);
          setMessage(result.message);
          setStatus(result.success ? "success" : "error");
          if (result.success) {
            form.reset({
              subjectId,
              title: "",
              content: "",
              difficultyRating: 5,
              usefulnessRating: 5,
              teacherName: "",
              semesterTaken: "",
              passedFirstTry: false,
              wouldRecommend: true
            });
          }
        })
      )}
    >
      <Input type="hidden" {...form.register("subjectId")} />
      <div className="space-y-2">
        <label className="text-sm font-medium">Cím</label>
        <Input {...form.register("title")} placeholder="Mi volt a legfontosabb benyomásod?" />
        <p className="text-xs text-destructive">{String(form.formState.errors.title?.message ?? "")}</p>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Tapasztalat</label>
        <Textarea
          {...form.register("content")}
          placeholder="Miből kérdeztek, mire kellett figyelni, mennyire volt időigényes..."
        />
        <p className="text-xs text-destructive">{String(form.formState.errors.content?.message ?? "")}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Nehézség (1-10)</label>
          <Input type="number" min={1} max={10} {...form.register("difficultyRating")} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Hasznosság (1-10)</label>
          <Input type="number" min={1} max={10} {...form.register("usefulnessRating")} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Oktató</label>
          <Input {...form.register("teacherName")} placeholder="opcionális" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Félév</label>
          <Input {...form.register("semesterTaken")} placeholder="2025/26/1" />
        </div>
      </div>
      <div className="grid gap-3 text-sm sm:grid-cols-2">
        <label className="flex items-center gap-2 rounded-2xl border border-border bg-card/70 p-3">
          <input type="checkbox" {...form.register("passedFirstTry")} />
          Elsőre átmentem
        </label>
        <label className="flex items-center gap-2 rounded-2xl border border-border bg-card/70 p-3">
          <input type="checkbox" {...form.register("wouldRecommend")} />
          Ajánlanám másnak is
        </label>
      </div>
      <Button disabled={pending}>{pending ? "Mentés..." : "Tapasztalat mentése"}</Button>
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
