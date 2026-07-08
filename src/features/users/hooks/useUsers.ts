import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  usersService,
  type UserFilters,
  type UpdateUserInput,
  type CreateManagerInput,
} from '@/services/users.service';
import type { UserRole } from '@/types/database.types';

export const usersKeys = {
  all: ['users'] as const,
  list: (filters: UserFilters) => [...usersKeys.all, 'list', filters] as const,
  detail: (id: string) => [...usersKeys.all, 'detail', id] as const,
};

export function useUsers(params: UserFilters) {
  return useQuery({
    queryKey: usersKeys.list(params),
    queryFn: () => usersService.getAll(params),
  });
}

export function useUserMutations() {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: usersKeys.all });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateUserInput }) =>
      usersService.update(id, input),
    onSuccess: () => {
      invalidate();
      toast.success('تم تحديث بيانات المستخدم');
    },
    onError: (e: Error) => toast.error(e.message || 'تعذّر التحديث'),
  });

  const updateRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) =>
      usersService.updateRole(id, role),
    onSuccess: () => {
      invalidate();
      toast.success('تم تغيير الدور');
    },
    onError: (e: Error) => toast.error(e.message || 'تعذّر تغيير الدور'),
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      usersService.toggleActive(id, is_active),
    onSuccess: (_data, vars) => {
      invalidate();
      toast.success(vars.is_active ? 'تم تفعيل الحساب' : 'تم تعطيل الحساب');
    },
    onError: (e: Error) => toast.error(e.message || 'تعذّر تغيير الحالة'),
  });

  const createManager = useMutation({
    mutationFn: (input: CreateManagerInput) =>
      usersService.createManager(input),
    onSuccess: () => {
      invalidate();
      toast.success('تم إنشاء المدير بنجاح');
    },
    onError: (e: Error) => toast.error(e.message || 'تعذّر إنشاء المدير'),
  });

  const deleteUser = useMutation({
    mutationFn: (id: string) =>
      usersService.deleteUser(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: usersKeys.all, refetchType: 'all' });
      toast.success('تم حذف المستخدم نهائياً');
    },
    onError: (e: Error) => toast.error(e.message || 'تعذّر الحذف'),
  });

  const resetPassword = useMutation({
    mutationFn: ({ id, newPassword }: { id: string; newPassword: string }) =>
      usersService.resetPassword(id, newPassword),
    onSuccess: () => toast.success('تم تعيين كلمة المرور الجديدة'),
    onError: (e: Error) => toast.error(e.message || 'تعذّر إعادة التعيين'),
  });

  return { update, updateRole, toggleActive, createManager, resetPassword, deleteUser };
}
