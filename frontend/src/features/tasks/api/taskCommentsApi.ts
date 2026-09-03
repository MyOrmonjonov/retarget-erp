import { api } from '@/shared/lib/api';

export interface TaskComment {
  id: string;
  taskId: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
}

interface TaskCommentDto {
  id: number;
  taskId: number;
  authorId: number;
  authorName: string;
  body: string;
  createdAt: string;
}

function toTaskComment(dto: TaskCommentDto): TaskComment {
  return {
    id: String(dto.id),
    taskId: String(dto.taskId),
    authorId: String(dto.authorId),
    authorName: dto.authorName,
    body: dto.body,
    createdAt: dto.createdAt,
  };
}

export const taskCommentsApi = {
  list: async (taskId: string): Promise<TaskComment[]> => {
    const response = await api.get<TaskCommentDto[]>(`/tasks/${taskId}/comments`);
    return response.data.map(toTaskComment);
  },

  create: async (taskId: string, body: string): Promise<TaskComment> => {
    const response = await api.post<TaskCommentDto>(`/tasks/${taskId}/comments`, { body });
    return toTaskComment(response.data);
  },
};
