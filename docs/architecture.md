# UniSurvive MVP terv

## App architektúra

Az alkalmazás App Router alapú Next.js projekt, ahol az olvasó oldalakat szerver komponensek renderelik Prisma lekérdezésekkel, a tartalomíró flow-kat pedig kliens oldali React Hook Form komponensek és szerver actionök kezelik. Az adatfolyam egyszerű: a route betölti az adatot Prisma segítségével, a kliens űrlap Zod validáció után actiont hív, az action ír az adatbázisba, majd `revalidatePath` frissíti az érintett oldalakat.

## Route térkép

- `/` landing oldal
- `/login` bejelentkezés
- `/register` regisztráció
- `/universities` egyetem lista
- `/universities/[universitySlug]` egyetem részoldal
- `/faculties/[facultySlug]` kar részoldal
- `/programs/[programSlug]` szak részoldal és tárgylista
- `/subjects/[subjectSlug]` tárgy részletes oldal
- `/search` globális kereső
- `/profile` saját profil

## Fő komponensek

- `Navbar`
- `Footer`
- `HeroSearch`
- `SearchBar`
- `SubjectCard`
- `SubjectHeader`
- `RatingBadge`
- `ReviewCard`
- `ExamTipCard`
- `ResourceCard`
- `CommentList`
- `CommentForm`
- `BookmarkButton`
- `AuthForm`
- `EmptyState`

## State és adatfolyam

- Session: HTTP-only cookie + `Session` tábla
- Tartalom olvasás: szerver komponens + Prisma
- Tartalom írás: RHF + Zod + szerver action
- Keresés: query string alapú szerver oldali szűrés
- Bookmark és vote: kis, célzott szerver actionök

## Prisma modell stratégia

- Hierarchia: `University -> Faculty -> Program -> Subject`
- Közösségi tartalom: `SubjectReview`, `NoteResource`, `ExamTip`, `Comment`
- Közösségi minőség: `Vote`, `Report`, `Bookmark`
- Moderációs előkészítés: `isHidden`, `role`, `isBanned`
- Auth: egyszerű MVP-s `Session` modell

## Seed stratégia

- 1 egyetem: BME
- 1 kar: VIK
- 1 szak: Mérnökinformatika
- 6 minta tárgy
- 1 demo user
- több review, exam tip, resource, comment és bookmark
