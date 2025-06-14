
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Coins, Wallet, TrendingUp } from "lucide-react";

interface Props {
  earned: number;
  available: number;
  received: number;
}

const CreditsOverview: React.FC<Props> = ({ earned, available, received }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <Card className="bg-green-50 border-green-200">
      <CardContent className="p-4 text-center">
        <Coins className="h-8 w-8 text-green-600 mx-auto mb-2" />
        <div className="text-2xl font-bold text-green-700">{earned}</div>
        <div className="text-sm text-green-600">Total Credits Earned</div>
      </CardContent>
    </Card>
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="p-4 text-center">
        <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
        <div className="text-2xl font-bold text-blue-700">{available}</div>
        <div className="text-sm text-blue-600">Available Credits</div>
      </CardContent>
    </Card>
    <Card className="bg-purple-50 border-purple-200">
      <CardContent className="p-4 text-center">
        <Wallet className="h-8 w-8 text-purple-600 mx-auto mb-2" />
        <div className="text-2xl font-bold text-purple-700">{received}</div>
        <div className="text-sm text-purple-600">KEM Tokens Received</div>
      </CardContent>
    </Card>
  </div>
);

export default CreditsOverview;
