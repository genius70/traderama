
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift } from "lucide-react";

type Milestone = {
  id: string | number;
  name: string;
  kem_bonus: number;
};

interface Props {
  milestones: Milestone[];
  userMilestones: (string | number)[];
}

const UserMilestoneBadges: React.FC<Props> = ({ milestones, userMilestones }) => (
  <Card className="my-4 bg-purple-50 border-purple-200">
    <CardHeader>
      <CardTitle>
        <Gift className="h-5 w-5 text-purple-600 mr-1" />
        Your Milestone Achievements
      </CardTitle>
      <CardDescription>
        Earn badges and bonus KEM awards!
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="flex flex-wrap gap-2">
        {milestones.map((m) => (
          <Badge
            key={m.id}
            className={userMilestones.includes(m.id) ? "bg-green-600 text-white" : "bg-gray-200"}
          >
            {m.name}
            {m.kem_bonus > 0 && <span className="ml-1">+{m.kem_bonus} KEM</span>}
            {userMilestones.includes(m.id) && <span className="ml-2 text-xs">Complete</span>}
          </Badge>
        ))}
        {!milestones.length && <span className="text-gray-500">No milestones yet</span>}
      </div>
    </CardContent>
  </Card>
);

export default UserMilestoneBadges;
