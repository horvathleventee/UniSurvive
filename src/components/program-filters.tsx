"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ProgramFiltersProps = {
  defaults: {
    q?: string;
    semester?: string;
    credits?: string;
    hasContent?: string;
    sort?: string;
    subjectType?: string;
    season?: string;
    hasPrerequisite?: string;
    hasCode?: string;
    category?: string;
  };
};

export function ProgramFilters({ defaults }: ProgramFiltersProps) {
  const quickFilters = [
    defaults.subjectType === "REQUIRED" ? "Kötelező" : null,
    defaults.subjectType === "REQUIRED_ELECTIVE" ? "Kötelezően választható" : null,
    defaults.hasContent === "with-content" ? "Van tartalom" : null,
    defaults.hasPrerequisite === "yes" ? "Van előfeltétel" : null,
    defaults.hasCode === "yes" ? "Van tárgykód" : null,
    defaults.semester ? `${defaults.semester}. félév` : null,
    defaults.category ?? null
  ].filter(Boolean);

  return (
    <form className="rounded-[28px] border border-border/80 bg-card/80 p-5 shadow-soft" action="">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-2 xl:col-span-2">
          <label className="text-sm font-medium">Keresés</label>
          <Input name="q" defaultValue={defaults.q ?? ""} placeholder="Tárgynév vagy tárgykód" className="bg-card" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Típus</label>
          <select name="subjectType" defaultValue={defaults.subjectType ?? ""} className="flex h-11 w-full rounded-2xl border border-border bg-card/80 px-4 py-2 text-sm">
            <option value="">Mindegyik</option>
            <option value="REQUIRED">Kötelező</option>
            <option value="REQUIRED_ELECTIVE">Kötelezően választható</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Szezon</label>
          <select name="season" defaultValue={defaults.season ?? ""} className="flex h-11 w-full rounded-2xl border border-border bg-card/80 px-4 py-2 text-sm">
            <option value="">Mindegyik</option>
            <option value="FALL">Őszi</option>
            <option value="SPRING">Tavaszi</option>
            <option value="ANY">Nincs megadva</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Kategória</label>
          <select name="category" defaultValue={defaults.category ?? ""} className="flex h-11 w-full rounded-2xl border border-border bg-card/80 px-4 py-2 text-sm">
            <option value="">Mindegyik</option>
            <option value="Matematikai alapok">Matematikai alapok</option>
            <option value="Programozás">Programozás</option>
            <option value="Adatkezelés">Adatkezelés</option>
            <option value="Rendszerközeli">Rendszerközeli</option>
            <option value="Szoftverfejlesztés">Szoftverfejlesztés</option>
            <option value="Intelligens rendszerek">Intelligens rendszerek</option>
            <option value="Projekt és gyakorlat">Projekt és gyakorlat</option>
            <option value="Egyéb">Egyéb</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Félév</label>
          <select name="semester" defaultValue={defaults.semester ?? ""} className="flex h-11 w-full rounded-2xl border border-border bg-card/80 px-4 py-2 text-sm">
            <option value="">Mindegyik</option>
            <option value="1">1. félév</option>
            <option value="2">2. félév</option>
            <option value="3">3. félév</option>
            <option value="4">4. félév</option>
            <option value="5">5. félév</option>
            <option value="6">6. félév</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Kredit</label>
          <select name="credits" defaultValue={defaults.credits ?? ""} className="flex h-11 w-full rounded-2xl border border-border bg-card/80 px-4 py-2 text-sm">
            <option value="">Mindegyik</option>
            <option value="2">2 kredit</option>
            <option value="3">3 kredit</option>
            <option value="4">4 kredit</option>
            <option value="5">5 kredit</option>
            <option value="5plus">5+ kredit</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Tartalom</label>
          <select name="hasContent" defaultValue={defaults.hasContent ?? ""} className="flex h-11 w-full rounded-2xl border border-border bg-card/80 px-4 py-2 text-sm">
            <option value="">Mindegyik</option>
            <option value="with-content">Van már review / tipp / forrás</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Előfeltétel</label>
          <select name="hasPrerequisite" defaultValue={defaults.hasPrerequisite ?? ""} className="flex h-11 w-full rounded-2xl border border-border bg-card/80 px-4 py-2 text-sm">
            <option value="">Mindegyik</option>
            <option value="yes">Van előfeltétel</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Tárgykód</label>
          <select name="hasCode" defaultValue={defaults.hasCode ?? ""} className="flex h-11 w-full rounded-2xl border border-border bg-card/80 px-4 py-2 text-sm">
            <option value="">Mindegyik</option>
            <option value="yes">Van tárgykód</option>
          </select>
        </div>
      </div>

      {quickFilters.length ? (
        <div className="mt-4 flex flex-wrap gap-2 text-sm text-muted-foreground">
          <span>Aktív szűrők:</span>
          {quickFilters.map((filter) => (
            <span key={filter} className="rounded-full border border-border bg-background px-3 py-1 text-foreground">
              {filter}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2 md:w-64">
          <label className="text-sm font-medium">Rendezés</label>
          <select name="sort" defaultValue={defaults.sort ?? "name-asc"} className="flex h-11 w-full rounded-2xl border border-border bg-card/80 px-4 py-2 text-sm">
            <option value="name-asc">Név szerint</option>
            <option value="semester-asc">Félév szerint</option>
            <option value="credits-desc">Legtöbb kredit elöl</option>
          </select>
        </div>
        <div className="flex gap-3">
          <Button type="submit">Szűrés</Button>
          <Button type="button" variant="outline" onClick={() => (window.location.search = "")}>
            Szűrők törlése
          </Button>
        </div>
      </div>
    </form>
  );
}
