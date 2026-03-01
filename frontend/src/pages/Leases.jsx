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

        // Validate dates
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
            // Display the overlap error or other backend errors
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

            // Refresh tenants list
            const tenantsRes = await tenantsAPI.getAll();
            setTenants(tenantsRes.data);

            // Auto-select the new tenant
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
        return <div style={{ padding: '20px' }}>Loading leases...</div>;
    }

    return (
        <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>Lease Management</h1>
                <div>
                    <button onClick={() => navigate('/dashboard')} style={buttonStyle}>Dashboard</button>
                    <button onClick={() => navigate('/properties')} style={buttonStyle}>Properties</button>
                    <button onClick={() => {
                        localStorage.removeItem('token');
                        toast.success('Logged out');
                        navigate('/login');
                    }} style={{ ...buttonStyle, backgroundColor: '#dc3545' }}>Logout</button>
                </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button
                    onClick={() => setShowLeaseForm(!showLeaseForm)}
                    style={{ ...buttonStyle, backgroundColor: '#28a745', marginLeft: 0 }}
                >
                    {showLeaseForm ? 'Cancel' : '+ New Lease'}
                </button>
                <button
                    onClick={() => setShowTenantForm(!showTenantForm)}
                    style={{ ...buttonStyle, backgroundColor: '#17a2b8', marginLeft: 0 }}
                >
                    {showTenantForm ? 'Cancel' : '+ New Tenant'}
                </button>
            </div>

            {/* Create Tenant Form (Quick Add) */}
            {showTenantForm && (
                <div style={{ ...formContainerStyle, marginBottom: '20px' }}>
                    <h3>Create New Tenant</h3>
                    <form onSubmit={handleCreateTenant}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <input
                                type="text"
                                placeholder="First Name"
                                value={tenantForm.first_name}
                                onChange={(e) => setTenantForm({ ...tenantForm, first_name: e.target.value })}
                                required
                                style={inputStyle}
                            />
                            <input
                                type="text"
                                placeholder="Last Name"
                                value={tenantForm.last_name}
                                onChange={(e) => setTenantForm({ ...tenantForm, last_name: e.target.value })}
                                required
                                style={inputStyle}
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                value={tenantForm.email}
                                onChange={(e) => setTenantForm({ ...tenantForm, email: e.target.value })}
                                required
                                style={inputStyle}
                            />
                            <input
                                type="tel"
                                placeholder="Phone (optional)"
                                value={tenantForm.phone}
                                onChange={(e) => setTenantForm({ ...tenantForm, phone: e.target.value })}
                                style={inputStyle}
                            />
                        </div>
                        <button type="submit" style={{ ...buttonStyle, backgroundColor: '#17a2b8', marginLeft: 0 }}>
                            Create Tenant
                        </button>
                    </form>
                </div>
            )}

            {/* Create Lease Form */}
            {showLeaseForm && (
                <div style={{ ...formContainerStyle, marginBottom: '20px' }}>
                    <h3>Create New Lease</h3>
                    <form onSubmit={handleCreateLease}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            {/* Unit Selection */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Unit *</label>
                                <select
                                    value={leaseForm.unit_id}
                                    onChange={(e) => setLeaseForm({ ...leaseForm, unit_id: e.target.value })}
                                    required
                                    style={inputStyle}
                                >
                                    <option value="">Select a unit...</option>
                                    {units.map(unit => (
                                        <option key={unit.id} value={unit.id}>
                                            {unit.property_name} - Unit {unit.unit_number} ({unit.bedrooms} bed, {unit.bathrooms} bath)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Tenant Selection */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Tenant *</label>
                                <select
                                    value={leaseForm.tenant_id}
                                    onChange={(e) => setLeaseForm({ ...leaseForm, tenant_id: e.target.value })}
                                    required
                                    style={inputStyle}
                                >
                                    <option value="">Select a tenant...</option>
                                    {tenants.map(tenant => (
                                        <option key={tenant.id} value={tenant.id}>
                                            {tenant.first_name} {tenant.last_name} ({tenant.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Lease Start Date */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Lease Start Date *</label>
                                <input
                                    type="date"
                                    value={leaseForm.lease_start}
                                    onChange={(e) => setLeaseForm({ ...leaseForm, lease_start: e.target.value })}
                                    required
                                    style={inputStyle}
                                />
                            </div>

                            {/* Lease End Date */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Lease End Date *</label>
                                <input
                                    type="date"
                                    value={leaseForm.lease_end}
                                    onChange={(e) => setLeaseForm({ ...leaseForm, lease_end: e.target.value })}
                                    required
                                    style={inputStyle}
                                />
                            </div>

                            {/* Monthly Rent */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Monthly Rent ($) *</label>
                                <input
                                    type="number"
                                    placeholder="1500"
                                    value={leaseForm.monthly_rent}
                                    onChange={(e) => setLeaseForm({ ...leaseForm, monthly_rent: e.target.value })}
                                    required
                                    min="0"
                                    step="0.01"
                                    style={inputStyle}
                                />
                            </div>

                            {/* Security Deposit */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Security Deposit ($)</label>
                                <input
                                    type="number"
                                    placeholder="3000"
                                    value={leaseForm.security_deposit}
                                    onChange={(e) => setLeaseForm({ ...leaseForm, security_deposit: e.target.value })}
                                    min="0"
                                    step="0.01"
                                    style={inputStyle}
                                />
                            </div>
                        </div>

                        <button type="submit" style={{ ...buttonStyle, width: '100%', backgroundColor: '#28a745', marginLeft: 0, marginTop: '10px' }}>
                            Create Lease
                        </button>
                    </form>
                </div>
            )}

            {/* Leases List */}
            <div style={{ backgroundColor: 'white', border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
                <h2>All Leases ({leases.length})</h2>

                {leases.length === 0 ? (
                    <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                        No leases yet. Create your first lease above!
                    </p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #ddd' }}>
                                    <th style={tableHeaderStyle}>Property</th>
                                    <th style={tableHeaderStyle}>Unit</th>
                                    <th style={tableHeaderStyle}>Tenant</th>
                                    <th style={tableHeaderStyle}>Start Date</th>
                                    <th style={tableHeaderStyle}>End Date</th>
                                    <th style={tableHeaderStyle}>Monthly Rent</th>
                                    <th style={tableHeaderStyle}>Status</th>
                                    <th style={tableHeaderStyle}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leases.map(lease => {
                                    const today = new Date();
                                    const start = new Date(lease.lease_start);
                                    const end = new Date(lease.lease_end);
                                    const isActive = today >= start && today <= end;
                                    const isFuture = today < start;
                                    const isPast = today > end;

                                    return (
                                        <tr key={lease.id} style={{ borderBottom: '1px solid #ddd' }}>
                                            <td style={tableCellStyle}>{lease.property_name}</td>
                                            <td style={tableCellStyle}>{lease.unit_number}</td>
                                            <td style={tableCellStyle}>{lease.first_name} {lease.last_name}</td>
                                            <td style={tableCellStyle}>{new Date(lease.lease_start).toLocaleDateString()}</td>
                                            <td style={tableCellStyle}>{new Date(lease.lease_end).toLocaleDateString()}</td>
                                            <td style={tableCellStyle}>${lease.monthly_rent}</td>
                                            <td style={tableCellStyle}>
                                                <span style={{
                                                    padding: '4px 8px',
                                                    borderRadius: '12px',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold',
                                                    backgroundColor: isActive ? '#d4edda' : isFuture ? '#fff3cd' : '#f8d7da',
                                                    color: isActive ? '#155724' : isFuture ? '#856404' : '#721c24'
                                                }}>
                                                    {isActive ? '✓ Active' : isFuture ? '⏳ Future' : '✕ Expired'}
                                                </span>
                                            </td>
                                            <td style={tableCellStyle}>
                                                <button
                                                    onClick={() => handleDeleteLease(lease.id)}
                                                    style={{ ...smallButtonStyle, backgroundColor: '#dc3545' }}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
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

const smallButtonStyle = {
    padding: '6px 12px',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
};

const formContainerStyle = {
    padding: '20px',
    backgroundColor: '#f8f9fa',
    border: '1px solid #ddd',
    borderRadius: '8px'
};

const inputStyle = {
    width: '100%',
    padding: '10px',
    marginBottom: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px'
};

const tableHeaderStyle = {
    padding: '12px',
    textAlign: 'left',
    fontWeight: 'bold'
};

const tableCellStyle = {
    padding: '12px',
    textAlign: 'left'
};

export default Leases;