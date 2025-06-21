// Product State Management Utilities

import type { Product } from '@shared/schema';

export type ProductState = 'draft' | 'pending_review' | 'published' | 'archived' | 'rejected';

export interface ProductTags {
  isUnlisted: boolean;
  isPreorder: boolean;
  isPrivate: boolean;
  isOutOfStock: boolean;
  isScheduled: boolean;
}

export interface ProductWithState extends Product {
  // All Product fields are already included via extension
}

export const getStateColor = (state: ProductState): string => {
  switch (state) {
    case 'draft':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'pending_review':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'published':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'archived':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'rejected':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getStateLabel = (state: ProductState): string => {
  switch (state) {
    case 'draft':
      return 'Draft';
    case 'pending_review':
      return 'Pending Review';
    case 'published':
      return 'Published';
    case 'archived':
      return 'Archived';
    case 'rejected':
      return 'Rejected';
    default:
      return 'Unknown';
  }
};

export const getTagColor = (tag: keyof ProductTags): string => {
  switch (tag) {
    case 'isUnlisted':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'isPreorder':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'isPrivate':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    case 'isOutOfStock':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'isScheduled':
      return 'bg-cyan-100 text-cyan-800 border-cyan-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getTagLabel = (tag: keyof ProductTags): string => {
  switch (tag) {
    case 'isUnlisted':
      return 'Unlisted';
    case 'isPreorder':
      return 'Pre-order';
    case 'isPrivate':
      return 'Private';
    case 'isOutOfStock':
      return 'Out of Stock';
    case 'isScheduled':
      return 'Scheduled';
    default:
      return 'Unknown';
  }
};

export const canEditProduct = (state: ProductState): boolean => {
  return state === 'draft' || state === 'rejected';
};

export const canPublishProduct = (state: ProductState): boolean => {
  return state === 'draft' || state === 'rejected';
};

export const canArchiveProduct = (state: ProductState): boolean => {
  return state === 'published' || state === 'rejected';
};

export const canDeleteProduct = (state: ProductState): boolean => {
  return state === 'draft' || state === 'archived' || state === 'rejected';
};

export const getProductVisibility = (product: ProductWithState): 'public' | 'private' | 'hidden' => {
  if (product.state !== 'published') return 'hidden';
  if (product.isPrivate) return 'private';
  if (product.isUnlisted) return 'private';
  return 'public';
};

export const getActiveTags = (product: ProductWithState): Array<keyof ProductTags> => {
  const tags: Array<keyof ProductTags> = [];
  
  if (product.isUnlisted) tags.push('isUnlisted');
  if (product.isPreorder) tags.push('isPreorder');
  if (product.isPrivate) tags.push('isPrivate');
  if (product.isScheduled) tags.push('isScheduled');
  
  // Auto-detect out of stock based on inventory
  if (product.stockQuantity === 0) tags.push('isOutOfStock');
  
  return tags;
};

export const getStateDescription = (state: ProductState): string => {
  switch (state) {
    case 'draft':
      return 'Editable, private to seller';
    case 'pending_review':
      return 'Awaiting admin approval';
    case 'published':
      return 'Public, live product';
    case 'archived':
      return 'Retired, historical';
    case 'rejected':
      return 'Needs revision; visible to seller only';
    default:
      return 'Unknown state';
  }
};

export const getAvailableTransitions = (currentState: ProductState): ProductState[] => {
  switch (currentState) {
    case 'draft':
      return ['pending_review', 'published'];
    case 'pending_review':
      return ['published', 'rejected'];
    case 'published':
      return ['archived'];
    case 'archived':
      return ['published'];
    case 'rejected':
      return ['draft', 'pending_review'];
    default:
      return [];
  }
};