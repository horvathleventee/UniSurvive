import { formatDistanceToNow } from "date-fns";
import { hu } from "date-fns/locale";

import { ReportButton } from "@/components/report-button";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { VoteButtons } from "@/components/vote-buttons";

export function CommentList({
  comments
}: {
  comments: Array<{
    id: string;
    content: string;
    createdAt: Date;
    score: number;
    viewerVote: number;
    user: {
      name: string;
      username: string;
      image?: string | null;
    };
  }>;
}) {
  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <Card key={comment.id}>
          <CardContent className="flex items-start justify-between gap-4 p-5">
            <div className="flex items-start gap-3">
              <Avatar name={comment.user.name} image={comment.user.image} className="h-9 w-9" />
              <div>
                <p className="text-sm font-medium">
                  @{comment.user.username}{" "}
                  <span className="font-normal text-muted-foreground">• {formatDistanceToNow(comment.createdAt, { addSuffix: true, locale: hu })}</span>
                </p>
                <p className="mt-1 text-sm text-foreground/90">{comment.content}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ReportButton targetId={comment.id} targetType="COMMENT" />
              <VoteButtons targetId={comment.id} targetType="COMMENT" score={comment.score} viewerVote={comment.viewerVote} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
