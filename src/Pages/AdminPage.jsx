import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'animate.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';

const AdminPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [monthlyStats, setMonthlyStats] = useState({});
  const [examCenters, setExamCenters] = useState([]);

  const handleLogin = () => {
    const { username, password } = loginData;
    if (username === 'admin' && password === 'admin123') {
      setIsLoggedIn(true);
      toast.success('Login successful!', { autoClose: 2000 });
    } else {
      toast.error('Invalid credentials!', { autoClose: 2000 });
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoginData({ username: '', password: '' });
    toast.info('Logged out', { autoClose: 2000 });
  };

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:4000/exceldownload');
      const fileList = res.data;
      setFiles(fileList);
      computeStats(fileList);
    } catch (err) {
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) fetchFiles();
  }, [isLoggedIn]);

  const computeStats = (fileList) => {
    const stats = {};
    const centers = new Set();

    fileList.forEach((file) => {
      const createdAt = new Date(file.createdAt);
      const monthKey = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`;
      stats[monthKey] = (stats[monthKey] || 0) + 1;

      const match = file.originalName?.match(/_([A-Z ]+)_\d{4,}/i);
      if (match && match[1]) {
        centers.add(match[1].replace(/_/g, ' ').trim());
      }
    });

    setMonthlyStats(stats);
    setExamCenters(Array.from(centers));
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    else if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    else return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  if (!isLoggedIn) {
    return (
      <div className="container-fluid d-flex justify-content-center align-items-center vh-100 bg-dark bg-gradient">
        <ToastContainer />
        <div className="bg-white p-5 rounded shadow-lg animate__animated animate__fadeInDown" style={{ maxWidth: 400, width: '100%' }}>
          <div className="text-center mb-4">
            <i className="bi bi-shield-lock-fill text-primary animate__animated animate__tada" style={{ fontSize: '2.5rem' }}></i>
            <h3 className="text-primary mt-2">Admin Login</h3>
          </div>
          <input
            className="form-control mb-3"
            type="text"
            placeholder="Username"
            value={loginData.username}
            onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
          />
          <input
            className="form-control mb-4"
            type="password"
            placeholder="Password"
            value={loginData.password}
            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
          />
          <button className="btn btn-primary w-100" onClick={handleLogin}>
            <i className="bi bi-box-arrow-in-right me-2"></i>Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 px-2 bg-light min-vh-100">
      <ToastContainer />
      <div className="container bg-white p-4 rounded shadow-lg animate__animated animate__fadeIn">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4">
          <h3 className="text-primary mb-3 mb-md-0">👨‍💼 Admin Dashboard</h3>
          <div className="d-flex gap-2">
            <button className="btn btn-info btn-sm" onClick={() => setShowStats(true)}>
              <i className="bi bi-bar-chart me-1"></i> Stats
            </button>
            <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right me-1"></i> Logout
            </button>
          </div>
        </div>

        <div className="mb-4">
          <div className="card border-0 shadow-sm animate__animated animate__fadeInUp">
            <div className="card-body">
              <h5 className="card-title">Welcome, Admin! 🎉</h5>
              <p className="card-text">Here you can manage and download uploaded Excel files.</p>
              <span className="badge bg-primary">Total Files: {files.length}</span>
            </div>
          </div>
        </div>

        <div className="table-responsive animate__animated animate__fadeInUp">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" />
              <p className="mt-2">Loading files...</p>
            </div>
          ) : (
            <table className="table table-bordered table-hover align-middle">
              <thead className="table-primary">
                <tr>
                  <th>#</th>
                  <th>Original Name</th>
                  <th>Stored Name</th>
                  <th>Size</th>
                  <th>Uploaded At</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td className="text-break">{file.originalName || '-'}</td>
                    <td className="text-break">{file.filename || '-'}</td>
                    <td>{formatSize(file.size)}</td>
                    <td>{new Date(file.createdAt).toLocaleString()}</td>
                    <td>
                      <a
                        href={`http://localhost:4000/upload/${file.filename}`}
                        download
                        className="btn btn-success btn-sm"
                      >
                        <i className="bi bi-download me-1"></i>Download
                      </a>
                    </td>
                  </tr>
                ))}
                {files.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center text-muted">No Excel files found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 📊 Stats Modal */}
      <Modal show={showStats} onHide={() => setShowStats(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>📊 Upload Statistics</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h6>📅 Excel Files Uploaded Per Month:</h6>
          <ul className="list-group mb-3">
            {Object.entries(monthlyStats).map(([month, count], idx) => (
              <li className="list-group-item d-flex justify-content-between" key={idx}>
                <span>{month}</span> <span className="badge bg-primary">{count}</span>
              </li>
            ))}
            {Object.keys(monthlyStats).length === 0 && (
              <li className="list-group-item text-muted">No uploads found</li>
            )}
          </ul>

          <h6>🏫 Exam Centre Names Found:</h6>
          <ul className="list-group">
            {examCenters.map((center, idx) => (
              <li className="list-group-item" key={idx}>{center}</li>
            ))}
            {examCenters.length === 0 && (
              <li className="list-group-item text-muted">No exam centers detected</li>
            )}
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStats(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminPage;
