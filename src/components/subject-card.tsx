import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSubjectCategory } from "@/lib/subject-groups";

type SubjectCardProps = {
  subject: {
    slug: string;
    name: string;
    code: string | null;
    description: string;
    credits: number | null;
    recommendedSemester: number | null;
    subjectType: "REQUIRED" | "REQUIRED_ELECTIVE";
    subjectSeason: "FALL" | "SPRING" | "ANY";
    lectureCredits: number | null;
    practiceCredits: number | null;
    prerequisites: string | null;
    reviews: Array<{ difficultyRating: number }>;
    resources: Array<unknown>;
    examTips: Array<unknown>;
  };
};

export function SubjectCard({ subject }: SubjectCardProps) {
  const averageDifficulty =
    subject.reviews.length > 0
      ? subject.reviews.reduce((sum, review) => sum + review.difficultyRating, 0) / subject.reviews.length
      : 0;
  const category = getSubjectCategory(subject.name);
  const totalSignals = subject.reviews.length + subject.resources.length + subject.examTips.length;
  const difficultyLabel =
    averageDifficulty >= 7.5 ? "Küzdős" : averageDifficulty >= 4.5 ? "Közepes" : averageDifficulty > 0 ? "Barátibb" : "Még nincs jel";

  return (
    <Link href={`/subjects/${subject.slug}`}>
      <Card className="h-full overflow-hidden rounded-[2rem] border-border/70 transition-all hover:-translate-y-1 hover:shadow-md">
        <CardHeader className="border-b border-border/50 bg-gradient-to-r from-accent/20 via-transparent to-secondary/20">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>{subject.name}</CardTitle>
            {subject.code ? <Badge variant="outline">{subject.code}</Badge> : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{category}</Badge>
            <Badge variant="outline">{subject.subjectType === "REQUIRED" ? "Kötelező" : "Köt. választható"}</Badge>
            {subject.subjectSeason !== "ANY" ? <Badge variant="outline">{subject.subjectSeason === "FALL" ? "Őszi" : "Tavaszi"}</Badge> : null}
            {subject.recommendedSemester ? <Badge variant="outline">{subject.recommendedSemester}. félév</Badge> : null}
            {subject.credits ? <Badge variant="outline">{subject.credits} kredit</Badge> : null}
          </div>
          <CardDescription>{subject.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-6 pt-5 text-sm text-muted-foreground">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-border/70 bg-background/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Nehézség</p>
              <p className="mt-2 font-heading text-2xl font-bold text-foreground">{averageDifficulty.toFixed(1)}/10</p>
              <p className="mt-1 text-xs">{difficultyLabel}</p>
            </div>
            <div className="rounded-3xl border border-border/70 bg-secondary/30 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Közösségi jel</p>
              <p className="mt-2 font-heading text-2xl font-bold text-foreground">{totalSignals}</p>
              <p className="mt-1 text-xs">Review + tipp + forrás együtt</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{subject.resources.length} forrás</Badge>
            <Badge variant="outline">{subject.examTips.length} tipp</Badge>
            <Badge variant="outline">{subject.reviews.length} review</Badge>
            {subject.lectureCredits !== null ? <Badge variant="outline">EA kredit: {subject.lectureCredits}</Badge> : null}
            {subject.practiceCredits !== null ? <Badge variant="outline">GY kredit: {subject.practiceCredits}</Badge> : null}
          </div>
          {subject.prerequisites ? <p className="line-clamp-2 text-xs">Előfeltétel: {subject.prerequisites}</p> : null}
        </CardContent>
      </Card>
    </Link>
  );
}
