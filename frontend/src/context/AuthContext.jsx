import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const DEFAULT_PRESET_ACCOUNTS = [
  {
    email: 'raghuluma2006@gmail.com',
    username: 'Raghul',
    password: 'Raghul@2006',
    name: 'Raghul (Administrator)',
    role: 'Administrator',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    department: 'System Architecture & Operations',
    status: 'Active'
  }
];

// Helper to get custom profiles cache from localStorage
const getCustomProfiles = () => {
  try {
    const saved = localStorage.getItem('smartoil_custom_profiles');
    return saved ? JSON.parse(saved) : {};
  } catch (e) {
    console.warn('Error parsing custom profiles:', e);
    return {};
  }
};

// Helper to save custom profiles cache to localStorage
const saveCustomProfile = (identifierKey, details) => {
  try {
    const existing = getCustomProfiles();
    const key = identifierKey.toLowerCase().trim();
    existing[key] = {
      ...(existing[key] || {}),
      ...details
    };
    localStorage.setItem('smartoil_custom_profiles', JSON.stringify(existing));
  } catch (e) {
    console.warn('Error saving custom profile:', e);
  }
};

export const AuthProvider = ({ children }) => {
  // Initialize authenticated user and token from localStorage to survive page refresh
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('smartoil_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [jwtToken, setJwtToken] = useState(() => {
    try {
      return localStorage.getItem('smartoil_jwt') || null;
    } catch {
      return null;
    }
  });

  const [isBackendConnected, setIsBackendConnected] = useState(false);

  // Allowed accounts pool (preset + backend synced + custom persistent profiles)
  const [accountsPool, setAccountsPool] = useState(() => {
    try {
      const savedPool = localStorage.getItem('smartoil_accounts_pool');
      const customProfiles = getCustomProfiles();
      let pool = savedPool ? JSON.parse(savedPool) : DEFAULT_PRESET_ACCOUNTS;

      // Apply any persistent custom profiles on startup
      return pool.map(acc => {
        const emailKey = acc.email?.toLowerCase().trim();
        const userKey = acc.username?.toLowerCase().trim();
        const custom = (emailKey && customProfiles[emailKey]) || (userKey && customProfiles[userKey]);
        if (custom) {
          return { ...acc, ...custom };
        }
        return acc;
      });
    } catch (e) {
      console.warn('Error reading accounts pool:', e);
      return DEFAULT_PRESET_ACCOUNTS;
    }
  });

  // Sync with Backend on mount
  useEffect(() => {
    const syncWithBackend = async () => {
      try {
        const res = await authService.getAccountsPool();
        if (res.data?.accounts && res.data.accounts.length > 0) {
          const customProfiles = getCustomProfiles();
          const mergedAccounts = res.data.accounts.map(bAcc => {
            const emailKey = bAcc.email?.toLowerCase().trim();
            const userKey = bAcc.username?.toLowerCase().trim();
            const custom = (emailKey && customProfiles[emailKey]) || (userKey && customProfiles[userKey]);
            return {
              ...bAcc,
              ...(custom || {})
            };
          });

          setAccountsPool(mergedAccounts);
          try {
            localStorage.setItem('smartoil_accounts_pool', JSON.stringify(mergedAccounts));
          } catch (e) {
            console.warn('Could not save accounts pool:', e);
          }
          setIsBackendConnected(true);
        }
      } catch {
        // Backend offline or starting up - continue in local mode
        setIsBackendConnected(false);
      }
    };

    syncWithBackend();
  }, []);

  const generateJWT = (userData) => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      sub: userData.email,
      name: userData.name,
      role: userData.role,
      iss: 'OilSync-Enterprise-Cloud',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400
    }));
    const signature = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...sig_' + Math.random().toString(36).substring(7);
    return `${header}.${payload}.${signature}`;
  };

  // Action: Update User Profile Details
  const updateUserProfile = async (updatedDetails) => {
    let backendUser = null;

    try {
      if (isBackendConnected) {
        const res = await authService.updateProfile(updatedDetails);
        if (res.data?.user) {
          backendUser = res.data.user;
        }
      }
    } catch (e) {
      console.warn('Backend update failed, updating local state:', e.message);
    }

    const newProfile = {
      ...(user || {}),
      ...(backendUser || {}),
      ...updatedDetails
    };

    setUser(newProfile);
    try {
      localStorage.setItem('smartoil_user', JSON.stringify(newProfile));
    } catch (e) {
      console.warn('Could not save smartoil_user:', e);
    }

    // Persist to custom profiles map for permanent offline & reload resilience
    if (newProfile.email) saveCustomProfile(newProfile.email, updatedDetails);
    if (newProfile.username) saveCustomProfile(newProfile.username, updatedDetails);

    // Update in accountsPool
    setAccountsPool(prev => {
      const targetEmail = (newProfile.email || user?.email || '').toLowerCase().trim();
      const targetUsername = (newProfile.username || user?.username || '').toLowerCase().trim();

      const exists = prev.some(acc =>
        (acc.email && acc.email.toLowerCase().trim() === targetEmail) ||
        (acc.username && acc.username.toLowerCase().trim() === targetUsername)
      );

      let updated;
      if (exists) {
        updated = prev.map(acc => {
          if (
            (acc.email && acc.email.toLowerCase().trim() === targetEmail) ||
            (acc.username && acc.username.toLowerCase().trim() === targetUsername)
          ) {
            return { ...acc, ...updatedDetails };
          }
          return acc;
        });
      } else {
        updated = [{ ...newProfile }, ...prev];
      }

      try {
        localStorage.setItem('smartoil_accounts_pool', JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not save accounts pool:', e);
      }
      return updated;
    });

    return newProfile;
  };

  // Add new login credentials issued by Administrator
  const registerNewCredentials = async (newAccount) => {
    let fullAccount = {
      ...newAccount,
      avatar: newAccount.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${newAccount.email}`,
      status: 'Active'
    };

    try {
      if (isBackendConnected) {
        const res = await authService.registerCredentials(newAccount);
        if (res.data?.user) {
          fullAccount = res.data.user;
        }
      }
    } catch (e) {
      console.warn('Backend register failed, updating local state:', e.message);
    }

    setAccountsPool(prev => {
      const updated = [fullAccount, ...prev];
      try {
        localStorage.setItem('smartoil_accounts_pool', JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not save accounts pool:', e);
      }
      return updated;
    });

    return fullAccount;
  };

  const loginWithGmail = async (identifier, password = '') => {
    const trimmedId = identifier.trim().toLowerCase();
    const customProfiles = getCustomProfiles();

    // Normalize typo alias: raghuluma2006@gmil.com -> raghuluma2006@gmail.com
    const normalizedId = trimmedId === 'raghuluma2006@gmil.com' ? 'raghuluma2006@gmail.com' : trimmedId;

    // 1. Try Backend Authentication First
    try {
      const res = await authService.login(normalizedId, password);
      if (res.data?.token && res.data?.user) {
        const { token, user: backendUser } = res.data;

        // Merge with any local custom profile if present
        const custom =
          (backendUser.email && customProfiles[backendUser.email.toLowerCase()]) ||
          (backendUser.username && customProfiles[backendUser.username.toLowerCase()]);
        const finalUser = custom ? { ...backendUser, ...custom } : backendUser;

        // Persist token so apiClient requests include Authorization header
        localStorage.setItem('smartoil_jwt', token);
        localStorage.setItem('smartoil_user', JSON.stringify(finalUser));

        setUser(finalUser);
        setJwtToken(token);
        setIsBackendConnected(true);

        return finalUser;
      }
    } catch (backendError) {
      // If backend explicitly rejected credentials with 400, 401, or 403, STOP and fail!
      if (backendError.response?.data?.message) {
        throw new Error(backendError.response.data.message);
      }
      if (
        backendError.response?.status === 401 ||
        backendError.response?.status === 400 ||
        backendError.response?.status === 403
      ) {
        throw new Error('Invalid email/username or password. Access denied.');
      }

      console.warn('Backend server unreachable, checking local credentials pool:', backendError.message);
    }

    // 2. Strict Offline Authentication (ONLY if backend is totally unreachable)
    const matched = accountsPool.find(
      (a) =>
        (a.email && a.email.toLowerCase().trim() === normalizedId) ||
        (a.username && a.username.toLowerCase().trim() === normalizedId)
    );

    // If user is not found, REJECT!
    if (!matched) {
      throw new Error('Invalid credentials. Account not found in system.');
    }

    // Strictly verify password!
    if (matched.password) {
      if (matched.password !== password) {
        throw new Error('Invalid password. Please check your credentials.');
      }
    } else {
      throw new Error('Cannot authenticate offline without an active backend connection. Please ensure the backend server is running.');
    }

    const customMatch = customProfiles[normalizedId];
    const accountData = { ...matched, ...(customMatch || {}) };
    if (normalizedId === 'raghuluma2006@gmail.com' || normalizedId === 'raghul') {
      accountData.role = 'Administrator';
    }

    const token = generateJWT(accountData);
    const fullUser = { ...accountData, loginTime: new Date().toISOString() };

    localStorage.setItem('smartoil_jwt', token);
    localStorage.setItem('smartoil_user', JSON.stringify(fullUser));

    setUser(fullUser);
    setJwtToken(token);
    return fullUser;
  };

  const removeAccountCredentials = (identifier) => {
    const target = (identifier || '').toLowerCase().trim();
    setAccountsPool(prev => {
      const updated = prev.filter(acc => {
        const email = (acc.email || '').toLowerCase().trim();
        const username = (acc.username || '').toLowerCase().trim();
        const id = (acc.id || '').toLowerCase().trim();
        return email !== target && username !== target && id !== target;
      });
      try {
        localStorage.setItem('smartoil_accounts_pool', JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not save accounts pool:', e);
      }
      return updated;
    });
  };

  const logout = () => {
    setUser(null);
    setJwtToken(null);
    localStorage.removeItem('smartoil_user');
    localStorage.removeItem('smartoil_jwt');
  };

  const hasAccess = (allowedRoles) => {
    if (!user) return false;
    if (user.role === 'Administrator') return true;
    return allowedRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{
      user,
      jwtToken,
      isAuthenticated: !!user,
      isBackendConnected,
      loginWithGmail,
      registerNewCredentials,
      removeAccountCredentials,
      updateUserProfile,
      logout,
      hasAccess,
      accountsPool
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
