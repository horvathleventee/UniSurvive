import { Prisma, ReportStatus, VoteTargetType } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getSubjectCategory } from "@/lib/subject-groups";
import { safeAverage } from "@/lib/utils";

export async function getUniversities() {
  return prisma.university.findMany({
    include: {
      faculties: {
        include: {
          programs: {
            include: {
              _count: { select: { subjects: true } }
            }
          }
        }
      }
    },
    orderBy: { name: "asc" }
  });
}

export async function getUniversityBySlug(slug: string) {
  return prisma.university.findUnique({
    where: { slug },
    include: {
      faculties: {
        include: {
          programs: { include: { _count: { select: { subjects: true } } } }
        },
        orderBy: { name: "asc" }
      }
    }
  });
}

export async function getFacultyBySlug(slug: string) {
  return prisma.faculty.findFirst({
    where: { slug },
    include: {
      university: true,
      programs: {
        include: { _count: { select: { subjects: true } } },
        orderBy: { name: "asc" }
      }
    }
  });
}

export async function getProgramBySlug(
  slug: string,
  filters?: {
    query?: string;
    semester?: string;
    credits?: string;
    hasContent?: string;
    sort?: string;
    subjectType?: string;
    season?: string;
    hasPrerequisite?: string;
    hasCode?: string;
  }
) {
  const andConditions: Prisma.SubjectWhereInput[] = [];

  if (filters?.query) {
    andConditions.push({
      OR: [
        { name: { contains: filters.query, mode: Prisma.QueryMode.insensitive } },
        { code: { contains: filters.query, mode: Prisma.QueryMode.insensitive } }
      ]
    });
  }

  if (filters?.semester) {
    andConditions.push({ recommendedSemester: Number(filters.semester) });
  }

  if (filters?.credits) {
    andConditions.push(filters.credits === "5plus" ? { credits: { gte: 5 } } : { credits: Number(filters.credits) });
  }

  if (filters?.hasContent === "with-content") {
    andConditions.push({
      OR: [{ reviews: { some: {} } }, { resources: { some: {} } }, { examTips: { some: {} } }]
    });
  }

  if (filters?.subjectType) {
    andConditions.push({ subjectType: filters.subjectType as "REQUIRED" | "REQUIRED_ELECTIVE" });
  }

  if (filters?.season) {
    andConditions.push({ subjectSeason: filters.season as "FALL" | "SPRING" | "ANY" });
  }

  if (filters?.hasPrerequisite === "yes") {
    andConditions.push({ prerequisites: { not: null } });
  }

  if (filters?.hasCode === "yes") {
    andConditions.push({ code: { not: null } });
  }

  const where: Prisma.SubjectWhereInput = {
    AND: andConditions
  };

  const orderBy =
    filters?.sort === "semester-asc"
      ? [{ recommendedSemester: "asc" as const }, { name: "asc" as const }]
      : filters?.sort === "credits-desc"
        ? [{ credits: "desc" as const }, { name: "asc" as const }]
        : [{ name: "asc" as const }];

  return prisma.program.findFirst({
    where: { slug },
    include: {
      faculty: { include: { university: true } },
      subjects: {
        where,
        include: {
          reviews: true,
          resources: true,
          examTips: true
        },
        orderBy
      }
    }
  });
}

export async function searchCatalog(query: string) {
  return prisma.subject.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: Prisma.QueryMode.insensitive } },
        { code: { contains: query, mode: Prisma.QueryMode.insensitive } },
        { program: { name: { contains: query, mode: Prisma.QueryMode.insensitive } } }
      ]
    },
    include: {
      program: { include: { faculty: { include: { university: true } } } },
      reviews: true,
      resources: true,
      examTips: true
    },
    take: 20,
    orderBy: { name: "asc" }
  });
}

