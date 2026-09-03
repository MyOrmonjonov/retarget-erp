'use client';

import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Textarea } from '@/shared/ui/textarea';
import { Avatar } from '@/shared/ui/avatar';
import { Skeleton } from '@/shared/ui/skeleton';
import { formatRelativeTime } from '@/shared/lib/utils';
import { useTaskComments, useAddTaskComment } from '../hooks/useTaskComments';

interface CommentThreadProps {
  taskId: string;
}

export function CommentThread({ taskId }: CommentThreadProps) {
  const { data: comments = [], isLoading } = useTaskComments(taskId);
  const addComment = useAddTaskComment(taskId);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');

  const handleSubmit = async () => {
    const text = draft.trim();
    if (!text) return;
    await addComment.mutateAsync(text);
    setDraft('');
    setOpen(true);
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--color-bg-hover)] text-caption font-medium text-[var(--color-accent)]"
      >
        <MessageSquare className="h-3.5 w-3.5" />
        {comments.length > 0 ? `${comments.length} ta izoh` : "Izoh qo'shish"}
      </button>

      {(open || comments.length > 0) && (
        <div className="mt-3 space-y-2">
          {isLoading ? (
            <Skeleton className="h-14 w-full" />
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="rounded-md border border-[var(--color-bg-border)] bg-[var(--color-bg-surface)] p-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5">
                    <Avatar name={comment.authorName} size="xs" />
                    <span className="text-caption font-semibold text-[var(--color-text-primary)]">{comment.authorName}</span>
                  </span>
                  <span className="text-[10px] text-[var(--color-text-muted)]">{formatRelativeTime(comment.createdAt)}</span>
                </div>
                <p className="mt-1.5 text-caption text-[var(--color-text-secondary)] whitespace-pre-wrap">{comment.body}</p>
              </div>
            ))
          )}

          <div className="space-y-1.5">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Vazifa bo'yicha izoh yozing..."
              rows={2}
            />
            <div className="flex justify-end">
              <Button variant="secondary" size="sm" onClick={handleSubmit} loading={addComment.isPending} disabled={!draft.trim()}>
                Yuborish
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
