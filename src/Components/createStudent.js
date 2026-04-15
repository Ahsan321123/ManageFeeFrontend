import React, { useEffect, useState,useRef } from 'react'
import axiosInstance from '../api/axiosInstance';
import {toast} from 'react-toastify'
import Loader from './Loader'

export default function CreateStudent() {



    const [name,setName]=useState('')
    const [studentClass,setStudentClass]=useState('')
    const [fee,setFees]=useState('');
    const [DOB,setDOB]=useState()
    const [fatherName,setFatherName]=useState('')
    const [dateOfAdmission,setDateOfAdmission]=useState()
    const [gender,setGender]=useState('')
    const [phoneNo,setPhoneNo]=useState('')
    const [address,setAddress]=useState('')
    const [CNIC,setCNIC]=useState('')
    const [GRNo,setGRNo]=useState('')
    const [classes,setClasses ]=useState()
    const [loading,setLoading] = useState(false)
    const [ grError,setGrError]=useState(null)
    const [ phoneError ,setPhoneError]=useState(null )
    const [ cnicError ,setCnicError]=useState(null )
    const [annualCharges,setAnnualCharges]=useState('');
    const [extraCharges,setExtraCharges]=useState('');
    const [labCharges,setLabCharges]=useState('');
    const [enrollmentCharges,setEnrollmentFee]=useState('');
    const [copyPresentationCharges,setCopyPresentationFee]=useState('');
    useEffect(()=>{
      axiosInstance.get('/classes')
      .then(res=>{
            setClasses(res.data.classData)       
})
},[])


const inputRef= useRef(null)
const token = localStorage.getItem('token')

    const handleSubmit = (e)=>{
      
      setLoading(true)
        e.preventDefault();
        const data={name,class:studentClass,fee,DOB,fatherName,dateOfAdmission,gender,
                        phoneNo,address,CNIC,GRNo,extraCharges,annualCharges,labCharges,enrollmentCharges,copyPresentationCharges}
        axiosInstance.post('/students',data,{
          headers:{
            'x-auth-token': token
          }
        },).then(res=>{
            console.log(res.data);
            console.log(res.headers)
            setLoading(false)
            setGrError(null)
            toast.success("Student created",{
              position: toast.POSITION.TOP_CENTER,
              autoClose: 2000 
            })
            inputRef.current.focus();
        }).catch(e => {
          if (e.response) {
               if (e.response.data.message.includes("some other error")) {
                  setPhoneError(e.response.data.message);
              } else if (e.response.data.message === "student with this GrNo# already exist") {
                  setGrError(e.response.data.message );
              }
              // toast.error(e.response.data.message, {
              //     position: toast.POSITION.TOP_CENTER,
              //     autoClose: 2000
              // });
          }
      });
    }

  return (
    <div className="cs-page">
      {loading && <Loader />}

      <div className="cs-card">

        {/* Header */}
        <div className="cs-header">
          <h3 className="cs-title">New Student Registration</h3>
          <p className="cs-subtitle">Fill in the details below to register a new student</p>
        </div>

        <form onSubmit={handleSubmit} className="cs-form">

          {/* ── Personal Information ── */}
          <div className="cs-section-label">Personal Information</div>
          <div className="cs-grid">

            <div className="cs-field">
              <label className="cs-label">Student Name <span className="cs-required">*</span></label>
              <input type="text" className="cs-input" placeholder="Enter student name"
                onChange={e => setName(e.target.value)} ref={inputRef} autoComplete="off" required />
            </div>

            <div className="cs-field">
              <label className="cs-label">Father Name <span className="cs-required">*</span></label>
              <input type="text" className="cs-input" placeholder="Enter father name"
                onChange={e => setFatherName(e.target.value)} autoComplete="off" required />
            </div>

            <div className="cs-field">
              <label className="cs-label">GR No. <span className="cs-required">*</span></label>
              <input type="number" className={`cs-input ${grError ? 'cs-input-error' : ''}`}
                placeholder="Enter GR number"
                onChange={e => { setGrError(null); setGRNo(e.target.value); }}
                autoComplete="off" required />
              {grError && <span className="cs-error-msg">{grError}</span>}
            </div>

            <div className="cs-field">
              <label className="cs-label">Gender <span className="cs-required">*</span></label>
              <select className="cs-input" onChange={e => setGender(e.target.value)} required>
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div className="cs-field">
              <label className="cs-label">Date of Birth <span className="cs-required">*</span></label>
              <input type="date" className="cs-input"
                onChange={e => setDOB(e.target.value)} autoComplete="off" required />
            </div>

            <div className="cs-field">
              <label className="cs-label">Date of Admission <span className="cs-required">*</span></label>
              <input type="date" className="cs-input"
                onChange={e => setDateOfAdmission(e.target.value)} autoComplete="off" required />
            </div>

            <div className="cs-field">
              <label className="cs-label">Phone No. <span className="cs-required">*</span></label>
              <input type="number" className="cs-input" placeholder="e.g. 03001234567"
                onChange={e => setPhoneNo(e.target.value)} autoComplete="off" required />
              {phoneError && <span className="cs-error-msg">{phoneError}</span>}
            </div>

            <div className="cs-field">
              <label className="cs-label">CNIC</label>
              <input type="text" className="cs-input" placeholder="e.g. 35201-1234567-1"
                onChange={e => setCNIC(e.target.value)} autoComplete="off" />
              {cnicError && <span className="cs-error-msg">{cnicError}</span>}
            </div>

            <div className="cs-field cs-field-full">
              <label className="cs-label">Address <span className="cs-required">*</span></label>
              <input type="text" className="cs-input" placeholder="Street, City"
                onChange={e => setAddress(e.target.value)} autoComplete="off" required />
            </div>

            <div className="cs-field cs-field-full">
              <label className="cs-label">Class <span className="cs-required">*</span></label>
              <select className="cs-input" onChange={e => setStudentClass(e.target.value)} required>
                <option value="">Select class</option>
                {classes && classes.map((c, i) => (
                  <option key={i} value={c.className}>{c.className}</option>
                ))}
              </select>
            </div>

          </div>

          {/* ── Fee Structure ── */}
          <div className="cs-section-label" style={{ marginTop: 28 }}>Fee Structure</div>
          <div className="cs-grid">

            <div className="cs-field">
              <label className="cs-label">Tuition Fee <span className="cs-required">*</span></label>
              <div className="cs-input-prefix-wrap">
                <span className="cs-prefix">Rs.</span>
                <input type="number" className="cs-input cs-input-prefixed" placeholder="0"
                  onChange={e => setFees(e.target.value)} autoComplete="off" required />
              </div>
            </div>

            <div className="cs-field">
              <label className="cs-label">Annual Charges</label>
              <div className="cs-input-prefix-wrap">
                <span className="cs-prefix">Rs.</span>
                <input type="number" className="cs-input cs-input-prefixed" placeholder="0"
                  onChange={e => setAnnualCharges(e.target.value)} autoComplete="off" />
              </div>
            </div>

            <div className="cs-field">
              <label className="cs-label">Lab Charges</label>
              <div className="cs-input-prefix-wrap">
                <span className="cs-prefix">Rs.</span>
                <input type="number" className="cs-input cs-input-prefixed" placeholder="0"
                  onChange={e => setLabCharges(e.target.value)} autoComplete="off" />
              </div>
            </div>

            <div className="cs-field">
              <label className="cs-label">Enrollment Charges</label>
              <div className="cs-input-prefix-wrap">
                <span className="cs-prefix">Rs.</span>
                <input type="number" className="cs-input cs-input-prefixed" placeholder="0"
                  onChange={e => setEnrollmentFee(e.target.value)} autoComplete="off" />
              </div>
            </div>

            <div className="cs-field">
              <label className="cs-label">Copy Presentation Charges</label>
              <div className="cs-input-prefix-wrap">
                <span className="cs-prefix">Rs.</span>
                <input type="number" className="cs-input cs-input-prefixed" placeholder="0"
                  onChange={e => setCopyPresentationFee(e.target.value)} autoComplete="off" />
              </div>
            </div>

            <div className="cs-field">
              <label className="cs-label">Extra Charges</label>
              <div className="cs-input-prefix-wrap">
                <span className="cs-prefix">Rs.</span>
                <input type="number" className="cs-input cs-input-prefixed" placeholder="0"
                  onChange={e => setExtraCharges(e.target.value)} autoComplete="off" />
              </div>
            </div>

          </div>

          <button type="submit" className="cs-submit-btn">
            Save Student
          </button>

        </form>
      </div>
    </div>
  )
}
