import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css'
import App from './App.tsx'
import './scss/styles.scss'
import LoginPage from './LoginPage';
import { AuthProvider } from './hooks/useAuth';
import { ProtectedRoute } from './routes/ProtectedRoute';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/CodingCoach/" element={<LoginPage />} />
          <Route path="/CodingCoach/login" element={<LoginPage />} />
          <Route path="/CodingCoach/review" element={
            <ProtectedRoute>
              <App />
            </ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/CodingCoach/login" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
