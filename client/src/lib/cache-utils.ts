import { QueryClient } from "@tanstack/react-query";

/**
 * Utility functions for consistent cache management across the application
 */

export interface CacheUpdateConfig {
  queryClient: QueryClient;
  listQueryKey: string[];
  itemQueryKey?: string[];
  itemId?: string | number;
}

/**
 * Updates both list and individual item caches to maintain consistency
 */
export function updateListAndItemCache(
  config: CacheUpdateConfig,
  updatedItem: any,
  updateFn?: (items: any[], updatedItem: any, itemId: string | number) => any[]
) {
  const { queryClient, listQueryKey, itemQueryKey, itemId } = config;

  // Update individual item cache if provided
  if (itemQueryKey && updatedItem) {
    queryClient.setQueryData(itemQueryKey, updatedItem);
  }

  // Update list cache
  queryClient.setQueryData(listQueryKey, (oldData: any) => {
    if (!oldData || !Array.isArray(oldData) || !itemId) {
      return oldData;
    }

    if (updateFn) {
      return updateFn(oldData, updatedItem, itemId);
    }

    // Default update: replace item with same ID
    return oldData.map((item: any) => 
      item.id === (typeof itemId === 'string' ? parseInt(itemId) : itemId)
        ? updatedItem 
        : item
    );
  });

  // Invalidate queries for consistency
  queryClient.invalidateQueries({ queryKey: listQueryKey });
  if (itemQueryKey) {
    queryClient.invalidateQueries({ queryKey: itemQueryKey });
  }
}

/**
 * Removes an item from list cache
 */
export function removeFromListCache(
  config: CacheUpdateConfig,
  itemId: string | number
) {
  const { queryClient, listQueryKey } = config;

  queryClient.setQueryData(listQueryKey, (oldData: any) => {
    if (!oldData || !Array.isArray(oldData)) {
      return oldData;
    }
    
    return oldData.filter((item: any) => 
      item.id !== (typeof itemId === 'string' ? parseInt(itemId) : itemId)
    );
  });

  queryClient.invalidateQueries({ queryKey: listQueryKey });
}

/**
 * Adds an item to list cache
 */
export function addToListCache(
  config: CacheUpdateConfig,
  newItem: any,
  position: 'start' | 'end' = 'start'
) {
  const { queryClient, listQueryKey } = config;

  queryClient.setQueryData(listQueryKey, (oldData: any) => {
    if (!oldData || !Array.isArray(oldData)) {
      return [newItem];
    }
    
    return position === 'start' 
      ? [newItem, ...oldData]
      : [...oldData, newItem];
  });

  queryClient.invalidateQueries({ queryKey: listQueryKey });
}

/**
 * Updates cart-specific cache with quantity changes
 */
export function updateCartItemCache(
  queryClient: QueryClient,
  itemId: number,
  quantity: number
) {
  queryClient.setQueryData(["/api/cart"], (oldData: any) => {
    if (!oldData || !Array.isArray(oldData)) {
      return oldData;
    }
    
    return oldData.map((item: any) => 
      item.id === itemId 
        ? { ...item, quantity }
        : item
    );
  });

  queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
}

/**
 * Updates notification cache with read status
 */
export function updateNotificationCache(
  queryClient: QueryClient,
  notificationId: number,
  isRead: boolean = true
) {
  queryClient.setQueryData(['/api/notifications'], (oldData: any) => {
    if (!oldData || !Array.isArray(oldData)) {
      return oldData;
    }
    
    return oldData.map((notification: any) => 
      notification.id === notificationId 
        ? { ...notification, isRead }
        : notification
    );
  });

  queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
}

/**
 * Updates review cache with helpful votes
 */
export function updateReviewCache(
  queryClient: QueryClient,
  productId: number,
  reviewId: number,
  helpfulVotes: number
) {
  const reviewQueryKey = [`/api/products/${productId}/reviews`];
  
  queryClient.setQueryData(reviewQueryKey, (oldData: any) => {
    if (!oldData || !Array.isArray(oldData)) {
      return oldData;
    }
    
    return oldData.map((review: any) => 
      review.id === reviewId 
        ? { ...review, helpfulVotes }
        : review
    );
  });

  queryClient.invalidateQueries({ queryKey: reviewQueryKey });
}