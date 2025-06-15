import React, { useState, useEffect } from 'react';
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

const AdminAirdropPanel: React.FC = () => {
  const [milestones, setMilestones] = useState<AirdropMilestoneRow[]>([]);
  const [newMilestoneName, setNewMilestoneName] = useState('');
  const [newMilestoneBonus, setNewMilestoneBonus] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchMilestones();
  }, []);

  const fetchMilestones = async () => {
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
      // Properly type-check and filter the data
      const validMilestones = data
        .filter((milestone): milestone is any => 
          milestone && 
          typeof milestone === 'object' && 
          'id' in milestone && 
          'name' in milestone && 
          'kem_bonus' in milestone
        )
        .map(milestone => ({
          id: milestone.id,
          name: milestone.name,
          kem_bonus: Number(milestone.kem_bonus),
          created_at: milestone.created_at
        }));
      
      setMilestones(validMilestones);
    } else {
      setMilestones([]);
    }
  };

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
          id: data.id,
          name: data.name,
          kem_bonus: Number(data.kem_bonus),
          created_at: data.created_at
        }]);
        
        setNewMilestoneName('');
        setNewMilestoneBonus('');
        
        toast({
          title: "Success",
          description: "Milestone added successfully!",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
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
