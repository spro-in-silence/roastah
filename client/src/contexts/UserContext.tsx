import { createContext, useContext, ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";

interface UserContextType {
  user: any;
  isLoading: boolean;
  isAuthenticated: boolean;
  isRoaster: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  
  // Handle role detection for both real users and impersonated development users
  const isRoaster = user?.role === 'roaster' && (
    user?.isRoasterApproved || 
    user?.id?.startsWith('dev-seller-') // Development impersonated sellers are always approved
  );

  // Debug logging for impersonated users
  if (user?.id?.startsWith('dev-')) {
    console.log('UserContext: Impersonated user detected', {
      userId: user.id,
      role: user.role,
      isRoasterApproved: user.isRoasterApproved,
      calculatedIsRoaster: isRoaster,
      fullUser: user
    });
  }

  return (
    <UserContext.Provider value={{ user, isLoading, isAuthenticated, isRoaster }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
