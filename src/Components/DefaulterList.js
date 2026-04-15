import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { PDFViewer } from '@react-pdf/renderer';
import MyDocument from './MyDocument';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const DefaulterList = () => {
  const [dueStudents, setDueStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDefaulters = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/student/defaulterList');
        setDueStudents(response.data.data);
      } catch (e) {
        console.log(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDefaulters();
  }, []);

  useEffect(() => {
    if (!selectedClass || selectedClass === "All Classes") {
      setFilteredStudents(dueStudents);
    } else {
      setFilteredStudents(dueStudents.filter(s => s.className === selectedClass));
    }
  }, [selectedClass, dueStudents]);

  const uniqueClasses = [...new Set(dueStudents.map(s => s.className))];

  return (
    <div className="dl-page">

      {/* Header */}
      <div className="dl-header-card">
        <div>
          <h3 className="dl-title">Defaulter List</h3>
          <p className="dl-subtitle">Students with pending fee payments</p>
        </div>
        {!loading && (
          <div className="dl-stat-badge">
            <span className="dl-stat-num">{dueStudents.length}</span>
            <span className="dl-stat-label">Total Defaulters</span>
          </div>
        )}
      </div>

      {/* Filter */}
      <div className="dl-filter-row">
        <label className="dl-filter-label">Filter by Class</label>
        <select
          className="dl-select"
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
        >
          <option value="">Select a class</option>
          {uniqueClasses.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
          <option value="All Classes">All Classes</option>
        </select>
        {selectedClass && (
          <span className="dl-filter-count">
            {filteredStudents.length} student(s)
          </span>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="dl-skeleton-wrap">
          <SkeletonTheme baseColor="#e2e8f0" highlightColor="#f8fafc">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <Skeleton height={52} borderRadius={10} />
              </div>
            ))}
          </SkeletonTheme>
        </div>
      ) : selectedClass && filteredStudents.length > 0 ? (
        <div className="dl-pdf-wrap">
          <div className="dl-pdf-label">
            Defaulter report for <strong>{selectedClass}</strong>
          </div>
          <PDFViewer width="100%" height="620" style={{ borderRadius: 12, border: 'none' }}>
            <MyDocument students={filteredStudents} className={selectedClass} />
          </PDFViewer>
        </div>
      ) : (
        <div className="msg-container">
          <div className="no-data-message">
            {selectedClass ? `No defaulters in ${selectedClass}` : 'Select a class to view the defaulter list'}
          </div>
        </div>
      )}
    </div>
  );
};

export default DefaulterList;
