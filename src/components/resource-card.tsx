import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { ReportButton } from "@/components/report-button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VoteButtons } from "@/components/vote-buttons";

export function ResourceCard({
  resource
}: {
  resource: {
    id: string;
    title: string;
    description: string | null;
    url: string;
    type: string;
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
      <CardHeader className="gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <CardTitle>{resource.title}</CardTitle>
            <div className="flex items-center gap-3">
              <Avatar name={resource.user.name} image={resource.user.image} className="h-9 w-9" />
              <p className="text-sm text-muted-foreground">@{resource.user.username}</p>
              <Badge variant="outline">{resource.type}</Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ReportButton targetId={resource.id} targetType="NOTE_RESOURCE" />
            <VoteButtons targetId={resource.id} targetType="NOTE_RESOURCE" score={resource.score} viewerVote={resource.viewerVote} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {resource.description ? <p className="text-sm text-muted-foreground">{resource.description}</p> : null}
        <Link href={resource.url} target="_blank" className="inline-flex items-center gap-2 text-sm font-medium text-primary">
          Forrás megnyitása
          <ExternalLink className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
