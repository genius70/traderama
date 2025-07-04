import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="symbol">Symbol *</Label>
                <Input
                  id="symbol"
                  value={newAsset.symbol}
                  onChange={(e) => setNewAsset({...newAsset, symbol: e.target.value.toUpperCase()})}
                  placeholder="e.g., AAPL"
                />
              </div>
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={newAsset.name}
                  onChange={(e) => setNewAsset({...newAsset, name: e.target.value})}
                  placeholder="e.g., Apple Inc."
                />
              </div>
              <div>
                <Label htmlFor="type">Asset Type *</Label>
                <Select
                  value={newAsset.asset_type}
                  onValueChange={(value: AssetType) => 
                    setNewAsset({...newAsset, asset_type: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stock">Stock</SelectItem>
                    <SelectItem value="etf">ETF</SelectItem>
                    <SelectItem value="index">Index</SelectItem>
                    <SelectItem value="crypto">Crypto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="exchange">Exchange *</Label>
                <Input
                  id="exchange"
                  value={newAsset.exchange}
                  onChange={(e) => setNewAsset({...newAsset, exchange: e.target.value})}
                  placeholder="e.g., NASDAQ"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="options"
                checked={newAsset.is_options_available}
                onCheckedChange={(checked) => setNewAsset({...newAsset, is_options_available: checked})}
              />
              <Label htmlFor="options">Options trading available</Label>
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleAddAsset}>
                <Save className="h-4 w-4 mr-2" />
                Add Asset
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assets List */}
      <div className="grid gap-4">
        {assets.map((asset) => (
          <Card key={asset.id}>
            <CardContent className="p-4">
              {editingAsset?.id === asset.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Symbol</Label>
                      <Input
                        value={editingAsset.symbol}
                        onChange={(e) => setEditingAsset({...editingAsset, symbol: e.target.value.toUpperCase()})}
                      />
                    </div>
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={editingAsset.name}
                        onChange={(e) => setEditingAsset({...editingAsset, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Type</Label>
                      <Select
                        value={editingAsset.asset_type}
                        onValueChange={(value: AssetType) => 
                          setEditingAsset({...editingAsset, asset_type: value})
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="stock">Stock</SelectItem>
                          <SelectItem value="etf">ETF</SelectItem>
                          <SelectItem value="index">Index</SelectItem>
                          <SelectItem value="crypto">Crypto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Exchange</Label>
                      <Input
                        value={editingAsset.exchange}
                        onChange={(e) => setEditingAsset({...editingAsset, exchange: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={editingAsset.is_options_available}
                      onCheckedChange={(checked) => setEditingAsset({...editingAsset, is_options_available: checked})}
                    />
                    <Label>Options trading available</Label>
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={handleUpdateAsset} size="sm">
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setEditingAsset(null)}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{asset.symbol}</h3>
                        <Badge variant="secondary">{asset.asset_type}</Badge>
                        {asset.is_options_available && (
                          <Badge variant="outline">Options</Badge>
                        )}
                        {!asset.is_active && (
                          <Badge variant="destructive">Inactive</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{asset.name}</p>
                      <p className="text-xs text-gray-500">{asset.exchange}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingAsset(asset)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteAsset(asset.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AssetManagement;
