import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import { DISTRICTS, MOH_AREAS } from './location';
import SriLankaMap, { type DistrictSummary } from '../components/SriLankaMap';

interface PHM {
  staffId: string;
  fullName: string;
  mohArea: string;
  nic: string;
}

interface AreaStat {
  areaName: string;
  phmCount: number;
  motherCount: number;
  status: string;
}

const PROVINCE_MAP: Record<string, { province: string; districtName: string }> = {
  KAN: { province: 'Central', districtName: 'Kandy' },
  MTL: { province: 'Central', districtName: 'Matale' },
  NEL: { province: 'Central', districtName: 'Nuwara Eliya' },
  COL: { province: 'Western', districtName: 'Colombo' },
  GAM: { province: 'Western', districtName: 'Gampaha' },
  KAL: { province: 'Western', districtName: 'Kalutara' },
  GAL: { province: 'Southern', districtName: 'Galle' },
  MAT: { province: 'Southern', districtName: 'Matara' },
  HAM: { province: 'Southern', districtName: 'Hambantota' },
  AMP: { province: 'Eastern', districtName: 'Ampara' },
  BAT: { province: 'Eastern', districtName: 'Batticaloa' },
  TRI: { province: 'Eastern', districtName: 'Trincomalee' },
  ANU: { province: 'North Central', districtName: 'Anuradhapura' },
  POL: { province: 'North Central', districtName: 'Polonnaruwa' },
  JAF: { province: 'Northern', districtName: 'Jaffna' },
  KIL: { province: 'Northern', districtName: 'Kilinochchi' },
  MAN: { province: 'Northern', districtName: 'Mannar' },
  MUL: { province: 'Northern', districtName: 'Mullaitivu' },
  VAV: { province: 'Northern', districtName: 'Vavuniya' },
  KUR: { province: 'North Western', districtName: 'Kurunegala' },
  PUT: { province: 'North Western', districtName: 'Puttalam' },
  KEG: { province: 'Sabaragamuwa', districtName: 'Kegalle' },
  RAT: { province: 'Sabaragamuwa', districtName: 'Ratnapura' },
  BAD: { province: 'Uva', districtName: 'Badulla' },
  MON: { province: 'Uva', districtName: 'Monaragala' },
};

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'analytics' | 'management'>('analytics');
  const [staffList, setStaffList] = useState<PHM[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [fullName, setFullName] = useState('');
  const [nic, setNic] = useState('');
  const [selectedDistrictCode, setSelectedDistrictCode] = useState('');
  const [selectedMohCode, setSelectedMohCode] = useState('');
  const [generatedStaffId, setGeneratedStaffId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 🟢 NEW: GN Division State
  const [gnDivision, setGnDivision] = useState('');
  const [gnDivisionItems, setGnDivisionItems] = useState<{ label: string; value: string }[]>([]);
  const [isFetchingGn, setIsFetchingGn] = useState(false);

  const [distributionStats, setDistributionStats] = useState<AreaStat[]>([]);

  useEffect(() => {
    fetchStaff();
    fetchDistribution(); 
  }, []);

  // Staff ID Generator
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

  // 🟢 NEW: Dynamic GN Division Fetcher
  useEffect(() => {
    setGnDivision('');
    setGnDivisionItems([]);
    
    if (selectedDistrictCode && selectedMohCode) {
      const mohFullName = (MOH_AREAS[selectedDistrictCode] || []).find(m => m.code === selectedMohCode)?.name || '';
      
      if (mohFullName) {
        setIsFetchingGn(true);
        fetch(`http://localhost:8080/api/locations/gn-divisions?mohArea=${mohFullName}`)
          .then(res => res.json())
          .then(data => {
             const formatted = data.map((name: string) => ({ label: name, value: name }));
             setGnDivisionItems(formatted);
          })
          .catch(err => console.error("Failed to fetch GN Divisions:", err))
          .finally(() => setIsFetchingGn(false));
      }
    }
  }, [selectedDistrictCode, selectedMohCode]);

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem("adminToken") || "";
      const response = await fetch("http://localhost:8080/api/users/staff/all", {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStaffList(data);
      }
    } catch (err) {
      console.error("Failed to load staff list");
    }
  };

  const fetchDistribution = async () => {
    try {
      const token = localStorage.getItem("adminToken") || "";
      const response = await fetch("http://localhost:8080/api/users/staff/stats/distribution", {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setDistributionStats(data);
      }
    } catch (err) {
      console.error("Failed to load distribution stats");
    }
  };

  const hierarchicalStats = useMemo(() => {
    const tree: Record<string, Record<string, AreaStat[]>> = {};

    distributionStats.forEach(stat => {
      let foundProvince = 'Other';
      let foundDistrict = 'General';

      for (const [distCode, info] of Object.entries(PROVINCE_MAP)) {
        const match = MOH_AREAS[distCode]?.some(m => m.name === stat.areaName);
        if (match) {
          foundProvince = info.province;
          foundDistrict = info.districtName;
          break;
        }
      }

      if (!tree[foundProvince]) tree[foundProvince] = {};
      if (!tree[foundProvince][foundDistrict]) tree[foundProvince][foundDistrict] = [];
      tree[foundProvince][foundDistrict].push(stat);
    });

    return tree;
  }, [distributionStats]);

  const districtSummaryForMap = useMemo(() => {
    const result: Record<string, DistrictSummary> = {};

    Object.values(hierarchicalStats).forEach(districts => {
      Object.entries(districts).forEach(([districtName, mohList]) => {
        const summary: DistrictSummary = result[districtName] || {
          phmCount: 0,
          motherCount: 0,
          totalMoh: 0,
          understaffedMoh: 0,
        };

        mohList.forEach(stat => {
          summary.phmCount += stat.phmCount;
          summary.motherCount += stat.motherCount || 0;
          summary.totalMoh += 1;
          if (stat.status !== 'Adequate') summary.understaffedMoh += 1;
        });

        result[districtName] = summary;
      });
    });

    return result;
  }, [hierarchicalStats]);

  const [selectedMapDistrict, setSelectedMapDistrict] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDistrictCode || !selectedMohCode || !gnDivision) {
      alert("Please select a District, MOH Area, and GN Division.");
      return;
    }

    setIsLoading(true);
    try {
      const mohFullName = (MOH_AREAS[selectedDistrictCode] || []).find(m => m.code === selectedMohCode)?.name || '';
      
      // 🟢 NEW: Add gnDivision to the payload
      const payload = { 
        fullName, 
        nic, 
        staffId: generatedStaffId, 
        mohArea: mohFullName, 
        gnDivision: gnDivision, 
        password: nic 
      };
      console.log("PAYLOAD BEING SENT:", JSON.stringify(payload));
      
      const token = localStorage.getItem("adminToken") || "";

      const response = await fetch("http://localhost:8080/api/users/staff/register", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert("Registration Successful!");
        setFullName(''); setNic(''); setSelectedDistrictCode(''); setSelectedMohCode(''); setGnDivision('');
        fetchStaff(); 
        fetchDistribution(); 
      } else {
        alert(`Registration Failed: ${await response.text()}`);
      }
    } catch (err) {
      alert("Server connection failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (staffId: string) => {
    if (!window.confirm(`Are you sure you want to permanently remove staff: ${staffId}?`)) return;

    try {
      const token = localStorage.getItem("adminToken") || "";
      const response = await fetch(`http://localhost:8080/api/users/staff/delete/${staffId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchStaff();
        fetchDistribution(); 
      } else {
        alert("Failed to remove staff.");
      }
    } catch (err) {
      alert("Server connection failed.");
    }
  };

  const handlePasswordReset = async (staffId: string) => {
    if (!window.confirm(`Reset password for ${staffId} back to their default NIC?`)) return;

    try {
      const token = localStorage.getItem("adminToken") || "";
      const response = await fetch(`http://localhost:8080/api/users/staff/reset-password/${staffId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert("Password successfully reset!");
      } else {
        alert("Failed to reset password.");
      }
    } catch (err) {
      alert("Server connection failed.");
    }
  };

  const filteredStaff = useMemo(() => {
    return staffList.filter(staff => 
      staff.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      staff.staffId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.mohArea.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [staffList, searchQuery]);

  return (
    <div className="admin-wrapper">
      <header className="official-header">
        <h1>MaathaCare National System</h1>
        <button className="btn-logout" onClick={() => { localStorage.removeItem("adminToken"); navigate('/login'); }}>Logout</button>
      </header>

      <div className="stats-banner" style={{ display: 'flex', gap: '2rem', padding: '2rem 3rem 0', width: '100%', boxSizing: 'border-box' }}>
        <div className="stat-card" style={{ flex: 1, backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #3b82f6', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>Total Active PHMs</h3>
          <p style={{ margin: '0.5rem 0 0', fontSize: '1.75rem', fontWeight: 'bold', color: '#0f172a' }}>
            {staffList.length}
          </p>
        </div>
        <div className="stat-card" style={{ flex: 1, backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #10b981', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>System Health</h3>
          <p style={{ margin: '0.5rem 0 0', fontSize: '1.75rem', fontWeight: 'bold', color: '#0f172a' }}>Online</p>
        </div>
      </div>

      <div style={{ padding: '2rem 3rem 0', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '2rem' }}>
        <button 
          onClick={() => setActiveTab('analytics')}
          style={{ 
            background: 'none', border: 'none', padding: '0.75rem 1rem', fontSize: '1.1rem', cursor: 'pointer',
            borderBottom: activeTab === 'analytics' ? '3px solid #3b82f6' : '3px solid transparent',
            color: activeTab === 'analytics' ? '#1e293b' : '#64748b',
            fontWeight: activeTab === 'analytics' ? '600' : '400',
            transition: 'all 0.2s ease'
          }}
        >
          📍 Caseload Analytics
        </button>
        <button 
          onClick={() => setActiveTab('management')}
          style={{ 
            background: 'none', border: 'none', padding: '0.75rem 1rem', fontSize: '1.1rem', cursor: 'pointer',
            borderBottom: activeTab === 'management' ? '3px solid #3b82f6' : '3px solid transparent',
            color: activeTab === 'management' ? '#1e293b' : '#64748b',
            fontWeight: activeTab === 'management' ? '600' : '400',
            transition: 'all 0.2s ease'
          }}
        >
          👥 Staff Management
        </button>
      </div>

      {activeTab === 'analytics' && (
        <div style={{ padding: '2rem 3rem', width: '100%', boxSizing: 'border-box', animation: 'fadeIn 0.3s' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '2rem', alignItems: 'start' }}>
            
            <div className="card" style={{ padding: '1.5rem', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.25rem', color: '#1e293b', borderBottom: '2px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                Maternal Caseload Distribution Hierarchy
              </h2>
              
              {Object.keys(hierarchicalStats).length === 0 ? (
                <p style={{ color: '#64748b' }}>No regional tracking data compiled yet.</p>
              ) : (
                Object.entries(hierarchicalStats).map(([province, districts]) => (
                  <div key={province} style={{ marginBottom: '1.5rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                    <h3 style={{ margin: '0 0 1rem 0', color: '#0f172a', fontSize: '1.05rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      📍 {province} Province
                    </h3>
                    
                    {Object.entries(districts).map(([district, mohList]) => (
                      <div key={district} style={{ marginBottom: '1rem', paddingLeft: '0.5rem' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#475569', fontSize: '0.95rem', fontWeight: '600' }}>
                          📋 {district} District
                        </h4>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                          {mohList.map(stat => (
                            <div key={stat.areaName} style={{ 
                              padding: '0.75rem', 
                              borderRadius: '6px', 
                              backgroundColor: '#fff',
                              border: '1px solid #e2e8f0',
                              borderLeft: `4px solid ${stat.status === 'Adequate' ? '#10b981' : '#ef4444'}`
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '600' }}>
                                <span>{stat.areaName}</span>
                                <span style={{ color: stat.status === 'Adequate' ? '#166534' : '#991b1b' }}>{stat.status}</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.75rem', marginTop: '4px' }}>
                                <span>{stat.phmCount} PHMs</span>
                                <span>{stat.motherCount || 0} Mothers</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>

            <div className="card" style={{ padding: '1.5rem', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.25rem', color: '#1e293b', borderBottom: '2px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                🗺️ National Coverage Map
              </h2>
              <SriLankaMap
                districtStats={districtSummaryForMap}
                selectedDistrict={selectedMapDistrict}
                onSelectDistrict={(name) =>
                  setSelectedMapDistrict(prev => (prev === name ? null : name))
                }
              />
              {selectedMapDistrict && districtSummaryForMap[selectedMapDistrict] && (
                <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', backgroundColor: '#f8fafc', borderRadius: '6px', fontSize: '0.85rem' }}>
                  <strong>{selectedMapDistrict}</strong> — {districtSummaryForMap[selectedMapDistrict].phmCount} PHMs,{' '}
                  {districtSummaryForMap[selectedMapDistrict].motherCount} mothers,{' '}
                  {districtSummaryForMap[selectedMapDistrict].totalMoh - districtSummaryForMap[selectedMapDistrict].understaffedMoh}/
                  {districtSummaryForMap[selectedMapDistrict].totalMoh} MOH areas adequately staffed
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {activeTab === 'management' && (
        <div className="dashboard-grid" style={{ animation: 'fadeIn 0.3s' }}>
          <div className="card form-card">
            <div className="card-header">
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Register Public Health Midwife</h2>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>Authorized Personnel Only</p>
            </div>
            <form onSubmit={handleRegister} className="registration-form">
              <div className="input-group">
                <label>Full Name</label>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required placeholder="e.g. A. B. C. Perera" />
              </div>
              <div className="input-group">
                <label>NIC</label>
                <input type="text" value={nic} onChange={e => setNic(e.target.value)} required placeholder="e.g. 199012345678V" />
              </div>
              <div className="input-group">
                <label>District</label>
                <select value={selectedDistrictCode} onChange={e => { setSelectedDistrictCode(e.target.value); setSelectedMohCode(''); }} required>
                  <option value="">-- Select District --</option>
                  {DISTRICTS.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>MOH Area</label>
                <select value={selectedMohCode} onChange={e => setSelectedMohCode(e.target.value)} required disabled={!selectedDistrictCode}>
                  <option value="">{selectedDistrictCode ? "-- Select MOH --" : "-- Select District First --"}</option>
                  {selectedDistrictCode && (MOH_AREAS[selectedDistrictCode] || []).map(a => <option key={a.code} value={a.code}>{a.name}</option>)}
                </select>
              </div>
              
              {/* 🟢 NEW: GN Division Dropdown */}
              <div className="input-group">
                <label>GN Division</label>
                <select 
                  value={gnDivision} 
                  onChange={e => setGnDivision(e.target.value)} 
                  required 
                  disabled={!selectedMohCode || isFetchingGn || gnDivisionItems.length === 0}
                >
                  <option value="">
                    {isFetchingGn ? "Loading divisions..." : selectedMohCode ? "-- Select GN Division --" : "-- Select MOH First --"}
                  </option>
                  {gnDivisionItems.map(gn => <option key={gn.value} value={gn.value}>{gn.label}</option>)}
                </select>
              </div>

              <div className="input-group">
                <label>Official Staff ID</label>
                <input type="text" value={generatedStaffId} readOnly className="readonly-input" />
              </div>
              <button type="submit" className="btn-primary" disabled={isLoading}>
                {isLoading ? 'Processing...' : 'Authorize & Register'}
              </button>
            </form>
          </div>

          <div className="card list-card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Active Staff Directory</h2>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>Manage registered personnel</p>
              </div>
              <input 
                type="text" 
                placeholder="Search directory..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
              />
            </div>
            <div className="staff-list">
              {filteredStaff.map(phm => (
                <div key={phm.staffId} className="staff-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.25rem', fontSize: '1rem' }}>{phm.fullName}</h3>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', marginRight: '1rem' }}>{phm.staffId}</span>
                    <span style={{ fontSize: '0.75rem', backgroundColor: '#e0e7ff', color: '#4f46e5', padding: '2px 6px', borderRadius: '10px' }}>{phm.mohArea}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      style={{ backgroundColor: '#f1f5f9', color: '#475569', border: 'none', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                      onClick={() => handlePasswordReset(phm.staffId)}
                    >
                      Reset Pass
                    </button>
                    <button 
                      className="btn-danger"
                      onClick={() => handleRemove(phm.staffId)}
                      style={{ padding: '0.5rem', fontSize: '0.75rem' }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              {filteredStaff.length === 0 && <p style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem 0' }}>No staff found.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;