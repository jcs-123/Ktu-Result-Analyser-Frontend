import React, { useState } from 'react'
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
function Disclaimer() {
    const [smShow, setSmShow] = useState(false);
    const [lgShow, setLgShow] = useState(false);
    return (
        <div>
            <span onClick={() => setLgShow(true)}>DISCLAIMER</span>


            <Modal
                size="sm"
                show={smShow}
                onHide={() => setSmShow(false)}
                aria-labelledby="example-modal-sizes-title-sm"
            >
                <Modal.Header closeButton>
                    <Modal.Title id="example-modal-sizes-title-sm">
                        Small Modal
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>...</Modal.Body>
            </Modal>
            <Modal
                size="lg"
                show={lgShow}
                onHide={() => setLgShow(false)}
                aria-labelledby="example-modal-sizes-title-lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title id="example-modal-sizes-title-lg">
                        DISCLAIMER
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <h4>No warranties</h4>
                    <p style={{ fontSize: "12px" }}>This application is provided “as is” without any representations or warranties, express or implied. Jyothi Engineering College (JECC) makes no representations or warranties in relation to this application or the information and materials provided on this application.

                        Without prejudice to the generality of the foregoing paragraph, JECC does not warrant that:<br></br>
                        *  this application will be constantly available, or available at all; or<br></br>
                        *  the information on this application is complete, true, accurate or non-misleading.<br></br>
                        Nothing on this application constitutes, or is meant to constitute, advice of any kind.</p>
                    <h4>Limitations of liability</h4>
                    <p style={{ fontSize: "12px" }}> JECC will not be liable to you (whether under the law of contract, the law of torts or otherwise) in relation to the contents of, or use of, or otherwise in connection with, this application:
                        <br></br>
                        * [to the extent that the application is provided free-of-charge, for any direct loss;]<br></br>
                        * for any indirect, special or consequential loss; or<br></br>
                        * for any business losses, loss of revenue, income, profits or anticipated savings, loss of contracts or business relationships, loss of reputation or goodwill, or loss or corruption of information or data.<br></br>
                        These limitations of liability apply even if JECC has been expressly advised of the potential loss.</p>
                    <h4>Exceptions</h4>
                    <p style={{ fontSize: "12px" }}>
                        Nothing in this application disclaimer will exclude or limit any warranty implied by law that it would be unlawful to exclude or limit; and nothing in this application disclaimer will exclude or limit JECC's liability in respect of any:
                        <br></br>
                        * death or personal injury caused by JECC's negligence;<br></br>
                        * fraud or fraudulent misrepresentation on the part of JECC; or<br></br>
                        * matter which it would be illegal or unlawful for JECC to exclude or limit, or to attempt or purport to exclude or limit, its liability.
                    </p>
                    <h4>Other parties</h4>
                    <p style={{ fontSize: "12px" }}>You accept that, JECC has an interest in limiting the personal liability of its stakeholders and employees. You agree that you will not bring any claim personally against JECC's stakeholders or employees in respect of any losses you suffer in connection with the application.
                        Without prejudice to the foregoing paragraph, you agree that the limitations of warranties and liability set out in this application disclaimer will protect JECC's stakeholders, employees, subsidiaries, successors, assigns and sub-contractors as well as JECC</p>

                    <h4>Reasonableness</h4>
                    <p style={{ fontSize: "12px" }}>By using this application, you agree that the exclusions and limitations of liability set out in this application disclaimer are reasonable. If you do not think they are reasonable, you must not use this application.</p>

                    <h4>Unenforceable provisions</h4>
                    <p style={{ fontSize: "12px" }}> </p>
                </Modal.Body>

            </Modal>

        </div>
    )
}

export default Disclaimer