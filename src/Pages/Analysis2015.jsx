import React, { useState, useEffect } from 'react';
import { Button, Nav, Table, Spinner, Modal  } from 'react-bootstrap';
import {  Link } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
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
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import jec from '../assets/jec.png';
import Disclaimer from './Disclaimer';
import Credits from './Credits';
import axios from 'axios';
import { toast,ToastContainer } from 'react-toastify';

function Analysis2015() {
  const [expanded, setExpanded] = useState(true);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [data, setData] = useState(null);
  const [loadingData, setLoadingData] = useState(false);

  // subjectCode -> { department: string, credit: number }
  const [subjectCodeToDept, setSubjectCodeToDept] = useState({});

  const toggleSidebar = () => setExpanded(!expanded);

  // Grade to grade point mapping for SGPA calculation
const gradePointsMap = {
  S: 10,
  'A+': 9,
  A: 8.5,
  'B+': 8,
  B: 7.5,
  'C+': 7,
  C: 6.5,
  D: 6,
  P: 5.5,
  F: 0,
  FE: 0,
  I: 0,
   Absent: 0 ,
   Withheld:0,
};

  // Fetch subject meta data including credits & department
useEffect(() => {
  async function fetchSubjects() {
    try {
      const response = await fetch('https://ktu-resuly-analyser-backend.onrender.com/depdata');
      const subjects = await response.json();

      const lookup = {};
      subjects.forEach(({ SUBJETCODE, DEP, SEM, CREDIT }) => {
        // Ensure all keys are uppercase for consistent lookup
        const code = SUBJETCODE.toUpperCase();
        lookup[code] = {
          department: DEP || 'Unknown',
          semester: SEM || '0', // Default to 0 if missing
          credit: Number(CREDIT) || 0,
        };
      });
      setSubjectCodeToDept(lookup);
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
    }
  }
  fetchSubjects();
}, []);
  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setErrorMessage(null);
    }
  };

  // Upload PDF and trigger backend parsing
  const handleUpload = async () => {
    if (!uploadedFile) return alert('Please upload a PDF file first.');

    const loggedUser = JSON.parse(localStorage.getItem('loggedUser'));
    const userEmail = loggedUser?.email || 'unknown@gmail.com';

    setUploading(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('filerev2015', uploadedFile);
      formData.append('email', userEmail);

      const response = await fetch('https://ktu-resuly-analyser-backend.onrender.com/upload-rev2015', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error(`Upload failed: ${response.statusText}`);

      // After successful upload, fetch the parsed data
      await fetchParsedData();
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setUploading(false);
    }
  };

  // Parse the multiline string from backend into array of student objects
const parseContentString = (parsedContent) => {
  if (!parsedContent || typeof parsedContent !== 'string' || parsedContent.trim() === '') return [];

  const lines = parsedContent
    .trim()
    .split('\n')
    .map(line => line.trim())
    .filter(line => line !== '');

  const studentData = [];

  // Improved register number regex
  const regNoPattern = /^([A-Z]{0,5}\d{2}[A-Z]{2,3}\d{3,5})/i;

  for (const line of lines) {
    const match = line.match(regNoPattern);
    if (!match) continue;

    const studentId = match[1].toUpperCase();
    const subjectsPart = line.slice(match[0].length).trim();
    const studentObj = { studentId };

    // More accurate subject-grade matching
    const subjectGradeRegex = /([A-Z]{2,4}[0-9]{2,3})\s*\(\s*([A-F][+\-]?)\s*\)/gi;
    let sgMatch;

    while ((sgMatch = subjectGradeRegex.exec(subjectsPart)) !== null) {
      const subjectCode = sgMatch[1].toUpperCase();
      const grade = sgMatch[2].toUpperCase();
      studentObj[subjectCode] = grade;
    }

    if (Object.keys(studentObj).length > 1) {
      studentData.push(studentObj);
    }
  }

  return studentData;
};


  // Fetch raw parsed content from backend (GET /revision2015)
const fetchRawContent = async () => {
  try {
    // 1. Attempt to fetch data from the API
    const response = await fetch('https://ktu-resuly-analyser-backend.onrender.com/revision2015', {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache' // Ensure fresh data
      }
    });

    // 2. Check for successful response
    if (!response.ok) {
      // Try to get error details from response body
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || 
        `Server responded with status ${response.status}: ${response.statusText}`
      );
    }

    // 3. Parse the response data
    const jsonData = await response.json();





    
    // 4. Handle multiple possible response formats
    const contentKeys = ['parsedContent', 'parsedcontent', 'data', 'content'];
    for (const key of contentKeys) {
      if (jsonData[key] !== undefined && jsonData[key] !== null) {
        // Store the data in localStorage as backup
        localStorage.setItem('lastFetchedData', JSON.stringify(jsonData[key]));
        return jsonData[key];
      }
    }

    // 5. If no valid content found, check localStorage
    const cachedData = localStorage.getItem('lastFetchedData');
    if (cachedData) {
      console.warn('Using cached data as fallback');
      return JSON.parse(cachedData);
    }

    // 6. Final fallback
    throw new Error('No valid data found in response');
    
  } catch (error) {
    console.error('Fetch error:', error);
    
    // 7. Comprehensive fallback strategy
    try {
      const cachedData = localStorage.getItem('lastFetchedData');
      if (cachedData) {
        console.warn('Using cached data after fetch failure');
        return JSON.parse(cachedData);
      }
    } catch (e) {
      console.error('Cache parse error:', e);
    }
    
    return '';
  }
};





