
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Copy, Download, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShareData {
  type: 'pnl' | 'strategy' | 'trade' | 'post';
  userName: string;
  totalProfit?: number;
  totalTrades?: number;
  winRate?: string;
  timeframe?: string;
  strategyName?: string;
  content?: string;
  timestamp: string;
}

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareData: ShareData;
}

const SocialShareModal: React.FC<SocialShareModalProps> = ({ isOpen, onClose, shareData }) => {
  const [customMessage, setCustomMessage] = useState('');
  const { toast } = useToast();

  const generateShareText = (platform: 'twitter' | 'facebook' | 'instagram' | 'generic') => {
    const { userName, totalProfit, totalTrades, winRate, timeframe } = shareData;
    
    const baseMessage = `🚀 Trading Update from ${userName}:\n\n` +
      `💰 Total P&L: ${totalProfit ? `$${totalProfit.toLocaleString()}` : 'N/A'}\n` +
      `📊 Trades: ${totalTrades || 'N/A'}\n` +
      `🎯 Win Rate: ${winRate || 'N/A'}%\n` +
      `📅 Period: ${timeframe || 'Recent'}\n\n`;

    const customPart = customMessage ? `${customMessage}\n\n` : '';

    switch (platform) {
      case 'twitter':
        return `${baseMessage}${customPart}#Trading #IronCondor #OptionsTrading`;
      case 'facebook':
        return `${baseMessage}${customPart}Check out my latest trading results! 📈`;
      case 'instagram':
        return `${baseMessage}${customPart}#trading #options #investing #financialfreedom`;
      default:
        return `${baseMessage}${customPart}`;
    }
  };

  const shareToSocial = (platform: 'twitter' | 'facebook' | 'instagram') => {
    const text = generateShareText(platform);
    let url = '';

    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(text)}`;
        break;
      case 'instagram':
        // Instagram doesn't support direct text sharing, so we copy to clipboard
        copyToClipboard(text);
        toast({
          title: "Copied to clipboard!",
          description: "Paste this text when creating your Instagram post.",
        });
        return;
    }

    window.open(url, '_blank', 'width=600,height=400');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to clipboard!",
        description: "Share text has been copied to your clipboard.",
      });
    });
  };

  const downloadShareImage = () => {
    // This would generate and download a share image
    // For now, we'll just show a toast
    toast({
      title: "Feature coming soon!",
      description: "Share image generation will be available soon.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Share2 className="h-5 w-5" />
            <span>Share Trading Results</span>
          </DialogTitle>
          <DialogDescription>
            Share your trading performance with the community
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Preview Card */}
          <Card className="border-2 border-dashed border-gray-200">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">Trading Update</Badge>
                  <span className="text-sm text-gray-500">
                    {new Date(shareData.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-semibold">🚀 Trading Update from {shareData.userName}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>💰 Total P&L: ${shareData.totalProfit?.toLocaleString() || 'N/A'}</div>
                  <div>📊 Trades: {shareData.totalTrades || 'N/A'}</div>
                  <div>🎯 Win Rate: {shareData.winRate || 'N/A'}%</div>
                  <div>📅 Period: {shareData.timeframe || 'Recent'}</div>
                </div>
                {customMessage && (
                  <p className="text-sm mt-2 p-2 bg-gray-50 rounded">{customMessage}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Custom Message */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Add a personal message (optional)</label>
            <Textarea
              placeholder="Add your thoughts about this trading period..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          {/* Social Platform Buttons */}
          <div className="space-y-4">
            <h4 className="font-medium">Share to social platforms:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                onClick={() => shareToSocial('twitter')}
                variant="outline"
                className="flex items-center space-x-2 bg-blue-50 hover:bg-blue-100 border-blue-200"
              >
                <span>🐦</span>
                <span>Twitter</span>
              </Button>
              
              <Button
                onClick={() => shareToSocial('facebook')}
                variant="outline"
                className="flex items-center space-x-2 bg-blue-50 hover:bg-blue-100 border-blue-200"
              >
                <span>📘</span>
                <span>Facebook</span>
              </Button>
              
              <Button
                onClick={() => shareToSocial('instagram')}
                variant="outline"
                className="flex items-center space-x-2 bg-pink-50 hover:bg-pink-100 border-pink-200"
              >
                <span>📷</span>
                <span>Instagram</span>
              </Button>
              
              <Button
                onClick={() => copyToClipboard(generateShareText('generic'))}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Copy className="h-4 w-4" />
                <span>Copy Text</span>
              </Button>
            </div>
          </div>

          {/* Additional Options */}
          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              onClick={downloadShareImage}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Download Image</span>
            </Button>
            
            <div className="space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={() => copyToClipboard(generateShareText('generic'))}>
                Copy & Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SocialShareModal;