export async function getSubjectBySlug(slug: string, viewerId?: string) {
  const subject = await prisma.subject.findUnique({
    where: { slug },
    include: {
      program: { include: { faculty: { include: { university: true } } } },
      reviews: {
        where: { isHidden: false },
        include: { user: true },
        orderBy: { createdAt: "desc" }
      },
      resources: {
        where: { isHidden: false },
        include: { user: true },
        orderBy: { createdAt: "desc" }
      },
      examTips: {
        where: { isHidden: false },
        include: { user: true },
        orderBy: { createdAt: "desc" }
      },
      comments: {
        where: { isHidden: false, reviewId: null },
        include: { user: true },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!subject) return null;

  const targetGroups = [
    ...subject.reviews.map((item) => ({ id: item.id, type: VoteTargetType.REVIEW })),
    ...subject.resources.map((item) => ({ id: item.id, type: VoteTargetType.NOTE_RESOURCE })),
    ...subject.examTips.map((item) => ({ id: item.id, type: VoteTargetType.EXAM_TIP })),
    ...subject.comments.map((item) => ({ id: item.id, type: VoteTargetType.COMMENT }))
  ];

  const allVotes = targetGroups.length
    ? await prisma.vote.findMany({
        where: {
          OR: targetGroups.map((group) => ({
            targetId: group.id,
            targetType: group.type
          }))
        }
      })
    : [];

  const viewerVotes =
    viewerId && targetGroups.length
      ? await prisma.vote.findMany({
          where: {
            userId: viewerId,
            OR: targetGroups.map((group) => ({
              targetId: group.id,
              targetType: group.type
            }))
          }
        })
      : [];

  const bookmark = viewerId
    ? await prisma.bookmark.findUnique({
        where: {
          userId_subjectId: {
            userId: viewerId,
            subjectId: subject.id
          }
        }
      })
    : null;

  const buildScore = (targetId: string, targetType: VoteTargetType) =>
    allVotes.filter((vote) => vote.targetId === targetId && vote.targetType === targetType).reduce((sum, vote) => sum + vote.value, 0);

  const buildViewerVote = (targetId: string, targetType: VoteTargetType) =>
    viewerVotes.find((vote) => vote.targetId === targetId && vote.targetType === targetType)?.value ?? 0;

  return {
    ...subject,
    averageDifficulty: safeAverage(subject.reviews.map((review) => review.difficultyRating)),
    averageUsefulness: safeAverage(subject.reviews.map((review) => review.usefulnessRating)),
    isBookmarked: Boolean(bookmark),
    reviews: subject.reviews.map((review) => ({
      ...review,
      score: buildScore(review.id, VoteTargetType.REVIEW),
      viewerVote: buildViewerVote(review.id, VoteTargetType.REVIEW)
    })),
    resources: subject.resources.map((resource) => ({
      ...resource,
      score: buildScore(resource.id, VoteTargetType.NOTE_RESOURCE),
      viewerVote: buildViewerVote(resource.id, VoteTargetType.NOTE_RESOURCE)
    })),
    examTips: subject.examTips.map((tip) => ({
      ...tip,
      score: buildScore(tip.id, VoteTargetType.EXAM_TIP),
      viewerVote: buildViewerVote(tip.id, VoteTargetType.EXAM_TIP)
    })),
    comments: subject.comments.map((comment) => ({
      ...comment,
      score: buildScore(comment.id, VoteTargetType.COMMENT),
      viewerVote: buildViewerVote(comment.id, VoteTargetType.COMMENT)
    }))
  };
}

export async function getProfileData(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      university: true,
      program: {
        include: {
          subjects: {
            where: { isHidden: false },
            orderBy: [{ recommendedSemester: "asc" }, { name: "asc" }]
          }
        }
      },
      reviews: { include: { subject: true }, orderBy: { createdAt: "desc" } },
      resources: { include: { subject: true }, orderBy: { createdAt: "desc" } },
      examTips: { include: { subject: true }, orderBy: { createdAt: "desc" } },
      bookmarks: {
        include: {
          subject: {
            include: { program: true }
          }
        },
        orderBy: { createdAt: "desc" }
      },
      progressEntries: {
        include: { subject: true },
        orderBy: { updatedAt: "desc" }
      }
    }
  });
}

export async function getUserSessionOverview(userId: string, currentToken: string | null) {
  const auditLog = (prisma as unknown as Record<string, unknown>).auditLog as
    | {
        findMany: (args: {
          where: { actorId: string };
          orderBy: { createdAt: "desc" };
          take: number;
        }) => Promise<Array<{ id: string; action: string; targetType: string | null; targetId: string | null; createdAt: Date }>>;
      }
    | undefined;

  const [sessions, auditLogs] = await Promise.all([
    prisma.session.findMany({
      where: { userId },
      orderBy: [{ lastUsedAt: "desc" }, { createdAt: "desc" }]
    }),
    auditLog
      ? auditLog.findMany({
          where: { actorId: userId },
          orderBy: { createdAt: "desc" },
          take: 12
        })
      : Promise.resolve([])
  ]);

  return {
    sessions: sessions.map((session: (typeof sessions)[number]) => ({
      ...session,
      isCurrent: currentToken ? session.token === currentToken : false
    })),
    auditLogs
  };
}

