import { Navigate, Route, Routes, BrowserRouter } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import './App.css';

function ProtectedDashboard() {
  return localStorage.getItem('adminToken') ? <AdminDashboard /> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={localStorage.getItem('adminToken') ? '/dashboard' : '/login'} replace />} />
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/dashboard" element={<ProtectedDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}