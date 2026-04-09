import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

import { logoutAction } from "@/actions/auth";
import { SearchBar } from "@/components/search-bar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/session";
import logo from "@/logo/startlogo.png";

export async function SiteShell({
  children
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-border/80 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-3 font-heading text-xl font-bold tracking-tight">
            <Image
              src={logo}
              alt="UniSurvive logo"
              className="h-14 w-14 rounded-[1.2rem] object-cover shadow-sm sm:h-16 sm:w-16"
              priority
            />
            <span className="text-[1.8rem] leading-none sm:text-[2.2rem]">UniSurvive</span>
          </Link>
          <div className="hidden flex-1 md:block">
            <SearchBar />
          </div>
          <nav className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <Link href="/universities">
              <Button variant="ghost" size="sm">
                Böngészés
              </Button>
            </Link>
            {user ? (
              <>
                {user.role === "ADMIN" || user.role === "MODERATOR" ? (
                  <>
                    <Link href="/admin/reports">
                      <Button variant="ghost" size="sm">
                        Reportok
                      </Button>
                    </Link>
                    <Link href="/admin/audit">
                      <Button variant="ghost" size="sm">
                        Audit
                      </Button>
                    </Link>
                  </>
                ) : null}
                <Link href="/profile">
                  <Button variant="outline" size="sm">
                    Profil
                  </Button>
                </Link>
                <form action={logoutAction}>
                  <Button size="sm">Kilépés</Button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Belépés
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Regisztráció</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-border/80 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 text-sm text-muted-foreground sm:px-6 lg:px-8 md:flex-row md:items-center md:justify-between">
          <p>Hallgatóknak készült, hallgatói túlélő üzemmódra optimalizálva.</p>
          <p>UniSurvive MVP • Next.js • Prisma • PostgreSQL</p>
        </div>
      </footer>
    </div>
  );
}
