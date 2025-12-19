'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Icon } from '@iconify/react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useTaskComments, useCreateComment, TaskComment } from '@/hooks/use-tasks';
import { Loader2, Send, MessageCircle, Reply } from 'lucide-react';

interface TaskCommentsSectionProps {
  taskId: string;
}

export function TaskCommentsSection({ taskId }: TaskCommentsSectionProps) {
  const { comments, isLoading, mutate } = useTaskComments(taskId);
  const { createComment, isCreating } = useCreateComment();
  const [newComment, setNewComment] = React.useState('');
  const [replyingTo, setReplyingTo] = React.useState<string | null>(null);
  const [replyContent, setReplyContent] = React.useState('');
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await createComment(taskId, newComment.trim());
      setNewComment('');
      mutate();
    } catch (error) {
      console.error('Failed to create comment:', error);
    }
  };

  const handleReply = async (parentId: string) => {
    if (!replyContent.trim()) return;

    try {
      await createComment(taskId, replyContent.trim(), parentId);
      setReplyContent('');
      setReplyingTo(null);
      mutate();
    } catch (error) {
      console.error('Failed to create reply:', error);
    }
  };

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '??';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
          <MessageCircle className="size-4 text-primary/70" />
          Comments
          {comments.length > 0 && (
            <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">
              {comments.length}
            </span>
          )}
        </h4>
      </div>

      {/* Comment input */}
      <form onSubmit={handleSubmit} className="relative">
        <textarea
          ref={inputRef}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="w-full min-h-[80px] p-3 pr-12 text-sm rounded-xl border border-border bg-muted/30 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              handleSubmit(e);
            }
          }}
        />
        <Button
          type="submit"
          size="icon"
          disabled={!newComment.trim() || isCreating}
          className="absolute bottom-3 right-3 size-8 rounded-lg"
        >
          {isCreating ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
        </Button>
      </form>

      {/* Comments list */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-sm text-muted-foreground py-6 text-center">
            <MessageCircle className="size-8 mx-auto mb-2 opacity-30" />
            No comments yet. Be the first to comment!
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                getInitials={getInitials}
                replyingTo={replyingTo}
                setReplyingTo={setReplyingTo}
                replyContent={replyContent}
                setReplyContent={setReplyContent}
                onReply={handleReply}
                isCreating={isCreating}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

function CommentItem({
  comment,
  getInitials,
  replyingTo,
  setReplyingTo,
  replyContent,
  setReplyContent,
  onReply,
  isCreating,
}: {
  comment: TaskComment;
  getInitials: (name: string) => string;
  replyingTo: string | null;
  setReplyingTo: (id: string | null) => void;
  replyContent: string;
  setReplyContent: (content: string) => void;
  onReply: (parentId: string) => void;
  isCreating: boolean;
}) {
  const isReplying = replyingTo === comment.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="group"
    >
      <div className="flex gap-3">
        <Avatar className="size-8 shrink-0">
          <AvatarImage src={comment.user?.avatar || undefined} />
          <AvatarFallback className="text-xs bg-primary/10 text-primary">
            {getInitials(comment.user?.fullName || '')}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {comment.user?.fullName || 'Unknown'}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
          </div>
          <p className="text-sm text-foreground/80 mt-1 whitespace-pre-wrap">
            {comment.content}
          </p>
          <button
            onClick={() => setReplyingTo(isReplying ? null : comment.id)}
            className="text-xs text-muted-foreground hover:text-primary mt-1 flex items-center gap-1"
          >
            <Reply className="size-3" />
            Reply
          </button>

          {/* Reply input */}
          <AnimatePresence>
            {isReplying && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2"
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write a reply..."
                    className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        onReply(comment.id);
                      }
                    }}
                    autoFocus
                  />
                  <Button
                    size="sm"
                    onClick={() => onReply(comment.id)}
                    disabled={!replyContent.trim() || isCreating}
                  >
                    {isCreating ? <Loader2 className="size-4 animate-spin" /> : 'Reply'}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 space-y-3 pl-4 border-l-2 border-border/40">
              {comment.replies.map((reply) => (
                <div key={reply.id} className="flex gap-2">
                  <Avatar className="size-6 shrink-0">
                    <AvatarImage src={reply.user?.avatar || undefined} />
                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                      {getInitials(reply.user?.fullName || '')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">
                        {reply.user?.fullName || 'Unknown'}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-xs text-foreground/80 mt-0.5">
                      {reply.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default TaskCommentsSection;
