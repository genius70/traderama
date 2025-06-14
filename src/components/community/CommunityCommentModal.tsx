import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface CommunityCommentModalProps {
  postId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: {
    name?: string;
    email?: string;
  };
}

export default function CommunityCommentModal({ postId, open, onOpenChange }: CommunityCommentModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) fetchComments();
  }, [open, postId]);

  async function fetchComments() {
    setLoading(true);
    const { data, error } = await supabase
      .from("post_comments")
      .select("*, profiles(name, email)")
      .eq("post_id", postId)
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Error fetching comments", variant: "destructive" });
      setComments([]);
    } else {
      setComments(data as Comment[] ?? []);
    }
    setLoading(false);
  }

  async function handleAddComment() {
    if (!user || !newComment.trim()) return;
    setSubmitting(true);
    const { error } = await supabase
      .from("post_comments")
      .insert({
        post_id: postId,
        user_id: user.id,
        content: newComment,
      });
    setSubmitting(false);
    if (error) {
      toast({ title: "Error adding comment", description: error.message, variant: "destructive" });
    } else {
      setNewComment("");
      fetchComments();
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Comments</DialogTitle>
          <DialogDescription className="mb-2">Share your thoughts on this post.</DialogDescription>
        </DialogHeader>
        <div className="max-h-80 overflow-y-auto mb-4">
          {loading ? (
            <div>Loading comments...</div>
          ) : comments.length === 0 ? (
            <div className="text-gray-500 py-6 text-center">No comments yet</div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="mb-3 border-b pb-2">
                <div className="font-semibold text-sm">{comment.profiles?.name || comment.profiles?.email}</div>
                <div className="text-xs text-gray-500">{new Date(comment.created_at).toLocaleString()}</div>
                <div className="mt-1">{comment.content}</div>
              </div>
            ))
          )}
        </div>
        <div className="space-y-2">
          <Textarea
            rows={2}
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            disabled={submitting}
          />
          <Button onClick={handleAddComment} disabled={submitting || !newComment.trim()} className="w-full">
            {submitting ? "Posting..." : "Post Comment"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
