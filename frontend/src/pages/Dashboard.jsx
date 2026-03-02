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
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="page-header">
                <h1 className="page-title">Dashboard</h1>
                <div className="header-actions">
                    <button onClick={() => navigate('/properties')} className="btn btn-primary">
                        Properties
                    </button>
                    <button onClick={() => navigate('/leases')} className="btn btn-primary">
                        Leases
                    </button>
                    <button onClick={handleLogout} className="btn btn-danger">
                        Logout
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">📋</div>
                    <div className="stat-number">{stats.activeLeases.length}</div>
                    <div className="stat-label">Active Leases</div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">⚠️</div>
                    <div className="stat-number">{stats.expiringLeases.length}</div>
                    <div className="stat-label">Expiring Soon</div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">🏠</div>
                    <div className="stat-number">{stats.vacantUnits.length}</div>
                    <div className="stat-label">Vacant Units</div>
                </div>
            </div>

            {/* Expiring Leases Alert */}
            {stats.expiringLeases.length > 0 && (
                <div className="alert alert-warning">
                    <h3 style={{ margin: '0 0 15px 0', fontSize: '18px' }}>⚠️ Leases Expiring in Next 30 Days</h3>
                    {stats.expiringLeases.map(lease => (
                        <div key={lease.id} style={{ padding: '10px 0', borderBottom: '1px solid #ffeeba' }}>
                            <strong>{lease.property_name} - Unit {lease.unit_number}</strong>
                            <br />
                            <span>Tenant: {lease.first_name} {lease.last_name}</span>
                            <br />
                            <span style={{ color: '#856404', fontWeight: '600' }}>
                                Expires: {new Date(lease.lease_end).toLocaleDateString()}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Vacant Units */}
            <div className="card mb-20">
                <div className="card-header">
                    <h3 className="card-title">Vacant Units</h3>
                </div>
                {stats.vacantUnits.length === 0 ? (
                    <p className="text-center" style={{ padding: '20px', color: '#7f8c8d' }}>
                        All units are currently occupied! 🎉
                    </p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {stats.vacantUnits.map(unit => (
                            <div key={unit.id} className="card" style={{ background: '#f8f9fa' }}>
                                <strong style={{ display: 'block', marginBottom: '5px' }}>
                                    {unit.property_name} - Unit {unit.unit_number}
                                </strong>
                                <span style={{ color: '#5a6c7d', fontSize: '14px' }}>
                                    {unit.bedrooms} bed, {unit.bathrooms} bath
                                    {unit.square_feet && ` • ${unit.square_feet} sq ft`}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Active Leases */}
            <div className="table-container">
                <h3 style={{ marginBottom: '20px' }}>Active Leases ({stats.activeLeases.length})</h3>
                {stats.activeLeases.length === 0 ? (
                    <p className="text-center" style={{ padding: '40px', color: '#7f8c8d' }}>
                        No active leases
                    </p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Property</th>
                                <th>Unit</th>
                                <th>Tenant</th>
                                <th>Start Date</th>
                                <th>End Date</th>
                                <th>Monthly Rent</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.activeLeases.map(lease => (
                                <tr key={lease.id}>
                                    <td>{lease.property_name}</td>
                                    <td>{lease.unit_number}</td>
                                    <td>{lease.first_name} {lease.last_name}</td>
                                    <td>{new Date(lease.lease_start).toLocaleDateString()}</td>
                                    <td>{new Date(lease.lease_end).toLocaleDateString()}</td>
                                    <td>${lease.monthly_rent}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default Dashboard;