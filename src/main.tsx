import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css'
import App from './App.tsx'
import './scss/styles.scss'
import LoginPage from './LoginPage';
import { AuthProvider } from './hooks/useAuth';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { Auth0Provider } from '@auth0/auth0-react';
import ChooseRepo from './ChooseRepoPage.tsx';

console.log(window.location.origin)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Auth0Provider
      domain="dev-3gneykmd0foohzrw.us.auth0.com"
      clientId="u4A9bTGpGhGNhmWMFgtutwiPyKovMjwS"
      authorizationParams={{
        redirect_uri: window.location.origin + '/CodingCoach/'
      }}
    >
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/CodingCoach/" element={<LoginPage />} />
            <Route path="/CodingCoach/login" element={<LoginPage />} />
            <Route path="/CodingCoach/repo" element={
              <ProtectedRoute>
                <ChooseRepo />
              </ProtectedRoute>} />
            <Route path="/CodingCoach/review" element={
              <ProtectedRoute>
                <App />
              </ProtectedRoute>} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </Auth0Provider>
  </StrictMode>,
)
