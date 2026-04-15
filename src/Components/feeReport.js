import { useState } from "react";
import React from "react";
import axiosInstance from "../api/axiosInstance";
import { toast } from "react-toastify";
import Loader from "./Loader";
import jsPDF from "jspdf";
import "jspdf-autotable";

const FeeReport = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [students, setStudents] = useState([]);
  const [grNum, setGrNum] = useState("");
  const [displayStudents, setDisplayStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');

  const handleDate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (startDate && endDate) {
        await axiosInstance.get(
          `/student/feeReport?startDate=${startDate}&endDate=${endDate}`,
          { headers: { "x-auth-token": token } }
        ).then((res) => {
          const sortedData = res.data.data
            .map((student) => ({
              ...student,
              feeStatus: student.feeStatus.sort((a, b) => new Date(a.date) - new Date(b.date))
            }))
            .sort((a, b) => new Date(a.feeStatus[0].date) - new Date(b.feeStatus[0].date));

          setStudents(sortedData);
          setDisplayStudents(sortedData);
          setLoading(false);
          if (sortedData.length === 0) {
            toast.error("No Students Found", { position: toast.POSITION.TOP_CENTER, autoClose: 2000 });
          }
        });
      }
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };

  const handleGrNum = (e) => {
    e.preventDefault();
    if (grNum === "") { setDisplayStudents(students); return; }
    const student = students.filter((s) => s.GRNo == grNum);
    setDisplayStudents(student);
  };

  function convertDate(inputFormat) {
    const pad = (s) => s < 10 ? "0" + s : s;
    const d = new Date(inputFormat);
    return [d.getMonth() + 1, pad(d.getDate()), pad(d.getFullYear())].join("-");
  }

  const formattedStartDate = convertDate(startDate);
  const formattedEndDate = convertDate(endDate);

  const studentCampus = students && students.map(s => s.campus?.[0]);

  const generateAndDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Green Peace School", doc.internal.pageSize.getWidth() / 2, 20, "center");
    doc.text(`Campus: ${studentCampus[0]}`, doc.internal.pageSize.getWidth() / 2, 30, "center");

    const headers = ["GRNo", "Name", "Month", "Status", "Date", "Fee Paid", "Fee Type"];
    const tableData = [];
    let totalFeeReceived = 0;

    displayStudents.forEach(student => {
      const feeDetails = student.feeStatus.filter(status => {
        const paymentDate = status.date && new Date(status.date.split("T")[0]);
        return paymentDate >= new Date(formattedStartDate) && paymentDate <= new Date(formattedEndDate);
      });
      if (feeDetails.length > 0) {
        feeDetails.forEach((detail, index) => {
          totalFeeReceived += parseFloat(detail.feeReceived) || 0;
          tableData.push([
            index === 0 ? student.GRNo : "",
            index === 0 ? student.studentName : "",
            detail.month, detail.status,
            detail.date.split("T")[0],
            detail.feeReceived,
            detail.feeType.join(", ")
          ]);
        });
      }
    });

    doc.autoTable(headers, tableData, {
      startY: 40,
      styles: { fontSize: 10, textAlign: "center" },
      headStyles: { textColor: [0, 0, 0], fontSize: 12, fontStyle: 'bold', fillColor: false },
      margin: { top: 10, right: 5, bottom: 10, left: 5 },
      tableWidth: 'auto',
      columnStyles: { 0: { cellWidth: 20 }, 1: { cellWidth: 30 }, 2: { cellWidth: 22 }, 3: { cellWidth: 30 }, 4: { cellWidth: 35 }, 5: { cellWidth: 30 }, 6: { cellWidth: 'auto' } }
    });
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`Total Fee Received: ${totalFeeReceived}`, doc.internal.pageSize.getWidth() / 2, doc.autoTable.previous.finalY + 20, "center");
    doc.save(`fee_report_${Date.now()}.pdf`);
  };

  return (
    <div className="fr-page">
      {loading && <Loader />}

      {/* Filter Panel */}
      <div className="fr-filter-card">
        <div className="fr-filter-header">
          <h3 className="fr-title">Fee Report</h3>
          <p className="fr-subtitle">Filter payments by date range</p>
        </div>
        <form onSubmit={handleDate} className="fr-filter-form">
          <div className="fr-field">
            <label className="fr-label">Start Date</label>
            <input type="date" className="fr-input" value={startDate}
              onChange={(e) => setStartDate(e.target.value)} required />
          </div>
          <div className="fr-field">
            <label className="fr-label">End Date</label>
            <input type="date" className="fr-input" value={endDate}
              onChange={(e) => setEndDate(e.target.value)} required />
          </div>
          <button type="submit" className="fr-generate-btn">Generate Report</button>
        </form>
      </div>

      {/* Results */}
      {displayStudents.length > 0 ? (
        <div className="fr-results-card">
          {/* Toolbar */}
          <div className="fr-toolbar">
            <span className="fr-results-count">{displayStudents.length} student(s) found</span>
            <div className="fr-toolbar-actions">
              <form onSubmit={handleGrNum} className="fr-gr-form">
                <input className="fr-gr-input" type="number" placeholder="Filter by GR No."
                  value={grNum} onChange={(e) => setGrNum(e.target.value)} />
                <button type="submit" className="fr-gr-btn">Search</button>
              </form>
              <button className="fr-download-btn" onClick={generateAndDownloadPDF}>
                ↓ Download PDF
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="fr-table-wrap">
            <table className="fr-table">
              <thead>
                <tr>
                  <th>GR No.</th>
                  <th>Student Name</th>
                  <th>Month</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Fee Paid</th>
                  <th>Fee Type</th>
                </tr>
              </thead>
              <tbody>
                {displayStudents.map((student) => {
                  const filteredFees = student.feeStatus.filter((status) => {
                    const paymentDate = status.date && new Date(status.date.split("T")[0]);
                    return paymentDate >= new Date(formattedStartDate) && paymentDate <= new Date(formattedEndDate);
                  });
                  return filteredFees.map((status, idx) => (
                    <tr key={`${student._id}-${idx}`} className={idx === 0 ? 'fr-row-first' : 'fr-row-cont'}>
                      <td className="fr-td-name">{idx === 0 ? student.GRNo : ''}</td>
                      <td className="fr-td-name">{idx === 0 ? student.studentName : ''}</td>
                      <td>{status.month}</td>
                      <td>
                        <span className={`fr-status-badge ${status.status === 'Paid' ? 'fr-paid' : 'fr-pending'}`}>
                          {status.status}
                        </span>
                      </td>
                      <td>{status.date.split("T")[0]}</td>
                      <td className="fr-amount">Rs. {status.feeReceived}</td>
                      <td>{status.feeType?.map(t => t.trim()).join(', ')}</td>
                    </tr>
                  ));
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        !loading && (
          <div className="msg-container">
            <div className="no-data-message">Select a date range above to generate the report</div>
          </div>
        )
      )}
    </div>
  );
};

export default FeeReport;
