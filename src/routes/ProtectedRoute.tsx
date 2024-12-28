import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface ProtectedRouteProps {
    children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { user } = useAuth();
    if (!user) {
        // user is not authenticated
        return <Navigate to="/CodingCoach/login" />;
    }
    return <>{children}</>;
};