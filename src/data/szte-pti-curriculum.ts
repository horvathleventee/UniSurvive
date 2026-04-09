export type CurriculumSubject = {
  name: string;
  code: string | null;
  slug: string;
  description: string;
  credits: number;
  recommendedSemester: number | null;
  prerequisites: string | null;
  subjectType: "REQUIRED" | "REQUIRED_ELECTIVE";
  subjectSeason: "FALL" | "SPRING" | "ANY";
  lectureCredits: number | null;
  practiceCredits: number | null;
  lectureHours: number | null;
  practiceHours: number | null;
  curriculumNote: string | null;
};

type RawSubject = [
  name: string,
  semester: number | null,
  type: "REQUIRED" | "REQUIRED_ELECTIVE",
  season: "FALL" | "SPRING" | "ANY",
  lectureCredits: number | null,
  practiceCredits: number | null,
  lectureHours: number | null,
  practiceHours: number | null,
  prerequisites: string | null,
  note: string | null
];

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildDescription(name: string, note: string | null) {
  return note ? `${name} az SZTE PTI tanterv része. ${note}` : `${name} az SZTE PTI tanterv egyik tárgya.`;
}

function toSubject([
  name,
  semester,
  type,
  season,
  lectureCredits,
  practiceCredits,
  lectureHours,
  practiceHours,
  prerequisites,
  note
]: RawSubject): CurriculumSubject {
  return {
    name,
    code: null,
    slug: slugify(name),
    description: buildDescription(name, note),
    credits: (lectureCredits ?? 0) + (practiceCredits ?? 0),
    recommendedSemester: semester,
    prerequisites,
    subjectType: type,
    subjectSeason: season,
    lectureCredits,
    practiceCredits,
    lectureHours,
    practiceHours,
    curriculumNote: note
  };
}

