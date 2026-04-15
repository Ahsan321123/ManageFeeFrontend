import React, { useState, useEffect, useCallback } from "react";
import axiosInstance from "../api/axiosInstance";
import Voucher from "../Components/voucher";
import { useNavigate } from "react-router-dom";
import UpdateStudent from "./updateStudent";
import Loader from '../Components/Loader'
import StudentCardSkeleton from './StudentCardSkeleton'
import { toast } from "react-toastify";
import PaginationComp from "./paginationComp";
import { CSVLink } from "react-csv";
import { CheckStatus } from "./CheckStatus";


export default function Allstudents() {
  const [allStudent, setAllStudent] = useState([]);
  const [classFilter, setClassFilter] = useState("");
  const [filterData, setFilterData] = useState([]);
  const [grNum, setGrNum] = useState();
  const [filterByGr, setFilterByGr] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [studentId, setStudentID] = useState();
  const [bankName, setBankName] = useState("");
  const [date, setDate] = useState();
  const [status, setStatus] = useState();
  const [updateStudent, setUpdateStudent] = useState();
  const [updateModal, setUpdateModal] = useState(false);
  const [classes, setClasses] = useState([]);
  const [studentStatus, setStudentStatus] = useState("");
  const [loading,setLoading]= useState(false);
  const [ currentPage ,setCurrentPage]=useState(1)
    const [ totalPages,setTotalPages]=useState()
    const [totalStudentsCount,setTotalStudentsCount]=useState(0)
    const [ studentFeeData,setStudentFeeData]=useState([])
    const [showFeeModal,setShowFeeModal]=useState(false)
    const [feeReceived,setFeeReceived]=useState("")
    const [month,setMonth]=useState()
    const [ voucherModal,setVoucherModal]=useState(false)
    const [ vocuherData ,setVocherData]= useState(
      {
        voucherId:"",
        voucherStud:{}
      }

    )
    const [checkedFees, setCheckedFees] = useState({
      annualCharges: false,
      labCharges: false,
      enrollmentFee: false
  });
 const [batchVoucherData,setBatchVoucherdata]=useState([])
 const [ singelVoucher,setSingelVocuher]=useState(false)
 const [ comment,setComment]=useState()
 const [feeType,setFeeType]=useState({
  TutionFee:"",
  AnnualCharges:"",
  LabCharges:"",
  EnrollmentFeee:""
} )


//! PAgination handle 

const token = localStorage.getItem('token')


const handlePage=(pageNumber)=>{
  setCurrentPage(pageNumber) 
}
   const fetchStudents = async (page) => {
    try{
    setLoading(true)
    const { data } = await axiosInstance.get(`/students?page=${page}`,{
    headers:{
      'x-auth-token': token
    }
    
    }
    
    )

      setAllStudent(data.allStudents);
    
      setTotalStudentsCount(data.totalStudents)   
  
      setLoading(false)
    
  
   }catch(e){
      console.log(e.response.data.messsage)
    }
  };
// Total pages 
useEffect(()=>{
   const studentPerPage=10
  const pages=Math.ceil(totalStudentsCount/studentPerPage) 
  setTotalPages(pages)
},[totalStudentsCount]) 

  
  const fetchClasses = async () => {
    const { data } = await axiosInstance.get("/classes",{
     
    })
      setClasses(data.classData);
    
  };

  const fetchFilteredStudentsByClass = async (className, page = 1) => {
    const { data } = await axiosInstance.get(
      `/students?className=${className}&page=${page}`,{
          headers:{
            'x-auth-token': token
          }
        
      }
    );
    
    setFilterData(data.allStudents);
    setTotalStudentsCount(data.totalStudents)   
      
    const studentPerPage=10;
    const pages=Math.ceil(data.totalStudents/studentPerPage); 
    setTotalPages(pages);
  };

  useEffect(() => {
    fetchStudents(currentPage);
    fetchClasses()
  }, [currentPage]); // Yeh useEffect sirf component mount hone par run hoga.

  useEffect(() => {
    if (classFilter && classFilter !== "All Classes") {
      fetchFilteredStudentsByClass(classFilter,currentPage);
    } else {
      setFilterData([]);
    }
  }, [classFilter,currentPage]); // Yeh useEffect sirf classFilter change hone par run hoga.

  useEffect(() => {
    if (grNum) {
      axiosInstance
        .get(`/students?GRNo=${grNum}`,{
          headers:{
            'x-auth-token': token
          }
        
      })
        .then((res) =>{

          setFilterByGr(res.data.allStudents)
      });
    }
  }, [grNum]);

  const handleUpdate = (id) => {
    setStudentID(id);
    setShowModal(true);
  };

  //! Generate Voucher for specific Student  */

  const navigate = useNavigate();
  const handleVoucher = async () => {

    setVoucherModal(true)
      
   };

   const handleVoucherButtonClick=(id,student)=>{
    handleVoucher()
    setVocherData(
      {
        voucherId: id,
        voucherStud: student
      }

    ) 
   }

  const  handleVoucherModalSubmit= async(e )=>{
    e.preventDefault()
    const data= {
    studentId: vocuherData.voucherId,
    student : vocuherData.voucherStud
    }
   try{
    await axiosInstance
      .get(`/student/${data.studentId}/voucher`,{
        headers:{
          'x-auth-token': token
        }
      
    })
      .then((res) => {
        
        // passing student data and navigating
if(res && res.data){   navigate("/voucher", {
  state: {
    studentData: data.student,
    voucherData: res.data,
    annualCharges: checkedFees.annualCharges ? res.data.annualCharges : 0,
    enrollmentCharges: checkedFees.enrollmentFee ? res.data.enrollmentCharges : 0,
    labCharges: checkedFees.labCharges ? res.data.labCharges:0  ,
    month,
    from: "generateSingle",
  },
});}
     
      });

    setStudentID(data.studentId);}catch(err){
      toast.error(err.response.data.message,{
        position: toast.POSITION.TOP_CENTER,
        autoClose: 2000 
      })
    }
   }

  // // **********
  const handleClassFilterChange = (e) => {
    setClassFilter(e.target.value);
    setCurrentPage(1)

      };
  /////// Update Student
  const handleStudentUpdate = (student) => {
    setUpdateStudent(student);
    setUpdateModal(true);
  };

  const handleGrNum = (e) => {
    e.preventDefault();

    let url = `/students?GRNo=${grNum}`;
    axiosInstance.get(url).then((res) => {
     setFilterByGr(res.data.student)});
    
  };

//! Update Student By Status

  const handleModalSubmit = (e) => {
    e.preventDefault();
    
    const id = studentId;
    const data = { bankName, date, status,month,feeReceived,feeType,comment};
    let url = `/student/${id}/updateStatus`;
    axiosInstance
      .patch(url, data,{
        headers:{
          'x-auth-token': token
        }
      
    })
      .then((response) => {
        const updatedStudent = response.data.student;
        const updateList = (list) =>
          list.map((student) => {
            if (student._id === updatedStudent._id) {
              return updatedStudent;
            }
            return student;
          });

        setAllStudent((prevStudents) => updateList(prevStudents));
        setFilterData((prevFilterData) => updateList(prevFilterData));
        setFilterByGr((prevFilterByGr) => updateList(prevFilterByGr));

        setShowModal(false);
     
      })
      .catch((e) => {
        
          if(e.response && e.response.data.message =='already Paid' ){
            toast.error(e.response.data.message,{
              position: toast.POSITION.TOP_CENTER,
              autoClose: 2000 
            })
          }else{
            toast.error(e.response.data.message,{
              position: toast.POSITION.TOP_CENTER,
              autoClose: 2000 
            })
          }
        
        
        // console.error("Error updating status:", error);

      });
    }
  // ! Check Status of fee 


  const handleCheckStatus =async(e,id)=>{
    e.preventDefault();
    setShowFeeModal(true)
    setLoading(true)
    const response = await axiosInstance.get(`/student/${id}/checkStatus`)
  if ( response.success === false ){
    setStudentFeeData([])

  }

    setStudentFeeData(response.data.feeStatus)
    setLoading(false)


  }



 
  // delete
  const handleStudentDelete = (student) => {
    axiosInstance
      .get(`/student/${student._id}/delete`,{
        headers:{
          'x-auth-token': token
        }
      
    })
      .then((res) => {
        toast.success('Student removed',{
          position:toast.POSITION.TOP_CENTER,
          autoClose:2000
        })
        const updateStudent = allStudent.filter((s) => s._id !== student._id);
        setAllStudent(updateStudent);

        if (filterByGr) {
          const updateStudent = filterByGr.filter((s) => s._id !== student._id);
          setFilterByGr(updateStudent);
        }
        if (filterData) {
          const updateStudent = filterData.filter((s) => s._id !== student._id);
          setFilterData(updateStudent);
        }
      }).catch(()=>{
        toast.error('Failed to remove student',{
          position:toast.POSITION.TOP_CENTER,
          autoClose:2000
        })
      });
  };

  const renderStudents = (studentsList) =>
    studentsList.map((student) => (
      <div className="student-card" key={student._id}>
        <div className="student-card-header">
          <div className="student-info">
            <div className="student-avatar">
              {student.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h5 className="student-name">{student.name}</h5>
              <span className="student-class-badge">Class {student.className}</span>
            </div>
          </div>
          <button
            onClick={(e) => handleCheckStatus(e, student._id)}
            className="check-status-btn"
          >
            Check Status
          </button>
        </div>
        <div className="student-card-actions">
          <button
            className="action-btn action-btn-primary"
            onClick={() => handleUpdate(student._id)}
          >
            Update Fee
          </button>
          <button
            className="action-btn action-btn-primary"
            onClick={() => handleVoucherButtonClick(student._id, student, setSingelVocuher(true))}
          >
            Generate Voucher
          </button>
          <button
            className="action-btn action-btn-secondary"
            onClick={() => handleStudentUpdate(student)}
          >
            View & Update
          </button>
          <button
            className="action-btn action-btn-danger"
            onClick={() => handleStudentDelete(student)}
          >
            Delete
          </button>
        </div>
      </div>
    ));

  const uniqueClasses = [
    ...new Set(allStudent.map((student) => student.className)),
  ];

  //! Generate All Vouchers

  const handleVouchersAll = (e) => {
    e.preventDefault();
    const stundetIds = batchVoucherData.map((student) => {
      return student._id;
    });
    generateAllVouchers(stundetIds);
  };

const handleVoucherModal=()=>{
  setBatchVoucherdata(filterData)
  setVoucherModal(true)

}

  const generateAllVouchers = async (StudentIds) => {


    await axiosInstance
      .post("/student/generateBatchVouchers", {
        StudentIds,
      },{
        headers:{
          'x-auth-token': token
        }
      
    })
      .then((res) => {
      
        navigate("/voucher", {
          state: {
            studentsData: res.data.students,
            vouchersData: res.data.vouchers,
            month,
            annualCharges: checkedFees.annualCharges ? res.data.vouchers.map(s=>s.annualCharges) : 0,
enrollmentCharges: checkedFees.enrollmentFee ? res.data.vouchers.map(s=>s.enrollmentCharges) : 0,
labCharges: checkedFees.labCharges ? res.data.vouchers.map(s=>s.labCharges):0, 
            from: "generateAll",
          },
          
        });
        
      });
  };

  // ***********

  //! Student Update

  const updatedStudent = (updatedStudentData) => {
    let newUpdateStudents = allStudent.map((student) =>
      student._id === updatedStudentData.student._id
        ? updatedStudentData.student
        : student
    );

    setAllStudent(newUpdateStudents);
  };



//! rendering 

const getFilteredStudents = () => {
  let students = filterData.length > 0 ? filterData : allStudent;

  // Class filter
  if (classFilter && classFilter !== "") {
    students = students.filter(s => s.className === classFilter);
  }

  // Status filter
  if (studentStatus) {
    students = students.filter(s => s.status === studentStatus);
   
  }

  // GR number filter
  if (filterByGr.length > 0) {
    students = filterByGr;
  }

  return students;
}


let studentsToRender=getFilteredStudents()

//  Alll Months 

const allMonths= ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];


  return (
    <>
      <div className="as-page">

        {/* Filter Bar */}
        <div className="as-filter-bar">
          <div className="as-filter-group">
            <label className="as-filter-label">Class</label>
            <select className="as-select" value={classFilter} onChange={(e) => handleClassFilterChange(e)}>
              <option value="">All Classes</option>
              {uniqueClasses.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="as-filter-group">
            <label className="as-filter-label">Status</label>
            <select className="as-select" value={studentStatus} onChange={(e) => setStudentStatus(e.target.value)}>
              <option value="">All</option>
              <option value="Paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <form onSubmit={handleGrNum} className="as-filter-group as-gr-form">
            <label className="as-filter-label">GR Number</label>
            <div className="as-gr-wrap">
              <input
                className="as-gr-input"
                type="number"
                placeholder="Search by GR No."
                value={grNum}
                onChange={(e) => setGrNum(e.target.value)}
              />
              <button className="as-gr-btn" type="submit">Search</button>
            </div>
          </form>

          {filterData.length > 0 && (
            <div className="as-filter-group as-filter-action">
              <label className="as-filter-label">&nbsp;</label>
              <button className="as-voucher-btn" onClick={handleVoucherModal}>
                Generate All Vouchers
              </button>
            </div>
          )}
        </div>
      {/* render  */}

        <div className="as-cards-wrap">
        {loading ? (
          <StudentCardSkeleton count={5} />
        ) : studentsToRender.length === 0 ? (
          <div className="msg-container">
            <div className="no-data-message">No Students Found</div>
          </div>
        ) : (
          renderStudents(studentsToRender)
        )}
        </div>
{/* Conditionally render the CSVLink button when studentStatus is "pending" */}
{
studentStatus == "pending" &&  
 
 
 <CSVLink 
 style={{   backgroundColor:'#2c3e50'}} 
 data={studentsToRender}
 filename="pending_students.csv" 
 className="csv-btn btn-primary mx-4">
   Download Pending Students
</CSVLink>

}


     

        {showModal && (
          <div className="modal show d-block blurred-background" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Update Fee Status</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <form onSubmit={handleModalSubmit}>
                    <div className="mb-3">
                      <label htmlFor="inputName" className="form-label">
                        Bank Name
                      </label>
                      <input
                        type="text"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="form-control"
                        id="inputName"
                        placeholder="Enter bank name"
                        autoComplete="off"
                      />
                    </div>
                    {/* Fee Received */}
                  
                    <div className="mb-3">
                      <label htmlFor="inputName" className="form-label">
                        Fee Received
                      </label>
                      <input
                        type="text"
                        value={feeReceived}
                        onChange={(e) => setFeeReceived(e.target.value)}
                        className="form-control"
                        id="inputName"
                        placeholder="Enter Fee"
                        autoComplete="off"
                        required
                      />
                    </div>
                    <div className="mb-3">Fee Type </div>

                    <div className="mb-3 form-check">
        

                    <label>
  Annual-Charges
<input 
  value="AnnualCharges"
  className="form-check-input"
type="checkbox"
onChange={(e)=> setFeeType(prev=>({

...prev,
AnnualCharges:e.target.value,
}))}
/> 
</label>
</div>

<div className="mb-3 form-check">
        

                    <label>
Enrollment-Fee
<input 
  value="EnrollmentFee"
  className="form-check-input"
type="checkbox"
onChange={(e)=> setFeeType(prev=>({

  ...prev,
  EnrollmentFeee:e.target.value,
  }))}
/> 

</label>
</div>
<div className="mb-3 form-check">
        

                    <label>
Lab-Charges
<input 
value="LabCharges"
className="form-check-input"
type="checkbox"
onChange={(e)=> setFeeType(prev=>({

  ...prev,
  LabCharges:e.target.value,
  }))}
/> 
</label>
</div>
<div className="mb-3 form-check">
        

                    <label>
Tution-Fee
<input 
value="TutionFee"
className="form-check-input"
type="checkbox"
onChange={(e)=> setFeeType(prev=>({

  ...prev,
  TutionFee:e.target.value,
  }))}
/> 

</label>
</div>
                   

                    <div className="mb-3">
                      <label htmlFor="inputName" className="form-label">
                        Month
                      </label>
<select
            className="form-select"
            id="classFilter"
            required
            onChange={(e) => setMonth(e.target.value)}
          >
            <option value="">Select Month</option>
            {allMonths.map((m) => (
          
              <option key={m} value={m}>
                {m}
      
              </option>
                     
            ))}
                      
          </select>

                    </div>

                    <div className="mb-3">
                      <label htmlFor="inputName" className="form-label">
                        Date
                      </label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="form-control"
                        id="inputName"
                        autoComplete="off"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="inputName" className="form-label">
                        Status
                      </label>
                      <select
                        className="form-select"
                        id="inputName"
                        value={status}
                        required
                        onChange={(e) => setStatus(e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Paid">Paid</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="inputName" className="form-label">
                        Comment
                      </label>
                      <textarea 
                         type="text"
                        value={comment}
                        onChange={(e)=>setComment(e.target.value)}
                        className="form-control"
                        id="inputName"
                        placeholder="small comment about fee"
                        autoComplete="off"
                      />
                    </div>


                    <div className="modal-footer">
                      <button style={{   backgroundColor:'#2c3e50'}} type="submit" className="btn btn-primary">
                        Save changes
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowModal(false)}
                      >
                        Close
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>{/* end as-page */}

{/* voucher Modal */}

{ voucherModal && 

<div className="modal show d-block blurred-background" tabIndex="-1">
  <div className="modal-dialog">
    <div className="modal-content">
      <div className="modal-header">
        <h5 className="modal-title">Create Voucher</h5>
        <button
          type="button"
          className="btn-close"
          onClick={() => setVoucherModal(false)}
        ></button>
      </div>
      <div className="modal-body">
        <form onSubmit={singelVoucher ? (e) => handleVoucherModalSubmit(e) : (e) => 
          { handleVouchersAll(e) }}>
          <div className="mb-3">
            <label htmlFor="inputName" className="form-label">Month</label>
            <select className="form-select" id="classFilter" 
              onChange={(e) => setMonth(e.target.value)}
              required
              >
              <option value="">Select Month</option>
              {allMonths.map((m) => (
                <option key={m} value={m}>{m}
              
                </option>
              ))}
              
            </select>
          </div>
          <div className="mb-3">
            <label htmlFor="inputName" className="form-label">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="form-control"
              id="inputName"
              autoComplete="off"
            />
          </div>
          <div className="mb-3 form-check">
            <input 
              type="checkbox"
              id="annualCharges"
              className="form-check-input"
              checked={checkedFees.annualCharges}
              onChange={(e) => setCheckedFees(prev => ({ ...prev, annualCharges: e.target.checked }))}
            />
            <label className="form-check-label" htmlFor="annualCharges">Annual Charges</label>
          </div>
          <div className="mb-3 form-check">
            <input 
              type="checkbox"
              id="labCharges"
              className="form-check-input"
              checked={checkedFees.labCharges}
              onChange={(e) => setCheckedFees(prev => ({ ...prev, labCharges: e.target.checked }))}
            />
            <label className="form-check-label" htmlFor="labCharges">Lab Charges</label>
          </div>
          <div className="mb-3 form-check">
            <input 
              type="checkbox"
              id="enrollmentFee"
              className="form-check-input"
              checked={checkedFees.enrollmentFee}
              onChange={(e) => setCheckedFees(prev => ({ ...prev, enrollmentFee: e.target.checked }))}
            />
            <label className="form-check-label" htmlFor="enrollmentFee">Enrollment Fee</label>
          </div>
          <div className="modal-footer">
            <button style={{backgroundColor:'#2c3e50'}} type="submit" className="btn btn-primary">
              Save changes
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</div>
}



      {updateModal && (
        <UpdateStudent
          student={updateStudent}
          setUpdateModal={setUpdateModal}
          updatedStudent={updatedStudent}
          classes={classes}
          token={token}
        />
      )}
      <PaginationComp 
      currentPage={currentPage}
        students={allStudent}
         totalStudentsCount={totalStudentsCount}
          pages={totalPages}
          setCurrentPage={setCurrentPage}
          handlePage={handlePage}
          classFilter={classFilter}
          filterData={filterData}
          token={token} 
          
    
    />
   


    {showFeeModal && <CheckStatus
      studentFeeData={studentFeeData}
      setShowFeeModal={setShowFeeModal}
      loading={loading}
    
    /> }    </>
    
  );
}
