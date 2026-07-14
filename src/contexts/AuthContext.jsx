import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  loginUser,
  logoutUser,
  refreshSession,
  registerUser,
} from "../services/api/auth.api.js";
import {
  clearAuthTokens,
  getAccessToken,
} from "../services/api/tokenStorage.js";
import { getMyProfile } from "../services/api/users.api.js";

export const AuthContext = createContext(null);

function extractUser(response) {
  return (
    response?.data?.user ||
    response?.data ||
    response?.user ||
    null
  );
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const loadCurrentUser = useCallback(async () => {
    const accessToken = getAccessToken();

    if (!accessToken) {
      setUser(null);
      setIsLoading(false);
      return null;
    }

    try {
      setIsLoading(true);
      setAuthError(null);

      const profileResponse = await getMyProfile();
      const profile = extractUser(profileResponse);

      setUser(profile);
      return profile;
    } catch (error) {
      try {
        await refreshSession();

        const profileResponse = await getMyProfile();
        const profile = extractUser(profileResponse);

        setUser(profile);
        return profile;
      } catch {
        clearAuthTokens();
        setUser(null);
        setAuthError(error);
        return null;
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

  const login = useCallback(async (credentials) => {
    try {
      setIsLoading(true);
      setAuthError(null);

      const response = await loginUser(credentials);
      const loggedUser = extractUser(response);

      setUser(loggedUser);
      return loggedUser;
    } catch (error) {
      setAuthError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (payload) => {
    try {
      setIsLoading(true);
      setAuthError(null);

      const response = await registerUser(payload);
      const registeredUser = extractUser(response);

      setUser(registeredUser);
      return registeredUser;
    } catch (error) {
      setAuthError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await logoutUser();
    } finally {
      clearAuthTokens();
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoggedIn: Boolean(user),
      isLoading,
      authError,
      login,
      register,
      logout,
      refreshCurrentUser: loadCurrentUser,
    }),
    [
      user,
      isLoading,
      authError,
      login,
      register,
      logout,
      loadCurrentUser,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
