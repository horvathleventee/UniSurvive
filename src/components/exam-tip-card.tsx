import { ReportButton } from "@/components/report-button";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { VoteButtons } from "@/components/vote-buttons";

export function ExamTipCard({
  tip
}: {
  tip: {
    id: string;
    content: string;
    score: number;
    viewerVote: number;
    user: {
      name: string;
      username: string;
      image?: string | null;
    };
  };
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4 p-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Avatar name={tip.user.name} image={tip.user.image} className="h-9 w-9" />
            <p className="text-sm text-muted-foreground">@{tip.user.username}</p>
          </div>
          <p className="text-sm leading-7">{tip.content}</p>
        </div>
        <div className="flex items-center gap-2">
          <ReportButton targetId={tip.id} targetType="EXAM_TIP" />
          <VoteButtons targetId={tip.id} targetType="EXAM_TIP" score={tip.score} viewerVote={tip.viewerVote} />
        </div>
      </CardContent>
    </Card>
  );
}
