
import React from 'react';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface EnhancedSocialShareProps {
  postData: {
    id: string;
    content: string;
    author: string;
    type?: 'post' | 'strategy' | 'trade';
    imageUrl?: string;
  };
  onShare: (platform: string) => void;
}

const EnhancedSocialShare: React.FC<EnhancedSocialShareProps> = ({ 
  postData, 
  onShare 
}) => {
  const { toast } = useToast();

  const shareUrl = `${window.location.origin}/post/${postData.id}`;
  const shareTitle = `Check out this ${postData.type || 'post'} by ${postData.author}`;
  const shareText = postData.content.substring(0, 100) + (postData.content.length > 100 ? '...' : '');

  const handleNativeShare = async () => {
    if (navigator.share && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        onShare('native');
        toast({
          title: "Shared successfully!"
        });
      } catch (error) {
        toast({
          title: "Share failed",
          variant: "destructive"
        });
      }
    } else {
      // Fallback to copying link
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied to clipboard!"
      });
      onShare('clipboard');
    }
  };

  const shareOnPlatform = (platform: string, url: string) => {
    window.open(url, '_blank', 'width=600,height=400');
    onShare(platform);
  };

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleNativeShare}
        className="flex items-center space-x-1"
      >
        <Share2 className="h-4 w-4" />
        <span>Share</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => shareOnPlatform('twitter', `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`)}
      >
        Twitter
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => shareOnPlatform('facebook', `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`)}
      >
        Facebook
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => shareOnPlatform('linkedin', `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`)}
      >
        LinkedIn
      </Button>
    </div>
  );
};

export default EnhancedSocialShare;
