import React, { useState, useEffect } from 'react';
import { Button, Nav, Table, Spinner, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ExcelJS from 'exceljs';import {
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
import { toast, ToastContainer } from 'react-toastify';

function Analysis2015() {
  const [expanded, setExpanded] = useState(true);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [data, setData] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
const [examTitle, setExamTitle] = useState("");

  // subjectCode -> { department: string, semester: string, credit: number }
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
    PASS: 5.5,
    F: 0,
    FE: 0,
    I: 0,
    Absent: 0,
    Withheld: 0,
  };

  // ===== Register number parser: JEC20CE034 -> {college:'JEC', year:'20', dept:'CE', roll:'034'}
  const parseRegisterNumber = (regNoRaw) => {
    if (!regNoRaw || typeof regNoRaw !== 'string') return null;
    const regNo = regNoRaw.trim().toUpperCase();
    // COLLEGE(3 letters) + YEAR(2 digits) + DEPT(2–3 letters) + ROLL(3–5 digits)
    const re = /^(?<college>[A-Z]{3})(?<year>\d{2})(?<dept>[A-Z]{2,3})(?<roll>\d{3,5})$/i;
    const m = regNo.match(re);
    if (!m || !m.groups) return null;
    const { college, year, dept, roll } = m.groups;
    return {
      college: (college || '').toUpperCase(),
      year: (year || '').padStart(2, '0'),
      dept: (dept || '').toUpperCase(),
      roll: roll || '',
      raw: regNo,
    };
  };
  // =====

  // Fetch subject meta data including credits & department
useEffect(() => {
  async function fetchSubjects() {
    // Helper: builds lookup map with optional "addShortCodes" control
    const buildLookupMap = (subjects, addShortCodes = true) => {
      const map = {};
      subjects.forEach(({ SUBJECTCODE, SUBJETCODE, DEP, SEM, CREDIT }) => {
        const code = String(SUBJECTCODE || SUBJETCODE || "").toUpperCase().trim();
        if (!code) return;

        const meta = {
          department: DEP?.toUpperCase() || "UNKNOWN",
          semester: SEM?.toUpperCase() || "0",
          credit: Number(CREDIT) || 0,
        };

        // Always store full code
        map[code] = meta;

        // Optionally add last-4 version
        if (addShortCodes) {
          const shortCode = code.slice(-4);
          map[shortCode] = meta;
        }
      });
      return map;
    };

    try {
      console.log("📡 Fetching main subject metadata (/depdata)...");
      const resMain = await fetch("https://ktu-resuly-analyser-backend.onrender.com/depdata");
      if (!resMain.ok) throw new Error(`Main API ${resMain.status}`);
      const mainData = await resMain.json();

      let finalMap = {};
      if (Array.isArray(mainData) && mainData.length > 0) {
        // ✅ Build map from full subject codes only (no short codes here)
        finalMap = buildLookupMap(mainData, false);
        console.log(`✅ Loaded ${Object.keys(finalMap).length} subjects from main API`);
      }

      // If main API returned empty data → fallback completely
      if (Object.keys(finalMap).length === 0) {
        throw new Error("Main API returned empty or invalid data");
      }

      // ✅ Now fetch fallback and add short-code mappings only
      try {
        console.log("🔁 Fetching fallback subject metadata (/getelsecredict)...");
        const resElse = await fetch("http://localhost:4000/getelsecredict");
        if (!resElse.ok) throw new Error(`Fallback API ${resElse.status}`);
        const elseData = await resElse.json();

        if (Array.isArray(elseData) && elseData.length > 0) {
          const elseMap = buildLookupMap(elseData, true);
          let added = 0;

          // Add only short-code entries from fallback if not already in main
          for (const [code, info] of Object.entries(elseMap)) {
            // Only process codes that are exactly 4 chars (short)
            if (code.length === 4 && !finalMap[code]) {
              finalMap[code] = info;
              added++;
            }
          }
          console.log(`✅ Added ${added} short-code subjects from fallback`);
        } else {
          console.warn("⚠️ Fallback API returned no valid data");
        }
      } catch (fallbackErr) {
        console.warn("⚠️ Fallback fetch skipped:", fallbackErr.message);
      }

      // ✅ Final subject map ready
      setSubjectCodeToDept(finalMap);
      console.log(`📘 Final subject map size: ${Object.keys(finalMap).length}`);
    } catch (err) {
      console.error("❌ Failed to fetch subject metadata:", err.message);
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
  if (!parsedContent || typeof parsedContent !== "string" || parsedContent.trim() === "")
    return [];

  // 🧹 Clean up hidden unicode characters and merge wrapped lines
  const cleanText = parsedContent
    .replace(/\u00A0|\u200B|\r/g, " ")          // remove hidden chars
    .replace(/,\s*\n/g, ", ")                   // join lines split after commas
    .replace(/\s+/g, " ")                       // normalize spaces
    .trim();

  const studentData = [];
  const regNoPattern = /([A-Z]{3}\d{2}[A-Z]{2,3}\d{3,5})/gi;
  const chunks = cleanText.split(regNoPattern).filter(Boolean);

  // 🚀 Loop through register–data pairs
  for (let i = 0; i < chunks.length; i++) {
    const maybeReg = chunks[i].trim();
    if (!/^[A-Z]{3}\d{2}[A-Z]{2,3}\d{3,5}$/i.test(maybeReg)) continue;

    const studentId = maybeReg.toUpperCase();
    const subjectsPart = (chunks[i + 1] || "").trim();
    const studentObj = { studentId };

    // 🎯 Match subjects like PCCET205(F), UCHUT128(PASS), GCESL218(A+)
    const subjectGradeRegex =
      /([A-Z]{2,6}\d{2,5})\s*\(\s*([A-Z]{1,3}\+?|PASS|P|ABSENT|WITHHELD|FAIL)\s*\)/gi;

    let sg;
    while ((sg = subjectGradeRegex.exec(subjectsPart)) !== null) {
      const subjectCode = sg[1].replace(/\s+/g, "").toUpperCase();
      const grade = sg[2].toUpperCase().trim();
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
      const response = await fetch('https://ktu-resuly-analyser-backend.onrender.com/revision2015', {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache', // Ensure fresh data
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server responded with status ${response.status}: ${response.statusText}`);
      }

      const jsonData = await response.json();

      const contentKeys = ['parsedContent', 'parsedcontent', 'data', 'content'];
      for (const key of contentKeys) {
        if (jsonData[key] !== undefined && jsonData[key] !== null) {
          localStorage.setItem('lastFetchedData', JSON.stringify(jsonData[key]));
          return jsonData[key];
        }
      }

      const cachedData = localStorage.getItem('lastFetchedData');
      if (cachedData) {
        console.warn('Using cached data as fallback');
        return JSON.parse(cachedData);
      }

      throw new Error('No valid data found in response');
    } catch (error) {
      console.error('Fetch error:', error);

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

    const { title, centre } = extractExamInfo(rawContent);
setExamTitle(title);
setExamCentre(centre);


      const parsedData = parseContentString(rawContent);

      if (!parsedData || parsedData.length === 0) {
        setErrorMessage('No data parsed');
        setData(null);
        return;
      }

      setData(parsedData);
    } catch (err) {
      setErrorMessage(err.message);
      setData(null);
      setExamCentre('Exam Centre: Not Found');
    } finally {
      setLoadingData(false);
    }
  };

 // Extract both exam title and exam centre
const extractExamInfo = (raw) => {
  if (!raw) return { title: "Exam Title: Not Found", centre: "Exam Centre: Not Found" };

  let title = "Exam Title: Not Found";
  let centre = "Exam Centre: Not Found";

  // 🧠 Find the first full exam title line like “B.Tech S2 (R) Exam May 2025 (2024 Scheme) (S2 Result)”
  const titlePattern = /(B\.?Tech.*?\(S\d.*?\))/i;
  const titleMatch = raw.match(titlePattern);
  if (titleMatch) title = titleMatch[1].trim();

  // 🏫 Find exam centre / college line
  const centrePatterns = [
    /Exam\s*Centre:\s*(.+)/i,
    /Examination\s*Center:\s*(.+)/i,
    /Center:\s*(.+)/i,
    /College:\s*(.+)/i,
  ];
  for (const pattern of centrePatterns) {
    const match = raw.match(pattern);
    if (match) {
      centre = match[1].trim();
      break;
    }
  }

  return { title, centre };
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
    return ['F', 'FE', 'RA', 'I', 'ABSENT', 'WITHHELD'].includes(String(grade).toUpperCase());
  };

  const [semesterCredits, setSemesterCredits] = useState({}); // { 'AD_S3': 23 }
  useEffect(() => {
    const fetchSemCredits = async () => {
      try {
        const res = await fetch('https://ktu-resuly-analyser-backend.onrender.com/getcredict');
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

        const credits = await res.json();

        if (!Array.isArray(credits)) {
          throw new Error('Expected an array of credits');
        }

        const map = {};
        credits.forEach(({ DEP, SEM, TOTALCREDIT }) => {
          if (DEP && SEM) {
            const key = `${String(DEP).toUpperCase()}_${String(SEM).toUpperCase()}`;
            const credit = Number(TOTALCREDIT);
            if (!isNaN(credit)) {
              map[key] = credit;
            }
          }
        });

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
    console.error("❌ Missing required data for SGPA calculation");
    return {};
  }

  const result = {};

  students.forEach((student) => {
    let department = "";
    let semester = "";
    let found = false;

    // 1️⃣ Detect department & semester
    for (const [code, grade] of Object.entries(student)) {
      if (code === "studentId") continue;
      const normCode = String(code).toUpperCase();
      const info = subjectCodeToDept[normCode] || subjectCodeToDept[normCode.slice(-4)];
      if (info?.department && info?.semester) {
        department = info.department.toUpperCase();
        semester = info.semester.toUpperCase().replace(/^S/, "");
        found = true;
        break;
      }
    }

    // 2️⃣ Fallback from register number
    if (!found) {
      const parsed = parseRegisterNumber(student.studentId);
      department = parsed?.dept?.toUpperCase() || "UNKNOWN";
      semester = "0";
    }

    const semesterKey = `${department}_S${semester}`;
    const totalSemesterCredits = Number(semesterCreditMap[semesterKey]) || 0;

    let totalGradePoints = 0;
    let totalCredits = 0;
    let hasFail = false; // ✅ Track failures

    // 3️⃣ Calculate (Ci × Gi)
    for (const [code, grade] of Object.entries(student)) {
      if (code === "studentId") continue;
      const normCode = String(code).toUpperCase();

      const info = subjectCodeToDept[normCode] || subjectCodeToDept[normCode.slice(-4)];
      if (!info) continue;

      const subjectDept = info.department.toUpperCase();
      const subjectSem = info.semester.toUpperCase().replace(/^S/, "");
      if (subjectDept !== department || subjectSem !== semester) continue;

      const credit = Number(info.credit) || 0;
      const gp = gradePointsMap[String(grade || "").toUpperCase()];
      if (gp === undefined || isNaN(credit) || credit <= 0) continue;

      // ✅ If failed subject found → mark as fail
      if (gp === 0) {
        hasFail = true;
      }

      totalGradePoints += gp * credit;
      totalCredits += credit;
    }

    // 4️⃣ Compute SGPA
    if (hasFail) {
      // ❌ Any failed subject = SGPA = 0.00 (KTU rule)
      result[student.studentId] = "0.00";
    } else if (totalCredits === 0) {
      result[student.studentId] = "N/A";
    } else {
      const sgpa = totalGradePoints / totalCredits;
      result[student.studentId] = sgpa.toFixed(2);
    }
  });

  console.log("✅ SGPA calculated for", Object.keys(result).length, "students");
  return result;
};



  // Department-wise flattening
  // NOW groups by department parsed from REGISTER NUMBER (primary), subject metadata is secondary
  const getDepartmentWiseData = () => {
    if (!data) return {};

    const deptData = {};

    data.forEach((student) => {
      // Primary department = from register number
      const regParsed = parseRegisterNumber(student.studentId);
      const regDept = (regParsed?.dept || 'UNKNOWN').toUpperCase();

      Object.entries(student).forEach(([key, grade]) => {
        if (key === 'studentId') return;

        const subjectCode = String(key).toUpperCase();
        const deptInfo = subjectCodeToDept[subjectCode] || {};

        // Keep subject department if needed, but GROUP by regDept
        const credit = deptInfo.credit || '-';
        const arrear = isArrear(grade);
        const groupKey = regDept; // <-- This ensures accurate dept-wise separation by register number

        if (!deptData[groupKey]) deptData[groupKey] = [];

        deptData[groupKey].push({
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

  // Export Excel with Dept & Roll included (derived from register no.)
// Export Excel with 3 bold, centered headings (merged cells). No Dept/Roll columns.




const exportDepartmentWiseExcel = async () => {
  if (!data || data.length === 0) {
    alert("No data available to export");
    return;
  }

  // === Workbook setup ===
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "KTU Result Analyser";
  workbook.created = new Date();

  const getCollegeName = () => {
    const raw = (examCentre || "").toString().trim();
    const cleaned = raw.replace(/^(Exam\s*Centre:|Examination\s*Center:|Center:|College:)\s*/i, "").trim();
    return cleaned || "College: N/A";
  };

  // 🎨 === Consistent professional color palette ===
  const COLORS = {
    BLUE: "305496",       // Deep KTU blue
    GREEN: "70AD47",      // Performance header green
    ORANGE: "ED7D31",     // Section header orange
    GOLD: "FFD966",       // Department title gold
    SILVER: "E7E6E6",     // Background gray
    RED: "FF0000",        // Highlight red
    WHITE: "FFFFFF",      // Text white
    BLACK: "000000"       // Border black
  };

  // === Styles ===
  const styles = {
    headerPrimary: {
      font: { name: "Calibri", size: 16, bold: true, color: { argb: COLORS.WHITE } },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.BLUE } },
      alignment: { horizontal: "center", vertical: "middle" },
      border: { top: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" }, bottom: { style: "thin" } }
    },
    headerSecondary: {
      font: { name: "Calibri", size: 14, bold: true, color: { argb: COLORS.WHITE } },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.GREEN } },
      alignment: { horizontal: "center", vertical: "middle" },
      border: { top: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" }, bottom: { style: "thin" } }
    },
    headerTertiary: {
      font: { name: "Calibri", size: 12, bold: true, color: { argb: COLORS.BLACK } },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.GOLD } },
      alignment: { horizontal: "center", vertical: "middle" },
      border: { top: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" }, bottom: { style: "thin" } }
    },
    sectionHeader: {
      font: { name: "Calibri", size: 11, bold: true, color: { argb: COLORS.WHITE } },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.ORANGE } },
      alignment: { horizontal: "center", vertical: "middle" },
      border: { top: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" }, bottom: { style: "thin" } }
    },
    tableHeader: {
      font: { name: "Calibri", size: 10, bold: true, color: { argb: COLORS.WHITE } },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.BLUE } },
      alignment: { horizontal: "center", vertical: "middle", wrapText: true },
      border: { top: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" }, bottom: { style: "thin" } }
    },
    dataCell: {
      font: { name: "Calibri", size: 9 },
      alignment: { horizontal: "center", vertical: "middle" },
      border: { top: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" }, bottom: { style: "thin" } }
    },
    highlightCell: {
      font: { name: "Calibri", size: 9, bold: true, color: { argb: COLORS.RED } },
      alignment: { horizontal: "center", vertical: "middle" },
      border: { top: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" }, bottom: { style: "thin" } }
    },
    metricCell: {
      font: { name: "Calibri", size: 10, bold: true },
      alignment: { horizontal: "center", vertical: "middle" },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.SILVER } },
      border: { top: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" }, bottom: { style: "thin" } }
    }
  };

  // ===== DEPARTMENT-WISE SHEETS =====
  Object.entries(getDepartmentWiseData()).forEach(([deptName, records]) => {
    const ws = workbook.addWorksheet(deptName.slice(0, 31));
    let row = 1;

    // Map students
    const studentMap = {};
    const subjectSet = new Set();
    records.forEach(({ studentId, subjectCode, grade, arrear }) => {
      if (!studentMap[studentId]) {
        studentMap[studentId] = { "Register No": studentId, SGPA: studentSgpas?.[studentId] || "-", Arrears: 0 };
      }
      studentMap[studentId][subjectCode] = grade;
      if (arrear) studentMap[studentId].Arrears += 1;
      subjectSet.add(subjectCode);
    });

    const subjects = Array.from(subjectSet).sort();
    const cols = ["Register No", ...subjects, "SGPA", "Arrears"];

    // === Headers ===
    const merged = (text, style) => {
      ws.mergeCells(row, 1, row, cols.length);
      ws.getCell(row, 1).value = text;
      Object.assign(ws.getCell(row, 1), style);
      row++;
    };

    merged("KTU RESULT ANALYSER", styles.headerPrimary);
    merged(examTitle || "Exam Title", styles.headerSecondary);
    merged(`Department: ${deptName}`, styles.headerTertiary);
    merged(getCollegeName(), styles.headerTertiary);
    row++;

    // === Student Table ===
    const headerRow = ws.getRow(row);
    cols.forEach((c, i) => {
      headerRow.getCell(i + 1).value = c;
      Object.assign(headerRow.getCell(i + 1), styles.tableHeader);
    });
    row++;

    Object.values(studentMap).forEach((s) => {
      const r = ws.getRow(row);
      cols.forEach((c, i) => {
        const v = s[c] ?? "-";
        r.getCell(i + 1).value = v;
        if (c === "Arrears" && v > 0) Object.assign(r.getCell(i + 1), styles.highlightCell);
        else if (isArrear(v)) Object.assign(r.getCell(i + 1), styles.highlightCell);
        else Object.assign(r.getCell(i + 1), styles.dataCell);
      });
      row++;
    });
    row++;

    // === Performance Analysis ===
    const perf = (() => {
      const total = Object.keys(studentMap).length;
      let pass = 0,
        fail = 0;
      const gCount = { S: 0, "A+": 0, A: 0, "B+": 0, B: 0, "C+": 0, C: 0, D: 0, P: 0, F: 0, FE: 0 };
      Object.values(studentMap).forEach((s) => {
        let arrear = false;
        subjects.forEach((sub) => {
          const g = s[sub];
          if (isArrear(g)) arrear = true;
          if (gCount[g] !== undefined) gCount[g]++;
        });
        arrear ? fail++ : pass++;
      });
      return { total, pass, fail, percent: ((pass / total) * 100).toFixed(2), gCount };
    })();

    merged("PERFORMANCE ANALYSIS", styles.sectionHeader);

    [
      ["Pass Percentage", `${perf.percent}%`],
      ["Total Students", perf.total],
      ["Total Passed", perf.pass],
      ["Total Failed", perf.fail]
    ].forEach(([label, val]) => {
      ws.getCell(row, 1).value = label;
      ws.getCell(row, 2).value = val;
      Object.assign(ws.getCell(row, 1), styles.metricCell);
      Object.assign(ws.getCell(row, 2), styles.metricCell);
      row++;
    });
    row++;


    // === Subject-wise Analysis ===
    merged("SUBJECT-WISE ANALYSIS", styles.sectionHeader);
    const subCols = ["SubCode", "PassPercent", "Pass", "Fail", "S", "A+", "A", "B+", "B", "C+", "C", "D", "P", "F", "FE"];

    const subHeader = ws.getRow(row);
    subCols.forEach((c, i) => {
      subHeader.getCell(i + 1).value = c;
      Object.assign(subHeader.getCell(i + 1), styles.tableHeader);
    });
    row++;

    const subData = {};
    records.forEach(({ subjectCode, grade }) => {
      if (!subData[subjectCode])
        subData[subjectCode] = { pass: 0, fail: 0, grades: Object.fromEntries(subCols.slice(4).map((x) => [x, 0])) };
      if (isArrear(grade)) subData[subjectCode].fail++;
      else subData[subjectCode].pass++;
      if (subData[subjectCode].grades[grade] !== undefined) subData[subjectCode].grades[grade]++;
    });

    Object.entries(subData).forEach(([sub, stat]) => {
      const tot = stat.pass + stat.fail;
      const passP = tot ? ((stat.pass / tot) * 100).toFixed(2) : "0";
      const r = ws.getRow(row);
      const vals = [
        sub,
        passP,
        stat.pass,
        stat.fail,
        ...subCols.slice(4).map((g) => stat.grades[g] ?? 0)
      ];
      vals.forEach((v, i) => {
        r.getCell(i + 1).value = v;
        Object.assign(r.getCell(i + 1), styles.dataCell);
      });
      row++;
    });

    ws.columns = cols.map(() => ({ width: 12 }));
  });

  // === Save file ===
  const buf = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const safeName = `${(examTitle || "KTU_Result").replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, "_")}_${getCollegeName()
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .replace(/\s+/g, "_")}_Full_Report.xlsx`;
  saveAs(blob, safeName);

  // Optional upload
  try {
    const file = new File([blob], safeName, { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const formData = new FormData();
    formData.append("excelFile", file);
    await axios.post("https://ktu-resuly-analyser-backend.onrender.com/exceldownload", formData);
  } catch (err) {
    console.error("Excel upload failed:", err);
  }
};

// Helper function for overall summary sheet
const addOverallSummarySheet = async (workbook, collegeName) => {
  const worksheet = workbook.addWorksheet('OVERALL SUMMARY');
  
  let currentRow = 1;

  // Main Title
  worksheet.mergeCells(currentRow, 1, currentRow, 15);
  worksheet.getCell(currentRow, 1).value = 'KTU RESULT ANALYSER - OVERALL SUMMARY';
  Object.assign(worksheet.getCell(currentRow, 1), styles.headerPrimary);
  currentRow++;

  // College Name
  worksheet.mergeCells(currentRow, 1, currentRow, 15);
  worksheet.getCell(currentRow, 1).value = collegeName;
  Object.assign(worksheet.getCell(currentRow, 1), styles.headerSecondary);
  currentRow += 2;

  // Add your overall summary content here following the same pattern...
  // You can reuse the performance analysis and subject-wise analysis logic

  worksheet.columns = new Array(15).fill({ width: 12 });
};




  // Add near the top with other useState declarations
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [newSubject, setNewSubject] = useState({
    DEP: '',
    SEM: '',
    SUBJETCODE: '',
    SUBJECT: '',
    CREDIT: '',
  });

  const handleAddSubject = async () => {
    try {
      // Normalize data
      const postData = {
        DEP: String(newSubject.DEP || '').trim().toUpperCase(),
        SEM: String(newSubject.SEM || '').trim().toUpperCase(),
        SUBJETCODE: String(newSubject.SUBJETCODE || '').trim().toUpperCase(),
        SUBJECT: String(newSubject.SUBJECT || '').trim(),
        CREDIT: Math.max(0, Math.min(10, Number(newSubject.CREDIT) || 0)),
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
        body: JSON.stringify(postData),
      });

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
      setSubjectCodeToDept((prev) => ({
        ...prev,
        [postData.SUBJETCODE]: {
          department: postData.DEP,
          semester: postData.SEM,
          credit: postData.CREDIT,
          subject: postData.SUBJECT,
        },
      }));

      setNewSubject({ DEP: '', SEM: '', SUBJETCODE: '', SUBJECT: '', CREDIT: '' });
      setShowAddSubjectModal(false);
      toast.success('Subject added successfully!');
    } catch (error) {
      console.error('Error:', error);
      toast.error(`Error: ${error.message}`);
    }
  };
  const computePerformanceAnalysis = () => {
  if (!data) return null;

  let totalStudents = data.length;
  let totalPassed = 0;
  let totalFailed = 0;
  const gradeCount = {
    S: 0, 'A+': 0, A: 0, 'B+': 0, B: 0,
    'C+': 0, C: 0, D: 0, P: 0, F: 0, FE: 0
  };

  data.forEach((student) => {
    let hasArrear = false;
    Object.entries(student).forEach(([sub, grade]) => {
      if (sub === "studentId") return;
      if (isArrear(grade)) {
        hasArrear = true;
      }
      if (gradeCount[grade] !== undefined) {
        gradeCount[grade] += 1;
      }
    });

    if (hasArrear) totalFailed++;
    else totalPassed++;
  });

  const passPercentage = ((totalPassed / totalStudents) * 100).toFixed(2);

  return { totalStudents, totalPassed, totalFailed, passPercentage, gradeCount };
};
const computeSubjectWiseAnalysis = () => {
  if (!data) return [];

  const subjectStats = {};

  data.forEach((student) => {
    Object.entries(student).forEach(([sub, grade]) => {
      if (sub === "studentId") return;
      if (!subjectStats[sub]) {
        subjectStats[sub] = {
          pass: 0,
          fail: 0,
          grades: { S:0,'A+':0,A:0,'B+':0,B:0,'C+':0,C:0,D:0,P:0,F:0,FE:0 }
        };
      }
      if (isArrear(grade)) {
        subjectStats[sub].fail++;
      } else {
        subjectStats[sub].pass++;
      }
      if (subjectStats[sub].grades[grade] !== undefined) {
        subjectStats[sub].grades[grade]++;
      }
    });
  });

  // Convert into array with Pass %
  return Object.entries(subjectStats).map(([sub, stats]) => {
    const total = stats.pass + stats.fail;
    const passPercent = total > 0 ? ((stats.pass / total) * 100).toFixed(2) : "0";
    return {
      subCode: sub,
      passPercent,
      pass: stats.pass,
      fail: stats.fail,
      ...stats.grades,
    };
  });
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
          padding: '1rem 0.5rem',
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
            {expanded ? <FontAwesomeIcon icon={faChevronLeft} /> : <FontAwesomeIcon icon={faChevronRight} />}
          </Button>
        </div>

        {/* Logo */}
        <div className="sidebar-logo text-center mb-4 px-2">
          <img src={jec} alt="College Logo" className="img-fluid" style={{ maxWidth: expanded ? '180px' : '50px' }} />
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
            INDIVIDUAL RESULT ANALYSIS - Generate Individual Excel Report from PDF
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

              {/* Add Subject Modal */}
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
                        onChange={(e) => setNewSubject({ ...newSubject, DEP: e.target.value.toUpperCase() })}
                        placeholder="AD"
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Semester (e.g., S5)</Form.Label>
                      <Form.Control
                        type="text"
                        value={newSubject.SEM}
                        onChange={(e) => setNewSubject({ ...newSubject, SEM: e.target.value.toUpperCase() })}
                        placeholder="S5"
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Subject Code (e.g., CST309)</Form.Label>
                      <Form.Control
                        type="text"
                        value={newSubject.SUBJETCODE}
                        onChange={(e) => setNewSubject({ ...newSubject, SUBJETCODE: e.target.value.toUpperCase() })}
                        placeholder="CST309"
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Subject Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={newSubject.SUBJECT}
                        onChange={(e) => setNewSubject({ ...newSubject, SUBJECT: e.target.value })}
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
                        onChange={(e) => setNewSubject({ ...newSubject, CREDIT: parseInt(e.target.value) })}
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
                 <div className="d-flex justify-content-between align-items-center mb-3">
    <div className="text-center flex-grow-1">
     <h5 className="fw-bold text-primary">{examTitle}</h5>
<h6 className="fw-bold text-dark">{examCentre}</h6>
<h5 className="fw-bold mt-2">Department-wise Report</h5>

    </div>

    {/* ✅ Excel Button */}
    <div>
      <Button className="btn-success ms-3" onClick={exportDepartmentWiseExcel}>
        <FontAwesomeIcon icon={faFileExcel} /> Download Excel
      </Button>
    </div>
  </div>

             {Object.entries(deptGroupedData).map(([deptName, records]) => {
  const subjectCodes = Array.from(new Set(records.map((r) => r.subjectCode))).sort();

  const studentMap = {};
  records.forEach(({ studentId, subjectCode, grade }) => {
    if (!studentMap[studentId]) studentMap[studentId] = {};
    studentMap[studentId][subjectCode] = grade;
  });

  // === Department-specific performance analysis ===
  const computeDeptPerformance = () => {
    let totalStudents = Object.keys(studentMap).length;
    let totalPassed = 0, totalFailed = 0;
    const gradeCount = { S:0,'A+':0,A:0,'B+':0,B:0,'C+':0,C:0,D:0,P:0,F:0,FE:0 };

    Object.values(studentMap).forEach((grades) => {
      let hasArrear = false;
      Object.values(grades).forEach((g) => {
        if (isArrear(g)) hasArrear = true;
        if (gradeCount[g] !== undefined) gradeCount[g] += 1;
      });
      if (hasArrear) totalFailed++; else totalPassed++;
    });

    const passPercentage = totalStudents > 0 
      ? ((totalPassed / totalStudents) * 100).toFixed(2) 
      : "0";

    return { totalStudents, totalPassed, totalFailed, passPercentage, gradeCount };
  };

  const computeDeptSubjectAnalysis = () => {
    const subjectStats = {};
    records.forEach(({ subjectCode, grade }) => {
      if (!subjectStats[subjectCode]) {
        subjectStats[subjectCode] = {
          pass: 0, fail: 0,
          grades: { S:0,'A+':0,A:0,'B+':0,B:0,'C+':0,C:0,D:0,P:0,F:0,FE:0 }
        };
      }
      if (isArrear(grade)) subjectStats[subjectCode].fail++;
      else subjectStats[subjectCode].pass++;
      if (subjectStats[subjectCode].grades[grade] !== undefined) {
        subjectStats[subjectCode].grades[grade]++;
      }
    });

    return Object.entries(subjectStats).map(([sub, stats]) => {
      const total = stats.pass + stats.fail;
      const passPercent = total > 0 ? ((stats.pass / total) * 100).toFixed(2) : "0";
      return { subCode: sub, passPercent, pass: stats.pass, fail: stats.fail, ...stats.grades };
    });
  };

  const perf = computeDeptPerformance();
  const subjects = computeDeptSubjectAnalysis();

  return (
    <div key={deptName} className="mb-5">
      <h6 className="fw-bold text-primary mb-2">{deptName}</h6>

      {/* Department-wise Report Table */}
      <div className="table-responsive">
        <Table striped bordered hover size="sm" className="table-sm small text-center align-middle text-nowrap">
          <thead className="table-secondary">
            <tr>
              <th className="text-start">Register No</th>
              {subjectCodes.map((code) => (<th key={code}>{code}</th>))}
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

      {/* Performance Analysis (Dept-specific) */}
      <div className="mt-3">
        <h6 className="fw-bold text-success text-center">Performance Analysis</h6>
        <Table striped bordered hover size="sm" className="text-center align-middle">
          <tbody>
            <tr><td>Pass Percentage</td><td>{perf.passPercentage}%</td></tr>
            <tr><td>Total Students</td><td>{perf.totalStudents}</td></tr>
            <tr><td>Total Passed</td><td>{perf.totalPassed}</td></tr>
            <tr><td>Total Failed</td><td>{perf.totalFailed}</td></tr>
          </tbody>
        </Table>

       
      </div>

      {/* Subject-wise Analysis (Dept-specific) */}
      <div className="mt-3">
        <h6 className="fw-bold text-info text-center">Subject-wise Analysis</h6>
        <Table striped bordered hover size="sm" className="text-center align-middle text-nowrap">
          <thead className="table-secondary">
            <tr>
              <th>SubCode</th><th>Pass %</th><th>Pass</th><th>Fail</th>
              <th>S</th><th>A+</th><th>A</th><th>B+</th><th>B</th>
              <th>C+</th><th>C</th><th>D</th><th>P</th><th>F</th><th>FE</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((s) => (
              <tr key={s.subCode}>
                <td>{s.subCode}</td>
                <td>{s.passPercent}</td>
                <td>{s.pass}</td>
                <td>{s.fail}</td>
                <td>{s.S}</td>
                <td>{s["A+"]}</td>
                <td>{s.A}</td>
                <td>{s["B+"]}</td>
                <td>{s.B}</td>
                <td>{s["C+"]}</td>
                <td>{s.C}</td>
                <td>{s.D}</td>
                <td>{s.P}</td>
                <td>{s.F}</td>
                <td>{s.FE}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
})}

              </div>
{/* === PERFORMANCE ANALYSIS SECTION === */}
{(() => {
  const perf = computePerformanceAnalysis();
  if (!perf) return null;
  return (
    <div className="mt-5">
      <h5 className="fw-bold text-center text-success">
        PERFORMANCE ANALYSIS OF REGULAR STUDENTS
      </h5>

      {/* Summary Table */}
      <Table striped bordered hover size="sm" className="text-center align-middle">
        <tbody>
          <tr><td>Pass Percentage</td><td>{perf.passPercentage}%</td></tr>
          <tr><td>Total Students</td><td>{perf.totalStudents}</td></tr>
          <tr><td>Total Passed</td><td>{perf.totalPassed}</td></tr>
          <tr><td>Total Failed</td><td>{perf.totalFailed}</td></tr>
        </tbody>
      </Table>

      {/* Grade Distribution */}
      <h6 className="fw-bold mt-3">Grade Distribution</h6>
      <div className="table-responsive">
        <Table striped bordered size="sm" className="text-center align-middle text-nowrap">
          <thead className="table-secondary">
            <tr>
              {Object.keys(perf.gradeCount).map((g) => (
                <th key={g}>{g}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {Object.values(perf.gradeCount).map((c, i) => (
                <td key={i}>{c}</td>
              ))}
            </tr>
          </tbody>
        </Table>
      </div>
    </div>
  );
})()}

{/* === SUBJECT-WISE ANALYSIS SECTION === */}
{(() => {
  const subjects = computeSubjectWiseAnalysis();
  if (!subjects.length) return null;
  return (
    <div className="mt-5">
      <h5 className="fw-bold text-center text-info">
        SUBJECT-WISE ANALYSIS - REGULAR STUDENTS
      </h5>
      <div className="table-responsive">
        <Table striped bordered hover size="sm" className="text-center align-middle text-nowrap">
          <thead className="table-secondary">
            <tr>
              <th>SubCode</th>
              <th>Pass %</th>
              <th>Pass</th>
              <th>Fail</th>
              <th>S</th>
              <th>A+</th>
              <th>A</th>
              <th>B+</th>
              <th>B</th>
              <th>C+</th>
              <th>C</th>
              <th>D</th>
              <th>P</th>
              <th>F</th>
              <th>FE</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((s) => (
              <tr key={s.subCode}>
                <td>{s.subCode}</td>
                <td>{s.passPercent}</td>
                <td>{s.pass}</td>
                <td>{s.fail}</td>
                <td>{s.S}</td>
                <td>{s["A+"]}</td>
                <td>{s.A}</td>
                <td>{s["B+"]}</td>
                <td>{s.B}</td>
                <td>{s["C+"]}</td>
                <td>{s.C}</td>
                <td>{s.D}</td>
                <td>{s.P}</td>
                <td>{s.F}</td>
                <td>{s.FE}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
})()}

              {/* <div className="alert alert-success mt-3 text-center">
                <h5>Analysis completed successfully!</h5>
                <p>Total records processed: {data.length}</p>
                <Button className="mt-3" onClick={exportDepartmentWiseExcel}>
                  <FontAwesomeIcon icon={faFileExcel} /> Download Department-wise Excel Report
                </Button>
              </div> */}
            </>
          )}

          <div className="mt-5 text-danger small text-center">
            NB:  If you find any issues with the generated excel file please Report issues to <a href="mailto:jcs@jecc.ac.in">jcs@jecc.ac.in</a> so that it will be helpful for us to maintain this application.
          </div>

          <div className="mt-4">
            <h4 className="text-center">Disclaimer</h4>
            <p style={{ textAlign: 'justify' }}>
              The analysis depends upon the structure of the PDF Result File provided by KTU. If you find any issues with
              the analysed excel file please report to <a href="">jcs@jecc.ac.in.</a> Always verify the results generated.
              Subject with NA or Absent instead of grade is considered as an arrear. This application is not suitable for
              Reevaluation results. SGPA calculated according to the KTU . Please check the grade points on page 8 of the
              regulations
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analysis2015;
