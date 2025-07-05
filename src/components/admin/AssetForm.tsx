
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Save, X } from 'lucide-react';

type AssetType = 'stock' | 'etf' | 'index' | 'crypto';

interface AssetFormData {
  symbol: string;
  name: string;
  asset_type: AssetType;
  exchange: string;
  is_options_available: boolean;
}

interface AssetFormProps {
  asset: AssetFormData;
  onAssetChange: (asset: AssetFormData) => void;
  onSave: () => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const AssetForm: React.FC<AssetFormProps> = ({
  asset,
  onAssetChange,
  onSave,
  onCancel,
  isEditing = false
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="symbol">Symbol *</Label>
          <Input
            id="symbol"
            value={asset.symbol}
            onChange={(e) => onAssetChange({...asset, symbol: e.target.value.toUpperCase()})}
            placeholder="e.g., AAPL"
          />
        </div>
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={asset.name}
            onChange={(e) => onAssetChange({...asset, name: e.target.value})}
            placeholder="e.g., Apple Inc."
          />
        </div>
        <div>
          <Label htmlFor="type">Asset Type *</Label>
          <Select
            value={asset.asset_type}
            onValueChange={(value: AssetType) => 
              onAssetChange({...asset, asset_type: value})
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
            value={asset.exchange}
            onChange={(e) => onAssetChange({...asset, exchange: e.target.value})}
            placeholder="e.g., NASDAQ"
          />
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="options"
          checked={asset.is_options_available}
          onCheckedChange={(checked) => onAssetChange({...asset, is_options_available: checked})}
        />
        <Label htmlFor="options">Options trading available</Label>
      </div>
      <div className="flex space-x-2">
        <Button onClick={onSave}>
          <Save className="h-4 w-4 mr-2" />
          {isEditing ? 'Update' : 'Add'} Asset
        </Button>
        <Button variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default AssetForm;
