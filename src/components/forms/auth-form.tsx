"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { loginAction, registerAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { loginSchema, registerSchema } from "@/lib/validators";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [serverMessage, setServerMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [isPending, startTransition] = useTransition();

  const schema = mode === "login" ? loginSchema : registerSchema;
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues:
      mode === "login"
        ? { email: "", password: "" }
        : { name: "", username: "", email: "", password: "" }
  });

  const onSubmit = (values: Record<string, string>) => {
    startTransition(async () => {
      const result = mode === "login" ? await loginAction(values) : await registerAction(values);
      setServerMessage(result.message);
      setStatus(result.success ? "success" : "error");

      if (result.success) {
        router.push("/profile");
        router.refresh();
      }
    });
  };

  return (
    <Card className="mx-auto w-full max-w-md overflow-hidden border-border/80 shadow-soft">
      <CardHeader className="border-b border-border/60 bg-gradient-to-r from-accent/30 via-transparent to-secondary/20">
        <CardTitle>{mode === "login" ? "Belépés" : "Regisztráció"}</CardTitle>
        <CardDescription>
          {mode === "login"
            ? "Lépj be, és mentsd el a fontos tárgyaidat, tippjeidet és jegyzeteidet."
            : "Készíts fiókot, és építsd a közös egyetemi túlélő tudásbázist."}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          {mode === "register" ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Név</label>
                <Input {...form.register("name")} placeholder="Teszt Elek" />
                <p className="text-xs text-destructive">{String(form.formState.errors.name?.message ?? "")}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Felhasználónév</label>
                <Input {...form.register("username")} placeholder="tesztelek" />
                <p className="text-xs text-destructive">{String(form.formState.errors.username?.message ?? "")}</p>
              </div>
            </>
          ) : null}
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input {...form.register("email")} placeholder="te@egyetem.hu" />
            <p className="text-xs text-destructive">{String(form.formState.errors.email?.message ?? "")}</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Jelszó</label>
            <Input type="password" {...form.register("password")} placeholder="minimum 8 karakter" />
            <p className="text-xs text-destructive">{String(form.formState.errors.password?.message ?? "")}</p>
          </div>
          {mode === "login" ? (
            <div className="rounded-2xl border border-border bg-card/60 p-3 text-xs text-muted-foreground">
              Demo belépés: <span className="font-medium">demo@unisurvive.hu</span> / <span className="font-medium">demo12345</span>
            </div>
          ) : null}
          <Button className="w-full" disabled={isPending}>
            {isPending ? "Feldolgozás..." : mode === "login" ? "Belépek" : "Fiókot készítek"}
          </Button>
          {serverMessage ? (
            <p
              className={`rounded-2xl px-4 py-3 text-sm ${
                status === "success" ? "bg-secondary text-secondary-foreground" : "bg-destructive/10 text-destructive"
              }`}
            >
              {serverMessage}
            </p>
          ) : null}
          <p className="text-sm text-muted-foreground">
            {mode === "login" ? "Még nincs fiókod?" : "Már van fiókod?"}{" "}
            <Link className="font-medium text-primary underline-offset-4 hover:underline" href={mode === "login" ? "/register" : "/login"}>
              {mode === "login" ? "Regisztrálj" : "Lépj be"}
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
