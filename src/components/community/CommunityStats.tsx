import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, MessageSquare, TrendingUp, Crown } from 'lucide-react';
import { useCommunityStats } from '@/hooks/useCommunityStats';

const CommunityStats = () => {
  const { stats, loading } = useCommunityStats();

  const statCards = [
    {
      title: 'Active Traders',
      description: 'Connect with fellow traders',
      icon: Users,
      iconColor: 'text-blue-600',
      value: stats.activeTraders.toLocaleString(),
      subtext: 'In the last 24 hours',
    },
    {
      title: 'Posts Today',
      description: 'New discussions and insights',
      icon: MessageSquare,
      iconColor: 'text-green-600',
      value: stats.postsToday.toLocaleString(),
      subtext: 'Shared today',
    },
    {
      title: 'Trending Strategies',
      description: 'Top performing strategies',
      icon: TrendingUp,
      iconColor: 'text-purple-600',
      value: stats.trendingStrategy,
      subtext: 'Most discussed',
    },
    {
      title: 'Premium Members',
      description: 'Exclusive content and insights',
      icon: Crown,
      iconColor: 'text-yellow-600',
      value: stats.premiumMembers.toLocaleString(),
      subtext: 'Active subscribers',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-in">
      {statCards.map((card, index) => (
        <Card key={index} className="hover:shadow-lg transition-all duration-300 hover-scale">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <card.icon className={`h-5 w-5 mr-2 ${card.iconColor}`} />
              {card.title}
            </CardTitle>
            <CardDescription>{card.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <>
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-4 w-32" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-900">{card.value}</div>
                <p className="text-sm text-gray-500 mt-1">{card.subtext}</p>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CommunityStats;
