import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx'
import './scss/styles.scss'
import LoginPage from './LoginPage';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { Auth0Provider } from '@auth0/auth0-react';
import ChooseRepo from './ChooseRepoPage.tsx';
import './index.css'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <Auth0Provider
        domain="dev-3gneykmd0foohzrw.us.auth0.com"
        clientId="u4A9bTGpGhGNhmWMFgtutwiPyKovMjwS"
        authorizationParams={{
          redirect_uri: window.location.origin + '/CodingCoach/'
        }}
      >
        <Routes>
          <Route path="/" element={
            <ProtectedRoute>
              <App />
            </ProtectedRoute>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/import" element={
            <ProtectedRoute>
              <ChooseRepo />
            </ProtectedRoute>} />
        </Routes>
      </Auth0Provider>
    </HashRouter>
  </StrictMode>,
)
