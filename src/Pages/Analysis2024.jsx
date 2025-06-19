import React, { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Button, Nav } from 'react-bootstrap';
import jec from '../assets/jec.png';
import { Link } from 'react-router-dom';
import { faFileExcel, faGem, faRightFromBracket, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Disclaimer from './Disclaimer';
import Credits from './Credits';
function Analysis2024() {
    const [expanded, setExpanded] = useState(true);

    const toggleSidebar = () => {
        setExpanded(!expanded);
    };
    return (
        <div> <div className="d-flex" >
            {/* Sidebar */}

            <div
                id='sidebar'
                className={` text-white p-3 ${expanded ? 'sidebar-expanded' : 'sidebar-collapsed'}`}
                style={{
                    width: expanded ? '250px' : '60px',
                    minHeight: '100vh',
                    transition: 'width 0.3s ease',
                    left: '0'

                }}
            >
                <div className="d-flex justify-content-between align-items-center mb-4">
                    {expanded && <span className="fs-5 text-center fw-bold text-light">RESULT ANALYSER</span>}
                    <Button
                        variant="outline-light"
                        size="sm"
                        onClick={toggleSidebar}
                        className="border-0"

                    >
                        {expanded ? '←' : '→'}
                    </Button>
                </div>

                <Nav className="flex-column">

                    <div>
                        <img className='img-fluid w-75 ' src={jec} alt="" />
                    </div>
                    <Nav.Link href="" className="text-white mb-1 d-flex align-items-center mt-2">
                        <i className="bi bi-graph-up"></i>
                        <Link to={'/Dashboard'} style={{ textDecoration: "none", color: "white" }}> {expanded && <span className="ms-2">OVERALL</span>}
                        </Link>
                    </Nav.Link>
                    <Nav.Link href="" className="text-white mb-1 d-flex align-items-center">
                        <FontAwesomeIcon icon={faFileExcel} />
                        <Link to={'/Analysis2015'} style={{ textDecoration: "none", color: "white" }}>       {expanded && <span className="ms-2">INDIVIDUAL 2015 SCHEME</span>}
                        </Link>
                    </Nav.Link>
                    <Nav.Link href="" className="text-white mb-1 d-flex align-items-center">
                        <FontAwesomeIcon icon={faFileExcel} />
                        <Link to={'/Analysis2019'} style={{ textDecoration: "none", color: "white" }}>   {expanded && <span className="ms-2">INDIVIDUAL 2019 SCHEME</span>}
                        </Link>
                    </Nav.Link>

                    <Nav.Link href="" className="text-white mb-1 d-flex align-items-center">
                        <FontAwesomeIcon icon={faFileExcel} />
                        <Link to={'/Analysis2024'} style={{ textDecoration: "none", color: "white" }}>     {expanded && <span className="ms-2">INDIVIDUAL 2024 SCHEME</span>}
                        </Link>
                    </Nav.Link>
                    <Nav.Link href="" className="text-white mb-1 d-flex align-items-center">
                        <FontAwesomeIcon icon={faTriangleExclamation} />
                        {expanded && <span className="ms-2"><Disclaimer /></span>}

                    </Nav.Link>
                    <Nav.Link href="" className="text-white mb-1 d-flex align-items-center">
                        <FontAwesomeIcon icon={faGem} />
                        {expanded && <span className="ms-2"><Credits /></span>}
                    </Nav.Link>
                    <Nav.Link href="" className="text-white mb-1 d-flex align-items-center">
                        <FontAwesomeIcon icon={faRightFromBracket} />
                        {expanded && <span className="ms-2">LOGOUT</span>}
                    </Nav.Link>
                </Nav>
            </div>

            {/* Main content */}
            <div className="p-4 flex-grow-1">
                <div className='row mt-5'>
                    <div className='col-md-12 d-md-inline d-none '>
                        <h1 className='text-center ' style={{ fontSize: "5rem", fontWeight: "900" }}>KTU B.Tech <span style={{ color: "coral" }}>Result Analyser</span></h1>
                        <h6 className='text-center'>2024 Scheme INDIVIDUAL RESULT ANALYSIS - GENERATE INDIVIDUAL EXCEL REPORT FROM THE RESULT PDF FILE</h6>
                        <div className='text-center mt-5'>

                            <button className='p-2 rounded shadow w-75 text-center'>
                                <label className='fs-2' htmlFor="fileupload">
                                    Click here to upload result file pubished by ktu
                                </label>
                            </button>


                            <input id='fileupload' style={{ display: "none" }} className='w-100 p-3 rounded text-center' type="file" placeholder='Click here to upload result file pubished by ktu' />
                        </div>
                        <div className='mt-5'>
                            <p className='text-danger text-center '>NB: If you find any issues with the generated excel file please report to tbi@jecc.ac.in so that it will be helpful for us to maintain this application.</p>
                        </div>
                        <div>
                            <h3 className='text-center'>Disclaimer!</h3>
                            <p style={{ textAlign: "justify" }}>The analysis depends upon the structure of the PDF Result File provided by KTU. If you find any issues with the analysed excel file please
                                report to <a href="">tbi@jecc.ac.in.</a> Always verify the results generated. Subject with NA or Absent instead of
                                grade is considered as an arrear. This application is not suitable for Reevaluation results. SGPA
                                calculated according to the KTU <a href="">2024 Regulations..</a> Please check the grade points on page 8 of the
                                regulations</p>

                        </div>
                    </div>


                    <div className='col-md-12 d-md-none'>
                        <h1 className='text-center fs-1 text-bold' >KTU B.Tech <span style={{ color: "coral" }}>Result Analyser</span></h1>
                        <h6 className='text-center'>2024 Scheme INDIVIDUAL RESULT ANALYSIS - GENERATE INDIVIDUAL EXCEL REPORT FROM THE RESULT PDF FILE</h6>
                        <div className='text-center mt-5'>

                            <button className='p-2 rounded shadow w-75 text-center'>
                                <label className='fs-2' htmlFor="fileupload">
                                    Click here to upload result file pubished by ktu
                                </label>
                            </button>


                            <input id='fileupload' style={{ display: "none" }} className='w-100 p-3 rounded text-center' type="file" placeholder='Click here to upload result file pubished by ktu' />
                        </div>
                        <div className='mt-5'>
                            <p className='text-danger text-center '>NB: If you find any issues with the generated excel file please report to tbi@jecc.ac.in so that it will be helpful for us to maintain this application.</p>
                        </div>
                        <div>
                            <h3 className='text-center'>Disclaimer!</h3>
                            <p style={{ textAlign: "justify" }}>The analysis depends upon the structure of the PDF Result File provided by KTU. If you find any issues with the analysed excel file please
                                report to <a href="">tbi@jecc.ac.in.</a> Always verify the results generated. Subject with NA or Absent instead of
                                grade is considered as an arrear. This application is not suitable for Reevaluation results. SGPA
                                calculated according to the KTU <a href="">2024 Regulations..</a> Please check the grade points on page 8 of the
                                regulations</p>

                        </div>
                    </div>
                </div>
            </div>
        </div></div>
    )
}

export default Analysis2024