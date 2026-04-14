import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthPanel } from "@/components/auth-panel";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Regisztráció",
  description: "Készíts fiókot, és építsd velünk a közös egyetemi túlélő tudásbázist."
};

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect("/profile");

  return <AuthPanel initialMode="register" />;
}
