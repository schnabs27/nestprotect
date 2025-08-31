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
    const fetchUserProfile = async () => {
      if (!user || isGuest) {
        // Set default zip code for guests
        setZipCode('78028');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('zip_code')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching profile:', error);
          setError(error.message);
        } else {
          setZipCode(data?.zip_code || null);
        }
      } catch (err) {
        console.error('Unexpected error fetching profile:', err);
        setError('Failed to fetch user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user, isGuest]);

  const updateZipCode = async (newZipCode: string) => {
    if (!user || isGuest) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          zip_code: newZipCode
        });

      if (error) {
        console.error('Error updating zip code:', error);
        throw new Error(error.message);
      }

      setZipCode(newZipCode);
    } catch (err) {
      console.error('Failed to update zip code:', err);
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