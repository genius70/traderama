
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import SocialShareModal from '../trading/SocialShareModal';

interface SocialShareButtonProps {
  postData: {
    id: string;
    content: string;
    author: string;
    type?: 'post' | 'strategy' | 'trade';
    metrics?: {
      likes?: number;
      comments?: number;
      shares?: number;
    };
  };
  size?: 'sm' | 'default' | 'lg';
  variant?: 'outline' | 'ghost' | 'default';
}

const SocialShareButton: React.FC<SocialShareButtonProps> = ({ 
  postData, 
  size = 'sm', 
  variant = 'ghost' 
}) => {
  const [showShareModal, setShowShareModal] = useState(false);

  const generateShareData = () => {
    const shareType: 'pnl' | 'strategy' | 'trade' | 'post' = postData.type === 'post' ? 'post' : (postData.type as 'pnl' | 'strategy' | 'trade' | 'post') || 'post';
    
    return {
      type: shareType,
      userName: postData.author,
      content: postData.content,
      timestamp: new Date().toISOString()
    };
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setShowShareModal(true)}
        className="flex items-center space-x-1"
      >
        <Share2 className="h-4 w-4" />
        <span>Share</span>
        {postData.metrics?.shares && postData.metrics.shares > 0 && (
          <span className="text-xs text-gray-500">({postData.metrics.shares})</span>
        )}
      </Button>

      <SocialShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        shareData={generateShareData()}
      />
    </>
  );
};

export default SocialShareButton;
