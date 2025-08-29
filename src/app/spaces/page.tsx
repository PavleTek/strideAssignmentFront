"use client";

import { useState, useCallback } from 'react';
import ProtectedRoute from "../../components/ProtectedRoute";
import Dashboard from "../../components/Dashboard";
import { SpaceView, SpaceDetails } from "../../components/spaceView";
import { Space } from "../../contexts/SpacesContext";
import { spacesApi } from "../../services/spacesApi";

export default function SpacesPage() {
  const [selectedSpace, setSelectedSpace] = useState<SpaceDetails | null>(null);

  const handleSpaceSelect = async (space: Space) => {
    // Only allow selection of spaces without children (leaf spaces)
    if (!space.children || space.children.length === 0) {
      try {
        // Fetch complete space details from backend
        const response = await spacesApi.getSpaceById(space.id);
        const spaceDetails: SpaceDetails = {
          id: response.space.id,
          name: response.space.name,
          about: response.space.about,
          level: response.space.level,
          children: response.space.children,
          bannerURL: response.space.bannerURL,
          contributors: response.space.contributors || [],
          flashcards: response.space.flashcards || [],
          articles: response.space.articles || [],
          alerts: response.space.alerts || [],
          subscribers: response.space.subscribers || []
        };
        setSelectedSpace(spaceDetails);
      } catch (error) {
        console.error('Failed to fetch space details:', error);
        // Fallback to basic space info if API call fails
        const spaceDetails: SpaceDetails = {
          id: space.id,
          name: space.name,
          level: space.level,
          children: space.children,
          contributors: [],
          flashcards: [],
          articles: [],
          alerts: [],
          subscribers: []
        };
        setSelectedSpace(spaceDetails);
      }
    }
  };

  // Function to refresh the selected space data
  const refreshSelectedSpace = useCallback(async () => {
    if (selectedSpace) {
      try {
        const response = await spacesApi.getSpaceById(selectedSpace.id);
        const updatedSpace: SpaceDetails = {
          id: response.space.id,
          name: response.space.name,
          about: response.space.about,
          level: response.space.level,
          children: response.space.children,
          bannerURL: response.space.bannerURL,
          contributors: response.space.contributors || [],
          flashcards: response.space.flashcards || [],
          articles: response.space.articles || [],
          alerts: response.space.alerts || [],
          subscribers: response.space.subscribers || []
        };
        setSelectedSpace(updatedSpace);
      } catch (error) {
        console.error('Failed to refresh space data:', error);
      }
    }
  }, [selectedSpace]);

  return (
    <ProtectedRoute>
      <Dashboard 
        onSpaceSelect={handleSpaceSelect}
        selectedSpaceTitle={selectedSpace?.name || null}
      >
        <div>
          <SpaceView space={selectedSpace} onRefresh={refreshSelectedSpace} />
        </div>
      </Dashboard>
    </ProtectedRoute>
  );
}
