import { useAuthStore } from '@/store/authStore';
import { hasPermission } from '@/lib/utils/auth-helpers';

export const usePermission = (permission: string) => {
  const { userRole } = useAuthStore();

  if (!userRole) return false;
  return hasPermission(userRole, permission);
};
