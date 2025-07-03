import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Settings, Plus } from 'lucide-react';

// Types matching the database schema
type AirdropMilestoneRow = {
  id: string;
  name: string;
  kem_bonus: number;
  created_at?: string;
};

// Type for database row with unknown structure
type DatabaseMilestone = {
  id: unknown;
  name: unknown;
  kem_bonus: unknown;
  created_at?: unknown;
};

// Fixed type guard that matches the expected return type
const isValidMilestone = (milestone: unknown): milestone is AirdropMilestoneRow => {
  return (
    milestone !== null &&
    typeof milestone === 'object' &&
    'id' in milestone &&
    'name' in milestone &&
    'kem_bonus' in milestone &&
    typeof (milestone as any).id === 'string' &&
    typeof (milestone as any).name === 'string' &&
    typeof (milestone as any).kem_bonus === 'number'
  );
};

const AdminAirdropPanel: React.FC = () => {
  const [milestones, setMilestones] = useState<AirdropMilestoneRow[]>([]);
  const [newMilestoneName, setNewMilestoneName] = useState('');
  const [newMilestoneBonus, setNewMilestoneBonus] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchMilestones = useCallback(async () => {
    const { data, error } = await supabase
      .from("airdrop_milestones")
      .select("*")
      .order("created_at");

    if (error) {
      toast({
        title: "Error fetching milestones",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    if (data && Array.isArray(data)) {
      // Transform and validate the data with proper type checking
      const validMilestones = data
        .filter(isValidMilestone)
        .map(milestone => ({
          id: String(milestone.id),
          name: String(milestone.name),
          kem_bonus: Number(milestone.kem_bonus),
          created_at: milestone.created_at ? String(milestone.created_at) : undefined
        }));
      
      setMilestones(validMilestones);
    } else {
      setMilestones([]);
    }
  }, [toast]);

  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);

  const handleAddMilestone = async () => {
    if (!newMilestoneName.trim() || !newMilestoneBonus.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in both name and bonus amount.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("airdrop_milestones")
        .insert([{
          name: newMilestoneName.trim(),
          kem_bonus: Number(newMilestoneBonus)
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setMilestones(prev => [...prev, {
          id: String(data.id),
          name: String(data.name),
          kem_bonus: Number(data.kem_bonus),
          created_at: data.created_at ? String(data.created_at) : undefined
        }]);
        
        setNewMilestoneName('');
        setNewMilestoneBonus('');
        
        toast({
          title: "Success",
          description: "Milestone added successfully!",
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-6 w-6 text-blue-600" />
          <span>Admin Airdrop Panel</span>
        </CardTitle>
        <CardDescription>
          Manage airdrop milestones and bonuses
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Milestone Section */}
        <div className="border rounded-lg p-4 space-y-4">
          <h3 className="font-semibold flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add New Milestone</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Milestone name"
              value={newMilestoneName}
              onChange={(e) => setNewMilestoneName(e.target.value)}
            />
            <Input
              type="number"
              placeholder="KEM bonus amount"
              value={newMilestoneBonus}
              onChange={(e) => setNewMilestoneBonus(e.target.value)}
            />
            <Button 
              onClick={handleAddMilestone} 
              disabled={loading}
              className="w-full"
            >
              {loading ? "Adding..." : "Add Milestone"}
            </Button>
          </div>
        </div>

        {/* Existing Milestones List */}
        <div className="space-y-4">
          <h3 className="font-semibold">Existing Milestones</h3>
          {milestones.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No milestones found</p>
          ) : (
            <div className="grid gap-3">
              {milestones.map((milestone) => (
                <div key={milestone.id} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{milestone.name}</h4>
                    <p className="text-sm text-gray-500">
                      Bonus: {milestone.kem_bonus} KEM tokens
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminAirdropPanel;
