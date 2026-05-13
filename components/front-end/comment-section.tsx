"use client";

import { useState, useEffect, useTransition } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Send, Trash2, Loader2 } from "lucide-react";
import { Comment, getComments, createComment, deleteComment } from "@/actions/comments";

interface CommentSectionProps {
  itemId: string;
  type: "movie" | "series";
  userId?: string | null;
  userName?: string;
  userImage?: string;
}

export function CommentSection({ itemId, type, userId, userName, userImage }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Load comments
  useEffect(() => {
    async function load() {
      const res = await getComments(type, itemId);
      if (res.success) {
        setComments(res.data || []);
      }
      setIsLoading(false);
    }
    load();
  }, [itemId, type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast.error("Please login to comment");
      return;
    }
    if (!content.trim()) return;

    startTransition(async () => {
      const res = await createComment({
        content: content.trim(),
        userId,
        type,
        itemId,
      });

      if (res.success && res.data) {
        setComments([res.data, ...comments]);
        setContent("");
        toast.success("Comment posted");
      } else {
        toast.error("Failed to post comment");
      }
    });
  };

  const handleDelete = async (commentId: string) => {
    if (!userId) return;
    
    if (confirm("Delete this comment?")) {
      const res = await deleteComment(commentId, userId, type, itemId);
      if (res.success) {
        setComments(comments.filter(c => c.id !== commentId));
        toast.success("Comment deleted");
      } else {
        toast.error("Failed to delete comment");
      }
    }
  };

  return (
    <div className="space-y-8 mt-12 border-t border-white/10 pt-12">
      <div className="flex items-center gap-3">
        <MessageSquare className="w-6 h-6 text-orange-500" />
        <h2 className="text-2xl font-bold">Comments ({comments.length})</h2>
      </div>

      {/* Comment Form */}
      {userId ? (
        <form onSubmit={handleSubmit} className="flex gap-4">
          <Avatar className="w-10 h-10 border border-white/10">
            <AvatarImage src={userImage || ""} />
            <AvatarFallback>{userName?.[0]?.toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-3">
            <Textarea
              placeholder="Write a comment..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="bg-white/5 border-white/10 focus:border-orange-500/50 resize-none"
              rows={3}
            />
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isPending || !content.trim()}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Post Comment
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
          <p className="text-muted-foreground mb-4">You must be logged in to post a comment.</p>
          <Button variant="outline" className="border-orange-500/50 text-orange-500 hover:bg-orange-500/10" asChild>
            <a href="/login">Login Now</a>
          </Button>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-4 group">
              <Avatar className="w-10 h-10 border border-white/10">
                <AvatarImage src={comment.user.imageUrl} />
                <AvatarFallback>{comment.user.name[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-white">{comment.user.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </span>
                      {userId === comment.userId && (
                        <button 
                          onClick={() => handleDelete(comment.id)}
                          className="text-red-500/50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Delete comment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 whitespace-pre-wrap">{comment.content}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </div>
  );
}
