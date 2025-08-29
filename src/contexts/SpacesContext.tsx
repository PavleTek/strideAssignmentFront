'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSpaces } from '../services/spacesApi';

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
    refreshSpaces();
    
    // Listen for spaces refresh events
    const handleSpacesRefresh = () => {
      refreshSpaces();
    };
    
    window.addEventListener('spaces-refresh', handleSpacesRefresh);
    
    return () => {
      window.removeEventListener('spaces-refresh', handleSpacesRefresh);
    };
  }, []);

  const value: SpacesContextType = {
    spaces,
    loading,
    error,
    refreshSpaces,
  };

  return <SpacesContext.Provider value={value}>{children}</SpacesContext.Provider>;
};
