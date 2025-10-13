// client/src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";
import { api } from "../utils/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await api.get("/auth/me");
      setUser(response.data.data.user);
    } catch (error) {
      console.error("Failed to fetch user:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { token: newToken, user: userData } = response.data.data;

      localStorage.setItem("token", newToken);
      setToken(newToken);
      setUser(userData);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

    const register = async (userData) => {
    try {
      const response = await axios.post('/api/auth/register', userData);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const verifyOTP = async (email, otp) => {
    try {
      const response = await axios.post('/api/auth/verify-otp', { email, otp });
      
      if (response.data.success) {
        const { user: userData, token } = response.data.data;
        localStorage.setItem('token', token);
        setUser(userData);
      }
      
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'OTP verification failed'
      };
    }
  };

  const resendOTP = async (email) => {
    try {
      const response = await axios.post('/api/auth/resend-otp', { email });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to resend OTP'
      };
    }
  };


  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const updateUser = (updates) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isClient: user?.role === "client",
    isFreelancer: user?.role === "freelancer",
    isAdmin: user?.role === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
