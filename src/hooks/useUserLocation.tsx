import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';

interface UserLocationData {
  zipCode: string | null;
  loading: boolean;
  error: string | null;
  updateZipCode: (newZipCode: string) => Promise<void>;
}

export const useUserLocation = (): UserLocationData => {
  const { user, isGuest } = useAuth();
  const [zipCode, setZipCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('useUserLocation: Effect triggered with user:', user?.id, 'isGuest:', isGuest);
    
    const fetchUserProfile = async () => {
      if (!user || isGuest) {
        // Set default zip code for guests
        console.log('useUserLocation: Setting default zip code for guest/no user');
        setZipCode('78028');
        setLoading(false);
        return;
      }

      try {
        console.log('useUserLocation: Fetching profile for user:', user.id);
        const { data, error } = await supabase
          .from('profiles')
          .select('zip_code')
          .eq('user_id', user.id)
          .maybeSingle();

        console.log('useUserLocation: Database response:', { data, error });

        if (error) {
          console.error('useUserLocation: Error fetching profile:', error);
          setError(error.message);
        } else if (data) {
          console.log('useUserLocation: Setting ZIP code from database:', data.zip_code);
          setZipCode(data.zip_code || null);
        } else {
          console.log('useUserLocation: No profile found, ZIP code will be null');
          setZipCode(null);
        }
      } catch (err) {
        console.error('useUserLocation: Unexpected error fetching profile:', err);
        setError('Failed to fetch user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();

    // Set up real-time subscription for profile changes
    if (user && !isGuest) {
      console.log('useUserLocation: Setting up real-time subscription for user:', user.id);
      
      const channel = supabase
        .channel('profile-zip-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'profiles',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('useUserLocation: Profile update received:', payload);
            if (payload.new && 'zip_code' in payload.new) {
              console.log('useUserLocation: Updating ZIP code from realtime:', payload.new.zip_code);
              setZipCode(payload.new.zip_code);
            }
          }
        )
        .subscribe((status) => {
          console.log('useUserLocation: Subscription status:', status);
        });

      return () => {
        console.log('useUserLocation: Cleaning up subscription');
        supabase.removeChannel(channel);
      };
    }
  }, [user, isGuest]);

  const updateZipCode = async (newZipCode: string) => {
    console.log('useUserLocation: updateZipCode called with:', newZipCode);
    console.log('useUserLocation: Current user:', user?.id);
    console.log('useUserLocation: isGuest:', isGuest);
    
    if (!user || isGuest) {
      console.log('useUserLocation: User not authenticated, throwing error');
      throw new Error("Please sign in to update your ZIP code");
    }

    try {
      console.log('useUserLocation: Updating zip code to:', newZipCode);
      
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          zip_code: newZipCode
        }, {
          onConflict: 'user_id'
        })
        .select('zip_code')
        .single();

      if (error) {
        console.error('useUserLocation: Error updating zip code:', error);
        throw new Error(error.message);
      }

      console.log('useUserLocation: ZIP code updated successfully in database:', data);
      // Update local state immediately for instant feedback
      setZipCode(newZipCode);
      console.log('useUserLocation: Local state updated to:', newZipCode);
    } catch (err) {
      console.error('useUserLocation: Failed to update zip code:', err);
      throw err;
    }
  };

  return {
    zipCode,
    loading,
    error,
    updateZipCode
  };
};