import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/authStore';

export const useAuth = () => {
  const router = useRouter();
  const { user, userRole, isLoading, setUser, setUserRole, setIsLoading } = useAuthStore();

  useEffect(() => {
    const initializeAuth = async () => {
      // Check if Supabase is configured
      if (!isSupabaseConfigured()) {
        console.warn('Supabase is not configured. Please set up your .env.local file.');
        setIsLoading(false);
        return;
      }

      try {
        const supabase = await createClient();
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (!authUser) {
          setUser(null);
          setUserRole(null);
          setIsLoading(false);
          return;
        }

        setUser({ id: authUser.id, email: authUser.email || '' });

        // Try to get user profile
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (profileError) {
          console.log('Profile not found, creating one...');
          // Profile doesn't exist, create it
          const { data: newProfile, error: createError } = await supabase
            .from('user_profiles')
            .insert({
              id: authUser.id,
              email: authUser.email,
              full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
              role: 'member',
            })
            .select()
            .single();

          if (createError) {
            console.error('Failed to create profile:', createError);
            // Still set user as member by default
            setUserRole('member');
          } else {
            setUserRole(newProfile?.role || 'member');
          }
        } else {
          setUserRole(profile?.role || 'member');
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
        setUserRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [setUser, setUserRole, setIsLoading, router]);

  const logout = async () => {
    if (!isSupabaseConfigured()) {
      return;
    }
    
    setIsLoading(true);
    try {
      const supabase = await createClient();
      await supabase.auth.signOut();
      setUser(null);
      setUserRole(null);
      router.push('/auth/sign-in');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { user, userRole, isLoading, logout };
};
