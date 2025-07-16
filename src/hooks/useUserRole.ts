import { useEffect, useState } from 'react';
import supabase from '../lib/supabase';

export function useUserRole() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRole() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('encargados')
        .select('rol')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      setRole(data?.rol);
      setLoading(false);
    }

    fetchRole();
  }, []);

  return { role, loading };
}