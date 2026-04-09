import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ChangePasswordForm } from "@/components/forms/change-password-form";
import { ProfileSettingsForm } from "@/components/forms/profile-settings-form";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getProfileData, getUniversities } from "@/lib/data";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Profil beállítások",
  description: "Állítsd be a profilodat, az aktív szakodat és a jelszavadat."
};

export default async function ProfileSettingsPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  const [profile, universities] = await Promise.all([getProfileData(currentUser.id), getUniversities()]);
  if (!profile) redirect("/login");

  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] xl:items-start">
          <div className="space-y-4 rounded-[2rem] border border-border/70 bg-gradient-to-br from-accent/20 via-background to-secondary/20 p-8 shadow-sm sm:p-10">
            <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">Profil</p>
            <h1 className="font-heading text-4xl font-bold tracking-tight">Profil beállítások</h1>
            <p className="max-w-2xl text-base leading-8 text-muted-foreground">
              Itt állíthatod be az aktív szakodat, a megjelenő profiladataidat és a jelszavadat. A security nézet külön oldalon elérhető a sessionök és audit események miatt.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/profile/sessions">
                <Button variant="outline">Sessionök és audit</Button>
              </Link>
            </div>
          </div>
          <Card className="rounded-[2rem] border-border/70">
            <CardContent className="grid gap-4 p-6 sm:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Aktív egyetem</p>
                <p className="mt-2 text-sm font-semibold text-foreground">{profile.university?.name ?? "Nincs beállítva"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Aktív szak</p>
                <p className="mt-2 text-sm font-semibold text-foreground">{profile.program?.name ?? "Nincs beállítva"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">@név</p>
                <p className="mt-2 text-sm font-semibold text-foreground">@{profile.username}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <Card className="rounded-[2rem] border-border/70">
            <CardHeader>
              <CardTitle>Nyilvános profil és aktív szak</CardTitle>
              <CardDescription>A felhasználónév, bio és a trackerhez használt egyetem/szak innen kezelhető.</CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileSettingsForm
                initialValues={{
                  name: profile.name,
                  username: profile.username,
                  bio: profile.bio ?? "",
                  image: profile.image ?? "",
                  universityId: profile.universityId ?? "",
                  programId: profile.programId ?? ""
                }}
                universities={universities}
              />
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-border/70">
            <CardHeader>
              <CardTitle>Jelszócsere</CardTitle>
              <CardDescription>Biztonsági okból kérjük a jelenlegi jelszavadat is.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChangePasswordForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </SiteShell>
  );
}
