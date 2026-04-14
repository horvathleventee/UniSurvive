import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthPanel } from "@/components/auth-panel";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Belépés",
  description: "Lépj be, és kezeld a mentett tárgyaidat, tapasztalataidat és ZH tippjeidet."
};

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/profile");

  return <AuthPanel initialMode="login" />;
}
