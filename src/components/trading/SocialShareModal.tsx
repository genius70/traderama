
import React from 'react';
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  WhatsappShareButton,
  EmailShareButton,
} from 'react-share';
import {
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  WhatsappIcon,
  EmailIcon,
} from 'react-share';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface SocialShareModalProps {
  url: string;
  title: string;
  body: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SocialShareModal = ({ url, title, body, open, onOpenChange }: SocialShareModalProps) => {
  const { toast } = useToast();

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: body,
          url: url,
        });
        toast({
          title: "Shared successfully!"
        });
      } catch (error) {
        console.error("Error sharing:", error);
        toast({
          title: "Share failed"
        });
      }
    } else {
      toast({
        title: "Web Share API not supported",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share this strategy</DialogTitle>
          <DialogDescription>
            Share this strategy with your friends and followers.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center space-x-2">
            <FacebookShareButton url={url} title={title}>
              <FacebookIcon size={32} round />
            </FacebookShareButton>
            <TwitterShareButton url={url} title={title}>
              <TwitterIcon size={32} round />
            </TwitterShareButton>
            <LinkedinShareButton url={url} title={title}>
              <LinkedinIcon size={32} round />
            </LinkedinShareButton>
            <WhatsappShareButton url={url} title={title}>
              <WhatsappIcon size={32} round />
            </WhatsappShareButton>
            <EmailShareButton url={url} subject={title} body={body}>
              <EmailIcon size={32} round />
            </EmailShareButton>
            <Button variant="outline" size="sm" onClick={handleShare}>
              Share
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SocialShareModal;
