"use client";

import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Custom User type matching backend schema
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
  role: string;
  accountType: string;
  createdAt: string;
  updatedAt: string;
  // Computed properties for compatibility
  uid: string; // Alias for id
  displayName: string; // Combined firstName + lastName
}

export const authClient = {
  signIn: {
    email: async ({ email, password }: { email: string; password: string; rememberMe?: boolean; callbackURL?: string }) => {
      try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const result = await response.json();

        if (!response.ok) {
          return {
            data: null,
            error: {
              code: result.error === 'Invalid credentials' ? 'INVALID_CREDENTIALS' : 'AUTH_ERROR',
              message: result.error || 'Login failed',
            },
          };
        }

        // Store JWT token
        localStorage.setItem('bearer_token', result.token);

        // Create User object with computed properties
        const user: User = {
          ...result.user,
          uid: result.user.id, // Alias for compatibility
          displayName: `${result.user.firstName} ${result.user.lastName}`,
        };

        return { data: user, error: null };
      } catch (error: any) {
        return {
          data: null,
          error: {
            code: 'NETWORK_ERROR',
            message: error.message || 'Network error',
          },
        };
      }
    },
  },
  signUp: {
    email: async ({ email, password, name, data }: { email: string; password: string; name: string; data?: any }) => {
      try {
        console.log('Attempting signup with email:', email, 'password length:', password.length, 'name:', name);

        // Split name into firstName and lastName
        const nameParts = name.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || nameParts[0] || '';

        const response = await fetch(`${API_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            firstName: data?.firstName || firstName,
            lastName: data?.lastName || lastName,
            phoneNumber: data?.phoneNumber || null,
            role: data?.role || 'user',
            accountType: data?.accountType || 'individual',
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          console.error('❌ SIGNUP ERROR:', result.error);
          return {
            data: null,
            error: {
              code: result.error === 'User already exists' ? 'USER_ALREADY_EXISTS' : 'AUTH_ERROR',
              message: result.error || 'Signup failed',
            },
          };
        }

        console.log('✅ Signup successful! User ID:', result.user.id);

        // Store JWT token
        localStorage.setItem('bearer_token', result.token);

        // Create User object with computed properties
        const user: User = {
          ...result.user,
          uid: result.user.id, // Alias for compatibility
          displayName: `${result.user.firstName} ${result.user.lastName}`,
        };

        return { data: user, error: null };
      } catch (error: any) {
        console.error('❌ SIGNUP ERROR:', error);
        return {
          data: null,
          error: {
            code: 'NETWORK_ERROR',
            message: error.message || 'Network error',
          },
        };
      }
    },
  },
  signOut: async () => {
    try {
      localStorage.removeItem('bearer_token');
      return { error: null };
    } catch (error: any) {
      return {
        error: {
          code: 'SIGNOUT_ERROR',
          message: error.message || 'Signout failed',
        },
      };
    }
  },
};

export function useSession() {
  const [session, setSession] = useState<{ user: User | null } | null>(null);
  const [isPending, setIsPending] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('bearer_token');
      
      if (!token) {
        setSession(null);
        setIsPending(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          // Token invalid, clear it
          localStorage.removeItem('bearer_token');
          setSession(null);
          setIsPending(false);
          return;
        }

        const result = await response.json();
        
        // Create User object with computed properties
        const user: User = {
          ...result.user,
          uid: result.user.id, // Alias for compatibility
          displayName: `${result.user.firstName} ${result.user.lastName}`,
        };

        setSession({ user });
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('bearer_token');
        setSession(null);
      }
      
      setIsPending(false);
    };

    checkAuth();
  }, []);

  const refetch = async () => {
    const token = localStorage.getItem('bearer_token');
    
    if (!token) {
      setSession(null);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        localStorage.removeItem('bearer_token');
        setSession(null);
        return;
      }

      const result = await response.json();
      
      // Create User object with computed properties
      const user: User = {
        ...result.user,
        uid: result.user.id, // Alias for compatibility
        displayName: `${result.user.firstName} ${result.user.lastName}`,
      };

      setSession({ user });
    } catch (error) {
      console.error('Auth refetch failed:', error);
      localStorage.removeItem('bearer_token');
      setSession(null);
    }
  };

  return {
    data: session,
    isPending,
    refetch,
  };
}