
import React, { useState } from "react";
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare } from "lucide-react";
import SocialShareButton from "./SocialShareButton";
import CommunityCommentModal from "./CommunityCommentModal";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Added Tip Modal
import TipModal from "./TipModal";

interface CommunityPostCardProps {
  post: any;
  onLike?: () => void;
  onCommentAdded?: () => void;
}

const CommunityPostCard: React.FC<CommunityPostCardProps> = ({ post, onLike, onCommentAdded }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [likes, setLikes] = useState<number>(post.likes_count ?? 0);
  const [likeDisabled, setLikeDisabled] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);
  const [tipOpen, setTipOpen] = useState(false);

  async function handleLike() {
    if (!user) return;
    setLikeDisabled(true);
    try {
      const { error } = await supabase
        .from("post_likes")
        .insert({ post_id: post.id, user_id: user.id });
      if (error) throw error;
      setLikes((prev) => prev + 1);
      onLike?.();
    } catch (e: any) {
      toast({ title: "Error liking post", description: e.message, variant: "destructive" });
    }
    setLikeDisabled(false);
  }

  // Compose data for SocialShareButton
  const shareData = {
    id: String(post.id),
    content: String(post.content ?? ""),
    author: post.profiles?.name || post.profiles?.email || "Unknown",
    type: "post" as const,
    metrics: {
      likes: Number(likes),
      comments: Number(post.comments_count),
      shares: Number(post.shares_count),
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback>
              {post.profiles?.name?.[0] || post.profiles?.email?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{post.profiles?.name || post.profiles?.email}</p>
            <p className="text-sm text-gray-500">{new Date(post.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-800 mb-4">{post.content}</p>
        <div className="flex items-center space-x-6 text-sm text-gray-600">
          <button
            onClick={handleLike}
            disabled={likeDisabled}
            className="flex items-center space-x-1 hover:text-red-500 transition-colors disabled:opacity-60"
            aria-label="Like post"
          >
            <Heart className="h-4 w-4" />
            <span>{likes}</span>
          </button>
          <button
            className="flex items-center space-x-1 hover:text-blue-500 transition-colors"
            onClick={() => setCommentOpen(true)}
            aria-label="Comment on post"
          >
            <MessageSquare className="h-4 w-4" />
            <span>{post.comments_count}</span>
          </button>
          {/* Share button */}
          <SocialShareButton postData={shareData} />
          {/* Tip button */}
          <Button variant="outline" size="sm" onClick={() => setTipOpen(true)}>
            💸 Tip
          </Button>
        </div>
      </CardContent>

      {/* Comments modal */}
      <CommunityCommentModal
        postId={String(post.id)}
        open={commentOpen}
        onOpenChange={setCommentOpen}
      />
      {/* Tip Modal */}
      <TipModal open={tipOpen} onOpenChange={setTipOpen} post={post} />
    </Card>
  );
};

export default CommunityPostCard;