const [examCentre, setExamCentre] = useState(''); // exam centre name
  // Fetch and parse data from backend
 const fetchParsedData = async () => {
  setLoadingData(true);
  setErrorMessage(null);

  try {
    const rawContent = await fetchRawContent();

    if (!rawContent.trim()) {
      setErrorMessage('No data found');
      setData(null);
      setExamCentre('Exam Centre: Not Found');
      return;
    }

    // ✅ Extract Exam Centre before parsing the full content
    const extractedExamCentre = extractExamCentre(rawContent);
    setExamCentre(extractedExamCentre);

    const parsedData = parseContentString(rawContent);

    if (!parsedData || parsedData.length === 0) {
      setErrorMessage('No data parsed');
      setData(null);
      return;
    }

    setData(parsedData); // ✅ this is your student table data
  } catch (err) {
    setErrorMessage(err.message);
    setData(null);
    setExamCentre('Exam Centre: Not Found');
  } finally {
    setLoadingData(false);
  }
};
const extractExamCentre = (raw) => {
  if (!raw) return 'Exam Centre: Not Found';

  const patterns = [
    /Exam\s*Centre:\s*(.+)/i,
    /Examination\s*Center:\s*(.+)/i,
    /Center:\s*(.+)/i,
    /College:\s*(.+)/i,
  ];

  for (const pattern of patterns) {
    const match = raw.match(pattern);
    if (match) return ` ${match[1].trim()}`;
  }

  return 'Exam Centre: Not Found';
};


  // Clear file and data
  const handleClear = () => {
    setUploadedFile(null);
    setData(null);
    setErrorMessage(null);
    const fileInput = document.getElementById('fileupload');
    if (fileInput) fileInput.value = null;
  };

  // Utility to check if a grade is an arrear (failed)
const isArrear = (grade) => {
  if (!grade) return false;
  return ['F', 'FE', 'RA', 'I', 'ABSENT','Withheld'].includes(grade.toUpperCase());
};

  const [semesterCredits, setSemesterCredits] = useState({}); // { 'AD_S3': 23 }
