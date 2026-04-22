import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [staffId, setStaffId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevents the page from reloading when you submit the form
    setErrorMsg('');

    if (!staffId || !password) {
      setErrorMsg("Please enter your Admin ID and password.");
      return;
    }

    setLoading(true);
    try {
      // 🚀 Using localhost since your web browser and backend are on the same laptop
      const response = await fetch("http://localhost:8080/api/users/staff/login", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffId, password }),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.role === 'ADMIN') {
          // Store token securely (we'll use localStorage for the web)
          localStorage.setItem("adminToken", data.token);
          // Navigate to the dashboard
          navigate('/dashboard'); 
        } else {
          setErrorMsg("Access Denied. System Administrators only.");
        }
      } else {
        const errText = await response.text();
        setErrorMsg(errText || "Login Failed");
      }
    } catch (error) {
      setErrorMsg("Network Error: Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  // --- WEB STYLING (Similar to React Native StyleSheet) ---
  const styles = {
    container: { display: 'flex', height: '100vh', backgroundColor: '#1a1a2e', justifyContent: 'center', alignItems: 'center', fontFamily: 'sans-serif' },
    card: { backgroundColor: '#16213e', padding: '40px', borderRadius: '15px', width: '100%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' },
    title: { color: '#fff', textAlign: 'center' as const, fontSize: '28px', marginBottom: '10px' },
    subtitle: { color: '#e94560', textAlign: 'center' as const, fontSize: '14px', marginBottom: '30px', fontWeight: 'bold' },
    label: { color: '#e94560', display: 'block', marginBottom: '8px', fontSize: '14px' },
    input: { width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '8px', border: '1px solid #0f3460', backgroundColor: '#0f3460', color: '#fff', boxSizing: 'border-box' as const },
    button: { width: '100%', padding: '15px', backgroundColor: '#e94560', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' },
    error: { color: '#ff4d4d', backgroundColor: '#ffe6e6', padding: '10px', borderRadius: '5px', marginBottom: '15px', textAlign: 'center' as const, fontSize: '14px' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>MaathaCare Admin</h1>
        <p style={styles.subtitle}>System Administrator Portal</p>
        
        {errorMsg && <div style={styles.error}>{errorMsg}</div>}

        <form onSubmit={handleLogin}>
          <label style={styles.label}>Admin ID</label>
          <input 
            type="text" 
            placeholder="e.g. ADMIN-MASTER" 
            value={staffId} 
            onChange={(e) => setStaffId(e.target.value)} 
            style={styles.input} 
          />

          <label style={styles.label}>Password</label>
          <input 
            type="password" 
            placeholder="********" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            style={styles.input} 
          />

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>
      </div>
    </div>
  );
}