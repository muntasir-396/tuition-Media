import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';

export function useBookmarks() {
  const { isLoggedIn } = useApp();
  const [bookmarkedTuitionIds, setBookmarkedTuitionIds] = useState<string[]>([]);
  const [bookmarkedTutorIds, setBookmarkedTutorIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch all bookmarked IDs from database
  const fetchBookmarkIds = useCallback(async () => {
    if (!isLoggedIn) {
      setBookmarkedTuitionIds([]);
      setBookmarkedTutorIds([]);
      return;
    }
    try {
      const res = await fetch('/api/bookmarks/ids');
      if (res.ok) {
        const data = await res.json();
        setBookmarkedTuitionIds(data.tuitionIds || []);
        setBookmarkedTutorIds(data.tutorIds || []);
      }
    } catch (e) {
      console.error('Failed to load bookmark IDs', e);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchBookmarkIds();
  }, [fetchBookmarkIds]);

  // Toggle bookmark with Optimistic UI updates
  const toggleBookmark = async (targetType: 'tuition' | 'tutor', targetId: string) => {
    if (!targetId) return;

    const isCurrentlySaved = targetType === 'tuition' 
      ? bookmarkedTuitionIds.includes(targetId)
      : bookmarkedTutorIds.includes(targetId);

    // Optimistic update
    if (targetType === 'tuition') {
      setBookmarkedTuitionIds(prev => 
        isCurrentlySaved ? prev.filter(id => id !== targetId) : [...prev, targetId]
      );
    } else {
      setBookmarkedTutorIds(prev => 
        isCurrentlySaved ? prev.filter(id => id !== targetId) : [...prev, targetId]
      );
    }

    try {
      if (isCurrentlySaved) {
        await fetch(`/api/bookmarks/${targetType}/${targetId}`, { method: 'DELETE' });
      } else {
        await fetch('/api/bookmarks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetType, targetId })
        });
      }
    } catch (e) {
      // Revert optimistic update on error
      console.error('Bookmark toggle failed, reverting', e);
      fetchBookmarkIds();
    }
  };

  const isBookmarked = (targetType: 'tuition' | 'tutor', targetId: string) => {
    return targetType === 'tuition'
      ? bookmarkedTuitionIds.includes(targetId)
      : bookmarkedTutorIds.includes(targetId);
  };

  return {
    bookmarkedTuitionIds,
    bookmarkedTutorIds,
    isBookmarked,
    toggleBookmark,
    refreshBookmarks: fetchBookmarkIds,
    loading
  };
}
