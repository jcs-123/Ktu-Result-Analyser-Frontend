import React, { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Button, Nav } from 'react-bootstrap';
import jec from '../assets/jec.png';
import { Link } from 'react-router-dom';
import Disclaimer from './Disclaimer';
import Credits from './Credits';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartBar,
  faChevronLeft,
  faChevronRight,
  faFileExcel,
  faGem,
  faRightFromBracket,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';
function Dashboard() {
    const [expanded, setExpanded] = useState(true);

    const toggleSidebar = () => {
        setExpanded(!expanded);
    };
    return (
        <div>
            <div className="d-flex" >
                {/* Sidebar */}
                <div
                className={`sidebar ${expanded ? 'expanded' : 'collapsed'} d-flex flex-column text-white`}
                style={{
                  width: expanded ? '280px' : '80px',
                  minHeight: '100vh',
                  transition: 'all 0.3s ease',
                  backgroundColor: 'CORAL',
                  padding: '1rem 0.5rem'
                }}
              >
                {/* Header with toggle button */}
                <div className="sidebar-header d-flex justify-content-between align-items-center mb-4 px-2">
                  {expanded && <h2 className="m-0 fs-5 fw-bold">RESULT ANALYSER</h2>}
                  <Button 
                    variant="link" 
                    onClick={toggleSidebar}
                    className="p-0 text-white"
                    aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
                  >
                    {expanded ? (
                      <FontAwesomeIcon icon={faChevronLeft} />
                    ) : (
                      <FontAwesomeIcon icon={faChevronRight} />
                    )}
                  </Button>
                </div>
              
                {/* Logo */}
                <div className="sidebar-logo text-center mb-4 px-2">
                  <img 
                    src={jec} 
                    alt="College Logo" 
                    className="img-fluid" 
                    style={{ maxWidth: expanded ? '180px' : '50px' }}
                  />
                </div>
              
                {/* Navigation Items */}
                <Nav className="sidebar-nav flex-column flex-grow-1 px-2">
                  <Nav.Item className="nav-item mb-2">
                    <Nav.Link as={Link} to="/Dashboard" className="text-white d-flex align-items-center">
                      <FontAwesomeIcon icon={faChartBar} className="nav-icon" />
                      {expanded && <span className="ms-3">OVERALL</span>}
                    </Nav.Link>
                  </Nav.Item>
                  
                  <Nav.Item className="nav-item mb-2">
                    <Nav.Link as={Link} to="/Analysis2019" className="text-white d-flex align-items-center">
                      <FontAwesomeIcon icon={faFileExcel} className="nav-icon" />
                      {expanded && <span className="ms-3">RESULT ANALYSER</span>}
                    </Nav.Link>
                  </Nav.Item>
                   
             <Nav.Item className="mb-2">
  <Nav.Link as="div" className="text-white d-flex align-items-center">
    <FontAwesomeIcon icon={faTriangleExclamation} />
    {expanded && <span className="ms-3"><Disclaimer /></span>}
  </Nav.Link>
</Nav.Item>

<Nav.Item className="mb-2">
  <Nav.Link as="div" className="text-white d-flex align-items-center">
    <FontAwesomeIcon icon={faGem} />
    {expanded && <span className="ms-3"><Credits /></span>}
  </Nav.Link>
</Nav.Item>

                    
                    <Nav.Item className="nav-item">
                      <Nav.Link as={Link} to="/" className="text-white d-flex align-items-center">
                        <FontAwesomeIcon icon={faRightFromBracket} className="nav-icon" />
                        {expanded && <span className="ms-3">LOGOUT</span>}
                      </Nav.Link>
                    </Nav.Item>
              
                 
                </Nav>
             
                </div>

                {/* Main content */}
                <div className="p-4 flex-grow-1">
                  {/* Main content */}
<div className="p-4 flex-grow-1 bg-light">
  <h1 className="fw-bold text-uppercase">
    KTU B.TECH <span className="text-warning">Result Analyser</span>
  </h1>
  <p className="fw-semibold text-dark">
    OVERALL RESULT ANALYSIS AVAILABLE FOR THE FOLLOWING:
  </p>
  <p className="text-danger fw-semibold">
    Since the university has updated the results of <strong>S8 (2019 Batch)</strong>,
    we have revised the analysis. Please email your suggestions to <a href="mailto:jcs@jecc.ac.in">jcs@jecc.ac.in</a>
  </p>
{/* 
  <div className="table-responsive mt-4">
    <table className="table table-bordered table-hover bg-white">
      <thead className="table-dark">
        <tr>
          <th>Analysis of</th>
          <th>Semester</th>
          <th>Admitted Batch</th>
          <th>Updated on</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="text-primary">B.Tech S2 (R) Exam May 2019</td>
          <td>Sem - 2</td>
          <td>2018</td>
          <td>24 Aug, 2019</td>
        </tr>
        <tr>
          <td className="text-primary">B.Tech S4 (R) Exam May 2019</td>
          <td>Sem - 4</td>
          <td>2017</td>
          <td>15 Aug, 2019</td>
        </tr>
        <tr>
          <td className="text-primary">B.Tech S6 (R) Exam May 2019</td>
          <td>Sem - 6</td>
          <td>2016</td>
          <td>30 Jul, 2019</td>
        </tr>
        <tr>
          <td className="text-primary">B.Tech S8 Exam May 2019</td>
          <td>Sem - 8</td>
          <td>2015</td>
          <td>17 Jul, 2019</td>
        </tr>
        <tr>
          <td className="text-primary">B.Tech S7 Exam Dec 2018</td>
          <td>Sem - 7</td>
          <td>2015</td>
          <td>04 May, 2019</td>
        </tr>
        <tr>
          <td className="text-primary">B.Tech S3 (R,S) Exam Dec 2018</td>
          <td>Sem - 3</td>
          <td>2017</td>
          <td>01 May, 2019</td>
        </tr>
        <tr>
          <td className="text-primary">B.Tech S5 Examination Dec 2018</td>
          <td>Sem - 5</td>
          <td>2016</td>
          <td>29 Apr, 2019</td>
        </tr>
        <tr>
          <td className="text-primary">B.Tech S1 Examination Dec 2018</td>
          <td>Sem - 1</td>
          <td>2018</td>
          <td>17 Apr, 2019</td>
        </tr>
      </tbody>
    </table>
  </div> */}
</div>

                </div>
            </div>
        </div>
    )
}

export default Dashboard
