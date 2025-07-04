import React from 'react';
import { useToast } from "@/components/ui/use-toast";
import { FacebookShareButton, FacebookIcon, TwitterShareButton, TwitterIcon, WhatsappShareButton, WhatsappIcon, LinkedinShareButton, LinkedinIcon, TelegramShareButton, TelegramIcon, EmailShareButton, EmailIcon } from 'react-share';

interface EnhancedSocialShareProps {
  url: string;
  title: string;
  description: string;
  hashtags?: string[];
}

const EnhancedSocialShare: React.FC<EnhancedSocialShareProps> = ({ 
  url, 
  title, 
  description, 
  hashtags = [] 
}) => {
  const { toast } = useToast();

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  const shareOnTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}&hashtags=${hashtags.join(',')}`, '_blank');
  };

  const shareOnLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
  };

  const shareOnWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} - ${url}`)}`, '_blank');
  };

  const shareViaTelegram = () => {
    window.open(`https://telegram.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
  };

  const shareViaEmail = () => {
    window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description}\n\n${url}`)}`;
  };

  const handleNativeShare = async () => {
    if (navigator.share && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        });
        toast({
          title: "Shared successfully!"
        });
      } catch (error) {
        toast({
          title: "Share failed"
        });
      }
    }
  };

  return (
    <div className="flex items-center space-x-3">
      <FacebookShareButton url={url} title={title} hashtags={hashtags}>
        <FacebookIcon size={32} round />
      </FacebookShareButton>

      <TwitterShareButton url={url} title={title} hashtags={hashtags}>
        <TwitterIcon size={32} round />
      </TwitterShareButton>

      <LinkedinShareButton url={url} title={title}>
        <LinkedinIcon size={32} round />
      </LinkedinShareButton>

      <WhatsappShareButton url={url} title={title} separator=" - ">
        <WhatsappIcon size={32} round />
      </WhatsappShareButton>

      <TelegramShareButton url={url} title={title}>
        <TelegramIcon size={32} round />
      </TelegramShareButton>

      <EmailShareButton url={url} subject={title} body={description}>
        <EmailIcon size={32} round />
      </EmailShareButton>

      {navigator.share && typeof navigator.share === 'function' && (
        <button
          onClick={handleNativeShare}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Share
        </button>
      )}
    </div>
  );
};

export default EnhancedSocialShare;
