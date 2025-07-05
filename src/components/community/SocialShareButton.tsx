
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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

  const shareUrl = `${window.location.origin}/post/${postData.id}`;
  const shareTitle = `Check out this ${postData.type || 'post'} by ${postData.author}`;

  const handleShare = (platform: string) => {
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareTitle} - ${shareUrl}`)}`
    };

    if (urls[platform as keyof typeof urls]) {
      window.open(urls[platform as keyof typeof urls], '_blank', 'width=600,height=400');
    }
    
    setShowShareModal(false);
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

      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share this {postData.type || 'post'}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col space-y-3">
            <Button onClick={() => handleShare('twitter')} variant="outline">
              Share on Twitter
            </Button>
            <Button onClick={() => handleShare('facebook')} variant="outline">
              Share on Facebook
            </Button>
            <Button onClick={() => handleShare('linkedin')} variant="outline">
              Share on LinkedIn
            </Button>
            <Button onClick={() => handleShare('whatsapp')} variant="outline">
              Share on WhatsApp
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SocialShareButton;
