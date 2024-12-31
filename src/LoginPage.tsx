import { useAuth } from "./hooks/useAuth";
import { Navigate } from "react-router-dom";

const LoginPage = () => {
    const { loginWithGithub, isAuthenticated, setUser, user } = useAuth();

    if (isAuthenticated) {
        setUser(user);
        return <Navigate to="/" />;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
            <h2>Login</h2>
            <button onClick={loginWithGithub} style={{ padding: '8px 16px', marginTop: '10px' }}>Login with GitHub</button>
        </div>
    );
};

export default LoginPage;
