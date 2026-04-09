"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { changePasswordAction } from "@/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { changePasswordSchema } from "@/lib/validators";

export function ChangePasswordForm() {
  const [serverMessage, setServerMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [pending, startTransition] = useTransition();

  const form = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = await changePasswordAction(values);
      setServerMessage(result.message);
      setStatus(result.success ? "success" : "error");

      if (result.success) {
        form.reset();
      }
    });
  });

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium">Jelenlegi jelszó</label>
        <Input type="password" {...form.register("currentPassword")} placeholder="Jelenlegi jelszó" />
        <p className="text-xs text-destructive">{String(form.formState.errors.currentPassword?.message ?? "")}</p>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Új jelszó</label>
        <Input type="password" {...form.register("newPassword")} placeholder="Legalább 8 karakter" />
        <p className="text-xs text-destructive">{String(form.formState.errors.newPassword?.message ?? "")}</p>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Új jelszó újra</label>
        <Input type="password" {...form.register("confirmPassword")} placeholder="Új jelszó megerősítése" />
        <p className="text-xs text-destructive">{String(form.formState.errors.confirmPassword?.message ?? "")}</p>
      </div>

      {serverMessage ? (
        <p
          className={`rounded-2xl px-4 py-3 text-sm ${
            status === "success" ? "bg-secondary text-secondary-foreground" : "bg-destructive/10 text-destructive"
          }`}
        >
          {serverMessage}
        </p>
      ) : null}

      <Button disabled={pending}>{pending ? "Mentés..." : "Jelszó frissítése"}</Button>
    </form>
  );
}
