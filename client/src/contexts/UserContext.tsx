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
  
  const isRoaster = user?.role === 'roaster' && user?.isRoasterApproved;

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
