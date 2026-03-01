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
        return <div style={{ padding: '20px' }}>Loading properties...</div>;
    }

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>Properties & Units Management</h1>
                <div>
                    <button onClick={() => navigate('/dashboard')} style={buttonStyle}>Dashboard</button>
                    <button onClick={() => navigate('/leases')} style={buttonStyle}>Leases</button>
                    <button onClick={() => {
                        localStorage.removeItem('token');
                        toast.success('Logged out');
                        navigate('/login');
                    }} style={{ ...buttonStyle, backgroundColor: '#dc3545' }}>Logout</button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* Properties Section */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h2>Properties ({properties.length})</h2>
                        <button
                            onClick={() => setShowPropertyForm(!showPropertyForm)}
                            style={{ ...buttonStyle, backgroundColor: '#28a745' }}
                        >
                            {showPropertyForm ? 'Cancel' : '+ New Property'}
                        </button>
                    </div>

                    {/* Create Property Form */}
                    {showPropertyForm && (
                        <div style={formContainerStyle}>
                            <h3>Create New Property</h3>
                            <form onSubmit={handleCreateProperty}>
                                <input
                                    type="text"
                                    placeholder="Property Name"
                                    value={propertyForm.name}
                                    onChange={(e) => setPropertyForm({ ...propertyForm, name: e.target.value })}
                                    required
                                    style={inputStyle}
                                />
                                <input
                                    type="text"
                                    placeholder="Address"
                                    value={propertyForm.address}
                                    onChange={(e) => setPropertyForm({ ...propertyForm, address: e.target.value })}
                                    required
                                    style={inputStyle}
                                />
                                <input
                                    type="text"
                                    placeholder="City"
                                    value={propertyForm.city}
                                    onChange={(e) => setPropertyForm({ ...propertyForm, city: e.target.value })}
                                    required
                                    style={inputStyle}
                                />
                                <input
                                    type="text"
                                    placeholder="State"
                                    value={propertyForm.state}
                                    onChange={(e) => setPropertyForm({ ...propertyForm, state: e.target.value })}
                                    required
                                    style={inputStyle}
                                />
                                <input
                                    type="text"
                                    placeholder="Zip Code"
                                    value={propertyForm.zip_code}
                                    onChange={(e) => setPropertyForm({ ...propertyForm, zip_code: e.target.value })}
                                    required
                                    style={inputStyle}
                                />
                                <button type="submit" style={{ ...buttonStyle, width: '100%', backgroundColor: '#28a745' }}>
                                    Create Property
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Properties List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {properties.length === 0 ? (
                            <p>No properties yet. Create your first property!</p>
                        ) : (
                            properties.map(property => (
                                <div
                                    key={property.id}
                                    style={{
                                        ...cardStyle,
                                        border: selectedProperty === property.id ? '2px solid #007bff' : '1px solid #ddd'
                                    }}
                                >
                                    <div>
                                        <h3 style={{ margin: '0 0 5px 0' }}>{property.name}</h3>
                                        <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                                            {property.address}, {property.city}, {property.state} {property.zip_code}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        <button
                                            onClick={() => fetchUnitsForProperty(property.id)}
                                            style={{ ...smallButtonStyle, backgroundColor: '#007bff' }}
                                        >
                                            View Units
                                        </button>
                                        <button
                                            onClick={() => handleDeleteProperty(property.id)}
                                            style={{ ...smallButtonStyle, backgroundColor: '#dc3545' }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Units Section */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h2>Units {selectedProperty && `(${units.length})`}</h2>
                        {selectedProperty && (
                            <button
                                onClick={() => setShowUnitForm(!showUnitForm)}
                                style={{ ...buttonStyle, backgroundColor: '#28a745' }}
                            >
                                {showUnitForm ? 'Cancel' : '+ New Unit'}
                            </button>
                        )}
                    </div>

                    {!selectedProperty ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                            <p>← Select a property to view its units</p>
                        </div>
                    ) : (
                        <>
                            {/* Create Unit Form */}
                            {showUnitForm && (
                                <div style={formContainerStyle}>
                                    <h3>Create New Unit</h3>
                                    <form onSubmit={handleCreateUnit}>
                                        <input
                                            type="text"
                                            placeholder="Unit Number (e.g., 101, A1)"
                                            value={unitForm.unit_number}
                                            onChange={(e) => setUnitForm({ ...unitForm, unit_number: e.target.value })}
                                            required
                                            style={inputStyle}
                                        />
                                        <input
                                            type="number"
                                            placeholder="Bedrooms"
                                            value={unitForm.bedrooms}
                                            onChange={(e) => setUnitForm({ ...unitForm, bedrooms: e.target.value })}
                                            required
                                            min="0"
                                            style={inputStyle}
                                        />
                                        <input
                                            type="number"
                                            step="0.5"
                                            placeholder="Bathrooms"
                                            value={unitForm.bathrooms}
                                            onChange={(e) => setUnitForm({ ...unitForm, bathrooms: e.target.value })}
                                            required
                                            min="0"
                                            style={inputStyle}
                                        />
                                        <input
                                            type="number"
                                            placeholder="Square Feet"
                                            value={unitForm.square_feet}
                                            onChange={(e) => setUnitForm({ ...unitForm, square_feet: e.target.value })}
                                            min="0"
                                            style={inputStyle}
                                        />
                                        <button type="submit" style={{ ...buttonStyle, width: '100%', backgroundColor: '#28a745' }}>
                                            Create Unit
                                        </button>
                                    </form>
                                </div>
                            )}

                            {/* Units List */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {units.length === 0 ? (
                                    <p>No units in this property yet.</p>
                                ) : (
                                    units.map(unit => (
                                        <div key={unit.id} style={cardStyle}>
                                            <div>
                                                <h3 style={{ margin: '0 0 5px 0' }}>Unit {unit.unit_number}</h3>
                                                <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                                                    {unit.bedrooms} bed, {unit.bathrooms} bath
                                                    {unit.square_feet && ` • ${unit.square_feet} sq ft`}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteUnit(unit.id)}
                                                style={{ ...smallButtonStyle, backgroundColor: '#dc3545' }}
                                            >
                                                Delete
                                            </button>
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

const cardStyle = {
    padding: '15px',
    backgroundColor: 'white',
    border: '1px solid #ddd',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
};

const formContainerStyle = {
    padding: '20px',
    backgroundColor: '#f8f9fa',
    border: '1px solid #ddd',
    borderRadius: '8px',
    marginBottom: '20px'
};

const inputStyle = {
    width: '100%',
    padding: '10px',
    marginBottom: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px'
};

export default Properties;