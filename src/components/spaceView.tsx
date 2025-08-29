import React, { useState, useEffect } from 'react';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import { spacesApi } from '../services/spacesApi';
import { Flashcard, FlashcardData } from './flashcard';
import { Article, ArticleData } from './article';
import { Alert, AlertData } from './alert';

export interface SpaceDetails {
  id: string;
  name: string;
  about?: string;
  level: number;
  children?: SpaceDetails[];
  bannerURL?: string;
  contributors?: Array<{ user: { id: string; username: string } }>;
  flashcards?: Array<FlashcardData>;
  articles?: Array<ArticleData>;
  alerts?: Array<AlertData>;
  subscribers?: Array<{ user: { id: string; username: string } }>;
}

interface SpaceViewProps {
  space: SpaceDetails | null;
  onRefresh?: () => Promise<void>;
}

export const SpaceView: React.FC<SpaceViewProps> = ({ space, onRefresh }) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'people' | 'about'>('feed');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Function to refresh space data
  const refreshSpaceData = async () => {
    setRefreshKey(prev => prev + 1);
    if (onRefresh) {
      await onRefresh();
    }
  };

  // Create unified feed items from all content types
  const getFeedItems = () => {
    const items: Array<{
      id: string;
      type: 'flashcard' | 'article' | 'alert';
      createdAt: string;
      data: FlashcardData | ArticleData | AlertData;
    }> = [];

    // Add flashcards
    space?.flashcards?.forEach(flashcard => {
      items.push({
        id: flashcard.id,
        type: 'flashcard',
        createdAt: flashcard.createdAt,
        data: flashcard
      });
    });

    // Add articles
    space?.articles?.forEach(article => {
      items.push({
        id: article.id,
        type: 'article',
        createdAt: article.createdAt,
        data: article
      });
    });

    // Add alerts
    space?.alerts?.forEach(alert => {
      items.push({
        id: alert.id,
        type: 'alert',
        createdAt: alert.createdAt,
        data: alert
      });
    });

    // Sort by creation date (newest first)
    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  // Check subscription status when space changes
  useEffect(() => {
    if (space) {
      checkSubscriptionStatus();
    }
  }, [space]);

  const checkSubscriptionStatus = async () => {
    if (!space) return;
    
    try {
      // Check if the current user is in the subscribers list
      const response = await spacesApi.getSubscribedSpaces();
      const isSubscribed = response.spaces.some(spaceItem => spaceItem.id === space.id);
      setIsSubscribed(isSubscribed);
    } catch (error) {
      console.error('Failed to check subscription status:', error);
    }
  };

  const handleSubscribeToggle = async () => {
    if (!space || isLoading) return;
    
    setIsLoading(true);
    try {
      await spacesApi.toggleSubscription(space.id);
      setIsSubscribed(!isSubscribed);
      
      // Trigger a refresh of the spaces context
      // This will update the navigation sidebar
      window.dispatchEvent(new CustomEvent('spaces-refresh'));
    } catch (error) {
      console.error('Failed to toggle subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!space) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 text-lg">Select a space to view its details</p>
      </div>
    );
  }

  const tabs = [
    { id: 'feed', name: 'Feed' },
    { id: 'people', name: 'People' },
    { id: 'about', name: 'About' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Banner */}
      <div className="w-full h-48 bg-gradient-to-r from-purple-600 to-blue-600 relative">
        {space.bannerURL ? (
          <img 
            src={space.bannerURL} 
            alt={`${space.name} banner`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
            <div className="text-white text-4xl font-bold opacity-20">{space.name}</div>
          </div>
        )}
      </div>

      {/* Thin purple separator strip */}
      <div className="w-full h-3 bg-[#7874d2]"></div>

      {/* Purple header section with stats */}
      <div className="bg-[#423cb9] text-white px-12 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between">
                         <div className="flex-1">
               <h1 className="text-3xl font-bold mb-4">{space.name}</h1>
               
                               {/* Stats and Action buttons - responsive layout */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium">{space.contributors?.length ?? 1}</span>
                      </div>
                      <span>{space.contributors?.length ?? 1} Contributor</span>
                    </div>
                    
                    <span className="text-white text-xl">•</span>
                    
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{space.flashcards?.length ?? 143} Flashcards</span>
                    </div>
                    
                    <span className="text-white text-xl">•</span>
                    
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{space.subscribers?.length ?? 48} Subscribers</span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-3">
                    <button 
                      type="button" 
                      className="p-2 bg-white text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <EllipsisHorizontalIcon className="w-5 h-5" />
                    </button>
                    
                    <button 
                      type="button" 
                      onClick={handleSubscribeToggle}
                      disabled={isLoading}
                      className={`px-4 py-2 font-semibold rounded-lg transition-colors ${
                        isSubscribed
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          : 'bg-white text-gray-900 hover:bg-gray-100'
                      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isLoading ? '...' : isSubscribed ? 'Unsubscribe' : 'Subscribe'}
                    </button>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'feed' | 'people' | 'about')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w mx-auto px-6 py-8">
        {activeTab === 'feed' && (
          <div className="space-y-6">
            {(() => {
              const feedItems = getFeedItems();
              return feedItems.length > 0 ? (
                <div className="space-y-4">
                  {feedItems.map((item, index) => {
                    const isFirst = index === 0;
                    const containerClass = isFirst ? '' : 'px-20';
                    
                    switch (item.type) {
                      case 'flashcard':
                        return (
                          <div key={item.id} className={containerClass}>
                            <Flashcard flashcard={item.data as FlashcardData} onUpdate={refreshSpaceData} />
                          </div>
                        );
                      case 'article':
                        return (
                          <div key={item.id} className={containerClass}>
                            <Article article={item.data as ArticleData} onUpdate={refreshSpaceData} />
                          </div>
                        );
                      case 'alert':
                        return (
                          <div key={item.id} className={containerClass}>
                            <Alert alert={item.data as AlertData} onUpdate={refreshSpaceData} />
                          </div>
                        );
                      default:
                        return null;
                    }
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No content in this space yet</p>
                </div>
              );
            })()}
          </div>
        )}

        {activeTab === 'people' && (
          <div className="space-y-6">
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">People content will appear here</p>
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="space-y-6 px-4">
            {space.about ? (
              <div className="prose max-w-none">
                <p className="text-gray-600 text-lg leading-relaxed">{space.about}</p>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-500 text-center">No description available for this space</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
