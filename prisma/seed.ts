import { PrismaClient, ResourceType, SubjectSeason, SubjectType } from "@prisma/client";
import { hashSync } from "bcryptjs";

import { sztePtiCurriculum } from "../src/data/szte-pti-curriculum";

const prisma = new PrismaClient();

async function main() {
  await prisma.vote.deleteMany();
  await prisma.report.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.examTip.deleteMany();
  await prisma.noteResource.deleteMany();
  await prisma.subjectReview.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.userSubjectProgress.deleteMany();
  await prisma.session.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.user.deleteMany();
  await prisma.program.deleteMany();
  await prisma.faculty.deleteMany();
  await prisma.university.deleteMany();

  const szte = await prisma.university.create({
    data: {
      name: "Szegedi Tudományegyetem",
      slug: "szte",
      faculties: {
        create: {
          name: "Természettudományi és Informatikai Kar",
          slug: "ttik",
          programs: {
            create: {
              name: "Programtervező informatikus",
              slug: "programtervezo-informatikus"
            }
          }
        }
      }
    },
    include: {
      faculties: { include: { programs: true } }
    }
  });

  const program = szte.faculties[0].programs[0];

  const subjects = await Promise.all(
    sztePtiCurriculum.map((subject) =>
      prisma.subject.create({
        data: {
          name: subject.name,
          code: subject.code,
          slug: subject.slug,
          description: subject.description,
          credits: subject.credits,
          recommendedSemester: subject.recommendedSemester,
          prerequisites: subject.prerequisites,
          subjectType: subject.subjectType as SubjectType,
          subjectSeason: subject.subjectSeason as SubjectSeason,
          lectureCredits: subject.lectureCredits,
          practiceCredits: subject.practiceCredits,
          lectureHours: subject.lectureHours,
          practiceHours: subject.practiceHours,
          curriculumNote: subject.curriculumNote,
          programId: program.id
        }
      })
    )
  );

  const bySlug = Object.fromEntries(subjects.map((subject) => [subject.slug, subject]));

  const user = await prisma.user.create({
    data: {
      name: "Teszt Elek",
      username: "tesztelek",
      email: "demo@unisurvive.hu",
      passwordHash: hashSync("demo12345", 10),
      bio: "SZTE TTIK programtervező informatikus hallgató, túlélő üzemmódban.",
      role: "ADMIN",
      universityId: szte.id,
      programId: program.id
    }
  });

  await prisma.subjectReview.createMany({
    data: [
      {
        title: "Fontos, hogy az elején ne csússz meg",
        content:
          "Programozás alapjaiból a heti gyakorlás sokkal többet ér, mint a ZH előtti kapkodás. Ha a feladatsorokat végigtolod, teljesen vállalható.",
        difficultyRating: 7,
        usefulnessRating: 9,
        teacherName: "Kovács Ádám",
        semesterTaken: "2025/26/1",
        passedFirstTry: true,
        wouldRecommend: true,
        subjectId: bySlug["programozas-alapjai"].id,
        userId: user.id
      },
      {
        title: "Matekos gerinctárgy, de nem reménytelen",
        content:
          "A definíciókat és a mintafeladatokat együtt kell nézni. Diszkrétből nem elég sejteni a megoldást, le is kell tudni vezetni.",
        difficultyRating: 8,
        usefulnessRating: 7,
        teacherName: "Szabó Eszter",
        semesterTaken: "2025/26/1",
        passedFirstTry: true,
        wouldRecommend: true,
        subjectId: bySlug["matematika-informatikusoknak-i"].id,
        userId: user.id
      },
      {
        title: "SQL rutin nélkül kellemetlen lehet",
        content:
          "Az Adatbázisok teljesen korrekt tárgy, de a lekérdezéseket nem lehet bemagolni. JOIN, GROUP BY és alkérdések biztosan menjenek.",
        difficultyRating: 6,
        usefulnessRating: 8,
        teacherName: "Nagy Dóra",
        semesterTaken: "2025/26/2",
        passedFirstTry: true,
        wouldRecommend: true,
        subjectId: bySlug["adatbazisok"].id,
        userId: user.id
      },
      {
        title: "Jó webes belépő, de ne becsüld alá",
        content:
          "A Webfejlesztés alapjai elsőre könnyűnek tűnhet, de ha nincs rutinod HTML/CSS oldalon, gyorsan összeadódik az anyag.",
        difficultyRating: 5,
        usefulnessRating: 8,
        teacherName: "Holló Csaba",
        semesterTaken: "2025/26/1",
        passedFirstTry: true,
        wouldRecommend: true,
        subjectId: bySlug["webfejlesztes-alapjai"].id,
        userId: user.id
      }
    ]
  });

  await prisma.examTip.createMany({
    data: [
      {
        content: "Programozás alapjaiból a ciklusok, függvények és tömbös feladatok szinte biztosan előjönnek.",
        userId: user.id,
        subjectId: bySlug["programozas-alapjai"].id
      },
      {
        content: "Matematika informatikusoknak I.-nél a relációk, logikai formulák és kombinatorikai minták nagyon fontosak.",
        userId: user.id,
        subjectId: bySlug["matematika-informatikusoknak-i"].id
      },
      {
        content: "Adatbázisoknál gyakorold külön a JOIN, GROUP BY és nested query feladatokat.",
        userId: user.id,
        subjectId: bySlug["adatbazisok"].id
      },
      {
        content: "Operációs rendszereknél az alapfogalmakból és definíciókból is szeretnek kérdezni.",
        userId: user.id,
        subjectId: bySlug["operacios-rendszerek"].id
      }
    ]
  });

  await prisma.noteResource.createMany({
    data: [
      {
        title: "Programozás alapjai saját jegyzet",
        description: "Rövid összefoglaló az alap vezérlési szerkezetekről és mintafeladatokról.",
        url: "https://example.com/programozas-alapjai-jegyzet",
        type: ResourceType.ARTICLE,
        userId: user.id,
        subjectId: bySlug["programozas-alapjai"].id
      },
      {
        title: "Matek I. gyakorló feladatok",
        description: "Relációk, logika és kombinatorika témakörre fókuszáló gyakorló csomag.",
        url: "https://example.com/matematika-inf-1",
        type: ResourceType.PDF,
        userId: user.id,
        subjectId: bySlug["matematika-informatikusoknak-i"].id
      },
      {
        title: "Adatbázisok gyakorló feladatok",
        description: "Drive link SQL gyakorlókkal és megoldásokkal.",
        url: "https://drive.google.com/example-adatbazisok",
        type: ResourceType.DRIVE,
        userId: user.id,
        subjectId: bySlug["adatbazisok"].id
      }
    ]
  });

  await prisma.comment.createMany({
    data: [
      {
        content: "A heti gyakorló feladatokat tényleg érdemes megcsinálni, abból áll össze a rutin.",
        userId: user.id,
        subjectId: bySlug["programozas-alapjai"].id
      },
      {
        content: "Ha van régi ZH-sor vagy minta, abból gyorsan látszik, milyen mélységben kérik vissza az SQL részt.",
        userId: user.id,
        subjectId: bySlug["adatbazisok"].id
      }
    ]
  });

  await prisma.bookmark.create({
    data: {
      userId: user.id,
      subjectId: bySlug["adatbazisok"].id
    }
  });

  await prisma.userSubjectProgress.createMany({
    data: [
      {
        userId: user.id,
        subjectId: bySlug["matematika-informatikusoknak-i"].id,
        status: "COMPLETED"
      },
      {
        userId: user.id,
        subjectId: bySlug["programozas-alapjai"].id,
        status: "COMPLETED"
      },
      {
        userId: user.id,
        subjectId: bySlug["adatbazisok"].id,
        status: "IN_PROGRESS"
      }
    ]
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
