"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { loginAction, registerAction } from "@/actions/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { Input } from "@/components/ui/input";
import { loginSchema, registerSchema } from "@/lib/validators";

type Mode = "login" | "register";

export function AuthPanel({ initialMode }: { initialMode: Mode }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [loginMsg, setLoginMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [registerMsg, setRegisterMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [isPending, startTransition] = useTransition();

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", username: "", email: "", password: "" },
  });

  const handleLogin = loginForm.handleSubmit((values) => {
    startTransition(async () => {
      const result = await loginAction(values);
      setLoginMsg({ text: result.message, ok: result.success });
      if (result.success) {
        router.push("/profile");
        router.refresh();
      }
    });
  });

  const handleRegister = registerForm.handleSubmit((values) => {
    startTransition(async () => {
      const result = await registerAction(values);
      setRegisterMsg({ text: result.message, ok: result.success });
      if (result.success) {
        router.push("/profile");
        router.refresh();
      }
    });
  });

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    router.replace(newMode === "login" ? "/login" : "/register", { scroll: false });
  };

  const isRegister = mode === "register";

  return (
    <div className="flex min-h-screen flex-col bg-[hsl(var(--background))]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Főoldal
        </Link>
        <span className="font-heading text-lg font-bold tracking-tight">UniSurvive</span>
        <ThemeToggle />
      </div>

      {/* Centered container */}
      <div className="flex flex-1 items-center justify-center p-4">

        {/* ── Desktop split-panel ── */}
        <div
          className="relative hidden w-full max-w-3xl overflow-hidden rounded-3xl shadow-2xl lg:block"
          style={{ minHeight: 560 }}
        >
          {/* Forms grid — both halves always rendered */}
          <div className="grid h-full grid-cols-2" style={{ minHeight: 560 }}>
            {/* Login form — left half */}
            <div
              className={`flex flex-col justify-center bg-white px-12 py-14 transition-opacity duration-700 dark:bg-card ${
                isRegister ? "pointer-events-none opacity-0" : "opacity-100"
              }`}
            >
              <h2 className="mb-1 text-2xl font-bold text-gray-800 dark:text-foreground">Belépés</h2>
              <p className="mb-6 text-sm text-gray-500 dark:text-muted-foreground">
                Üdv vissza a saját dashboardodon!
              </p>
              <form className="space-y-3" onSubmit={handleLogin}>
                <div>
                  <Input
                    {...loginForm.register("email")}
                    placeholder="Email"
                    type="email"
                    className="border-gray-200 bg-gray-50 dark:bg-muted/40"
                  />
                  {loginForm.formState.errors.email && (
                    <p className="mt-1 text-xs text-destructive">
                      {String(loginForm.formState.errors.email.message)}
                    </p>
                  )}
                </div>
                <div>
                  <Input
                    {...loginForm.register("password")}
                    placeholder="Jelszó"
                    type="password"
                    className="border-gray-200 bg-gray-50 dark:bg-muted/40"
                  />
                  {loginForm.formState.errors.password && (
                    <p className="mt-1 text-xs text-destructive">
                      {String(loginForm.formState.errors.password.message)}
                    </p>
                  )}
                </div>
                <div className="rounded-xl border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                  Demo:{" "}
                  <span className="font-medium">demo@unisurvive.hu</span> /{" "}
                  <span className="font-medium">demo12345</span>
                </div>
                {loginMsg && (
                  <p
                    className={`rounded-xl px-3 py-2 text-xs ${
                      loginMsg.ok
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {loginMsg.text}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 py-2.5 text-sm font-bold uppercase tracking-widest text-white shadow transition hover:opacity-90 disabled:opacity-50"
                >
                  {isPending ? "Belépés…" : "Belépek"}
                </button>
              </form>
            </div>

            {/* Register form — right half */}
            <div
              className={`flex flex-col justify-center bg-white px-12 py-14 transition-opacity duration-700 dark:bg-card ${
                !isRegister ? "pointer-events-none opacity-0" : "opacity-100"
              }`}
            >
              <h2 className="mb-1 text-2xl font-bold text-gray-800 dark:text-foreground">Fiók létrehozása</h2>
              <p className="mb-6 text-sm text-gray-500 dark:text-muted-foreground">
                Csatlakozz a platformhoz ingyen!
              </p>
              <form className="space-y-2.5" onSubmit={handleRegister}>
                <div>
                  <Input
                    {...registerForm.register("name")}
                    placeholder="Teljes név"
                    className="border-gray-200 bg-gray-50 dark:bg-muted/40"
                  />
                  {registerForm.formState.errors.name && (
                    <p className="mt-1 text-xs text-destructive">
                      {String(registerForm.formState.errors.name.message)}
                    </p>
                  )}
                </div>
                <div>
                  <Input
                    {...registerForm.register("username")}
                    placeholder="Felhasználónév"
                    className="border-gray-200 bg-gray-50 dark:bg-muted/40"
                  />
                  {registerForm.formState.errors.username && (
                    <p className="mt-1 text-xs text-destructive">
                      {String(registerForm.formState.errors.username.message)}
                    </p>
                  )}
                </div>
                <div>
                  <Input
                    {...registerForm.register("email")}
                    placeholder="Email"
                    type="email"
                    className="border-gray-200 bg-gray-50 dark:bg-muted/40"
                  />
                  {registerForm.formState.errors.email && (
                    <p className="mt-1 text-xs text-destructive">
                      {String(registerForm.formState.errors.email.message)}
                    </p>
                  )}
                </div>
                <div>
                  <Input
                    {...registerForm.register("password")}
                    placeholder="Jelszó (min. 8 karakter)"
                    type="password"
                    className="border-gray-200 bg-gray-50 dark:bg-muted/40"
                  />
                  {registerForm.formState.errors.password && (
                    <p className="mt-1 text-xs text-destructive">
                      {String(registerForm.formState.errors.password.message)}
                    </p>
                  )}
                </div>
                {registerMsg && (
                  <p
                    className={`rounded-xl px-3 py-2 text-xs ${
                      registerMsg.ok
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {registerMsg.text}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 py-2.5 text-sm font-bold uppercase tracking-widest text-white shadow transition hover:opacity-90 disabled:opacity-50"
                >
                  {isPending ? "Feldolgozás…" : "Regisztrálok"}
                </button>
              </form>
            </div>
          </div>

          {/* ── Sliding overlay panel ── */}
          {/*
            Login mode:  overlay at left=50%, translateX(0)   → covers RIGHT half
            Register mode: overlay stays at left=50%, translateX(-100%) → covers LEFT half
          */}
          <div
            className="absolute inset-y-0 w-1/2 transition-transform duration-700 ease-in-out"
            style={{
              left: "50%",
              transform: isRegister ? "translateX(-100%)" : "translateX(0%)",
            }}
          >
            {/* Gradient background with decorative shapes */}
            <div className="relative h-full overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-500 to-cyan-500">
              {/* Decorative blobs */}
              <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-white/10" />
              <div className="absolute -top-12 -right-12 h-52 w-52 rounded-full bg-white/10" />
              <div className="absolute bottom-1/3 right-1/4 h-28 w-28 rounded-full bg-white/10" />
              {/* Diamond accents */}
              <div className="absolute left-1/4 top-1/4 h-5 w-5 rotate-45 bg-white/25" />
              <div className="absolute right-1/3 top-1/2 h-3 w-3 rotate-45 bg-white/25" />
              <div className="absolute left-1/3 bottom-1/4 h-4 w-4 rotate-45 bg-white/20" />
              <div className="absolute right-1/4 bottom-1/3 h-6 w-6 rotate-45 bg-white/15" />

              {/*
                Inner dual-content strip:
                  200% wide (= 2× overlay width), each half fills the overlay.
                Login mode:  strip at translateX(0)    → first child visible ("Helló barátom!")
                Register mode: strip at translateX(-50%) → second child visible ("Üdv vissza!")
              */}
              <div
                className="flex h-full w-[200%] transition-transform duration-700 ease-in-out"
                style={{ transform: isRegister ? "translateX(-50%)" : "translateX(0%)" }}
              >
                {/* Shown when LOGIN mode — overlay is on right, prompts to register */}
                <div className="flex w-1/2 flex-col items-center justify-center px-10 py-12 text-white">
                  <h2 className="mb-3 text-center text-3xl font-bold leading-tight">
                    Helló, Barátom!
                  </h2>
                  <p className="mb-8 text-center text-sm leading-relaxed text-white/80">
                    Add meg az adataidat,
                    <br />
                    és indulj velünk együtt!
                  </p>
                  <button
                    onClick={() => switchMode("register")}
                    className="rounded-full border-2 border-white px-10 py-2.5 text-sm font-bold uppercase tracking-widest text-white transition duration-200 hover:bg-white/20"
                  >
                    Regisztrálok
                  </button>
                </div>

                {/* Shown when REGISTER mode — overlay is on left, prompts to login */}
                <div className="flex w-1/2 flex-col items-center justify-center px-10 py-12 text-white">
                  <h2 className="mb-3 text-center text-3xl font-bold leading-tight">
                    Üdv vissza!
                  </h2>
                  <p className="mb-8 text-center text-sm leading-relaxed text-white/80">
                    A kapcsolat megőrzéséhez
                    <br />
                    lépj be a profiloddal!
                  </p>
                  <button
                    onClick={() => switchMode("login")}
                    className="rounded-full border-2 border-white px-10 py-2.5 text-sm font-bold uppercase tracking-widest text-white transition duration-200 hover:bg-white/20"
                  >
                    Belépek
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Mobile tab layout ── */}
        <div className="w-full max-w-sm lg:hidden">
          {/* Tab switcher */}
          <div className="mb-5 flex rounded-2xl bg-muted/50 p-1">
            <button
              onClick={() => switchMode("login")}
              className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition-all duration-200 ${
                !isRegister
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Belépés
            </button>
            <button
              onClick={() => switchMode("register")}
              className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition-all duration-200 ${
                isRegister
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Regisztráció
            </button>
          </div>

          <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
            {!isRegister ? (
              <form className="space-y-3" onSubmit={handleLogin}>
                <div>
                  <Input {...loginForm.register("email")} placeholder="Email" type="email" />
                  {loginForm.formState.errors.email && (
                    <p className="mt-1 text-xs text-destructive">
                      {String(loginForm.formState.errors.email.message)}
                    </p>
                  )}
                </div>
                <div>
                  <Input
                    {...loginForm.register("password")}
                    placeholder="Jelszó"
                    type="password"
                  />
                  {loginForm.formState.errors.password && (
                    <p className="mt-1 text-xs text-destructive">
                      {String(loginForm.formState.errors.password.message)}
                    </p>
                  )}
                </div>
                <div className="rounded-xl border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                  Demo: <span className="font-medium">demo@unisurvive.hu</span> /{" "}
                  <span className="font-medium">demo12345</span>
                </div>
                {loginMsg && (
                  <p
                    className={`rounded-xl px-3 py-2 text-xs ${
                      loginMsg.ok
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {loginMsg.text}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 py-2.5 text-sm font-bold uppercase tracking-widest text-white shadow transition hover:opacity-90 disabled:opacity-50"
                >
                  {isPending ? "Belépés…" : "Belépek"}
                </button>
              </form>
            ) : (
              <form className="space-y-3" onSubmit={handleRegister}>
                <div>
                  <Input {...registerForm.register("name")} placeholder="Teljes név" />
                  {registerForm.formState.errors.name && (
                    <p className="mt-1 text-xs text-destructive">
                      {String(registerForm.formState.errors.name.message)}
                    </p>
                  )}
                </div>
                <div>
                  <Input {...registerForm.register("username")} placeholder="Felhasználónév" />
                  {registerForm.formState.errors.username && (
                    <p className="mt-1 text-xs text-destructive">
                      {String(registerForm.formState.errors.username.message)}
                    </p>
                  )}
                </div>
                <div>
                  <Input {...registerForm.register("email")} placeholder="Email" type="email" />
                  {registerForm.formState.errors.email && (
                    <p className="mt-1 text-xs text-destructive">
                      {String(registerForm.formState.errors.email.message)}
                    </p>
                  )}
                </div>
                <div>
                  <Input
                    {...registerForm.register("password")}
                    placeholder="Jelszó (min. 8 karakter)"
                    type="password"
                  />
                  {registerForm.formState.errors.password && (
                    <p className="mt-1 text-xs text-destructive">
                      {String(registerForm.formState.errors.password.message)}
                    </p>
                  )}
                </div>
                {registerMsg && (
                  <p
                    className={`rounded-xl px-3 py-2 text-xs ${
                      registerMsg.ok
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {registerMsg.text}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 py-2.5 text-sm font-bold uppercase tracking-widest text-white shadow transition hover:opacity-90 disabled:opacity-50"
                >
                  {isPending ? "Feldolgozás…" : "Regisztrálok"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
