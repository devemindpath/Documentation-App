import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';

// Define the shape of the context
interface UserContextType {
  user: ReturnType<typeof useAuth>['user'];
  userInfo: ReturnType<typeof useAuth>['userInfo'];
  loading: boolean;
  signIn: ReturnType<typeof useAuth>['signIn'];
  signUp: ReturnType<typeof useAuth>['signUp'];
  signOut: ReturnType<typeof useAuth>['signOut'];
  updateUserRole: ReturnType<typeof useAuth>['updateUserRole'];
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const auth = useAuth();
  return <UserContext.Provider value={auth}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}; 