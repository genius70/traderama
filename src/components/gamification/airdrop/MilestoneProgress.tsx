
import React from "react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface Props {
  creditsEarned: number;
  nextMilestone: number;
  progressValue: number;
}

const MilestoneProgress: React.FC<Props> = ({
  creditsEarned,
  nextMilestone,
  progressValue,
}) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <Label>Milestone Progress</Label>
      <Badge variant="outline">
        {creditsEarned} / {nextMilestone} credits
      </Badge>
    </div>
    <Progress value={progressValue} className="h-2" />
    <p className="text-sm text-gray-500">
      Earn {nextMilestone - creditsEarned} more credits to reach the next milestone
    </p>
  </div>
);

export default MilestoneProgress;
