import "@/index.css";
import "@fontsource/outfit/400.css";
import "@fontsource/outfit/500.css";
import "@fontsource/outfit/600.css";
import "@fontsource/outfit/700.css";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AuthCallback from "./pages/AuthCallback";
import Dashboard from "./pages/Dashboard";
import Collections from "./pages/Collections";
import Goals from "./pages/Goals";
import Alerts from "./pages/Alerts";
import Academy from "./pages/Academy";
import Reports from "./pages/Reports";
import Referrals from "./pages/Referrals";

// AppRouter handles OAuth callback detection
function AppRouter() {
  const location = useLocation();
  
  // Check URL fragment for session_id synchronously during render (prevents race conditions)
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }
  
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      } />
      <Route path="/collections" element={
        <ProtectedRoute><Collections /></ProtectedRoute>
      } />
      <Route path="/goals" element={
        <ProtectedRoute><Goals /></ProtectedRoute>
      } />
      <Route path="/alerts" element={
        <ProtectedRoute><Alerts /></ProtectedRoute>
      } />
      <Route path="/academy" element={
        <ProtectedRoute><Academy /></ProtectedRoute>
      } />
      <Route path="/reports" element={
        <ProtectedRoute><Reports /></ProtectedRoute>
      } />
      <Route path="/referrals" element={
        <ProtectedRoute><Referrals /></ProtectedRoute>
      } />
      
      {/* Catch all - redirect to landing */}
      <Route path="*" element={<Landing />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
