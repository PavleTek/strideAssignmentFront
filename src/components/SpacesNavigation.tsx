'use client';

import React, { useState } from 'react';
import { ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/20/solid';
import { useSpaces, Space } from '../contexts/SpacesContext';
import { spacesApi } from '../services/spacesApi';

interface SpaceItemProps {
  space: Space;
  level: number;
  isExpanded: boolean;
  onToggle: (spaceId: string) => void;
  onSpaceClick: (space: Space) => void;
  expandedSpaces: Set<string>;
  selectedSpaceId: string | null;
}

const SpaceItem: React.FC<SpaceItemProps> = ({ space, level, isExpanded, onToggle, onSpaceClick, expandedSpaces, selectedSpaceId }) => {
  const hasChildren = space.children && space.children.length > 0;
  const paddingLeft = level * 16; // 16px per level
  const isSelected = selectedSpaceId === space.id;

  return (
    <div>
      <div
        className={`flex items-center gap-2 py-1 px-2 rounded cursor-pointer ${
          isSelected 
            ? 'bg-gray-200 text-gray-800 font-medium' 
            : 'hover:bg-gray-100 text-gray-700'
        }`}
        style={{ paddingLeft: `${paddingLeft}px` }}
        onClick={() => onSpaceClick(space)}
      >
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle(space.id);
            }}
            className="p-1 hover:bg-gray-200 rounded"
          >
            {isExpanded ? <ChevronDownIcon className="h-4 w-4 text-gray-500" /> : <ChevronRightIcon className="h-4 w-4 text-gray-500" />}
          </button>
        )}
        {!hasChildren && <div className="w-6" />} {/* Spacer for alignment */}
        <span className={`text-sm ${isSelected ? 'font-medium' : ''}`}>{space.name}</span>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {space.children!.map((child) => (
            <SpaceItem 
              key={child.id} 
              space={child} 
              level={level + 1} 
              isExpanded={expandedSpaces.has(child.id)} 
              onToggle={onToggle} 
              onSpaceClick={onSpaceClick} 
              expandedSpaces={expandedSpaces}
              selectedSpaceId={selectedSpaceId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface SpacesNavigationProps {
  onSpaceSelect?: (space: Space) => Promise<void>;
}

export const SpacesNavigation: React.FC<SpacesNavigationProps> = ({ onSpaceSelect }) => {
  const { spaces, loading, error } = useSpaces();
  const [viewMode, setViewMode] = useState<'subscribed' | 'all'>('all');
  const [expandedSpaces, setExpandedSpaces] = useState<Set<string>>(new Set());
  const [currentSpaces, setCurrentSpaces] = useState<Space[]>([]);
  const [subscribedSpaces, setSubscribedSpaces] = useState<Space[]>([]);
  const [subscribedLoading, setSubscribedLoading] = useState(false);
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);

  React.useEffect(() => {
    if (viewMode === 'all') {
      setCurrentSpaces(spaces);
    } else {
      // Fetch subscribed spaces when switching to subscribed view
      fetchSubscribedSpaces();
    }
  }, [spaces, viewMode]);

  const fetchSubscribedSpaces = async () => {
    try {
      setSubscribedLoading(true);
      const response = await spacesApi.getSubscribedSpacesHierarchy();
      setSubscribedSpaces(response.spaces);
      setCurrentSpaces(response.spaces);
    } catch (err) {
      console.error('Failed to fetch subscribed spaces:', err);
      setCurrentSpaces([]);
    } finally {
      setSubscribedLoading(false);
    }
  };

  const handleToggle = (spaceId: string) => {
    const newExpanded = new Set(expandedSpaces);
    if (newExpanded.has(spaceId)) {
      newExpanded.delete(spaceId);
    } else {
      newExpanded.add(spaceId);
    }
    setExpandedSpaces(newExpanded);
  };

  const handleSpaceClick = async (space: Space) => {
    const hasChildren = space.children && space.children.length > 0;
    
    // Only select spaces that don't have children (leaf spaces)
    if (!hasChildren) {
      setSelectedSpaceId(space.id);
      
      if (onSpaceSelect) {
        await onSpaceSelect(space);
      }
    }
  };

  if (loading || (viewMode === 'subscribed' && subscribedLoading)) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <p className="text-red-500 text-sm">Error loading spaces: {error}</p>
      </div>
    );
  }

  return (
    <div className="px-4">
      {/* Toggle between subscribed and all spaces */}
      <div className="flex justify-center gap-4 mb-4 bg-gray-50 p-2">
        <button
          onClick={() => setViewMode('subscribed')}
          className={`px-3 py-1 text-gray-600 rounded-md font-medium ${
            viewMode === 'subscribed' ? 'bg-gray-200 text-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Subscribed
        </button>
        <button
          onClick={() => setViewMode('all')}
          className={`px-3 py-1 text-gray-600 rounded-md font-medium ${
            viewMode === 'all' ? 'bg-gray-200 text-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All Spaces
        </button>
      </div>

      {/* Spaces list */}
      <div className="space-y-1">
        {currentSpaces.map((space) => (
          <SpaceItem
            key={space.id}
            space={space}
            level={0}
            isExpanded={expandedSpaces.has(space.id)}
            onToggle={handleToggle}
            onSpaceClick={handleSpaceClick}
            expandedSpaces={expandedSpaces}
            selectedSpaceId={selectedSpaceId}
          />
        ))}
      </div>

      {currentSpaces.length === 0 && <p className="text-gray-500 text-base text-center py-4">No spaces found</p>}
    </div>
  );
};