export async function getModerationReports() {
  const reports = await prisma.report.findMany({
    include: {
      user: {
        select: {
          name: true,
          username: true
        }
      }
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }]
  });

  const reviewIds = reports.filter((report) => report.targetType === "REVIEW").map((report) => report.targetId);
  const resourceIds = reports.filter((report) => report.targetType === "NOTE_RESOURCE").map((report) => report.targetId);
  const tipIds = reports.filter((report) => report.targetType === "EXAM_TIP").map((report) => report.targetId);
  const commentIds = reports.filter((report) => report.targetType === "COMMENT").map((report) => report.targetId);
  const subjectIds = reports.filter((report) => report.targetType === "SUBJECT").map((report) => report.targetId);
  const userIds = reports.filter((report) => report.targetType === "USER").map((report) => report.targetId);

  const [reviews, resources, tips, comments, subjects, users] = await Promise.all([
    reviewIds.length
      ? prisma.subjectReview.findMany({ where: { id: { in: reviewIds } }, include: { subject: true } })
      : [],
    resourceIds.length
      ? prisma.noteResource.findMany({ where: { id: { in: resourceIds } }, include: { subject: true } })
      : [],
    tipIds.length ? prisma.examTip.findMany({ where: { id: { in: tipIds } }, include: { subject: true } }) : [],
    commentIds.length ? prisma.comment.findMany({ where: { id: { in: commentIds } }, include: { subject: true, review: { include: { subject: true } } } }) : [],
    subjectIds.length ? prisma.subject.findMany({ where: { id: { in: subjectIds } } }) : [],
    userIds.length ? prisma.user.findMany({ where: { id: { in: userIds } } }) : []
  ]);

  return reports.map((report) => {
    if (report.targetType === "REVIEW") {
      const target = reviews.find((item) => item.id === report.targetId);
      return {
        ...report,
        targetLabel: target?.title ?? "Törölt review",
        targetPath: target ? `/subjects/${target.subject.slug}` : null,
        targetPreview: target?.content?.slice(0, 180) ?? null,
        targetState: target?.isHidden ? "REJTETT" : "LÁTHATÓ"
      };
    }

    if (report.targetType === "NOTE_RESOURCE") {
      const target = resources.find((item) => item.id === report.targetId);
      return {
        ...report,
        targetLabel: target?.title ?? "Törölt forrás",
        targetPath: target ? `/subjects/${target.subject.slug}` : null,
        targetPreview: target?.description ?? target?.url ?? null,
        targetState: target?.isHidden ? "REJTETT" : "LÁTHATÓ"
      };
    }

    if (report.targetType === "EXAM_TIP") {
      const target = tips.find((item) => item.id === report.targetId);
      return {
        ...report,
        targetLabel: target ? target.content.slice(0, 80) : "Törölt tipp",
        targetPath: target ? `/subjects/${target.subject.slug}` : null,
        targetPreview: target?.content ?? null,
        targetState: target?.isHidden ? "REJTETT" : "LÁTHATÓ"
      };
    }

    if (report.targetType === "COMMENT") {
      const target = comments.find((item) => item.id === report.targetId);
      const path = target?.subject ? `/subjects/${target.subject.slug}` : target?.review ? `/subjects/${target.review.subject.slug}` : null;
      return {
        ...report,
        targetLabel: target ? target.content.slice(0, 80) : "Törölt komment",
        targetPath: path,
        targetPreview: target?.content ?? null,
        targetState: target?.isHidden ? "REJTETT" : "LÁTHATÓ"
      };
    }

    if (report.targetType === "SUBJECT") {
      const target = subjects.find((item) => item.id === report.targetId);
      return {
        ...report,
        targetLabel: target?.name ?? "Törölt tárgy",
        targetPath: target ? `/subjects/${target.slug}` : null,
        targetPreview: target?.description ?? null,
        targetState: target?.isHidden ? "REJTETT" : "LÁTHATÓ"
      };
    }

    const target = users.find((item) => item.id === report.targetId);
    return {
      ...report,
      targetLabel: target ? `@${target.username}` : "Törölt felhasználó",
      targetPath: null,
      targetPreview: target?.name ?? null,
      targetState: target?.isBanned ? "TILTOTT" : "AKTÍV"
    };
  });
}

export async function getReportStats() {
  const [openReports, reviewedReports, resolvedReports] = await Promise.all([
    prisma.report.count({ where: { status: ReportStatus.OPEN } }),
    prisma.report.count({ where: { status: ReportStatus.REVIEWED } }),
    prisma.report.count({ where: { status: ReportStatus.RESOLVED } })
  ]);

  return { openReports, reviewedReports, resolvedReports };
}

export async function getAdminAuditLogs() {
  const auditLog = (prisma as unknown as Record<string, unknown>).auditLog as
    | {
        findMany: (args: {
          include: {
            actor: {
              select: {
                name: true;
                username: true;
              };
            };
          };
          orderBy: { createdAt: "desc" };
          take: number;
        }) => Promise<Array<{
          id: string;
          action: string;
          targetType: string | null;
          targetId: string | null;
          metadata: unknown;
          createdAt: Date;
          actor: { name: string; username: string } | null;
        }>>;
      }
    | undefined;

  if (!auditLog) {
    return [];
  }

  return auditLog.findMany({
    include: {
      actor: {
        select: {
          name: true,
          username: true
        }
      }
    },
    orderBy: { createdAt: "desc" },
    take: 50
  });
}

export function getSubjectCategoryCounts(subjects: Array<{ name: string }>) {
  return Array.from(
    subjects.reduce((map, subject) => {
      const category = getSubjectCategory(subject.name);
      map.set(category, (map.get(category) ?? 0) + 1);
      return map;
    }, new Map<string, number>())
  ).sort((a, b) => b[1] - a[1]);
}
