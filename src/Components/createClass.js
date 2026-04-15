import { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';
import Loader from './Loader';

const CreateClass = () => {
  const [classes, setClasses] = useState('');
  const [loading, setLoading] = useState(false);
  const [showClasses, setShowClasses] = useState([]);

  useEffect(() => {
    async function fetchClasses() {
      await axiosInstance.get('/classes').then((res) => {
        setShowClasses(res.data.classData);
      });
    }
    fetchClasses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await axiosInstance.post('/create/class', { className: classes })
      .then((res) => {
        setLoading(false);
        setClasses('');
        setShowClasses(prev => [...prev, { className: classes, _id: res.data.classData._id }]);
        toast.success('Class created', { position: toast.POSITION.TOP_CENTER, autoClose: 2000 });
      }).catch(() => {
        setLoading(false);
        toast.error('Class not created', { position: toast.POSITION.TOP_CENTER, autoClose: 2000 });
      });
  };

  const handleDelete = async (e, id) => {
    e.preventDefault();
    await axiosInstance.get(`/class/${id}/delete`).then((res) => setShowClasses(res.data.updatedClasses));
  };

  return (
    <div className="cc-page">
      {loading && <Loader />}

      <div className="cc-card">
        <div className="cc-header">
          <h3 className="cc-title">Manage Classes</h3>
          <p className="cc-subtitle">Add or remove classes from the system</p>
        </div>

        <div className="cc-body">
          {/* Add Class Form */}
          <form onSubmit={handleSubmit} className="cc-add-form">
            <div className="cc-input-wrap">
              <label className="cc-label">Class Name</label>
              <input
                type="text"
                className="cc-input"
                placeholder="e.g. Class 5, Nursery, KG..."
                value={classes}
                onChange={(e) => setClasses(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="cc-add-btn">
              + Add Class
            </button>
          </form>

          {/* Divider */}
          <div className="cc-divider">
            <span>All Classes ({showClasses.length})</span>
          </div>

          {/* Classes List */}
          {showClasses.length === 0 ? (
            <div className="cc-empty">No classes added yet</div>
          ) : (
            <div className="cc-list">
              {showClasses.map((c, i) => (
                <div className="cc-list-item" key={c._id || i}>
                  <div className="cc-class-info">
                    <div className="cc-class-icon">{i + 1}</div>
                    <span className="cc-class-name">{c.className}</span>
                  </div>
                  <button
                    className="cc-delete-btn"
                    onClick={(e) => handleDelete(e, c._id)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateClass;
