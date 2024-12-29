import { createContext, useContext, useMemo, ReactNode } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { getUser, setUser } from "./localStorage";

interface AuthContextType {
  getUser: any;
  logout: () => void;
  loginWithGithub: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: any;
  user: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { loginWithRedirect, user, isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();

  const logout = () => {
    setUser(undefined);
    navigate("/CodingCoach/", { replace: true });
  };

  const loginWithGithub = async () => {
    await loginWithRedirect()
  };

  const value = useMemo(
    () => ({
      getUser,
      logout,
      loginWithGithub,
      isAuthenticated,
      isLoading,
      setUser,
      user
    }),
    [getUser, isAuthenticated, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};