import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { propertiesAPI, unitsAPI } from '../services/api';
import { toast } from 'react-toastify';

function Properties() {
    const navigate = useNavigate();
    const [properties, setProperties] = useState([]);
    const [units, setUnits] = useState([]);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [showPropertyForm, setShowPropertyForm] = useState(false);
    const [showUnitForm, setShowUnitForm] = useState(false);
    const [loading, setLoading] = useState(true);

    const [propertyForm, setPropertyForm] = useState({
        name: '',
        address: '',
        city: '',
        state: '',
        zip_code: ''
    });

    const [unitForm, setUnitForm] = useState({
        property_id: '',
        unit_number: '',
        bedrooms: '',
        bathrooms: '',
        square_feet: ''
    });

    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async () => {
        try {
            const response = await propertiesAPI.getAll();
            setProperties(response.data);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to load properties');
            setLoading(false);
        }
    };

    const fetchUnitsForProperty = async (propertyId) => {
        try {
            const response = await unitsAPI.getAll(propertyId);
            setUnits(response.data);
            setSelectedProperty(propertyId);
        } catch (error) {
            toast.error('Failed to load units');
        }
    };

    const handleCreateProperty = async (e) => {
        e.preventDefault();
        try {
            await propertiesAPI.create(propertyForm);
            toast.success('Property created successfully!');
            setShowPropertyForm(false);
            setPropertyForm({ name: '', address: '', city: '', state: '', zip_code: '' });
            fetchProperties();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create property');
        }
    };

    const handleCreateUnit = async (e) => {
        e.preventDefault();
        try {
            await unitsAPI.create({ ...unitForm, property_id: selectedProperty });
            toast.success('Unit created successfully!');
            setShowUnitForm(false);
            setUnitForm({ property_id: '', unit_number: '', bedrooms: '', bathrooms: '', square_feet: '' });
            fetchUnitsForProperty(selectedProperty);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create unit');
        }
    };

    const handleDeleteProperty = async (id) => {
        if (!window.confirm('Are you sure you want to delete this property?')) return;

        try {
            await propertiesAPI.delete(id);
            toast.success('Property deleted successfully!');
            fetchProperties();
            if (selectedProperty === id) {
                setSelectedProperty(null);
                setUnits([]);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete property');
        }
    };

    const handleDeleteUnit = async (id) => {
        if (!window.confirm('Are you sure you want to delete this unit?')) return;

        try {
            await unitsAPI.delete(id);
            toast.success('Unit deleted successfully!');
            fetchUnitsForProperty(selectedProperty);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete unit');
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
                <h1 className="page-title">Properties & Units</h1>
                <div className="header-actions">
                    <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
                        Dashboard
                    </button>
                    <button onClick={() => navigate('/leases')} className="btn btn-primary">
                        Leases
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

            <div className="grid-2">
                {/* Properties Section */}
                <div>
                    <div className="flex justify-between align-center mb-20">
                        <h2>Properties ({properties.length})</h2>
                        <button
                            onClick={() => setShowPropertyForm(!showPropertyForm)}
                            className="btn btn-success"
                        >
                            {showPropertyForm ? 'Cancel' : '+ New Property'}
                        </button>
                    </div>

                    {showPropertyForm && (
                        <div className="form-container">
                            <h3 style={{ marginBottom: '20px' }}>Create New Property</h3>
                            <form onSubmit={handleCreateProperty}>
                                <div className="form-group">
                                    <label className="form-label">Property Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Sunset Apartments"
                                        value={propertyForm.name}
                                        onChange={(e) => setPropertyForm({ ...propertyForm, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Address</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="123 Main Street"
                                        value={propertyForm.address}
                                        onChange={(e) => setPropertyForm({ ...propertyForm, address: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">City</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="San Francisco"
                                            value={propertyForm.city}
                                            onChange={(e) => setPropertyForm({ ...propertyForm, city: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">State</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="CA"
                                            value={propertyForm.state}
                                            onChange={(e) => setPropertyForm({ ...propertyForm, state: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Zip Code</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="94102"
                                        value={propertyForm.zip_code}
                                        onChange={(e) => setPropertyForm({ ...propertyForm, zip_code: e.target.value })}
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn btn-success w-100">
                                    Create Property
                                </button>
                            </form>
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {properties.length === 0 ? (
                            <p className="text-center" style={{ padding: '40px', color: '#7f8c8d' }}>
                                No properties yet. Create your first property!
                            </p>
                        ) : (
                            properties.map(property => (
                                <div
                                    key={property.id}
                                    className="card"
                                    style={{ borderColor: selectedProperty === property.id ? '#667eea' : '#e8e8e8', borderWidth: '2px' }}
                                >
                                    <div className="card-header">
                                        <div>
                                            <h3 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>{property.name}</h3>
                                            <p style={{ margin: 0, color: '#7f8c8d', fontSize: '14px' }}>
                                                {property.address}, {property.city}, {property.state} {property.zip_code}
                                            </p>
                                        </div>
                                        <div className="card-actions">
                                            <button
                                                onClick={() => fetchUnitsForProperty(property.id)}
                                                className="btn btn-primary btn-small"
                                            >
                                                View Units
                                            </button>
                                            <button
                                                onClick={() => handleDeleteProperty(property.id)}
                                                className="btn btn-danger btn-small"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Units Section */}
                <div>
                    <div className="flex justify-between align-center mb-20">
                        <h2>Units {selectedProperty && `(${units.length})`}</h2>
                        {selectedProperty && (
                            <button
                                onClick={() => setShowUnitForm(!showUnitForm)}
                                className="btn btn-success"
                            >
                                {showUnitForm ? 'Cancel' : '+ New Unit'}
                            </button>
                        )}
                    </div>

                    {!selectedProperty ? (
                        <div className="text-center" style={{ padding: '60px 20px', color: '#7f8c8d' }}>
                            <div style={{ fontSize: '48px', marginBottom: '10px' }}>🏢</div>
                            <p>← Select a property to view its units</p>
                        </div>
                    ) : (
                        <>
                            {showUnitForm && (
                                <div className="form-container">
                                    <h3 style={{ marginBottom: '20px' }}>Create New Unit</h3>
                                    <form onSubmit={handleCreateUnit}>
                                        <div className="form-group">
                                            <label className="form-label">Unit Number</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="101"
                                                value={unitForm.unit_number}
                                                onChange={(e) => setUnitForm({ ...unitForm, unit_number: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-grid">
                                            <div className="form-group">
                                                <label className="form-label">Bedrooms</label>
                                                <input
                                                    type="number"
                                                    className="form-input"
                                                    placeholder="2"
                                                    value={unitForm.bedrooms}
                                                    onChange={(e) => setUnitForm({ ...unitForm, bedrooms: e.target.value })}
                                                    required
                                                    min="0"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Bathrooms</label>
                                                <input
                                                    type="number"
                                                    step="0.5"
                                                    className="form-input"
                                                    placeholder="1.5"
                                                    value={unitForm.bathrooms}
                                                    onChange={(e) => setUnitForm({ ...unitForm, bathrooms: e.target.value })}
                                                    required
                                                    min="0"
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Square Feet (optional)</label>
                                            <input
                                                type="number"
                                                className="form-input"
                                                placeholder="850"
                                                value={unitForm.square_feet}
                                                onChange={(e) => setUnitForm({ ...unitForm, square_feet: e.target.value })}
                                                min="0"
                                            />
                                        </div>
                                        <button type="submit" className="btn btn-success w-100">
                                            Create Unit
                                        </button>
                                    </form>
                                </div>
                            )}

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {units.length === 0 ? (
                                    <p className="text-center" style={{ padding: '40px', color: '#7f8c8d' }}>
                                        No units in this property yet.
                                    </p>
                                ) : (
                                    units.map(unit => (
                                        <div key={unit.id} className="card">
                                            <div className="card-header">
                                                <div>
                                                    <h3 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>Unit {unit.unit_number}</h3>
                                                    <p style={{ margin: 0, color: '#7f8c8d', fontSize: '14px' }}>
                                                        {unit.bedrooms} bed, {unit.bathrooms} bath
                                                        {unit.square_feet && ` • ${unit.square_feet} sq ft`}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteUnit(unit.id)}
                                                    className="btn btn-danger btn-small"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Properties;