useEffect(() => {
  const fetchSemCredits = async () => {
    try {
      const res = await fetch('https://ktu-resuly-analyser-backend.onrender.com/getcredict');
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

      const credits = await res.json();

      if (!Array.isArray(credits)) {
        throw new Error("Expected an array of credits");
      }

      const map = {};
      credits.forEach(({ DEP, SEM, TOTALCREDIT }) => {
        if (DEP && SEM) {
          const key = `${DEP}_${SEM}`;
          const credit = Number(TOTALCREDIT);
          if (!isNaN(credit)) {
            map[key] = credit;
          }
        }
      });

      console.log("✅ Mapped Semester Credits:", map);
      setSemesterCredits(map);
    } catch (err) {
      console.error('❌ Failed to fetch semester credits:', err.message);
    }
  };

  fetchSemCredits();
}, []);


  
  // Calculate SGPA for each student from their grades & credits
  // Return object { studentId: string, sgpa: string }
const calculateSGPAs = (students, subjectCodeToDept, semesterCreditMap) => {
  if (!Array.isArray(students) || !subjectCodeToDept || !semesterCreditMap) {
    console.error('Missing required data for SGPA calculation');
    return {};
  }

  const result = {};

  students.forEach((student) => {
    let department = '';
    let semester = '';
    let found = false;

    // Extract department & semester from subject info
    for (const [code, grade] of Object.entries(student)) {
      if (code === 'studentId') continue;
      const info = subjectCodeToDept[code.toUpperCase()];
      if (info?.department && info?.semester) {
        department = info.department;
        semester = info.semester.replace(/^S/, ''); // remove 'S'
        found = true;
        break;
      }
    }

    // Fallback to ID
    if (!found) {
      const idParts = student.studentId.match(/JEC(\d{2})([A-Z]{2})/);
      department = idParts?.[2] || 'UNKNOWN';
      semester = '0'; // fallback unknown semester
    }

    const semesterKey = `${department}_S${semester}`;
    const totalSemesterCredits = semesterCreditMap[semesterKey];

    if (!totalSemesterCredits || totalSemesterCredits <= 0) {
      console.warn(`❌ No semester credits found for ${semesterKey}`);
      result[student.studentId] = 'N/A';
      return;
    }

    let totalGradePoints = 0;
    let creditsAccounted = 0;

    for (const [code, grade] of Object.entries(student)) {
      if (code === 'studentId') continue;

      const info = subjectCodeToDept[code.toUpperCase()];
      if (!info) {
        // console.warn(`⚠️ Subject info not found for ${code}`);
        continue;
      }

      // Match only same department + semester
      const isSameSem = info.semester.replace(/^S/, '') === semester;
      if (info.department !== department || !isSameSem) continue;

      const credit = Number(info.credit) || 0;
      const gradePoint = gradePointsMap[grade?.toUpperCase()];
      if (gradePoint === undefined) {
        // console.warn(`⚠️ Invalid grade "${grade}" for ${code}`);
        continue;
      }

      totalGradePoints += gradePoint * credit;
      creditsAccounted += credit;
    }

    if (creditsAccounted === 0) {
      result[student.studentId] = 'N/A';
      // console.warn(`⚠️ No valid subjects for ${student.studentId}`);
    } else {
      const sgpa = totalGradePoints / totalSemesterCredits;
      result[student.studentId] = sgpa.toFixed(2);
    }

    console.debug('SGPA Calculation:', {
      studentId: student.studentId,
      department,
      semester,
      semesterKey,
      totalSemesterCredits,
      totalGradePoints,
      calculatedSGPA: result[student.studentId]
    });
  });

  return result;
};

  // Get department wise flattened data for table display
  // Output: { [departmentName]: [{ studentId, subjectCode, grade, credit, arrear }] }
  const getDepartmentWiseData = () => {
    if (!data) return {};

    const deptData = {};

    data.forEach((student) => {
      Object.entries(student).forEach(([key, grade]) => {
        if (key === 'studentId') return;

        const subjectCode = key;
        const deptInfo = subjectCodeToDept[subjectCode] || {};
        const department = deptInfo.department || 'Unknown Department';
        const credit = deptInfo.credit || '-';
        const arrear = isArrear(grade);

        if (!deptData[department]) deptData[department] = [];

        deptData[department].push({
          studentId: student.studentId,
          subjectCode,
          grade,
          credit,
          arrear,
        });
      });
    });

    return deptData;
  };
