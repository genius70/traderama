import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, Clock, Heart, MessageSquare } from 'lucide-react';

interface CommunityFiltersProps {
  sortBy: 'recent' | 'popular' | 'trending';
  onSortChange: (sort: 'recent' | 'popular' | 'trending') => void;
  postType?: string;
  onPostTypeChange: (type: string) => void;
}

const CommunityFilters = ({ sortBy, onSortChange, postType, onPostTypeChange }: CommunityFiltersProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={sortBy === 'recent' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSortChange('recent')}
            className="transition-all hover-scale"
          >
            <Clock className="h-4 w-4 mr-2" />
            Recent
          </Button>
          <Button
            variant={sortBy === 'popular' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSortChange('popular')}
            className="transition-all hover-scale"
          >
            <Heart className="h-4 w-4 mr-2" />
            Popular
          </Button>
          <Button
            variant={sortBy === 'trending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSortChange('trending')}
            className="transition-all hover-scale"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Trending
          </Button>
        </div>

        <Select value={postType || 'all'} onValueChange={onPostTypeChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Post Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Posts</SelectItem>
            <SelectItem value="text">Text Posts</SelectItem>
            <SelectItem value="strategy">Strategy Shares</SelectItem>
            <SelectItem value="analysis">Market Analysis</SelectItem>
            <SelectItem value="question">Questions</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default CommunityFilters;
