import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

function Credits() {
  const [lgShow, setLgShow] = useState(false);

  return (
    <div>
      <span
        onClick={() => setLgShow(true)}
        style={{ cursor: 'pointer', fontWeight: 'bold' }}
      >
        CREDITS
      </span>

      <Modal
        size="lg"
        show={lgShow}
        onHide={() => setLgShow(false)}
        aria-labelledby="credits-modal"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="credits-modal">
            CREDITS
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <h5 className="mb-3 fw-bold">Result Analyser Tool</h5>
          <p className="mb-2">
            Developed by the Technical Team at <strong>Jyothi Engineering College</strong>, Cheruthuruthy.
          </p>
          <p className="text-muted small">
            For any queries or feedback, please contact <a href="mailto:tbi@jecc.ac.in">jcs@jecc.ac.in</a>
          </p>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default Credits;
