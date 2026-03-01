import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { leasesAPI } from '../services/api';
import { toast } from 'react-toastify';

function Dashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        activeLeases: [],
        expiringLeases: [],
        vacantUnits: [],
        loading: true
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [activeRes, expiringRes, vacantRes] = await Promise.all([
                leasesAPI.getActive(),
                leasesAPI.getExpiring(30),
                leasesAPI.getVacantUnits()
            ]);

            setStats({
                activeLeases: activeRes.data,
                expiringLeases: expiringRes.data,
                vacantUnits: vacantRes.data,
                loading: false
            });
        } catch (error) {
            toast.error('Failed to load dashboard data');
            setStats(prev => ({ ...prev, loading: false }));
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        toast.success('Logged out successfully');
        navigate('/login');
    };

    if (stats.loading) {
        return <div style={{ padding: '20px' }}>Loading dashboard...</div>;
    }

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1>Lease Management Dashboard</h1>
                <div>
                    <button onClick={() => navigate('/properties')} style={buttonStyle}>Properties</button>
                    <button onClick={() => navigate('/leases')} style={buttonStyle}>Leases</button>
                    <button onClick={handleLogout} style={{ ...buttonStyle, backgroundColor: '#dc3545' }}>Logout</button>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <StatCard
                    title="Active Leases"
                    count={stats.activeLeases.length}
                    color="#28a745"
                    icon="📋"
                />
                <StatCard
                    title="Expiring Soon"
                    count={stats.expiringLeases.length}
                    color="#ffc107"
                    icon="⚠️"
                />
                <StatCard
                    title="Vacant Units"
                    count={stats.vacantUnits.length}
                    color="#17a2b8"
                    icon="🏠"
                />
            </div>

            {/* Expiring Leases Alert */}
            {stats.expiringLeases.length > 0 && (
                <div style={{ backgroundColor: '#fff3cd', border: '1px solid #ffc107', padding: '15px', borderRadius: '4px', marginBottom: '20px' }}>
                    <h3 style={{ margin: '0 0 10px 0' }}>⚠️ Leases Expiring in Next 30 Days</h3>
                    {stats.expiringLeases.map(lease => (
                        <div key={lease.id} style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
                            <strong>{lease.property_name} - Unit {lease.unit_number}</strong>
                            <br />
                            <span>Tenant: {lease.first_name} {lease.last_name}</span>
                            <br />
                            <span style={{ color: '#856404' }}>Expires: {new Date(lease.lease_end).toLocaleDateString()}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Vacant Units */}
            <div style={{ backgroundColor: 'white', border: '1px solid #ddd', padding: '20px', borderRadius: '4px', marginBottom: '20px' }}>
                <h3>Vacant Units</h3>
                {stats.vacantUnits.length === 0 ? (
                    <p>All units are currently occupied! 🎉</p>
                ) : (
                    <div style={{ display: 'grid', gap: '10px' }}>
                        {stats.vacantUnits.map(unit => (
                            <div key={unit.id} style={{ padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                                <strong>{unit.property_name} - Unit {unit.unit_number}</strong>
                                <br />
                                <span>{unit.bedrooms} bed, {unit.bathrooms} bath - {unit.square_feet} sq ft</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Active Leases */}
            <div style={{ backgroundColor: 'white', border: '1px solid #ddd', padding: '20px', borderRadius: '4px' }}>
                <h3>Active Leases ({stats.activeLeases.length})</h3>
                {stats.activeLeases.length === 0 ? (
                    <p>No active leases</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f8f9fa' }}>
                                    <th style={tableHeaderStyle}>Property</th>
                                    <th style={tableHeaderStyle}>Unit</th>
                                    <th style={tableHeaderStyle}>Tenant</th>
                                    <th style={tableHeaderStyle}>Start Date</th>
                                    <th style={tableHeaderStyle}>End Date</th>
                                    <th style={tableHeaderStyle}>Monthly Rent</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.activeLeases.map(lease => (
                                    <tr key={lease.id} style={{ borderBottom: '1px solid #ddd' }}>
                                        <td style={tableCellStyle}>{lease.property_name}</td>
                                        <td style={tableCellStyle}>{lease.unit_number}</td>
                                        <td style={tableCellStyle}>{lease.first_name} {lease.last_name}</td>
                                        <td style={tableCellStyle}>{new Date(lease.lease_start).toLocaleDateString()}</td>
                                        <td style={tableCellStyle}>{new Date(lease.lease_end).toLocaleDateString()}</td>
                                        <td style={tableCellStyle}>${lease.monthly_rent}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

// Stat Card Component
function StatCard({ title, count, color, icon }) {
    return (
        <div style={{
            backgroundColor: 'white',
            border: `2px solid ${color}`,
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center'
        }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>{icon}</div>
            <h2 style={{ margin: '10px 0', fontSize: '32px', color }}>{count}</h2>
            <p style={{ margin: 0, color: '#666' }}>{title}</p>
        </div>
    );
}

// Styles
const buttonStyle = {
    padding: '10px 20px',
    marginLeft: '10px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
};

const tableHeaderStyle = {
    padding: '12px',
    textAlign: 'left',
    borderBottom: '2px solid #ddd'
};

const tableCellStyle = {
    padding: '12px',
    textAlign: 'left'
};

export default Dashboard;