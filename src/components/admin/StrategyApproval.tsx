import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Strategy {
  id: string;
  title: string;
  description: string | null;
  creator_id: string;
  strategy_config: any;
  status: string | null;
  created_at: string | null;
}

const StrategyApproval: React.FC = () => {
  const { toast } = useToast();
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPendingStrategies = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('trading_strategies')
          .select('*')
          .eq('status', 'pending_review')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setStrategies((data || []).map(item => ({
          ...item,
          status: item.status || 'draft'
        })));
      } catch (error) {
        toast({ title: 'Error fetching strategies', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchPendingStrategies();
  }, [toast]);

  const handleApproval = async (id: string, newStatus: 'published' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('trading_strategies')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      setStrategies(strategies.filter((strategy) => strategy.id !== id));
      toast({
        title: `Strategy ${newStatus}`,
      });

      // Trigger notification via strategy-publish function
      await fetch('/api/strategy-publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strategy_id: id, status: newStatus }),
      });
    } catch (error) {
      toast({ title: `Error ${newStatus} strategy`, variant: 'destructive' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Strategy Approval</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div>Loading...</div>
        ) : strategies.length === 0 ? (
          <div>No pending strategies for approval.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Creator</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {strategies.map((strategy) => (
                <TableRow key={strategy.id}>
                  <TableCell>{strategy.title}</TableCell>
                  <TableCell>{strategy.description || 'No description'}</TableCell>
                  <TableCell>{strategy.creator_id}</TableCell>
                  <TableCell>{strategy.created_at ? new Date(strategy.created_at).toLocaleDateString() : 'Unknown'}</TableCell>
                  <TableCell>
                    <Button
                      className="mr-2"
                      onClick={() => handleApproval(strategy.id, 'published')}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleApproval(strategy.id, 'rejected')}
                    >
                      Reject
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default StrategyApproval;
