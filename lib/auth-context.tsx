'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, UserRole, DatabaseUserRole } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  roleData: DatabaseUserRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string, role: UserRole) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  roleData: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [roleData, setRoleData] = useState<DatabaseUserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;

      if (session?.user) {
        setUser(session.user);
        const { data: roleRow } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();
        if (mounted) {
          setRole(roleRow?.role || 'customer');
          setRoleData(roleRow as DatabaseUserRole | null);
        }
      }
      if (mounted) setLoading(false);
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        if (session?.user) {
          setUser(session.user);
          const { data: roleRow } = await supabase
            .from('user_roles')
            .select('*')
            .eq('user_id', session.user.id)
            .maybeSingle();
          setRole(roleRow?.role || 'customer');
          setRoleData(roleRow as DatabaseUserRole | null);
        } else {
          setUser(null);
          setRole(null);
          setRoleData(null);
        }
        setLoading(false);
      })();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message || null };
  };

  const signUp = async (email: string, password: string, name: string, selectedRole: UserRole) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };

    if (data.user) {
      await supabase.from('user_roles').insert({
        user_id: data.user.id,
        role: selectedRole,
      });

      if (selectedRole === 'customer') {
        await supabase.from('customers').insert({
          user_id: data.user.id,
          name,
          email,
        });
        await supabase.from('wallets').insert({
          customer_id: (await supabase.from('customers').select('id').eq('user_id', data.user.id).maybeSingle()).data?.id,
          balance: 0,
        });
        await supabase.from('loyalty_points').insert({
          customer_id: (await supabase.from('customers').select('id').eq('user_id', data.user.id).maybeSingle()).data?.id,
          points: 0,
        });
      }
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    setRoleData(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, roleData, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
