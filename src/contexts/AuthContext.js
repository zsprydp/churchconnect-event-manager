import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import logger from '../utils/logger';

const AuthContext = createContext(null);

const DEMO_USER = {
  id: 'demo-user',
  email: 'admin@churchconnect.demo',
  name: 'Demo Admin',
  role: 'admin',
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId) => {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error) {
      logger.error('Failed to fetch profile:', error);
      return null;
    }
    return data;
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setUser(DEMO_USER);
      setProfile(DEMO_USER);
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).then(setProfile);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).then(setProfile);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signIn = async (email, password) => {
    if (!isSupabaseConfigured) {
      setUser(DEMO_USER);
      setProfile(DEMO_USER);
      return { error: null };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email, password, name, role = 'member') => {
    if (!isSupabaseConfigured) {
      const newUser = { ...DEMO_USER, email, name, role };
      setUser(newUser);
      setProfile(newUser);
      return { error: null };
    }
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (!error && data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        email,
        name,
        role,
      });
    }
    return { error };
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      setUser(DEMO_USER);
      setProfile(DEMO_USER);
      return;
    }
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const isAdmin = profile?.role === 'admin';
  const isCoordinator = profile?.role === 'coordinator' || isAdmin;
  const isVolunteer = profile?.role === 'volunteer' || isCoordinator;

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user,
    isDemo: !isSupabaseConfigured,
    isAdmin,
    isCoordinator,
    isVolunteer,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
