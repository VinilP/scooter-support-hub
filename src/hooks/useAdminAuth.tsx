import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

const ADMIN_PHONE_NUMBER = '+919890236593';

export const useAdminAuth = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        setHasProfile(false);
        return;
      }

      try {
        // Check if user has a profile with the admin phone number
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('phone_number')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
          setHasProfile(false);
        } else if (profile) {
          setHasProfile(true);
          setIsAdmin(profile.phone_number === ADMIN_PHONE_NUMBER);
        } else {
          setHasProfile(false);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        setHasProfile(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  const createProfileWithPhone = async (phoneNumber: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          phone_number: phoneNumber,
          display_name: user.email?.split('@')[0] || 'User'
        });

      if (error) {
        console.error('Error creating profile:', error);
        return false;
      }

      // Recheck admin status
      setHasProfile(true);
      setIsAdmin(phoneNumber === ADMIN_PHONE_NUMBER);
      return true;
    } catch (error) {
      console.error('Error creating profile:', error);
      return false;
    }
  };

  return {
    isAdmin,
    loading,
    hasProfile,
    createProfileWithPhone,
    adminPhoneNumber: ADMIN_PHONE_NUMBER
  };
};