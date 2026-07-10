import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { MessageSquare, Send, Trash2 } from 'lucide-react';
import { taskCommentService } from '../../lib/services/taskCommentService';
import { extractErrorMessage } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import type { TaskComment } from '../../types';

function formatWhen(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function TaskComments({ taskId, canModerate }: { taskId: number; canModerate: boolean }) {
  const { user } = useAuth();
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    taskCommentService
      .list(taskId)
      .then(setComments)
      .catch((error) => toast.error(extractErrorMessage(error, 'No se pudieron cargar los comentarios.')))
      .finally(() => setIsLoading(false));
  }, [taskId]);

  async function handleAdd() {
    if (!body.trim()) return;
    setIsSending(true);
    try {
      const comment = await taskCommentService.create(taskId, body.trim());
      setComments((prev) => [comment, ...prev]);
      setBody('');
    } catch (error) {
      toast.error(extractErrorMessage(error, 'No se pudo enviar el comentario.'));
    } finally {
      setIsSending(false);
    }
  }

  async function handleDelete(commentId: number) {
    const previous = comments;
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    try {
      await taskCommentService.remove(taskId, commentId);
    } catch (error) {
      setComments(previous);
      toast.error(extractErrorMessage(error, 'No se pudo eliminar el comentario.'));
    }
  }

  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-semibold text-neutral-700 mb-2">
        <MessageSquare className="w-4 h-4" /> Comentarios {comments.length > 0 && `(${comments.length})`}
      </label>

      <div className="flex items-start gap-2 mb-3">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleAdd();
            }
          }}
          placeholder="Escribe un comentario..."
          rows={2}
          className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400 resize-none"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={isSending || !body.trim()}
          className="shrink-0 h-9 w-9 mt-0.5 rounded-lg bg-primary-500 text-white flex items-center justify-center hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
        {isLoading && <p className="text-xs text-neutral-400">Cargando comentarios...</p>}
        {!isLoading && comments.length === 0 && <p className="text-xs text-neutral-400">Sé el primero en comentar esta tarea.</p>}
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-2 group">
            <div className="w-7 h-7 rounded-full bg-primary-400 text-white flex items-center justify-center text-[11px] font-bold shrink-0">
              {comment.user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="bg-neutral-50 border border-neutral-100 rounded-lg px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-neutral-700">{comment.user?.name}</span>
                  <span className="text-[10px] text-neutral-400 shrink-0">{formatWhen(comment.created_at)}</span>
                </div>
                <p className="text-sm text-neutral-700 mt-0.5 whitespace-pre-wrap break-words">{comment.body}</p>
              </div>
              {(comment.user_id === user?.id || canModerate) && (
                <button
                  type="button"
                  onClick={() => handleDelete(comment.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-neutral-400 hover:text-error-500 flex items-center gap-1 mt-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" /> Eliminar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
