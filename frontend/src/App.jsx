import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider, ThemeContext } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import EmployeeDashboard from './pages/EmployeeDashboard';
import HRDashboard from './pages/HRDashboard';

function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-500 flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function HomeRoute() {
  const { user } = useContext(AuthContext);

  if (user?.role === 'HR_ADMIN') {
    return <HRDashboard />;
  }
  return <EmployeeDashboard />;
}

function MainLayout() {
  const { theme } = useContext(ThemeContext);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#0b0f19] text-slate-100' : 'bg-white text-slate-900'} flex flex-col font-sans transition-colors duration-200`}>
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomeRoute />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <MainLayout />
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}
