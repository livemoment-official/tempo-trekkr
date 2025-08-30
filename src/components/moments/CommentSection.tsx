import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import { Send, Edit3, Trash2 } from "lucide-react";
import { useMomentComments } from "@/hooks/useMomentComments";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface CommentSectionProps {
  momentId: string;
  className?: string;
}

export function CommentSection({ momentId, className }: CommentSectionProps) {
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  
  const { user } = useAuth();
  const { 
    comments, 
    isLoading, 
    addComment, 
    updateComment, 
    deleteComment,
    isAdding 
  } = useMomentComments(momentId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    addComment(newComment);
    setNewComment("");
  };

  const handleEdit = (commentId: string, content: string) => {
    setEditingId(commentId);
    setEditContent(content);
  };

  const handleSaveEdit = (commentId: string) => {
    if (!editContent.trim()) return;
    
    updateComment({ commentId, content: editContent });
    setEditingId(null);
    setEditContent("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-3">
              <div className="w-8 h-8 bg-muted rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/4" />
                <div className="h-4 bg-muted rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Comments List */}
      <div className="space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={comment.user?.avatar_url} />
              <AvatarFallback>
                {comment.user?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">
                  {comment.user?.name || comment.user?.username}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.created_at), {
                    addSuffix: true,
                    locale: it
                  })}
                </span>
              </div>
              
              {editingId === comment.id ? (
                <div className="space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[60px] text-sm"
                    placeholder="Modifica il commento..."
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleSaveEdit(comment.id)}
                      disabled={!editContent.trim()}
                    >
                      Salva
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCancelEdit}
                    >
                      Annulla
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-sm">{comment.content}</p>
                  
                  {comment.user_id === user?.id && (
                    <div className="flex gap-1 mt-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(comment.id, comment.content)}
                        className="h-6 px-2 text-xs"
                      >
                        <Edit3 size={12} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteComment(comment.id)}
                        className="h-6 px-2 text-xs text-destructive hover:text-destructive"
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {comments.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-4">
            Nessun commento ancora. Sii il primo a commentare!
          </p>
        )}
      </div>

      {/* Add Comment Form */}
      {user && (
        <form onSubmit={handleSubmit} className="flex gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={user.user_metadata?.avatar_url} />
            <AvatarFallback>
              {user.user_metadata?.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Scrivi un commento..."
              className="min-h-[60px] text-sm resize-none"
              disabled={isAdding}
            />
            
            <div className="flex justify-end">
              <Button
                type="submit"
                size="sm"
                disabled={!newComment.trim() || isAdding}
                className="flex items-center gap-2"
              >
                <Send size={14} />
                {isAdding ? 'Invio...' : 'Commenta'}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}