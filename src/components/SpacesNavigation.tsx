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
}

const SpaceItem: React.FC<SpaceItemProps> = ({ space, level, isExpanded, onToggle, onSpaceClick }) => {
  const hasChildren = space.children && space.children.length > 0;
  const paddingLeft = level * 16; // 16px per level

  return (
    <div>
      <div
        className="flex items-center gap-2 py-1 px-2 rounded hover:bg-gray-100 cursor-pointer"
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
            {isExpanded ? (
              <ChevronDownIcon className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRightIcon className="h-4 w-4 text-gray-500" />
            )}
          </button>
        )}
        {!hasChildren && <div className="w-6" />} {/* Spacer for alignment */}
        <span className="text-sm text-gray-700">{space.name}</span>
      </div>
      
      {hasChildren && isExpanded && (
        <div>
          {space.children!.map((child) => (
            <SpaceItem
              key={child.id}
              space={child}
              level={level + 1}
              isExpanded={false}
              onToggle={onToggle}
              onSpaceClick={onSpaceClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface SpacesNavigationProps {
  onSpaceSelect?: (space: Space) => void;
}

export const SpacesNavigation: React.FC<SpacesNavigationProps> = ({ onSpaceSelect }) => {
  const { spaces, loading, error } = useSpaces();
  const [viewMode, setViewMode] = useState<'subscribed' | 'all'>('all');
  const [expandedSpaces, setExpandedSpaces] = useState<Set<string>>(new Set());
  const [currentSpaces, setCurrentSpaces] = useState<Space[]>([]);

  React.useEffect(() => {
    if (viewMode === 'all') {
      setCurrentSpaces(spaces);
    } else {
      // For subscribed spaces, we'll need to fetch them separately
      // For now, we'll show all spaces
      setCurrentSpaces(spaces);
    }
  }, [spaces, viewMode]);

  const handleToggle = (spaceId: string) => {
    const newExpanded = new Set(expandedSpaces);
    if (newExpanded.has(spaceId)) {
      newExpanded.delete(spaceId);
    } else {
      newExpanded.add(spaceId);
    }
    setExpandedSpaces(newExpanded);
  };

  const handleSpaceClick = (space: Space) => {
    if (onSpaceSelect) {
      onSpaceSelect(space);
    }
  };

  if (loading) {
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
    <div className="p-4">
      {/* Toggle between subscribed and all spaces */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setViewMode('subscribed')}
          className={`px-3 py-1 text-xs rounded-full ${
            viewMode === 'subscribed'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Subscribed
        </button>
        <button
          onClick={() => setViewMode('all')}
          className={`px-3 py-1 text-xs rounded-full ${
            viewMode === 'all'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
          />
        ))}
      </div>

      {currentSpaces.length === 0 && (
        <p className="text-gray-500 text-sm text-center py-4">
          No spaces found
        </p>
      )}
    </div>
  );
};
