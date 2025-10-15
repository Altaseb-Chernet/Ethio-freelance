import React, { useState } from 'react';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await axios.post('/api/auth/forgot-password', { email });
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to send reset OTP');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
      <form onSubmit={handleSubmit} className="card p-8 space-y-6 max-w-md w-full">
        <h2 className="text-2xl font-bold text-center">Forgot Password</h2>
        <p className="text-gray-600 text-center">Enter your email to get a reset OTP</p>
        
        {message && <div className="text-center text-primary-600">{message}</div>}

        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="input"
        />

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Sending...' : 'Send OTP'}
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
