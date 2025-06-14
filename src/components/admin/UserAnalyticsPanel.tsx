
import { Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const mockUserStats = {
  totalUsers: 1250,
  actives: 480,
  newSignups: 45,
  retention: 78, // percent, dummy value
  churn: 6, // percent, dummy value
};

export default function UserAnalyticsPanel() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg font-medium">User Analytics</CardTitle>
          <CardDescription>Deep analytics on user base & engagement</CardDescription>
        </div>
        <Users className="h-6 w-6 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-2xl font-bold">{mockUserStats.totalUsers}</div>
            <div className="text-sm text-gray-500">Total Users</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{mockUserStats.actives}</div>
            <div className="text-sm text-gray-500">Monthly Active</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-600">+{mockUserStats.newSignups}</div>
            <div className="text-sm text-gray-500">New Signups</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-sky-600">{mockUserStats.retention}%</div>
            <div className="text-sm text-gray-500">Retention</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-pink-600">{mockUserStats.churn}%</div>
            <div className="text-sm text-gray-500">Churn</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
