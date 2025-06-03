
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Plus, Edit, Trash2, TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Asset {
  id: string;
  symbol: string;
  name: string;
  asset_type: string;
  exchange: string;
  is_options_available: boolean;
  is_active: boolean;
  created_at: string;
}

const AssetManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    symbol: '',
    name: '',
    asset_type: 'stock',
    exchange: '',
    is_options_available: false,
    is_active: true
  });

  const assetTypes = [
    { value: 'stock', label: 'Stock' },
    { value: 'etf', label: 'ETF' },
    { value: 'index', label: 'Index' },
    { value: 'crypto', label: 'Cryptocurrency' }
  ];

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const { data, error } = await supabase
        .from('tradeable_assets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssets(data || []);
    } catch (error) {
      console.error('Error fetching assets:', error);
      toast({
        title: "Error loading assets",
        description: "Failed to load tradeable assets",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async () => {
    if (!formData.symbol || !formData.name) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (editingAsset) {
        const { error } = await supabase
          .from('tradeable_assets')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingAsset.id);

        if (error) throw error;

        toast({
          title: "Asset updated",
          description: `${formData.symbol} has been updated successfully`,
        });
      } else {
        const { error } = await supabase
          .from('tradeable_assets')
          .insert({
            ...formData,
            added_by: user?.id
          });

        if (error) throw error;

        toast({
          title: "Asset added",
          description: `${formData.symbol} has been added successfully`,
        });
      }

      resetForm();
      setIsDialogOpen(false);
      fetchAssets();
    } catch (error) {
      toast({
        title: "Operation failed",
        description: "Please try again or check for duplicate symbols",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setFormData({
      symbol: asset.symbol,
      name: asset.name,
      asset_type: asset.asset_type,
      exchange: asset.exchange || '',
      is_options_available: asset.is_options_available,
      is_active: asset.is_active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (assetId: string) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;

    try {
      const { error } = await supabase
        .from('tradeable_assets')
        .delete()
        .eq('id', assetId);

      if (error) throw error;

      toast({
        title: "Asset deleted",
        description: "The asset has been removed successfully",
      });

      fetchAssets();
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Failed to delete the asset",
        variant: "destructive",
      });
    }
  };

  const toggleAssetStatus = async (assetId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('tradeable_assets')
        .update({ is_active: !currentStatus })
        .eq('id', assetId);

      if (error) throw error;

      toast({
        title: "Asset updated",
        description: `Asset ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      });

      fetchAssets();
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update asset status",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      symbol: '',
      name: '',
      asset_type: 'stock',
      exchange: '',
      is_options_available: false,
      is_active: true
    });
    setEditingAsset(null);
  };

  const getAssetTypeColor = (type: string) => {
    const colors = {
      stock: 'bg-blue-100 text-blue-800',
      etf: 'bg-green-100 text-green-800',
      index: 'bg-purple-100 text-purple-800',
      crypto: 'bg-orange-100 text-orange-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Asset Management</h2>
          <p className="text-gray-600">Manage tradeable stocks, ETFs, indices, and cryptocurrencies</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Asset
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingAsset ? 'Edit Asset' : 'Add New Asset'}
              </DialogTitle>
              <DialogDescription>
                {editingAsset ? 'Update asset information' : 'Add a new tradeable asset to the platform'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="symbol">Symbol *</Label>
                  <Input
                    id="symbol"
                    placeholder="AAPL"
                    value={formData.symbol}
                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                  />
                </div>
                <div>
                  <Label htmlFor="asset_type">Asset Type</Label>
                  <Select value={formData.asset_type} onValueChange={(value) => setFormData({ ...formData, asset_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {assetTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="Apple Inc."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="exchange">Exchange</Label>
                <Input
                  id="exchange"
                  placeholder="NASDAQ"
                  value={formData.exchange}
                  onChange={(e) => setFormData({ ...formData, exchange: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="options">Options Available</Label>
                <Switch
                  id="options"
                  checked={formData.is_options_available}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_options_available: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="active">Active</Label>
                <Switch
                  id="active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>

              <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
                {isLoading ? 'Saving...' : (editingAsset ? 'Update Asset' : 'Add Asset')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Tradeable Assets ({assets.length})
          </CardTitle>
          <CardDescription>Currently available assets for trading</CardDescription>
        </CardHeader>
        <CardContent>
          {assets.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No assets added yet</p>
          ) : (
            <div className="space-y-3">
              {assets.map((asset) => (
                <div key={asset.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{asset.symbol}</h3>
                        <Badge className={getAssetTypeColor(asset.asset_type)}>
                          {asset.asset_type.toUpperCase()}
                        </Badge>
                        {asset.is_options_available && (
                          <Badge variant="outline">Options</Badge>
                        )}
                        {!asset.is_active && (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{asset.name}</p>
                      {asset.exchange && (
                        <p className="text-xs text-gray-500">{asset.exchange}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={asset.is_active}
                      onCheckedChange={() => toggleAssetStatus(asset.id, asset.is_active)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(asset)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(asset.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AssetManagement;
