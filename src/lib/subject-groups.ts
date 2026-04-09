export function getSubjectCategory(subjectName: string) {
  const name = subjectName.toLowerCase();

  if (name.includes("matematika") || name.includes("numerikus") || name.includes("optimaliz") || name.includes("logika")) {
    return "Matematikai alapok";
  }

  if (
    name.includes("programoz") ||
    name.includes("algoritmus") ||
    name.includes("objektum") ||
    name.includes("assembly") ||
    name.includes("backend") ||
    name.includes("mobil")
  ) {
    return "Programozás";
  }

  if (name.includes("adatbázis") || name.includes("adat") || name.includes("döntési rendszerek")) {
    return "Adatkezelés";
  }

  if (name.includes("hálózat") || name.includes("operációs") || name.includes("architekt") || name.includes("gépközeli")) {
    return "Rendszerközeli";
  }

  if (name.includes("web") || name.includes("szoftver") || name.includes("devops") || name.includes("ux") || name.includes("ui")) {
    return "Szoftverfejlesztés";
  }

  if (
    name.includes("intelligencia") ||
    name.includes("képfeldolgozás") ||
    name.includes("mélytanulás") ||
    name.includes("neurális") ||
    name.includes("nyelvtechnológia")
  ) {
    return "Intelligens rendszerek";
  }

  if (name.includes("projekt") || name.includes("szakdolgozat") || name.includes("gyakorlat")) {
    return "Projekt és gyakorlat";
  }

  return "Egyéb";
}
