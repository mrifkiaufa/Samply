
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'respondent' | 'researcher';
  institution?: string;
  points?: number; 
  selectedTopics?: string[];
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Partial<User> & { password: string }) => Promise<void>;
  logout: () => void;
  updateUserProfile: (data: Partial<User>) => void;
  updateUserPoints: (points: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Load user data from local storage on startup
  useEffect(() => {
    const storedUser = localStorage.getItem('samplyUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    // In a real app, this would call an API
    const storedUsers = localStorage.getItem('samplyUsers');
    if (storedUsers) {
      const users = JSON.parse(storedUsers);
      const foundUser = users.find((u: User & { password: string }) => 
        u.email === email && u.password === password
      );
      
      if (foundUser) {
        const { password: _, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        localStorage.setItem('samplyUser', JSON.stringify(userWithoutPassword));
      } else {
        throw new Error('Invalid email or password');
      }
    } else {
      throw new Error('No users found');
    }
  };

  // Register function
  const register = async (userData: Partial<User> & { password: string }) => {
    // In a real app, this would call an API
    const storedUsers = localStorage.getItem('samplyUsers');
    const users = storedUsers ? JSON.parse(storedUsers) : [];
    
    // Check if user already exists
    if (users.some((u: User) => u.email === userData.email)) {
      throw new Error('User already exists with this email');
    }
    
    const newUser = {
      id: `user_${Date.now()}`,
      name: userData.name || '',
      email: userData.email || '',
      role: userData.role || 'respondent',
      institution: userData.institution || '',
      points: userData.role === 'researcher' ? 100 : 0, // Initialize with 100 points for researchers
      password: userData.password,
      selectedTopics: userData.selectedTopics || [],
    };
    
    users.push(newUser);
    localStorage.setItem('samplyUsers', JSON.stringify(users));
    
    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem('samplyUser', JSON.stringify(userWithoutPassword));
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('samplyUser');
  };

  // Update user profile
  const updateUserProfile = (data: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    localStorage.setItem('samplyUser', JSON.stringify(updatedUser));
    
    // Also update in the users array
    const storedUsers = localStorage.getItem('samplyUsers');
    if (storedUsers) {
      const users = JSON.parse(storedUsers);
      const updatedUsers = users.map((u: User) => 
        u.id === user.id ? { ...u, ...data } : u
      );
      localStorage.setItem('samplyUsers', JSON.stringify(updatedUsers));
    }
  };

  // Update user points specifically
  const updateUserPoints = (points: number) => {
    if (!user) return;
    
    const updatedUser = { ...user, points };
    setUser(updatedUser);
    localStorage.setItem('samplyUser', JSON.stringify(updatedUser));
    
    // Also update in the users array
    const storedUsers = localStorage.getItem('samplyUsers');
    if (storedUsers) {
      const users = JSON.parse(storedUsers);
      const updatedUsers = users.map((u: User & { password?: string }) => 
        u.id === user.id ? { ...u, points } : u
      );
      localStorage.setItem('samplyUsers', JSON.stringify(updatedUsers));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUserProfile, updateUserPoints }}>
      {children}
    </AuthContext.Provider>
  );
};