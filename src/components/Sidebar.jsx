import React from 'react';
import { Nav, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFileExcel, faTriangleExclamation, faGem, faRightFromBracket, faBug, faChevronLeft, faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import { BiBarChart } from 'react-icons/bi';
import jec from '../assets/jec.png';
import Disclaimer from '../Pages/Disclaimer';
import Credits from '../Pages/Credits';

const Sidebar = ({ expanded, toggleSidebar }) => {
  const navItems = [
    { icon: <BiBarChart size={20} />, label: 'OVERALL', path: '/Dashboard' },
    { icon: <FontAwesomeIcon icon={faFileExcel} />, label: 'INDIVIDUAL 2015 SCHEME', path: '/Analysis2015' },
    { icon: <FontAwesomeIcon icon={faFileExcel} />, label: 'INDIVIDUAL 2019 SCHEME', path: '/Analysis2019' },
    { icon: <FontAwesomeIcon icon={faBug} />, label: 'ISSUE TRACKER', path: '/IssueTracker' },
  ];

  return (
    <div
      className={`sidebar d-flex flex-column text-white ${expanded ? 'expanded' : 'collapsed'}`}
      style={{
        width: expanded ? '260px' : '80px',
        minHeight: '100vh',
        transition: 'all 0.3s ease',
        backgroundColor: 'coral',
        padding: '1rem 0.5rem'
      }}
    >
      {/* Header with toggle */}
      <div className="d-flex justify-content-between align-items-center px-2 mb-3">
        {expanded && <h4 className="m-0">RESULT ANALYSER</h4>}
        <Button
          variant="link"
          onClick={toggleSidebar}
          className="text-white p-0"
          aria-label="Toggle sidebar"
        >
          <FontAwesomeIcon icon={expanded ? faChevronLeft : faChevronRight} />
        </Button>
      </div>

      {/* Logo */}
      <div className="text-center mb-4">
        <img
          src={jec}
          alt="Jyothi Engineering College Logo"
          className="img-fluid"
          style={{ maxWidth: expanded ? '160px' : '50px' }}
        />
      </div>

      {/* Nav Links */}
      <Nav className="flex-column px-2">
        {navItems.map(({ icon, label, path }) => (
          <Nav.Link
            as={Link}
            to={path}
            key={label}
            className="text-white d-flex align-items-center mb-2"
          >
            {icon}
            {expanded && <span className="ms-3">{label}</span>}
          </Nav.Link>
        ))}

        {/* Disclaimer */}
        <div className="d-flex align-items-center mb-2">
          <FontAwesomeIcon icon={faTriangleExclamation} />
          {expanded && <div className="ms-3"><Disclaimer /></div>}
        </div>

        {/* Credits */}
        <div className="d-flex align-items-center mb-2">
          <FontAwesomeIcon icon={faGem} />
          {expanded && <div className="ms-3"><Credits /></div>}
        </div>

        {/* Logout */}
        <Nav.Link
          as={Link}
          to="/Logout"
          className="text-white d-flex align-items-center"
        >
          <FontAwesomeIcon icon={faRightFromBracket} />
          {expanded && <span className="ms-3">LOGOUT</span>}
        </Nav.Link>
      </Nav>
    </div>
  );
};

export default Sidebar;