const deptGroupedData = getDepartmentWiseData();
const studentSgpas = calculateSGPAs(data, subjectCodeToDept, semesterCredits);

  // Export Excel with arrear and SGPA included

const exportDepartmentWiseExcel = async () => {
  if (!data || data.length === 0) {
    alert('No data available to export');
    return;
  }

  const workbook = XLSX.utils.book_new();
  const deptData = getDepartmentWiseData();

  Object.entries(deptData).forEach(([deptName, records]) => {
    const studentMap = {};
    const subjectSet = new Set();

    records.forEach(({ studentId, subjectCode, grade, arrear }) => {
      if (!studentMap[studentId]) {
        studentMap[studentId] = {
          'Register No': studentId,
          SGPA: studentSgpas[studentId] || '-',
          Arrears: 0,
        };
      }

      studentMap[studentId][subjectCode] = grade;
      if (arrear) studentMap[studentId].Arrears += 1;
      subjectSet.add(subjectCode);
    });

    const allSubjects = Array.from(subjectSet).sort();

    const sheetData = Object.values(studentMap).map((student) => {
      allSubjects.forEach((subject) => {
        if (!(subject in student)) {
          student[subject] = '-';
        }
      });
      return student;
    });

    const columns = ['Register No', ...allSubjects, 'SGPA', 'Arrears'];

    // Insert exam centre as top row manually
    const centreRow = [[examCentre || 'Exam Centre: UNKNOWN']];
    const headerRow = [columns];
    const dataRows = sheetData.map((row) => columns.map((col) => row[col]));
    const fullSheetData = [...centreRow, [], ...headerRow, ...dataRows];

    const worksheet = XLSX.utils.aoa_to_sheet(fullSheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, deptName.substring(0, 31));
  });

  const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  // File name using exam centre (sanitize filename)
  const safeExamName = (examCentre || 'KTU_Result').replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '_');
  const filename = `${safeExamName}_DeptWise_Results.xlsx`;

  // Save locally
  saveAs(blob, filename);

  // Upload to backend
  const file = new File([blob], filename, {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const formData = new FormData();
  formData.append('excelFile', file);

  try {
    await axios.post('https://ktu-resuly-analyser-backend.onrender.com/exceldownload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  } catch (error) {
    console.error('Excel upload failed:', error);
  }
};

// Add near the top with other useState declarations
const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
const [newSubject, setNewSubject] = useState({
  DEP: '',
  SEM: '',
  SUBJETCODE: '',
  SUBJECT: '',
  CREDIT: ''
});

const handleAddSubject = async () => {
  try {
    // Normalize data
    const postData = {
      DEP: String(newSubject.DEP || '').trim().toUpperCase(),
      SEM: String(newSubject.SEM || '').trim().toUpperCase(),
      SUBJETCODE: String(newSubject.SUBJETCODE || '').trim().toUpperCase(), // ✅ Fixed typo
      SUBJECT: String(newSubject.SUBJECT || '').trim(),
      CREDIT: Math.max(0, Math.min(10, Number(newSubject.CREDIT) || 0))
    };

    // Basic Validation
    if (!postData.DEP || !postData.SEM || !postData.SUBJETCODE || !postData.SUBJECT) {
     toast.error('All fields are required');
    }

    const response = await fetch('https://ktu-resuly-analyser-backend.onrender.com/add-depdata', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData)
    });

    // Validate JSON response
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Server returned: ${text.slice(0, 100)}...`);
    }

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Request failed');
    }

    // On success
    setSubjectCodeToDept(prev => ({
      ...prev,
      [postData.SUBJETCODE]: {
        department: postData.DEP,
        semester: postData.SEM,
        credit: postData.CREDIT,
        subject: postData.SUBJECT
      }
    }));

    setNewSubject({ DEP: '', SEM: '', SUBJETCODE: '', SUBJECT: '', CREDIT: '' }); // ✅ Fixed key names
    setShowAddSubjectModal(false);
   toast.success('Subject added successfully!');

  } catch (error) {
    console.error('Error:', error);
    toast.error(`Error: ${error.message}`);
  }
};


  return (
    <div className="d-flex ">
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
        {expanded && <span className="ms-3">2019 SCHEME</span>}
      </Nav.Link>
    </Nav.Item>
    
    {/* Footer Items */}
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
        <div className="text-center">
          <h1 className="fw-bold" style={{ fontSize: '3rem' }}>
            KTU B.Tech <span style={{ color: 'coral' }}>Result Analyser</span>
          </h1>
          <p className="mb-4">
            2015 Scheme INDIVIDUAL RESULT ANALYSIS - Generate Individual Excel Report from PDF
          </p>

          <label
            htmlFor="fileupload"
            className="btn btn-primary btn-lg mt-2 mb-3 w-100"
            style={{ cursor: 'pointer' }}
          >
            Click to upload KTU Result PDF
          </label>
          <input
            id="fileupload"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

    {uploadedFile && (
  <div className="mt-3">
    <p>
      <strong>Selected file:</strong> {uploadedFile.name}
    </p>
    <Button onClick={handleUpload} disabled={uploading}>
      {uploading ? (
        <>
          <Spinner animation="border" size="sm" /> Uploading...
        </>
      ) : (
        'Analyze'
      )}
    </Button>
    <Button variant="secondary" className="ms-2 mt-2" onClick={handleClear} disabled={uploading}>
      Clear
    </Button>

   
<Button
  variant="warning"
  className="ms-2 mt-2"
  onClick={() => setShowAddSubjectModal(true)}
>
  Add Unknown Subjects  
</Button>
   {/* Add this Modal just before the final closing </div> */}
<Modal show={showAddSubjectModal} onHide={() => setShowAddSubjectModal(false)}>
  <Modal.Header closeButton>
    <Modal.Title>Add New Subject</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <Form>
      <Form.Group className="mb-3">
        <Form.Label>Department Code (e.g., AD)</Form.Label>
        <Form.Control 
          type="text" 
          value={newSubject.DEP}
          onChange={(e) => setNewSubject({...newSubject, DEP: e.target.value.toUpperCase()})}
          placeholder="AD"
          required
        />
      </Form.Group>
      
      <Form.Group className="mb-3">
        <Form.Label>Semester (e.g., S5)</Form.Label>
        <Form.Control 
          type="text" 
          value={newSubject.SEM}
          onChange={(e) => setNewSubject({...newSubject, SEM: e.target.value.toUpperCase()})}
          placeholder="S5"
          required
        />
      </Form.Group>
      
      <Form.Group className="mb-3">
        <Form.Label>Subject Code (e.g., CST309)</Form.Label>
        <Form.Control 
          type="text" 
          value={newSubject.SUBJETCODE}
          onChange={(e) => setNewSubject({...newSubject, SUBJETCODE: e.target.value.toUpperCase()})}
          placeholder="CST309"
          required
        />
      </Form.Group>
      
      <Form.Group className="mb-3">
        <Form.Label>Subject Name</Form.Label>
        <Form.Control 
          type="text" 
          value={newSubject.SUBJECT}
          onChange={(e) => setNewSubject({...newSubject, SUBJECT: e.target.value})}
          placeholder="MANAGEMENT OF SOFTWARE SYSTEMS"
          required
        />
      </Form.Group>
      
      <Form.Group className="mb-3">
        <Form.Label>Credits</Form.Label>
        <Form.Control 
          type="number" 
          min="0"
          max="10"
          value={newSubject.CREDIT}
          onChange={(e) => setNewSubject({...newSubject, CREDIT: parseInt(e.target.value)})}
          required
        />
      </Form.Group>
    </Form>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowAddSubjectModal(false)}>
      Cancel
    </Button>
    <Button variant="primary" onClick={handleAddSubject}>
      Save Subject
    </Button>
  </Modal.Footer>
</Modal>
            <ToastContainer position="top-right" autoClose={3000} />

  </div>
  
)}

          {errorMessage && <div className="alert alert-danger mt-3">{errorMessage}</div>}

          {loadingData && (
            <div className="mt-4">
              <Spinner animation="border" role="status" />
              <span className="ms-2">Loading parsed data...</span>
            </div>
          )}

  {data && (
  <>
    <div className="mt-4">
      <div className="text-center mb-3">
        <h5 className="fw-bold">{examCentre}</h5>
        <h5 className="fw-bold">Department-wise Report</h5>
      </div>

      {Object.entries(deptGroupedData).map(([deptName, records]) => {
        const subjectCodes = Array.from(
          new Set(records.map((r) => r.subjectCode))
        ).sort();

        const studentMap = {};
        records.forEach(({ studentId, subjectCode, grade }) => {
          if (!studentMap[studentId]) studentMap[studentId] = {};
          studentMap[studentId][subjectCode] = grade;
        });

        return (
          <div key={deptName} className="mb-4">
            <h6 className="fw-bold text-primary mb-2">{deptName}</h6>
            <div className="table-responsive">
              <Table
                striped
                bordered
                hover
                size="sm"
                className="table-sm small text-center align-middle text-nowrap"
              >
                <thead className="table-secondary">
                  <tr>
                    <th className="text-start">Register No</th>
                    {subjectCodes.map((code) => (
                      <th key={code}>{code}</th>
                    ))}
                    <th>SGPA</th>
                    <th>Arrears</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(studentMap).map(([studentId, grades]) => {
                    const arrearCount = Object.values(grades).filter((g) => isArrear(g)).length;

                    return (
                      <tr key={studentId}>
                        <td className="text-start">{studentId}</td>
                        {subjectCodes.map((code) => (
                          <td key={code}>{grades[code] || '-'}</td>
                        ))}
                        <td>{studentSgpas[studentId] || '-'}</td>
                        <td>{arrearCount}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          </div>
        );
      })}
    </div>

    <div className="alert alert-success mt-3 text-center">
      <h5>Analysis completed successfully!</h5>
      <p>Total records processed: {data.length}</p>
      <Button className="mt-3" onClick={exportDepartmentWiseExcel}>
        <FontAwesomeIcon icon={faFileExcel} /> Download Department-wise Excel Report
      </Button>
    </div>
  </>
)}



          <div className="mt-5 text-danger small text-center">
            NB:  If you find any issues with the generated excel file please Report issues to <a href="mailto:tbi@jecc.ac.in">tbi@jecc.ac.in</a> so that it will be helpful for us to maintain this application.
          </div>

          <div className="mt-4">
            <h4 className="text-center">Disclaimer</h4>
             <p style={{ textAlign: "justify" }}>The analysis depends upon the structure of the PDF Result File provided by KTU. If you find any issues with the analysed excel file please
                                    report to <a href="">tbi@jecc.ac.in.</a> Always verify the results generated. Subject with NA or Absent instead of
                                    grade is considered as an arrear. This application is not suitable for Reevaluation results. SGPA
                                    calculated according to the KTU <a href="">2019 Regulations..</a> Please check the grade points on page 8 of the
                                    regulations</p>

          </div>
        </div>
      </div>
   

    </div>
  );
}

export default Analysis2015;
