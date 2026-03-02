import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { leasesAPI, unitsAPI, tenantsAPI } from '../services/api';
import { toast } from 'react-toastify';

function Leases() {
    const navigate = useNavigate();
    const [leases, setLeases] = useState([]);
    const [units, setUnits] = useState([]);
    const [tenants, setTenants] = useState([]);
    const [showLeaseForm, setShowLeaseForm] = useState(false);
    const [showTenantForm, setShowTenantForm] = useState(false);
    const [loading, setLoading] = useState(true);

    const [leaseForm, setLeaseForm] = useState({
        unit_id: '',
        tenant_id: '',
        lease_start: '',
        lease_end: '',
        monthly_rent: '',
        security_deposit: ''
    });

    const [tenantForm, setTenantForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [leasesRes, unitsRes, tenantsRes] = await Promise.all([
                leasesAPI.getAll(),
                unitsAPI.getAll(),
                tenantsAPI.getAll()
            ]);

            setLeases(leasesRes.data);
            setUnits(unitsRes.data);
            setTenants(tenantsRes.data);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to load data');
            setLoading(false);
        }
    };

    const handleCreateLease = async (e) => {
        e.preventDefault();

        if (new Date(leaseForm.lease_start) >= new Date(leaseForm.lease_end)) {
            toast.error('End date must be after start date');
            return;
        }

        try {
            await leasesAPI.create(leaseForm);
            toast.success('Lease created successfully! 🎉');
            setShowLeaseForm(false);
            setLeaseForm({
                unit_id: '',
                tenant_id: '',
                lease_start: '',
                lease_end: '',
                monthly_rent: '',
                security_deposit: ''
            });
            fetchData();
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to create lease';
            toast.error(errorMessage, { autoClose: 5000 });
        }
    };

    const handleCreateTenant = async (e) => {
        e.preventDefault();
        try {
            const response = await tenantsAPI.create(tenantForm);
            toast.success('Tenant created successfully!');
            setShowTenantForm(false);
            setTenantForm({ first_name: '', last_name: '', email: '', phone: '' });

            const tenantsRes = await tenantsAPI.getAll();
            setTenants(tenantsRes.data);
            setLeaseForm({ ...leaseForm, tenant_id: response.data.id });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create tenant');
        }
    };

    const handleDeleteLease = async (id) => {
        if (!window.confirm('Are you sure you want to delete this lease?')) return;

        try {
            await leasesAPI.delete(id);
            toast.success('Lease deleted successfully!');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete lease');
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="page-header">
                <h1 className="page-title">Lease Management</h1>
                <div className="header-actions">
                    <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
                        Dashboard
                    </button>
                    <button onClick={() => navigate('/properties')} className="btn btn-primary">
                        Properties
                    </button>
                    <button onClick={() => {
                        localStorage.removeItem('token');
                        toast.success('Logged out');
                        navigate('/login');
                    }} className="btn btn-danger">
                        Logout
                    </button>
                </div>
            </div>

            <div className="flex gap-10 mb-20" style={{ flexWrap: 'wrap' }}>
                <button
                    onClick={() => setShowLeaseForm(!showLeaseForm)}
                    className="btn btn-success"
                >
                    {showLeaseForm ? 'Cancel' : '+ New Lease'}
                </button>
                <button
                    onClick={() => setShowTenantForm(!showTenantForm)}
                    className="btn btn-info"
                >
                    {showTenantForm ? 'Cancel' : '+ New Tenant'}
                </button>
            </div>

            {showTenantForm && (
                <div className="form-container">
                    <h3 style={{ marginBottom: '20px' }}>Create New Tenant</h3>
                    <form onSubmit={handleCreateTenant}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">First Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="John"
                                    value={tenantForm.first_name}
                                    onChange={(e) => setTenantForm({ ...tenantForm, first_name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Last Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Doe"
                                    value={tenantForm.last_name}
                                    onChange={(e) => setTenantForm({ ...tenantForm, last_name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    placeholder="john@example.com"
                                    value={tenantForm.email}
                                    onChange={(e) => setTenantForm({ ...tenantForm, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Phone (optional)</label>
                                <input
                                    type="tel"
                                    className="form-input"
                                    placeholder="555-1234"
                                    value={tenantForm.phone}
                                    onChange={(e) => setTenantForm({ ...tenantForm, phone: e.target.value })}
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-info w-100">
                            Create Tenant
                        </button>
                    </form>
                </div>
            )}

            {showLeaseForm && (
                <div className="form-container">
                    <h3 style={{ marginBottom: '20px' }}>Create New Lease</h3>
                    <form onSubmit={handleCreateLease}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">Unit *</label>
                                <select
                                    className="form-select"
                                    value={leaseForm.unit_id}
                                    onChange={(e) => setLeaseForm({ ...leaseForm, unit_id: e.target.value })}
                                    required
                                >
                                    <option value="">Select a unit...</option>
                                    {units.map(unit => (
                                        <option key={unit.id} value={unit.id}>
                                            {unit.property_name} - Unit {unit.unit_number} ({unit.bedrooms} bed, {unit.bathrooms} bath)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Tenant *</label>
                                <select
                                    className="form-select"
                                    value={leaseForm.tenant_id}
                                    onChange={(e) => setLeaseForm({ ...leaseForm, tenant_id: e.target.value })}
                                    required
                                >
                                    <option value="">Select a tenant...</option>
                                    {tenants.map(tenant => (
                                        <option key={tenant.id} value={tenant.id}>
                                            {tenant.first_name} {tenant.last_name} ({tenant.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Lease Start Date *</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={leaseForm.lease_start}
                                    onChange={(e) => setLeaseForm({ ...leaseForm, lease_start: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Lease End Date *</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={leaseForm.lease_end}
                                    onChange={(e) => setLeaseForm({ ...leaseForm, lease_end: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Monthly Rent ($) *</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="1500"
                                    value={leaseForm.monthly_rent}
                                    onChange={(e) => setLeaseForm({ ...leaseForm, monthly_rent: e.target.value })}
                                    required
                                    min="0"
                                    step="0.01"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Security Deposit ($)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="3000"
                                    value={leaseForm.security_deposit}
                                    onChange={(e) => setLeaseForm({ ...leaseForm, security_deposit: e.target.value })}
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-success w-100 mt-20">
                            Create Lease
                        </button>
                    </form>
                </div>
            )}

            <div className="table-container">
                <h2 style={{ marginBottom: '20px' }}>All Leases ({leases.length})</h2>

                {leases.length === 0 ? (
                    <div className="text-center" style={{ padding: '60px 20px', color: '#7f8c8d' }}>
                        <div style={{ fontSize: '48px', marginBottom: '10px' }}>📋</div>
                        <p>No leases yet. Create your first lease above!</p>
                    </div>
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
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leases.map(lease => {
                                const today = new Date();
                                const start = new Date(lease.lease_start);
                                const end = new Date(lease.lease_end);
                                const isActive = today >= start && today <= end;
                                const isFuture = today < start;

                                return (
                                    <tr key={lease.id}>
                                        <td>{lease.property_name}</td>
                                        <td>{lease.unit_number}</td>
                                        <td>{lease.first_name} {lease.last_name}</td>
                                        <td>{new Date(lease.lease_start).toLocaleDateString()}</td>
                                        <td>{new Date(lease.lease_end).toLocaleDateString()}</td>
                                        <td>${lease.monthly_rent}</td>
                                        <td>
                                            <span className={`badge ${isActive ? 'badge-success' : isFuture ? 'badge-warning' : 'badge-danger'}`}>
                                                {isActive ? '✓ Active' : isFuture ? '⏳ Future' : '✕ Expired'}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => handleDeleteLease(lease.id)}
                                                className="btn btn-danger btn-small"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default Leases;