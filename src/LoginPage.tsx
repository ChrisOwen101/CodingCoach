import { useState } from 'react';
import { useAuth } from "./hooks/useAuth";

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();

    const handleLogin = async () => {
        // Implement your login logic here
        if (username === 'user' && password === 'password') {
            await login({ username });
        } else {
            alert('Invalid credentials');
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
            <h2>Login</h2>
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ marginBottom: '10px', padding: '8px', width: '200px' }}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ marginBottom: '10px', padding: '8px', width: '200px' }}
            />
            <button onClick={handleLogin} style={{ padding: '8px 16px' }}>Login</button>
        </div>
    );
};

export default LoginPage;
