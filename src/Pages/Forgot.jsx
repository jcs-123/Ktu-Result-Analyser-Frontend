import React, { useState } from 'react';
import { Button, Form, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import jcs from '../assets/jyothiimg.jpg';

function Forgot() {
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

 const handleSendOTP = async () => {
  if (!email) return toast.error("Please enter your registered email");
  setLoading(true);
  try {
    const res = await axios.post('http://localhost:4000/forgot-password', { email });

    if (res.data.emailExists) {
      toast.success(res.data.message);
      setOtpSent(true);
    } else {
      toast.error(res.data.message); // "Email not registered"
    }
  } catch (err) {
    toast.error(err.response?.data?.message || "Failed to send OTP");
  } finally {
    setLoading(false);
  }
};


  const handleResetPassword = async () => {
    if (!otp || !newPassword || !confirmPassword) {
      return toast.warning("Please fill all fields");
    }

    if (newPassword !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:4000/reset-password', {
        email,
        otp,
        newPassword,
        confirmPassword,
      });
      toast.success(res.data.message);
      setTimeout(() => {
        navigate('/');
      }, 500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundImage: `url(${jcs})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <ToastContainer position="top-center" autoClose={3000} />

      <div style={{ position: 'absolute', top: '20px', left: '20px' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Button style={{
            background: 'rgba(0,0,0,0.7)',
            border: 'none',
            color: 'white',
            fontWeight: 'bold',
            padding: '6px 20px',
            borderRadius: '25px',
            backdropFilter: 'blur(5px)'
          }}>
            ← Back Home
          </Button>
        </Link>
      </div>

      <div className="w-100" style={{ maxWidth: '450px' }}>
        <div className="p-4 shadow" style={{
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(15px)',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.3)',
          color: '#fff',
        }}>
          <h3 className="text-center mb-4">🔒 Forgot Password</h3>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label style={{ color: '#f1f1f1' }}>Registered Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered email"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.3)',
                }}
              />
            </Form.Group>

            {otpSent && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label style={{ color: '#f1f1f1' }}>OTP</Form.Label>
                  <Form.Control
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter OTP"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      color: '#fff',
                      border: '1px solid rgba(255,255,255,0.3)',
                    }}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label style={{ color: '#f1f1f1' }}>New Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      color: '#fff',
                      border: '1px solid rgba(255,255,255,0.3)',
                    }}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label style={{ color: '#f1f1f1' }}>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your new password"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      color: '#fff',
                      border: '1px solid rgba(255,255,255,0.3)',
                    }}
                  />
                </Form.Group>
              </>
            )}

            <Button
              onClick={otpSent ? handleResetPassword : handleSendOTP}
              className="w-100 rounded-4"
              disabled={loading}
              style={{
                backgroundColor: 'coral',
                border: 'none',
                fontWeight: 'bold',
              }}
            >
              {loading ? (
                <Spinner size="sm" animation="border" />
              ) : otpSent ? 'RESET PASSWORD' : 'SEND OTP'}
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default Forgot;
