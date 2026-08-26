import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { workspaceApi } from '../api/workspaceApi';
import { useAuthStore } from '@/features/auth/store/authStore';

export function useCreateWorkspace() {
  const addWorkspace = useAuthStore((s) => s.addWorkspace);
  return useMutation({
    mutationFn: (name: string) => workspaceApi.create(name),
    onSuccess: (workspace) => {
      addWorkspace(workspace);
      toast.success("Yangi ish maydoni yaratildi");
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "Ish maydonini yaratishda xatolik yuz berdi");
    },
  });
}

export function useRenameWorkspace() {
  const renameWorkspace = useAuthStore((s) => s.renameWorkspace);
  return useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => workspaceApi.rename(id, name),
    onSuccess: (workspace) => {
      renameWorkspace(workspace.id, workspace.name);
      toast.success('Ish maydoni nomi yangilandi');
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Nomni yangilashda xatolik yuz berdi');
    },
  });
}
