'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSpaces } from '../services/spacesApi';
import { useAuth } from './AuthContext';

export interface Space {
  id: string;
  name: string;
  level: number;
  children?: Space[];
}

interface SpacesContextType {
  spaces: Space[];
  loading: boolean;
  error: string | null;
  refreshSpaces: () => Promise<void>;
}

const SpacesContext = createContext<SpacesContextType | undefined>(undefined);

export const useSpaces = () => {
  const context = useContext(SpacesContext);
  if (context === undefined) {
    throw new Error('useSpaces must be used within a SpacesProvider');
  }
  return context;
};

interface SpacesProviderProps {
  children: ReactNode;
}

export const SpacesProvider: React.FC<SpacesProviderProps> = ({ children }) => {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { loading: authLoading, user } = useAuth();

  const refreshSpaces = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getSpaces();
      setSpaces(response.spaces);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch spaces');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch spaces when auth is not loading and user is authenticated
    if (!authLoading && user) {
      refreshSpaces();
    } else if (!authLoading && !user) {
      // If auth is done but no user, set loading to false
      setLoading(false);
    }
    
    // Listen for spaces refresh events
    const handleSpacesRefresh = () => {
      if (user) {
        refreshSpaces();
      }
    };
    
    window.addEventListener('spaces-refresh', handleSpacesRefresh);
    
    return () => {
      window.removeEventListener('spaces-refresh', handleSpacesRefresh);
    };
  }, [authLoading, user]);

  const value: SpacesContextType = {
    spaces,
    loading: loading || authLoading, // Show loading if either spaces or auth is loading
    error,
    refreshSpaces,
  };

  return <SpacesContext.Provider value={value}>{children}</SpacesContext.Provider>;
};
