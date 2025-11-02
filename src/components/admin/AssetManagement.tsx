
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import AssetForm from './AssetForm';
import AssetListItem from './AssetListItem';

type AssetType = 'stock' | 'etf' | 'index' | 'crypto';

interface Asset {
  id: string;
  symbol: string;
  name: string;
  asset_type: AssetType;
  exchange: string;
  is_options_available: boolean;
  is_active: boolean;
}

interface AssetFormData {
  symbol: string;
  name: string;
  asset_type: AssetType;
  exchange: string;
  is_options_available: boolean;
}

const AssetManagement = () => {
  const { toast } = useToast();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [newAsset, setNewAsset] = useState<AssetFormData>({
    symbol: '',
    name: '',
    asset_type: 'stock' as AssetType,
    exchange: '',
    is_options_available: false
  });
  const [showAddForm, setShowAddForm] = useState(false);

  // Fetch assets from market_data table
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const { data, error } = await supabase
          .from('market_data')
          .select('symbol, ticker')
          .order('symbol');

        if (error) throw error;

        // Create unique assets from market data
        const uniqueAssets = new Map<string, Asset>();
        data?.forEach((item) => {
          const symbol = item.symbol || item.ticker;
          if (symbol && !uniqueAssets.has(symbol)) {
            uniqueAssets.set(symbol, {
              id: symbol,
              symbol: symbol,
              name: symbol,
              asset_type: 'stock',
              exchange: 'Unknown',
              is_options_available: true,
              is_active: true
            });
          }
        });

        setAssets(Array.from(uniqueAssets.values()));
      } catch (error) {
        console.error('Error fetching assets:', error);
        toast({
          title: 'Error loading assets',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, [toast]);

  const handleAddAsset = () => {
    if (!newAsset.symbol || !newAsset.name || !newAsset.exchange) {
      toast({
        title: "Error",
        variant: "destructive",
      });
      return;
    }

    const asset: Asset = {
      id: Date.now().toString(),
      ...newAsset,
      is_active: true
    };

    setAssets([...assets, asset]);
    setNewAsset({
      symbol: '',
      name: '',
      asset_type: 'stock',
      exchange: '',
      is_options_available: false
    });
    setShowAddForm(false);

    toast({
      title: "Asset added successfully",
    });
  };

  const handleUpdateAsset = () => {
    if (!editingAsset) return;

    setAssets(assets.map(asset => 
      asset.id === editingAsset.id ? editingAsset : asset
    ));
    setEditingAsset(null);

    toast({
      title: "Asset updated successfully",
    });
  };

  const handleDeleteAsset = (assetId: string) => {
    setAssets(assets.filter(asset => asset.id !== assetId));
    toast({
      title: "Asset removed",
    });
  };

  const handleEditAssetChange = (updatedAsset: AssetFormData) => {
    if (editingAsset) {
      setEditingAsset({
        ...editingAsset,
        ...updatedAsset
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Loading assets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Asset Management</h2>
          <p className="text-gray-600">Assets available for trading based on market data</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Add Asset
        </Button>
      </div>

      {/* Add New Asset Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Asset</CardTitle>
            <CardDescription>Add a new tradeable asset to the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <AssetForm
              asset={newAsset}
              onAssetChange={setNewAsset}
              onSave={handleAddAsset}
              onCancel={() => setShowAddForm(false)}
              isEditing={false}
            />
          </CardContent>
        </Card>
      )}

      {/* Assets List */}
      <div className="grid gap-4">
        {assets.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No assets found in market data. Assets will appear here once market data is synced.
            </CardContent>
          </Card>
        ) : (
          assets.map((asset) => (
          <Card key={asset.id}>
            <CardContent className="p-4">
              {editingAsset?.id === asset.id ? (
                <AssetForm
                  asset={{
                    symbol: editingAsset.symbol,
                    name: editingAsset.name,
                    asset_type: editingAsset.asset_type,
                    exchange: editingAsset.exchange,
                    is_options_available: editingAsset.is_options_available
                  }}
                  onAssetChange={handleEditAssetChange}
                  onSave={handleUpdateAsset}
                  onCancel={() => setEditingAsset(null)}
                  isEditing={true}
                />
              ) : (
                <AssetListItem
                  asset={asset}
                  onEdit={setEditingAsset}
                  onDelete={handleDeleteAsset}
                />
              )}
            </CardContent>
          </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AssetManagement;
