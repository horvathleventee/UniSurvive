import { format } from "date-fns";
import { hu } from "date-fns/locale";

import { ReportButton } from "@/components/report-button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { VoteButtons } from "@/components/vote-buttons";

type ReviewCardProps = {
  review: {
    id: string;
    title: string;
    content: string;
    difficultyRating: number;
    usefulnessRating: number;
    teacherName: string | null;
    semesterTaken: string | null;
    passedFirstTry: boolean | null;
    wouldRecommend: boolean | null;
    createdAt: Date;
    score: number;
    viewerVote: number;
    user: {
      name: string;
      username: string;
      image?: string | null;
    };
  };
};

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <Card>
      <CardHeader className="gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar name={review.user.name} image={review.user.image} />
            <div>
              <h3 className="font-heading text-lg font-semibold">{review.title}</h3>
              <p className="text-sm text-muted-foreground">
                @{review.user.username} • {format(review.createdAt, "yyyy. MMM d.", { locale: hu })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ReportButton targetId={review.id} targetType="REVIEW" />
            <VoteButtons targetId={review.id} targetType="REVIEW" score={review.score} viewerVote={review.viewerVote} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge>Nehézség {review.difficultyRating}/10</Badge>
          <Badge variant="outline">Hasznosság {review.usefulnessRating}/10</Badge>
          {review.teacherName ? <Badge variant="outline">{review.teacherName}</Badge> : null}
          {review.semesterTaken ? <Badge variant="outline">{review.semesterTaken}</Badge> : null}
          {review.passedFirstTry ? <Badge variant="secondary">Elsőre átment</Badge> : null}
          {review.wouldRecommend ? <Badge variant="secondary">Ajánlaná</Badge> : null}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-7 text-foreground/90">{review.content}</p>
      </CardContent>
    </Card>
  );
}
