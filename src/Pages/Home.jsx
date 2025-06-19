import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Modal, Button, Container, Nav, Navbar } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';

import jecimage from '../assets/jecimage.png';
import tbiimage from '../assets/tbi_logo.png';
import jyothihead from '../assets/jyothi_head.png';
import secondimage from '../assets/2.jpg';
import fourthimage from '../assets/4.jpg';
import sixthimage from '../assets/6.jpg';
import firstimage from '../assets/1.png';
import thirdimage from '../assets/3.png';
import fifthimage from '../assets/5.png';
import Forgot from './Forgot';

function Home() {
  const navigate = useNavigate();

  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  // Register form state
  const [registerData, setRegisterData] = useState({
    fullName: '',
    occupation: '',
    college: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const handleRegisterChange = (e) => {
    const { id, value } = e.target;
    setRegisterData(prev => ({ ...prev, [id]: value }));
  };

  const handleLoginChange = (e) => {
    const { id, value } = e.target;
    setLoginData(prev => ({ ...prev, [id]: value }));
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const { fullName, occupation, college, email, password, confirmPassword } = registerData;

    if (!fullName || !occupation || !college || !email || !password || !confirmPassword) {
      toast.error("Please fill out all fields.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      const response = await axios.post('http://localhost:4000/add-register', registerData);
      if (response.status === 201 || response.status === 200) {
        toast.success("Registration successful!");
        setRegisterData({
          fullName: '', occupation: '', college: '', email: '', password: '', confirmPassword: ''
        });
        setShowRegister(false);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Registration failed.");
    }
  };

const handleLoginSubmit = async (e) => {
  e.preventDefault();
  const { email, password } = loginData;

  if (!email || !password) {
    toast.error("Please enter both email and password.");
    return;
  }

  try {
    const response = await axios.post('http://localhost:4000/login', { email, password });

    if (response.status === 200 && response.data.success) {
      toast.success("Login successful!");

      // ✅ Save email in localStorage
      localStorage.setItem('loggedUser', JSON.stringify({ email }));

      setLoginData({ email: '', password: '' });
      setShowLogin(false);
      navigate('/Dashboard'); // Navigate to Dashboard on success
    } else {
      toast.error(response.data.message || "Invalid email or password.");
    }
  } catch (error) {
    console.error(error);
    toast.error(error.response?.data?.message || "Login failed.");
  }
};



  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Navbar */}
      <Navbar collapseOnSelect expand="lg" className="navbar border-dark" style={{ fontWeight: "800", backgroundColor: "coral", position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000 }}>
        <Container>
          <Navbar.Brand className="fs-4 text-light">RESULT ANALYSER</Navbar.Brand>
          <Navbar.Toggle className="bg-light border-dark" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link href="#About">ABOUT</Nav.Link>
              <Nav.Link href="#Teambehind">TEAM BEHIND</Nav.Link>
              <Nav.Link href="#Features">FEATURES</Nav.Link>
              <Nav.Link href="#Contact">CONTACT</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Home Section */}
      <div className="home-bg" style={{ paddingTop: "80px", backgroundColor: "#333", color: "white" }}>
        <div className="container text-center mt-5">
          <h1 style={{ fontWeight: "800", fontSize: "3rem" }}>KTU B.TECH RESULT ANALYSER</h1>
          <div className="mx-auto my-2" style={{ width: "50px", height: "5px", backgroundColor: "coral" }}></div>
          <h5 className="mt-3">
KTU B.Tech Result Analyser gives you a detailed analysis of the results of regular examinations published by APJ Abdul Kalam Technological University.</h5>

          <div className="d-flex justify-content-center gap-3 mt-4 flex-wrap">
            <Button
              style={{ backgroundColor: "white", color: "coral", border: "2px solid coral", fontWeight: "bold" }}
              onMouseEnter={e => { e.target.style.backgroundColor = "coral"; e.target.style.color = "white"; }}
              onMouseLeave={e => { e.target.style.backgroundColor = "white"; e.target.style.color = "coral"; }}
              onClick={() => setShowLogin(true)}
            >LOGIN TO EXPLORE</Button>

            <Button
              style={{ backgroundColor: "coral", color: "white", border: "2px solid coral", fontWeight: "bold" }}
              onMouseEnter={e => { e.target.style.backgroundColor = "white"; e.target.style.color = "coral"; }}
              onMouseLeave={e => { e.target.style.backgroundColor = "coral"; e.target.style.color = "white"; }}
              onClick={() => setShowRegister(true)}
            >REGISTER NOW</Button>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div id="About" className="container-fluid pt-5" style={{ backgroundColor: "coral", color: "white", height: "90vh" }}>
        <div className="container text-center pt-5">
          <h1>We've got what you need!</h1>
          <div className="mx-auto my-2" style={{ width: "50px", height: "5px", backgroundColor: "white" }}></div>
          <h5 className="mt-3 text-justify">We process the results published by the university and organize it in a suitable way so that one can derive helpful information from it. The analysed data is suitable for colleges and faculties to analyse how they performed with respect to others. Data is analysed so that we can take measures based on the quantitative figures which are proofs rather than rumours.

.</h5>
          <Button className="mt-4 p-3 rounded-5 fw-bold" variant="light" href="#Teambehind">TEAM BEHIND!</Button>
        </div>
      </div>

      {/* Team Section */}
      <div id="Teambehind" className="container mt-5 mb-5">
        <h1 className="text-center">Team Behind</h1>
        <div className="d-flex justify-content-center"><div style={{ width: "50px", height: "5px", backgroundColor: "coral" }}></div></div>
        <div className="row mt-5">
          <div className="col-md-6 text-center">
            <img className="img-fluid w-75" src={jecimage} alt="JECC" />
          </div>
          <div className="col-md-6 text-center">
            <img className="img-fluid w-50 mb-3" src={tbiimage} alt="TBI" />
            <img className="img-fluid w-75" src={jyothihead} alt="Jyothi" />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="Features" className="container-fluid mt-5 mb-5">
        <div className="row">
          {[firstimage, secondimage, thirdimage, fourthimage, fifthimage, sixthimage].map((img, index) => (
            <div key={index} className="col-md-4 mb-3">
              <img className="img-fluid w-100" src={img} alt={`feature-${index + 1}`} />
            </div>
          ))}
        </div>
        <div className="bg-black text-white py-5 text-center">
          <h1 className="fs-1">Register now to explore!</h1>
          <h5>We respect the privacy of your data.</h5>
          <Button className="mt-3 bg-light text-dark fw-bold" onClick={() => setShowRegister(true)}>Register</Button>
        </div>
      </div>

      {/* Contact Section */}
      <div id="Contact" className="container mt-5 mb-5">
        <h1 className="text-center">Let's Get In Touch!</h1>
        <div className="d-flex justify-content-center"><div style={{ width: "50px", height: "5px", backgroundColor: "coral" }}></div></div>
        <h5 className="mt-3 text-justify">The analysed data may not be 100% perfect. The data is extracted from PDF files published by Abdul Kalam Technological University. Format of the PDF files changes and hence the scripts are modified accordingly. There are chances for bugs and it may reduce the accuracy of the data analysed. We take all our efforts to provide you accurate information. If you find any issues in the data displayed we request you to help us in resolving them.</h5>
        <div className="text-center mt-4">
          <FontAwesomeIcon icon={faEnvelope} className="fs-1 shadow" />
          <p className="fs-4 text-warning mt-2">tbi@jecc.ac.in</p>
        </div>
      </div>

      {/* Register Modal */}
      <Modal show={showRegister} onHide={() => setShowRegister(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Register to explore KTU Result Analyser</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleRegisterSubmit}>
            <div className="mb-3">
              <label htmlFor="fullName" className="form-label">Full Name</label>
              <input type="text" className="form-control" id="fullName" value={registerData.fullName} onChange={handleRegisterChange} />
            </div>
            <div className="mb-3">
              <label htmlFor="occupation" className="form-label">Occupation</label>
              <select className="form-select" id="occupation" value={registerData.occupation} onChange={handleRegisterChange}>
                <option value="" disabled>Select your occupation</option>
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="principal">Principal</option>
                <option value="parents">Parents</option>
                <option value="administration">Administration</option>
                <option value="manager">Manager</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="mb-3">
              <label htmlFor="college" className="form-label">Associated College</label>
              <input type="text" className="form-control" id="college" value={registerData.college} onChange={handleRegisterChange} />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email ID</label>
              <input type="email" className="form-control" id="email" value={registerData.email} onChange={handleRegisterChange} />
            </div>
            <div className="row mb-3">
              <div className="col">
                <label htmlFor="password" className="form-label">Password</label>
                <input type="password" className="form-control" id="password" value={registerData.password} onChange={handleRegisterChange} />
              </div>
              <div className="col">
                <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                <input type="password" className="form-control" id="confirmPassword" value={registerData.confirmPassword} onChange={handleRegisterChange} />
              </div>
            </div>
            <div className="d-flex justify-content-end">
              <Button type="submit" style={{ backgroundColor: "coral", border: "none", fontWeight: "bold", padding: "6px 20px", borderRadius: "20px" }}>
                REGISTER
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* Login Modal */}
      <Modal show={showLogin} onHide={() => setShowLogin(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Login</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleLoginSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email ID</label>
              <input type="email" className="form-control" id="email" value={loginData.email} onChange={handleLoginChange} />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input type="password" className="form-control" id="password" value={loginData.password} onChange={handleLoginChange} />
            </div>
           
           <div className="d-flex justify-content-end flex-column align-items-end mt-3">
  <Button
    type="submit"
    style={{
      backgroundColor: "coral",
      border: "none",
      fontWeight: "bold",
      padding: "6px 20px",
      borderRadius: "20px",
    }}
  >
    LOGIN
  </Button>

  {/* Forgot Password Link */}
  <button
    className="btn btn-link mt-2 p-0"
    style={{
      color: "blue",
      fontWeight: "500",
      fontSize: "0.9rem",
    }}
  >
 <Link to={'/Forgot'}>   Forgot your password?</Link>
  </button>
</div>

          </form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default Home;
