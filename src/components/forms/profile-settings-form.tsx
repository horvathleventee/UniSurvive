"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { updateProfileAction } from "@/actions/profile";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { profileSettingsSchema } from "@/lib/validators";

type UniversityOption = {
  id: string;
  name: string;
  faculties: Array<{
    id: string;
    name: string;
    programs: Array<{
      id: string;
      name: string;
    }>;
  }>;
};

export function ProfileSettingsForm({
  initialValues,
  universities
}: {
  initialValues: {
    name: string;
    username: string;
    bio: string;
    image: string;
    universityId: string;
    programId: string;
  };
  universities: UniversityOption[];
}) {
  const router = useRouter();
  const [serverMessage, setServerMessage] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [pending, startTransition] = useTransition();
  const [uploadPending, setUploadPending] = useState(false);

  const form = useForm({
    resolver: zodResolver(profileSettingsSchema),
    defaultValues: initialValues
  });

  const selectedUniversityId = useWatch({ control: form.control, name: "universityId" });
  const image = useWatch({ control: form.control, name: "image" });
  const name = useWatch({ control: form.control, name: "name" });

  const availablePrograms = useMemo(() => {
    const selectedUniversity = universities.find((university) => university.id === selectedUniversityId);
    if (!selectedUniversity) return [];

    return selectedUniversity.faculties.flatMap((faculty) =>
      faculty.programs.map((program) => ({
        id: program.id,
        label: `${faculty.name} • ${program.name}`
      }))
    );
  }, [selectedUniversityId, universities]);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadPending(true);
    setUploadMessage("");

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload/avatar", {
      method: "POST",
      body: formData
    });

    const payload = (await response.json()) as { message?: string; url?: string };

    if (!response.ok || !payload.url) {
      setUploadMessage(payload.message ?? "A feltöltés most nem sikerült.");
      setUploadPending(false);
      return;
    }

    form.setValue("image", payload.url, { shouldDirty: true, shouldValidate: true });
    setUploadMessage("A profilkép feltöltve. Az avatar automatikusan középre igazított négyzetes kivágással jelenik meg.");
    setUploadPending(false);
    event.target.value = "";
  }

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = await updateProfileAction(values);
      setServerMessage(result.message);
      setStatus(result.success ? "success" : "error");

      if (result.success) {
        router.refresh();
      }
    });
  });

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <input type="hidden" {...form.register("image")} />

      <div className="rounded-[28px] border border-border/70 bg-card/60 p-5">
        <div className="grid gap-5 lg:grid-cols-[auto_1fr]">
          <div className="flex items-center gap-4">
            <Avatar name={name || "UniSurvive"} image={image || null} className="h-20 w-20 text-lg" />
            {image ? (
              <div className="relative h-24 w-24 overflow-hidden rounded-2xl border border-border/70 bg-background">
                <Image src={image} alt="Profilkép előnézet" fill className="object-cover" unoptimized />
              </div>
            ) : null}
          </div>
          <div className="space-y-3">
            <div>
              <p className="font-medium">Profilkép és kezelés</p>
              <p className="text-sm text-muted-foreground">
                Tölts fel egy képet közvetlenül a profilodhoz. A rendszer most automatikusan középre vágott, négyzetes előnézetet használ, így legalább konzisztens marad minden avatar.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer items-center justify-center rounded-full border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted">
                {uploadPending ? "Feltöltés..." : image ? "Kép cseréje" : "Profilkép kiválasztása"}
                <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={handleFileChange} disabled={uploadPending} />
              </label>
              {image ? (
                <Button type="button" variant="outline" onClick={() => form.setValue("image", "", { shouldDirty: true, shouldValidate: true })}>
                  Kép eltávolítása
                </Button>
              ) : null}
            </div>
            {uploadMessage ? <p className="text-sm text-muted-foreground">{uploadMessage}</p> : null}
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Név</label>
          <Input {...form.register("name")} placeholder="Horváth Levente" />
          <p className="text-xs text-destructive">{String(form.formState.errors.name?.message ?? "")}</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">@felhasználónév</label>
          <Input {...form.register("username")} placeholder="horvathlevi" />
          <p className="text-xs text-destructive">{String(form.formState.errors.username?.message ?? "")}</p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Bio</label>
        <Textarea {...form.register("bio")} placeholder="Pl. SZTE PTI, főleg algoritmusok és web témák érdekelnek." className="min-h-[120px]" />
        <p className="text-xs text-destructive">{String(form.formState.errors.bio?.message ?? "")}</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Aktív egyetem</label>
          <select
            {...form.register("universityId", {
              onChange: () => form.setValue("programId", "")
            })}
            className="flex h-11 w-full rounded-2xl border border-border bg-card/80 px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Nincs kiválasztva</option>
            {universities.map((university) => (
              <option key={university.id} value={university.id}>
                {university.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Aktív szak</label>
          <select
            {...form.register("programId")}
            className="flex h-11 w-full rounded-2xl border border-border bg-card/80 px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Nincs kiválasztva</option>
            {availablePrograms.map((program) => (
              <option key={program.id} value={program.id}>
                {program.label}
              </option>
            ))}
          </select>
        </div>
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

      <div className="flex flex-wrap gap-3">
        <Button disabled={pending}>{pending ? "Mentés..." : "Profil mentése"}</Button>
        <Button type="button" variant="outline" onClick={() => router.push("/profile")}>
          Vissza a profilhoz
        </Button>
      </div>
    </form>
  );
}
