// client/src/components/OTPVerification.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Mail, ArrowLeft, RotateCcw } from 'lucide-react';

const OTPVerification = ({ email, onVerify, onBack, onResend }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputsRef = useRef([]);

  // Countdown for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Handle OTP input
  const handleChange = (e, index) => {
    const value = e.target.value;

    if (!/^[0-9]?$/.test(value)) return; // only allow single digit

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next
    if (value && inputsRef.current[index + 1]) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && inputsRef.current[index - 1]) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');

    if (otpString.length !== 6) {
      alert('Please enter the complete 6-digit OTP');
      return;
    }

    try {
      setLoading(true);
      await onVerify(otpString); // Calls parent-provided backend verification
    } catch (err) {
      console.error(err);
      alert('OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setResendLoading(true);
      const result = await onResend();
      if (result.success) {
        setCountdown(60);
        alert('New OTP sent to your email!');
      } else {
        alert(result.message || 'Failed to resend OTP.');
      }
    } catch (error) {
      console.error(error);
      alert('Error resending OTP.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Back button */}
        <div className="text-center">
          <button
            onClick={onBack}
            type="button"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to registration
          </button>

          {/* Icon */}
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-primary-600" />
          </div>

          <h2 className="text-3xl font-bold text-gray-900">Verify your email</h2>
          <p className="mt-2 text-gray-600">
            We sent a 6-digit code to <strong>{email}</strong>
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                Enter verification code
              </label>
              <div className="flex justify-center space-x-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputsRef.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="w-12 h-12 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Verifying...</span>
                </div>
              ) : (
                'Verify Email'
              )}
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Didn’t receive the code?{' '}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendLoading || countdown > 0}
                  className="font-medium text-primary-600 hover:text-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendLoading
                    ? 'Sending...'
                    : countdown > 0
                    ? `Resend in ${countdown}s`
                    : (
                      <span className="inline-flex items-center space-x-1">
                        <RotateCcw className="w-4 h-4" />
                        <span>Resend OTP</span>
                      </span>
                    )}
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
