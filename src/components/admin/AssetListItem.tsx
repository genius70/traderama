
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';

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

interface AssetListItemProps {
  asset: Asset;
  onEdit: (asset: Asset) => void;
  onDelete: (assetId: string) => void;
}

const AssetListItem: React.FC<AssetListItemProps> = ({
  asset,
  onEdit,
  onDelete
}) => {
  return (
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
          onClick={() => onEdit(asset)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(asset.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default AssetListItem;
