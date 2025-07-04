import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Share2, Twitter, Facebook, Linkedin, Link, MessageSquare, Image } from 'lucide-react';

interface EnhancedSocialShareProps {
  postData: {
    id: string;
    content: string;
    author: string;
    type?: 'post' | 'strategy' | 'trade';
    imageUrl?: string;
    videoUrl?: string;
  };
  onShare?: (platform: string) => void;
}

const EnhancedSocialShare: React.FC<EnhancedSocialShareProps> = ({ postData, onShare }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const shareUrl = `${window.location.origin}/posts/${postData.id}`;
  const baseMessage = `Check out this ${postData.type} by ${postData.author}: ${postData.content.substring(0, 100)}...`;

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        variant: "destructive",
      });
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Unsupported file type",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
  };

  const handlePlatformShare = (platform: string) => {
    const message = customMessage || baseMessage;
    let shareUrl = '';

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(message)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${encodeURIComponent(message)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(message + ' ' + shareUrl)}`;
        break;
      default:
        return;
    }

    window.open(shareUrl, '_blank', 'width=600,height=400');
    onShare?.(platform);
    
    toast({
      title: "Shared successfully",
      description: `Content shared to ${platform.charAt(0).toUpperCase() + platform.slice(1)}`,
    });
    
    setIsOpen(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied",
      });
    } catch {
      toast({
        title: "Failed to copy",
        variant: "destructive",
      });
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: `Post by ${postData.author}`,
          text: customMessage || baseMessage,
          url: shareUrl,
        });
        onShare?.('native');
      } catch {
        console.log('Native share cancelled or failed');
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center space-x-1">
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share this post</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Custom Message */}
          <div>
            <label className="text-sm font-medium">Custom message (optional)</label>
            <Textarea
              placeholder="Add your own message..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="text-sm font-medium">Add image or video (optional)</label>
            <div className="mt-1 flex items-center space-x-2">
              <Input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
                id="media-upload"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('media-upload')?.click()}
              >
                <Image className="h-4 w-4 mr-2" />
                Add Media
              </Button>
              {selectedFile && (
                <span className="text-sm text-gray-600">{selectedFile.name}</span>
              )}
            </div>
          </div>

          {/* Share Platforms */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => handlePlatformShare('twitter')}
              className="flex items-center justify-center space-x-2"
            >
              <Twitter className="h-4 w-4" />
              <span>Twitter</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => handlePlatformShare('facebook')}
              className="flex items-center justify-center space-x-2"
            >
              <Facebook className="h-4 w-4" />
              <span>Facebook</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => handlePlatformShare('linkedin')}
              className="flex items-center justify-center space-x-2"
            >
              <Linkedin className="h-4 w-4" />
              <span>LinkedIn</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => handlePlatformShare('whatsapp')}
              className="flex items-center justify-center space-x-2"
            >
              <MessageSquare className="h-4 w-4" />
              <span>WhatsApp</span>
            </Button>
          </div>

          {/* Native Share and Copy Link */}
          <div className="flex space-x-2">
            {navigator.share && (
              <Button
                variant="outline"
                onClick={handleNativeShare}
                className="flex-1"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Native Share
              </Button>
            )}
            <Button
              variant="outline"
              onClick={copyToClipboard}
              className="flex-1"
            >
              <Link className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedSocialShare;
