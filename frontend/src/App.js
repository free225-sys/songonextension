import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// Pages
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import AdminPage from "@/pages/AdminPage";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050a07] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Main One-Page */}
      <Route path="/" element={<HomePage />} />
      
      {/* Redirect old routes to home with hash anchors */}
      <Route path="/masterplan" element={<Navigate to="/#masterplan" replace />} />
      <Route path="/contact" element={<Navigate to="/#contact" replace />} />
      
      {/* Auth & Admin */}
      <Route path="/login" element={<LoginPage />} />
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute>
            <AdminPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster 
            position="top-right"
            toastOptions={{
              style: {
                background: 'rgba(0, 0, 0, 0.9)',
                color: '#f0fdf4',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                fontFamily: 'Montserrat, sans-serif',
              },
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
