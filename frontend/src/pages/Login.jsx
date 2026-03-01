import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';

function Login({ setIsAuthenticated }) {
    const [isRegister, setIsRegister] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = isRegister
                ? await authAPI.register(formData)
                : await authAPI.login({ email: formData.email, password: formData.password });

            // Save token
            localStorage.setItem('token', response.data.token);
            setIsAuthenticated(true);

            toast.success(isRegister ? 'Registration successful!' : 'Login successful!');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || err.response?.data?.error || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>{isRegister ? 'Register' : 'Login'}</h2>

            <form onSubmit={handleSubmit}>
                {isRegister && (
                    <>
                        <input
                            type="text"
                            placeholder="First Name"
                            value={formData.first_name}
                            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                            required
                            style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                        <input
                            type="text"
                            placeholder="Last Name"
                            value={formData.last_name}
                            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                            required
                            style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                    </>
                )}

                <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                />

                <input
                    type="password"
                    placeholder="Password (min 6 characters)"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={6}
                    style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                />

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '12px',
                        marginBottom: '10px',
                        backgroundColor: loading ? '#ccc' : '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '16px'
                    }}
                >
                    {loading ? 'Processing...' : (isRegister ? 'Register' : 'Login')}
                </button>
            </form>

            <button
                onClick={() => setIsRegister(!isRegister)}
                style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: 'transparent',
                    border: '1px solid #007bff',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    color: '#007bff'
                }}
            >
                {isRegister ? 'Already have an account? Login' : 'Need an account? Register'}
            </button>
        </div>
    );
}

export default Login;