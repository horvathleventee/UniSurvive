import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/forms/auth-form";
import { SiteShell } from "@/components/site-shell";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Regisztráció",
  description: "Készíts fiókot, és építsd velünk a közös egyetemi túlélő tudásbázist."
};

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect("/profile");

  return (
    <SiteShell>
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_440px] lg:items-start lg:px-8">
        <div className="space-y-6 rounded-[2rem] border border-border/70 bg-gradient-to-br from-secondary/20 via-background to-accent/25 p-8 shadow-sm sm:p-10">
          <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Új fiók</p>
          <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
            Készíts profilt, és kezdj el valódi tárgytudást építeni.
          </h1>
          <p className="max-w-2xl text-base leading-8 text-muted-foreground">
            Review, ZH tipp, jegyzet, bookmark és haladáskövetés. Egy saját fiókkal rögtön használhatóvá válik az egész app.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-border/70 bg-background/85 p-5">
              <p className="text-sm text-muted-foreground">Review-k</p>
              <p className="mt-2 font-heading text-3xl font-bold">Közösségi</p>
            </div>
            <div className="rounded-3xl border border-border/70 bg-background/85 p-5">
              <p className="text-sm text-muted-foreground">Bookmarkok</p>
              <p className="mt-2 font-heading text-3xl font-bold">Saját lista</p>
            </div>
            <div className="rounded-3xl border border-border/70 bg-background/85 p-5">
              <p className="text-sm text-muted-foreground">Haladás</p>
              <p className="mt-2 font-heading text-3xl font-bold">Félévre szabva</p>
            </div>
          </div>
        </div>
        <AuthForm mode="register" />
      </div>
    </SiteShell>
  );
}
