
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";

const userGrowthData = [
  { month: 'Jan', users: 120, trades: 200, iv: 0.12 },
  { month: 'Feb', users: 150, trades: 250, iv: 0.14 },
  { month: 'Mar', users: 180, trades: 300, iv: 0.16 },
  { month: 'Apr', users: 220, trades: 350, iv: 0.17 },
  { month: 'May', users: 260, trades: 400, iv: 0.15 },
  { month: 'Jun', users: 300, trades: 450, iv: 0.13 },
];

const tradePerformanceData = [
  { month: "Jan", returns: 2.2, volume: 25000 },
  { month: "Feb", returns: -0.6, volume: 28000 },
  { month: "Mar", returns: 1.3, volume: 34050 },
  { month: "Apr", returns: 3.9, volume: 37000 },
  { month: "May", returns: 0.5, volume: 45000 },
  { month: "Jun", returns: 2.7, volume: 49000 },
];

export default function AdminCharts() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>User Growth</CardTitle>
          <CardDescription>Monthly new user registrations</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId={0} />
              <YAxis yAxisId={1} orientation="right" />
              <Tooltip />
              <Line type="monotone" dataKey="users" stroke="#4f46e5" strokeWidth={2} name="Users" yAxisId={0} />
              <Line type="monotone" dataKey="iv" stroke="#f43f5e" yAxisId={1} dot={{ r: 4 }} name="IV (Implied Volatility)" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Trading Volume & Returns</CardTitle>
          <CardDescription>Trading volume and average monthly returns</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={tradePerformanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis orientation="right" yAxisId="right" />
              <Tooltip />
              <Bar yAxisId="left" dataKey="volume" fill="#14b8a6" name="Volume" />
              <Line yAxisId="right" type="monotone" dataKey="returns" stroke="#6366f1" strokeWidth={3} name="Returns (%)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

