
import React from "react";
import { Badge } from "@/components/ui/badge";

type Milestone = {
  id: string | number;
  name: string;
  kem_bonus: number;
};

interface MilestonesListProps {
  milestones: Milestone[];
}

const MilestonesList: React.FC<MilestonesListProps> = ({ milestones }) => {
  if (!milestones || milestones.length === 0) {
    return <div className="text-gray-400 text-xs">No milestones found</div>;
  }

  return (
    <div className="flex flex-col gap-1">
      {milestones.map((m) => (
        <Badge key={m.id} className="mb-1">
          {m.name} ({m.kem_bonus} KEM)
        </Badge>
      ))}
    </div>
  );
};

export default MilestonesList;

