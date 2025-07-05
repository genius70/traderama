
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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

const AssetManagement = () => {
  const { toast } = useToast();
  const [assets, setAssets] = useState<Asset[]>([
    {
      id: '1',
      symbol: 'SPY',
      name: 'SPDR S&P 500 ETF Trust',
      asset_type: 'etf',
      exchange: 'NYSE',
      is_options_available: true,
      is_active: true
    },
    {
      id: '2',
      symbol: 'QQQ',
      name: 'Invesco QQQ Trust',
      asset_type: 'etf',
      exchange: 'NASDAQ',
      is_options_available: true,
      is_active: true
    },
    {
      id: '3',
      symbol: 'AAPL',
      name: 'Apple Inc.',
      asset_type: 'stock',
      exchange: 'NASDAQ',
      is_options_available: true,
      is_active: true
    }
  ]);

  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [newAsset, setNewAsset] = useState({
    symbol: '',
    name: '',
    asset_type: 'stock' as AssetType,
    exchange: '',
    is_options_available: false
  });
  const [showAddForm, setShowAddForm] = useState(false);

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Asset Management</h2>
          <p className="text-gray-600">Manage stocks, ETFs, indices, and crypto assets</p>
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
        {assets.map((asset) => (
          <Card key={asset.id}>
            <CardContent className="p-4">
              {editingAsset?.id === asset.id ? (
                <AssetForm
                  asset={editingAsset}
                  onAssetChange={setEditingAsset}
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
        ))}
      </div>
    </div>
  );
};

export default AssetManagement;
