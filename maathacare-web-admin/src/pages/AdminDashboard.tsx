import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

interface PHM {
  staffId: string;
  fullName: string;
  mohArea: string;
  nic: string;
}

// 📌 Official District Codes (Updated Kandy to KAN)
const DISTRICTS = [
  { name: "Kandy", code: "KAN" },
  { name: "Jaffna", code: "JAF" },
  { name: "Colombo", code: "COL" },
];

// 📌 Official MOH Areas mapped to District Codes
const MOH_AREAS: Record<string, { name: string; code: string }[]> = {
  KAN: [
    { name: "Akurana", code: "AKU" },
    { name: "Bambaradeniya", code: "BAM" },
    { name: "Deltota", code: "DEL" },
    { name: "Doluwa", code: "DOL" },
    { name: "Galagedara", code: "GLG" },
    { name: "Galaha", code: "GLH" },
    { name: "Gampola (Udapalatha)", code: "GMP" },
    { name: "Ganga Ihala Korale", code: "GIK" },
    { name: "Gangawata Korale", code: "GWK" },
    { name: "Harispattuwa", code: "HAR" },
    { name: "Hasalaka", code: "HAS" },
    { name: "Hatharaliyadda", code: "HTH" },
    { name: "Kadugannawa", code: "KDG" },
    { name: "Kandy MC", code: "KMC" },
    { name: "Kundasale", code: "KUN" },
    { name: "Manikhinna", code: "MAN" },
    { name: "Medadumbara", code: "MED" },
    { name: "Nawalapitiya (Pasbage)", code: "NAW" },
    { name: "Panvila", code: "PAN" },
    { name: "Poojapitiya", code: "POO" },
    { name: "Thalathuoya", code: "THA" },
    { name: "Udadumbara", code: "UDD" },
    { name: "Udunuwara", code: "UDN" },
    { name: "Wattegama (Pathadumbara)", code: "WAT" },
    { name: "Yatinuwara", code: "YAT" },
  ],
  JAF: [
    { name: "Jaffna MC", code: "JMC" },
    { name: "Nallur", code: "NAL" },
    { name: "Chavakachcheri", code: "CHV" },
    { name: "Kopay", code: "KOP" },
    { name: "Uduvil", code: "UDV" },
    { name: "Tellippalai", code: "TEL" },
    { name: "Sandilipay", code: "SAN" },
  ],
  COL: [
    { name: "Colombo MC", code: "CMC" },
    { name: "Dehiwala", code: "DEH" },
    { name: "Moratuwa", code: "MOR" },
    { name: "Kolonnawa", code: "KOL" },
  ]
};

const AdminDashboard: React.FC = () => {
  const [staffList, setStaffList] = useState<PHM[]>([]);
  
  const [fullName, setFullName] = useState('');
  const [nic, setNic] = useState('');
  
  const [selectedDistrictCode, setSelectedDistrictCode] = useState('');
  const [selectedMohCode, setSelectedMohCode] = useState('');
  
  const [generatedStaffId, setGeneratedStaffId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, []);

  // Auto-Generate Staff ID with District + MOH
  useEffect(() => {
    if (selectedDistrictCode && selectedMohCode) {
      const prefix = `PHM-${selectedDistrictCode}-${selectedMohCode}-`;
      
      const areaStaff = staffList.filter(staff => staff.staffId?.startsWith(prefix));
      
      let maxNumber = 0;
      areaStaff.forEach(staff => {
        const parts = staff.staffId.split('-'); 
        if (parts.length === 4) {
          const num = parseInt(parts[3], 10);
          if (num > maxNumber) maxNumber = num;
        }
      });

      const nextNumber = String(maxNumber + 1).padStart(3, '0');
      setGeneratedStaffId(`${prefix}${nextNumber}`);
    } else {
      setGeneratedStaffId('');
    }
  }, [selectedDistrictCode, selectedMohCode, staffList]);

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
    if (!selectedDistrictCode || !selectedMohCode) {
      alert("Please select both a District and an MOH Area.");
      return;
    }

    setIsLoading(true);
    try {
      const mohFullName = MOH_AREAS[selectedDistrictCode].find(m => m.code === selectedMohCode)?.name || '';

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
        setFullName('');
        setNic('');
        setSelectedDistrictCode('');
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

  // 🌟 NEW: Handle Staff Removal
  const handleRemove = async (staffId: string) => {
    const isConfirmed = window.confirm(`Are you sure you want to remove staff member: ${staffId}? This action cannot be undone.`);
    
    if (!isConfirmed) return;

    try {
      const token = localStorage.getItem("token") || localStorage.getItem("adminToken") || "";
      
      // Sending DELETE request to your Spring Boot backend
      const response = await fetch(`http://localhost:8080/api/users/staff/delete/${staffId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert("Staff member successfully removed.");
        fetchStaff(); // Automatically refresh the list to remove them from the UI
      } else {
        const msg = await response.text();
        alert(`Failed to remove staff: ${msg}`);
      }
    } catch (err) {
      alert("Server connection failed. Could not remove staff member.");
    }
  };

  return (
    <div className="admin-wrapper">
      <header className="official-header">
        <div className="header-titles">
          <h1>MaathaCare National System</h1>
          <p>System Administrator Control Panel</p>
        </div>
        <button className="btn-logout">Logout</button>
      </header>

      <div className="dashboard-grid">
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
              <label>Assigned District (RDHS)</label>
              <select 
                value={selectedDistrictCode} 
                onChange={e => {
                  setSelectedDistrictCode(e.target.value);
                  setSelectedMohCode(''); 
                }} 
                required
              >
                <option value="" disabled>-- Select District --</option>
                {DISTRICTS.map(dist => (
                  <option key={dist.code} value={dist.code}>
                    {dist.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>Assigned MOH Area</label>
              <select 
                value={selectedMohCode} 
                onChange={e => setSelectedMohCode(e.target.value)} 
                required
                disabled={!selectedDistrictCode}
              >
                <option value="" disabled>
                  {selectedDistrictCode ? "-- Select MOH Area --" : "-- Select District First --"}
                </option>
                {selectedDistrictCode && MOH_AREAS[selectedDistrictCode].map(area => (
                  <option key={area.code} value={area.code}>
                    {area.name} ({area.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>Official Staff ID (Auto-Generated)</label>
              <input type="text" value={generatedStaffId} readOnly className="readonly-input" placeholder="Select District & MOH Area first" />
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
                  {/* 🌟 NEW: Wired up the onClick event to our handleRemove function */}
                  <button 
                    className="btn-danger"
                    onClick={() => handleRemove(phm.staffId)}
                  >
                    Remove
                  </button>
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