const rawSubjects: RawSubject[] = [
  ["Matematika informatikusoknak I.", 1, "REQUIRED", "ANY", 2, 3, 2, 2, null, "Téma: diszkrét matematika. 1. félévben való teljesítése kritikus."],
  ["Matematika praktikum", 1, "REQUIRED", "ANY", null, 2, null, 2, null, "Kiugrási lehetőség."],
  ["Programozás alapjai", 1, "REQUIRED", "ANY", 2, 3, 2, 2, null, "1. félévben való teljesítése kritikus."],
  ["Programozás alapjai praktikum", 1, "REQUIRED", "ANY", null, 2, null, 1, null, null],
  ["Számítógép hálózatok", 1, "REQUIRED", "ANY", 2, null, 1, null, null, null],
  ["Optimalizálási algoritmusok", 1, "REQUIRED", "ANY", 1, 3, 1, 2, null, null],
  ["Optimalizálási algoritmusok praktikum", 1, "REQUIRED", "ANY", null, 2, null, 1, null, null],
  ["Egyetemi informatikai alapok", 1, "REQUIRED", "ANY", null, 3, null, 2, null, "Kiugrási lehetőség."],
  ["Személyes és szociális készségek", 1, "REQUIRED", "ANY", 2, null, 2, null, null, null],
  ["Webfejlesztés alapjai", 1, "REQUIRED", "ANY", 1, 2, 1, 1, null, "Előadás és gyakorlat függetlenül teljesíthető. Téma: HTML és CSS."],
  ["Matematika informatikusoknak II.", 2, "REQUIRED", "ANY", 2, 3, 2, 2, "Matematika informatikusoknak I.", "Téma: folytonos matematika, kalkulus és lineáris algebra."],
  ["Számítógépes adatelemzés", 2, "REQUIRED", "ANY", null, 3, null, 2, "Programozás alapjai gy", null],
  ["Numerikus számítások", 2, "REQUIRED", "ANY", 1, 2, 1, 1, "Matematika informatikusoknak I.", null],
  ["Algoritmusok és adatszerkezetek", 2, "REQUIRED", "ANY", 2, 4, 2, 2, "Programozás alapjai gy", null],
  ["Objektumorientált programozás", 2, "REQUIRED", "ANY", 2, 3, 2, 2, "Programozás alapjai gy", "2. félévben való teljesítése kritikus. Java alapú OOP kurzus."],
  ["Szoftverfejlesztési folyamatok", 2, "REQUIRED", "ANY", 2, 2, 2, 1, "Programozás alapjai gy előzetes teljesítése vagy párhuzamos felvétele", "Előadás és gyakorlat függetlenül teljesíthető."],
  ["Adatbázisok", 2, "REQUIRED", "ANY", 2, 2, 2, 2, "Programozás alapjai gy", "Előadás és gyakorlat függetlenül teljesíthető."],
  ["Számítógép-architektúrák", 3, "REQUIRED", "ANY", 2, null, 2, null, null, null],
  ["Informatikai biztonság", 3, "REQUIRED", "ANY", 2, null, 2, null, "Számítógép hálózatok", null],
  ["Fejlett numerikus számítások", 3, "REQUIRED", "ANY", 1, 3, 1, 2, "Numerikus számítások, Matematika informatikusoknak II.", null],
  ["Natív programozás", 3, "REQUIRED", "ANY", 2, 2, 2, 2, "Objektumorientált programozás gy", "Előadás és gyakorlat függetlenül teljesíthető. C++ alapú OOP kurzus."],
  ["Szoftvertesztelés", 3, "REQUIRED", "ANY", 2, 2, 2, 1, "Szoftverfejlesztési folyamatok gy; Programozás alapjai gy", null],
  ["Projektmunka I", 3, "REQUIRED", "ANY", null, 3, null, 2, "Szoftverfejlesztési folyamatok ea; Szoftverfejlesztési folyamatok gy; Programozás alapjai gy", null],
  ["Digitális képfeldolgozás", 3, "REQUIRED", "ANY", 2, 2, 2, 2, "Matematika informatikusoknak I.; Programozás alapjai gy", null],
  ["Mesterséges intelligencia", 3, "REQUIRED", "ANY", 2, 3, 2, 2, "Algoritmusok és adatszerkezetek", "Előadás és gyakorlat függetlenül teljesíthető."],
  ["Operációs rendszerek", 4, "REQUIRED", "ANY", 2, null, 2, null, "Programozás alapjai gy", null],
  ["Matematika informatikusoknak III.", 4, "REQUIRED", "ANY", 2, 3, 2, 2, "Matematika informatikusoknak II.", "Téma: valószínűségszámítás és statisztika alapjai."],
  ["Szoftver architektúrák", 4, "REQUIRED", "ANY", null, 5, null, 2, "Objektumorientált programozás gy", "Előadás és gyakorlat függetlenül teljesíthető."],
  ["Számítástudomány", 5, "REQUIRED", "ANY", 2, 3, 2, 2, "Matematika informatikusoknak I.", null],
  ["Szakdolgozat I", 5, "REQUIRED", "ANY", null, 10, null, 1, null, null],
  ["Szakmai gyakorlat", 6, "REQUIRED", "ANY", null, 0, null, null, "320 óra", "320 óra szakmai gyakorlat."],
  ["Szakdolgozat II", 6, "REQUIRED", "ANY", null, 10, null, 1, null, null],
  ["Gazdasági informatika", null, "REQUIRED_ELECTIVE", "FALL", 1, 3, 1, 2, null, null],
  ["Gépközeli programozás", null, "REQUIRED_ELECTIVE", "FALL", 2, 2, 1, 1, "Objektumorientált programozás gy", "C programozás."],
  ["Programozási paradigmák", null, "REQUIRED_ELECTIVE", "FALL", 2, 2, 2, 1, "Objektumorientált programozás gy", "Előadás és gyakorlat függetlenül teljesíthető."],
  ["Mobilalkalmazás-fejlesztés", null, "REQUIRED_ELECTIVE", "FALL", 2, 2, 1, 1, null, "Előadás és gyakorlat függetlenül teljesíthető."],
  ["Webfejlesztés keretrendszerek", null, "REQUIRED_ELECTIVE", "FALL", 2, 2, 1, 1, null, "Előadás és gyakorlat függetlenül teljesíthető."],
  ["DevOps", null, "REQUIRED_ELECTIVE", "FALL", 2, 2, 1, 1, "Programozás alapjai gy", null],
  ["Webprogramozás", null, "REQUIRED_ELECTIVE", "FALL", 2, 2, 2, 2, "Programozás alapjai gy; Webfejlesztés alapjai gy", "JavaScript. Előadás és gyakorlat függetlenül teljesíthető."],
  ["Backend programozás", null, "REQUIRED_ELECTIVE", "FALL", 2, 2, 2, 1, "Szoftver architektúrák gy", "Előadás és gyakorlat függetlenül teljesíthető."],
  ["Projektmunka III", null, "REQUIRED_ELECTIVE", "FALL", null, 4, null, 2, "Projektmunka II; Szoftver architektúrák", null],
  ["Nemfunkcionális tesztelés", null, "REQUIRED_ELECTIVE", "FALL", 2, 2, 1, 1, "Szoftvertesztelés", null],
  ["Fejlett optimalizálási módszerek", null, "REQUIRED_ELECTIVE", "SPRING", 1, 3, 1, 2, "Optimalizálási algoritmusok", null],
  ["Számítógépes grafika", null, "REQUIRED_ELECTIVE", "SPRING", 2, null, 2, null, "Matematika informatikusoknak I.", "Az előadás és gyakorlat egymástól függetlenül felvehető és teljesíthető."],
  ["Számítógépes grafika gyakorlat", null, "REQUIRED_ELECTIVE", "SPRING", null, 2, null, 2, "Programozás alapjai gy", null],
  ["Autoipari szoftverek tesztelése", null, "REQUIRED_ELECTIVE", "SPRING", 2, 2, 1, 1, "Szoftvertesztelés", null],
  ["UX és UI tervezés", null, "REQUIRED_ELECTIVE", "SPRING", 2, 2, 2, 1, "Webfejlesztés alapjai", "Előadás és gyakorlat függetlenül teljesíthető."],
  ["AI rendszerek fejlesztése", null, "REQUIRED_ELECTIVE", "SPRING", 2, 2, 1, 1, "Projektmunka II gy", "Előadás és gyakorlat függetlenül teljesíthető."],
  ["Szkriptprogramozás", null, "REQUIRED_ELECTIVE", "SPRING", 2, 2, 2, 2, "Programozás alapjai gy", null],
  ["Mobilalkalmazás-tesztelés", null, "REQUIRED_ELECTIVE", "SPRING", 2, 2, 1, 1, "Szoftvertesztelés", null],
  ["Assembly programozás", null, "REQUIRED_ELECTIVE", "SPRING", 2, 2, 1, 1, "Natív programozás gy vagy Gépközeli programozás gy", null],
  ["Menedzselt programozás", null, "REQUIRED_ELECTIVE", "SPRING", 2, 2, 2, 2, "Objektumorientált programozás gy", "Előadás és gyakorlat függetlenül teljesíthető."],
  ["Agilis fejlesztés", null, "REQUIRED_ELECTIVE", "SPRING", 2, 2, 1, 2, "Szoftverfejlesztési folyamatok", null],
  ["Felhő és kód környezetek", null, "REQUIRED_ELECTIVE", "SPRING", 2, 2, 1, 2, null, "Előadás és gyakorlat függetlenül teljesíthető."],
  ["Tesztautomatizálás", null, "REQUIRED_ELECTIVE", "SPRING", 2, 2, 1, 1, "Szoftvertesztelés", null],
  ["AI tesztelés", null, "REQUIRED_ELECTIVE", "SPRING", 2, 2, 1, 1, "Szoftvertesztelés", null],
  ["Szerveroldali webprogramozás", null, "REQUIRED_ELECTIVE", "SPRING", 2, 2, 2, 1, "Backend programozás", null],
  ["Új elvű számítások az informatikában", null, "REQUIRED_ELECTIVE", "SPRING", 3, 0, 2, null, "Matematika informatikusoknak I.", null],
  ["Hardver-szoftver rendszerek verifikációja", null, "REQUIRED_ELECTIVE", "SPRING", 2, 2, 2, 1, "Matematika informatikusoknak I.", null],
  ["Döntési rendszerek", null, "REQUIRED_ELECTIVE", "ANY", 1, 3, 1, 2, null, null],
  ["Validált matematika ismeretek", null, "REQUIRED_ELECTIVE", "ANY", null, 4, null, 4, null, null],
  ["Validált informatika ismeretek", null, "REQUIRED_ELECTIVE", "ANY", null, 4, null, 4, null, null],
  ["Formális nyelvek és elemzők", null, "REQUIRED_ELECTIVE", "ANY", 3, null, 2, null, "Matematika informatikusoknak I.", "Rendszertelenül tartva."],
  ["Logika és informatikai alkalmazásai", null, "REQUIRED_ELECTIVE", "ANY", 2, 2, 2, 1, "Matematika informatikusoknak I.", null],
  ["Mélytanulás", null, "REQUIRED_ELECTIVE", "ANY", 2, 4, 2, 2, "Mesterséges intelligencia gy", null],
  ["Nyelvtechnológia", null, "REQUIRED_ELECTIVE", "ANY", null, 6, null, 4, "Mesterséges intelligencia gy", null],
  ["Adattudomány", null, "REQUIRED_ELECTIVE", "ANY", null, 6, null, 4, "Számítógépes adatelemzés vagy Mérés és adatelemzés", null],
  ["Számítógépes beszédelemzés", null, "REQUIRED_ELECTIVE", "ANY", null, 4, null, 2, "Mesterséges intelligencia gy", null],
  ["Megerősítéses tanulás", null, "REQUIRED_ELECTIVE", "ANY", null, 4, null, 2, "Mesterséges intelligencia gy", null],
  ["Fejlett algoritmusok és adatszerkezetek", null, "REQUIRED_ELECTIVE", "ANY", 2, 2, 2, 1, "Algoritmusok és adatszerkezetek", null],
  ["Validált mesterséges intelligencia ismeretek", null, "REQUIRED_ELECTIVE", "ANY", null, 4, null, 0, "Mesterséges intelligencia ea", null],
  ["Multimédia", null, "REQUIRED_ELECTIVE", "ANY", 2, null, 2, null, null, "Az előadás és gyakorlat egymástól függetlenül felvehető és teljesíthető."],
  ["Multimédia gyakorlat", null, "REQUIRED_ELECTIVE", "ANY", null, 2, null, 1, "Programozás alapjai gy", null],
  ["Digitális topológia és matematikai morfológia", null, "REQUIRED_ELECTIVE", "ANY", 3, null, 2, null, null, null],
  ["Vázkijelölés a képfeldolgozásban", null, "REQUIRED_ELECTIVE", "ANY", 3, null, 2, null, null, null],
  ["Számítógéppel támogatott tervezés", null, "REQUIRED_ELECTIVE", "ANY", 3, null, 2, null, null, null],
  ["Mobil képalkotás és alkalmazásai", null, "REQUIRED_ELECTIVE", "ANY", 3, null, 2, null, null, null],
  ["Image Processing Software Tools", null, "REQUIRED_ELECTIVE", "ANY", 3, null, 2, null, "Programozás alapjai gy", null],
  ["Térinformatika", null, "REQUIRED_ELECTIVE", "ANY", 2, 2, 2, 1, "Adatbázisok", null],
  ["Konvolúciós neurális hálók a képfeldolgozásban", null, "REQUIRED_ELECTIVE", "ANY", 3, null, 2, null, null, null],
  ["Igazságügyi képelemzés", null, "REQUIRED_ELECTIVE", "ANY", 3, null, 2, null, "Programozás alapjai; Matematika informatikusoknak I.; Matematika informatikusoknak II.; Matematika informatikusoknak III.", null],
  ["Medical Image Analysis", null, "REQUIRED_ELECTIVE", "ANY", 3, null, 2, null, "Programozás alapjai gy", null],
  ["Validált képfeldolgozó ismeretek", null, "REQUIRED_ELECTIVE", "ANY", null, 2, null, null, null, null],
  ["Adatbázis alapú rendszerek", null, "REQUIRED_ELECTIVE", "ANY", 2, 2, 2, 1, "Adatbázisok", null],
  ["Nagy mennyiségű adatok feldolgozása (Lufthansa)", null, "REQUIRED_ELECTIVE", "ANY", null, null, null, null, "Adatbázisok", null],
  ["Diszkrét matematika 2", null, "REQUIRED_ELECTIVE", "ANY", 2, 3, 2, 2, "Matematika informatikusoknak I.", null],
  ["Diszkrét matematika 3", null, "REQUIRED_ELECTIVE", "ANY", 2, 3, 2, 2, "Diszkrét matematika 2", null]
];

export const sztePtiCurriculum = rawSubjects.map(toSubject);
