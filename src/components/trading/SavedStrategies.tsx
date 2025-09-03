import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Trash2, Eye, FileText } from 'lucide-react';

interface SavedStrategy {
  id: string;
  title: string;
  description: string | null;
  strategy_config: any;
  status: string | null;
  fee_percentage: number | null;
  is_premium_only: boolean | null;
  created_at: string | null;
}

interface SavedStrategiesProps {
  onLoadStrategy: (strategy: SavedStrategy) => void;
}

const SavedStrategies: React.FC<SavedStrategiesProps> = ({ onLoadStrategy }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [strategies, setStrategies] = useState<SavedStrategy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedStrategies();
  }, [user]);

  const fetchSavedStrategies = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('trading_strategies')
        .select('*')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStrategies(data || []);
    } catch (error) {
      console.error('Error fetching strategies:', error);
      toast({ title: 'Error fetching saved strategies', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const deleteStrategy = async (strategyId: string) => {
    try {
      if (!user) return;
      
      const { error } = await supabase
        .from('trading_strategies')
        .delete()
        .eq('id', strategyId)
        .eq('creator_id', user.id);

      if (error) throw error;

      setStrategies(strategies.filter(s => s.id !== strategyId));
      toast({ title: 'Strategy deleted successfully' });
    } catch (error) {
      console.error('Error deleting strategy:', error);
      toast({ title: 'Error deleting strategy', variant: 'destructive' });
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'pending_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'draft':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Saved Strategies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8">Loading saved strategies...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Saved Strategies</CardTitle>
      </CardHeader>
      <CardContent>
        {strategies.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No saved strategies yet. Create your first strategy to see it here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {strategies.map((strategy) => (
              <Card key={strategy.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{strategy.title}</CardTitle>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onLoadStrategy(strategy)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteStrategy(strategy.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Badge className={getStatusColor(strategy.status)}>
                    {strategy.status || 'draft'}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {strategy.description || 'No description provided'}
                  </p>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      {strategy.is_premium_only ? 'Premium' : 'Free'}
                    </span>
                    <span>
                      Fee: {strategy.fee_percentage || 0}%
                    </span>
                  </div>
                  {strategy.created_at && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Created: {new Date(strategy.created_at).toLocaleDateString()}
                    </p>
                  )}
                  <Button
                    className="w-full mt-3"
                    variant="outline"
                    size="sm"
                    onClick={() => onLoadStrategy(strategy)}
                  >
                    Load Strategy
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SavedStrategies;