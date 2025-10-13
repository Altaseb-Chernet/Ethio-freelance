// client/src/components/OTPVerification.jsx
import React, { useState, useEffect } from 'react';
import { Mail, ArrowLeft, RotateCcw } from 'lucide-react';

const OTPVerification = ({ email, onVerify, onBack, onResend }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    setOtp(prev => {
      const newOtp = [...prev];
      newOtp[index] = element.value;
      return newOtp;
    });

    // Focus next input
    if (element.nextSibling && element.value !== '') {
      element.nextSibling.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !e.target.value && e.target.previousSibling) {
      e.target.previousSibling.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      alert('Please enter the complete 6-digit OTP');
      return;
    }

    setLoading(true);
    await onVerify(otpString);
    setLoading(false);
  };

  const handleResend = async () => {
    setResendLoading(true);
    const result = await onResend();
    setResendLoading(false);
    
    if (result.success) {
      setCountdown(60); // 60 seconds countdown
      alert('New OTP sent to your email!');
    } else {
      alert(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <button
            onClick={onBack}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to registration
          </button>
          
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-primary-600" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900">Verify your email</h2>
          <p className="mt-2 text-gray-600">
            We sent a 6-digit code to <strong>{email}</strong>
          </p>
        </div>

        <div className="card p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                Enter verification code
              </label>
              <div className="flex justify-center space-x-3">
                {otp.map((data, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    value={data}
                    onChange={e => handleChange(e.target, index)}
                    onKeyDown={e => handleKeyDown(e, index)}
                    onFocus={e => e.target.select()}
                    className="w-12 h-12 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-colors"
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
                Didn't receive the code?{' '}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendLoading || countdown > 0}
                  className="font-medium text-primary-600 hover:text-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendLoading ? (
                    'Sending...'
                  ) : countdown > 0 ? (
                    `Resend in ${countdown}s`
                  ) : (
                    <span className="flex items-center justify-center space-x-1">
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