import { useEffect } from "react";
import { useMobileDetection } from "@/hooks/usePWA";

// Component to handle mobile-specific optimizations
export function MobileOptimizations() {
  const { isMobile, isTablet } = useMobileDetection();

  useEffect(() => {
    // Prevent zoom on input focus (iOS)
    if (isMobile) {
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      }
    }

    // Handle iOS safe area insets
    if (isMobile || isTablet) {
      document.documentElement.style.setProperty('--safe-area-inset-top', 'env(safe-area-inset-top)');
      document.documentElement.style.setProperty('--safe-area-inset-right', 'env(safe-area-inset-right)');
      document.documentElement.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom)');
      document.documentElement.style.setProperty('--safe-area-inset-left', 'env(safe-area-inset-left)');
    }

    // Prevent overscroll bounce on iOS
    if (isMobile && /iPad|iPhone|iPod/.test(navigator.userAgent)) {
      document.addEventListener('touchmove', (e) => {
        if (e.target === document.body) {
          e.preventDefault();
        }
      }, { passive: false });
    }

    // Handle Android back button
    if (isMobile && /Android/.test(navigator.userAgent)) {
      const handleBackButton = () => {
        if (window.history.length > 1) {
          window.history.back();
        } else {
          // If no history, go to home
          window.location.href = '/';
        }
      };

      window.addEventListener('popstate', handleBackButton);
      return () => window.removeEventListener('popstate', handleBackButton);
    }
  }, [isMobile, isTablet]);

  return null; // This component doesn't render anything
}

// Hook for mobile-specific styles
export function useMobileStyles() {
  const { isMobile, isTablet, isDesktop } = useMobileDetection();

  return {
    // Container styles
    containerClass: isMobile 
      ? 'px-4 py-2' 
      : isTablet 
        ? 'px-6 py-4' 
        : 'px-8 py-6',
    
    // Text sizes
    headingClass: isMobile 
      ? 'text-2xl' 
      : isTablet 
        ? 'text-3xl' 
        : 'text-4xl',
    
    // Button sizes
    buttonClass: isMobile 
      ? 'px-4 py-2 text-sm' 
      : isTablet 
        ? 'px-6 py-3 text-base' 
        : 'px-8 py-4 text-lg',
    
    // Grid layouts
    gridClass: isMobile 
      ? 'grid-cols-1' 
      : isTablet 
        ? 'grid-cols-2' 
        : 'grid-cols-3',
    
    // Spacing
    spacingClass: isMobile 
      ? 'space-y-4' 
      : isTablet 
        ? 'space-y-6' 
        : 'space-y-8',
    
    // Card sizes
    cardClass: isMobile 
      ? 'p-4' 
      : isTablet 
        ? 'p-6' 
        : 'p-8',
    
    // Form inputs
    inputClass: isMobile 
      ? 'px-3 py-2 text-base' 
      : 'px-4 py-3 text-base',
    
    // Navigation
    navClass: isMobile 
      ? 'fixed bottom-0 left-0 right-0 bg-white border-t' 
      : 'static',
    
    // Modal/drawer
    modalClass: isMobile 
      ? 'fixed inset-0 bg-white' 
      : 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4',
    
    // Image sizes
    imageClass: isMobile 
      ? 'w-full h-48' 
      : isTablet 
        ? 'w-full h-64' 
        : 'w-full h-80',
    
    // Layout helpers
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice: isMobile || isTablet,
  };
}

// Touch gesture helper
export function useTouchGestures() {
  const { isMobile, isTablet } = useMobileDetection();

  const addSwipeGesture = (element: HTMLElement, onSwipe: (direction: 'left' | 'right' | 'up' | 'down') => void) => {
    if (!isMobile && !isTablet) return;

    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      endX = e.changedTouches[0].clientX;
      endY = e.changedTouches[0].clientY;
      
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const minSwipeDistance = 50;
      
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > minSwipeDistance) {
          onSwipe(deltaX > 0 ? 'right' : 'left');
        }
      } else {
        // Vertical swipe
        if (Math.abs(deltaY) > minSwipeDistance) {
          onSwipe(deltaY > 0 ? 'down' : 'up');
        }
      }
    };

    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  };

  return { addSwipeGesture };
}