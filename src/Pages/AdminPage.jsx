import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "animate.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import { Modal, Button, Pagination } from "react-bootstrap";
import axios from "axios";

const AdminPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [monthlyStats, setMonthlyStats] = useState({});
  const [examCenters, setExamCenters] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const filesPerPage = 10;

  // -------------------- LOGIN --------------------
  const handleLogin = () => {
    const { username, password } = loginData;
    if (username === "admin" && password === "admin123") {
      setIsLoggedIn(true);
      toast.success("✅ Login successful!");
    } else {
      toast.error("❌ Invalid credentials!");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoginData({ username: "", password: "" });
    toast.info("You have been logged out.");
  };

  // -------------------- FETCH FILES --------------------
  const fetchFiles = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        "https://ktu-resuly-analyser-backend.onrender.com/exceldownload"
      );
      const fileList = res.data;
      setFiles(fileList);
      computeStats(fileList);
    } catch (err) {
      toast.error("Failed to load files");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) fetchFiles();
  }, [isLoggedIn]);

  // -------------------- STATS --------------------
  const computeStats = (fileList) => {
    const stats = {};
    const centers = new Set();

    fileList.forEach((file) => {
      const createdAt = new Date(file.createdAt);
      const monthKey = `${createdAt.getFullYear()}-${String(
        createdAt.getMonth() + 1
      ).padStart(2, "0")}`;
      stats[monthKey] = (stats[monthKey] || 0) + 1;

      const match = file.originalName?.match(/_([A-Z ]+)_\d{4,}/i);
      if (match && match[1]) {
        centers.add(match[1].replace(/_/g, " ").trim());
      }
    });

    setMonthlyStats(stats);
    setExamCenters(Array.from(centers));
  };

  // -------------------- HELPERS --------------------
  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    else if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    else return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const indexOfLastFile = currentPage * filesPerPage;
  const indexOfFirstFile = indexOfLastFile - filesPerPage;
  const currentFiles = files.slice(indexOfFirstFile, indexOfLastFile);
  const totalPages = Math.ceil(files.length / filesPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  // -------------------- LOGIN PAGE --------------------
  if (!isLoggedIn) {
    return (
      <div className="d-flex vh-100 justify-content-center align-items-center bg-dark bg-gradient">
        <ToastContainer />
        <div
          className="bg-white p-5 rounded shadow-lg text-center animate__animated animate__fadeInDown"
          style={{ width: "360px" }}
        >
          <i
            className="bi bi-shield-lock-fill text-primary mb-3"
            style={{ fontSize: "3rem" }}
          ></i>
          <h4 className="mb-4 fw-bold text-primary">Admin Portal</h4>
          <input
            className="form-control mb-3"
            type="text"
            placeholder="Username"
            value={loginData.username}
            onChange={(e) =>
              setLoginData({ ...loginData, username: e.target.value })
            }
          />
          <input
            className="form-control mb-4"
            type="password"
            placeholder="Password"
            value={loginData.password}
            onChange={(e) =>
              setLoginData({ ...loginData, password: e.target.value })
            }
          />
          <button
            className="btn btn-primary w-100 fw-semibold"
            onClick={handleLogin}
          >
            <i className="bi bi-box-arrow-in-right me-2"></i>Login
          </button>
        </div>
      </div>
    );
  }

  // -------------------- DASHBOARD --------------------
  return (
    <div className="min-vh-100 bg-light d-flex flex-column">
      <ToastContainer />

      {/* TOP NAVBAR */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div className="container-fluid">
          <h4 className="text-white fw-bold mb-0">
            <i className="bi bi-speedometer2 me-2"></i>Admin Dashboard
          </h4>
          <div className="ms-auto d-flex align-items-center gap-3">
            <button
              className="btn btn-light btn-sm"
              onClick={() => setShowStats(true)}
            >
              <i className="bi bi-bar-chart"></i> Stats
            </button>
            <button className="btn btn-danger btn-sm" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right me-1"></i> Logout
            </button>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div className="container py-4 flex-grow-1 animate__animated animate__fadeIn">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
          <h3 className="fw-bold text-primary mb-3 mb-md-0">
            Welcome, Admin 👋
          </h3>
          <span className="badge bg-secondary fs-6">
            Total Files: {files.length}
          </span>
        </div>

        {/* TABLE CARD */}
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <h5 className="card-title mb-3">
              <i className="bi bi-file-earmark-excel me-2"></i>Uploaded Files
            </h5>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" />
                <p className="mt-3 text-muted">Loading files...</p>
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-primary">
                      <tr>
                        <th>#</th>
                        <th>Original Name</th>
                        <th>Stored Name</th>
                        <th>Size</th>
                        <th>Uploaded</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentFiles.map((file, index) => (
                        <tr key={index}>
                          <td>{indexOfFirstFile + index + 1}</td>
                          <td className="text-break">{file.originalName}</td>
                          <td className="text-break">{file.filename}</td>
                          <td>{formatSize(file.size)}</td>
                          <td>
                            {new Date(file.createdAt).toLocaleDateString()}{" "}
                            {new Date(file.createdAt).toLocaleTimeString()}
                          </td>
                          <td>
                            <a
                              href={`https://ktu-resuly-analyser-backend.onrender.com/upload/${file.filename}`}
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
                          <td colSpan="6" className="text-center text-muted">
                            No files found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* PAGINATION */}
                {totalPages > 1 && (
                  <div className="d-flex justify-content-center mt-4">
                    <Pagination>
                      <Pagination.First
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(1)}
                      />
                      <Pagination.Prev
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                      />
                      {[...Array(totalPages)].map((_, i) => (
                        <Pagination.Item
                          key={i + 1}
                          active={i + 1 === currentPage}
                          onClick={() => handlePageChange(i + 1)}
                        >
                          {i + 1}
                        </Pagination.Item>
                      ))}
                      <Pagination.Next
                        disabled={currentPage === totalPages}
                        onClick={() => handlePageChange(currentPage + 1)}
                      />
                      <Pagination.Last
                        disabled={currentPage === totalPages}
                        onClick={() => handlePageChange(totalPages)}
                      />
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* STATS MODAL */}
      <Modal show={showStats} onHide={() => setShowStats(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>📊 Upload Statistics</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h6>📅 Uploads Per Month:</h6>
          <ul className="list-group mb-3">
            {Object.entries(monthlyStats).map(([month, count], idx) => (
              <li
                key={idx}
                className="list-group-item d-flex justify-content-between"
              >
                <span>{month}</span>
                <span className="badge bg-primary">{count}</span>
              </li>
            ))}
            {Object.keys(monthlyStats).length === 0 && (
              <li className="list-group-item text-muted">No uploads yet</li>
            )}
          </ul>

          <h6>🏫 Exam Centers:</h6>
          <ul className="list-group">
            {examCenters.map((c, idx) => (
              <li key={idx} className="list-group-item">
                {c}
              </li>
            ))}
            {examCenters.length === 0 && (
              <li className="list-group-item text-muted">None detected</li>
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
