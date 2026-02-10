import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { UserRole } from '@/lib/types/database';

export const getCurrentUser = async () => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};

export const getUserProfile = async (userId: string) => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
};

export const getUserRole = async (userId: string): Promise<UserRole | null> => {
  try {
    const profile = await getUserProfile(userId);
    return profile?.role || null;
  } catch {
    return null;
  }
};

export const hasPermission = (userRole: UserRole, permission: string): boolean => {
  const permissions: Record<UserRole, Record<string, boolean>> = {
    superadmin: {
      canViewAllData: true,
      canCreateAdmins: true,
      canDeleteAdmins: true,
      canCreateMembers: true,
      canEditMembers: true,
      canDeleteMembers: true,
      canCreateProducts: true,
      canEditProducts: true,
      canDeleteProducts: true,
      canCreateExpenses: true,
      canEditExpenses: true,
      canDeleteExpenses: true,
      canCreatePromos: true,
      canEditPromos: true,
      canDeletePromos: true,
      canApproveEdits: true,
      canViewAnalytics: true,
      canExportData: true,
      canManageRoles: true,
    },
    admin: {
      canViewAllData: true,
      canCreateMembers: true,
      canEditMembers: true,
      canDeleteMembers: true,
      canCreateProducts: true,
      canEditProducts: true,
      canDeleteProducts: true,
      canCreateExpenses: true,
      canEditExpenses: true,
      canDeleteExpenses: true,
      canCreatePromos: true,
      canEditPromos: true,
      canDeletePromos: true,
      canApproveEdits: true,
      canViewAnalytics: true,
      canExportData: true,
    },
    staff: {
      canCreateExpenses: true,
      canLogCustomers: true,
      canViewShiftBalance: true,
    },
    member: {
      canViewProfile: true,
      canEditProfile: true,
      canViewPromos: true,
      canViewMembership: true,
    },
  };

  return permissions[userRole]?.[permission] || false;
};
