import React, { useState, useEffect } from 'react';
import './AdminDashboard.css'; // Make sure this matches your CSS file name (e.g., App.css)

interface PHM {
  staffId: string;
  fullName: string;
  mohArea: string;
  nic: string;
}

// 📌 Official MOH Areas & Abbreviations List
const MOH_AREAS = [
  { name: "Colombo", code: "COL" },
  { name: "Gampaha", code: "GMP" },
  { name: "Kalutara", code: "KAL" },
  { name: "Kandy", code: "KAN" },
  { name: "Matale", code: "MTL" },
  { name: "Nuwara Eliya", code: "NWE" },
  { name: "Galle", code: "GAL" },
  { name: "Matara", code: "MTR" },
  { name: "Hambantota", code: "HAM" },
  { name: "Jaffna", code: "JAF" },
  // Add more as needed...
];

const AdminDashboard: React.FC = () => {
  const [staffList, setStaffList] = useState<PHM[]>([]);
  
  // Form States
  const [fullName, setFullName] = useState('');
  const [nic, setNic] = useState('');
  const [selectedMohCode, setSelectedMohCode] = useState('');
  const [generatedStaffId, setGeneratedStaffId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch existing staff on load
  useEffect(() => {
    fetchStaff();
  }, []);

  // 🚀 MAGIC: Auto-Generate Staff ID whenever the MOH Area changes
  useEffect(() => {
    if (selectedMohCode) {
      // 1. Find all staff in this specific MOH area
      const areaStaff = staffList.filter(staff => staff.staffId?.startsWith(`PHM-${selectedMohCode}-`));
      
      // 2. Find the highest existing number
      let maxNumber = 0;
      areaStaff.forEach(staff => {
        const parts = staff.staffId.split('-'); // e.g., ["PHM", "MTR", "005"]
        if (parts.length === 3) {
          const num = parseInt(parts[2], 10);
          if (num > maxNumber) maxNumber = num;
        }
      });

      // 3. Format the next number with leading zeros (e.g., 006)
      const nextNumber = String(maxNumber + 1).padStart(3, '0');
      setGeneratedStaffId(`PHM-${selectedMohCode}-${nextNumber}`);
    } else {
      setGeneratedStaffId('');
    }
  }, [selectedMohCode, staffList]);

  const fetchStaff = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/users/staff/all");
      if (response.ok) {
        const data = await response.json();
        setStaffList(data);
      }
    } catch (err) {
      console.error("Failed to load staff list");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMohCode) {
      alert("Please select an MOH Area first.");
      return;
    }

    setIsLoading(true);
    try {
      // Get the full name of the MOH area to save in the database
      const mohFullName = MOH_AREAS.find(m => m.code === selectedMohCode)?.name || '';

      const payload = {
        fullName: fullName,
        nic: nic,
        staffId: generatedStaffId,
        mohArea: mohFullName,
        password: nic
      };

      const token = localStorage.getItem("token") || localStorage.getItem("adminToken") || "";

      const response = await fetch("http://localhost:8080/api/users/staff/register", {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert("Official PHM Registration Successful!");
        // Clear form
        setFullName('');
        setNic('');
        setSelectedMohCode('');
        fetchStaff(); 
      } else {
        const msg = await response.text();
        alert(`Registration Failed: ${msg}`);
      }
    } catch (err) {
      alert("Server connection failed. Ensure backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-wrapper">
      {/* Official Header */}
      <header className="official-header">
        <div className="header-titles">
          <h1>MaathaCare National System</h1>
          <p>System Administrator Control Panel</p>
        </div>
        <button className="btn-logout">Logout</button>
      </header>

      <div className="dashboard-grid">
        {/* Left Column: Official Registration Form */}
        <div className="card form-card">
          <div className="card-header">
            <h2>Register Public Health Midwife</h2>
            <p>Authorized Personnel Only</p>
          </div>
          
          <form onSubmit={handleRegister} className="registration-form">
            <div className="input-group">
              <label>Full Name (As per NIC)</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required placeholder="e.g. A. B. C. Perera" />
            </div>
            
            <div className="input-group">
              <label>National Identity Card (NIC)</label>
              <input type="text" value={nic} onChange={e => setNic(e.target.value)} required placeholder="e.g. 199012345678V" />
            </div>

            <div className="input-group">
              <label>Assigned MOH Area</label>
              <select value={selectedMohCode} onChange={e => setSelectedMohCode(e.target.value)} required>
                <option value="" disabled>-- Select MOH Area --</option>
                {MOH_AREAS.map(area => (
                  <option key={area.code} value={area.code}>
                    {area.name} ({area.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>Official Staff ID (Auto-Generated)</label>
              <input type="text" value={generatedStaffId} readOnly className="readonly-input" placeholder="Select MOH Area first" />
            </div>

            <div className="input-group">
              <label>Temporary Password</label>
              <input type="text" value={nic ? `Default: ${nic}` : 'Awaiting NIC...'} readOnly className="readonly-input" />
              <small className="help-text">PHM will be prompted to change this upon first login.</small>
            </div>

            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Authorize & Register PHM'}
            </button>
          </form>
        </div>

        {/* Right Column: Active Staff Directory */}
        <div className="card list-card">
          <div className="card-header">
            <h2>Active Staff Directory</h2>
            <p>Total Registered: {staffList.length}</p>
          </div>
          
          <div className="staff-list">
            {staffList.length === 0 ? (
              <div className="empty-state">No active staff members found.</div>
            ) : (
              staffList.map(phm => (
                <div key={phm.staffId} className="staff-item">
                  <div className="staff-avatar">
                    {phm.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="staff-details">
                    <h3>{phm.fullName}</h3>
                    <div className="staff-badges">
                      <span className="badge badge-id">{phm.staffId}</span>
                      <span className="badge badge-moh">{phm.mohArea}</span>
                    </div>
                  </div>
                  <button className="btn-danger">Remove</button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;