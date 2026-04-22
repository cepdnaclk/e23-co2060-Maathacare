import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard'; // 🚀 Import the new dashboard!

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<AdminLogin />} />
        
        {/* 🚀 Replace the div with the actual Component */}
        <Route path="/dashboard" element={<AdminDashboard />} /> 
      </Routes>
    </BrowserRouter>
  );
}

export default App;