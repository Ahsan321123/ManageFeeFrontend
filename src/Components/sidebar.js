import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import axiosInstance from '../api/axiosInstance';
import {
    UserPlus,
    Users,
    BookOpen,
    BarChart2,
    AlertTriangle,
    LogOut,
    UserCog,
    Database,
    GraduationCap,
} from 'lucide-react';

export default function Sidebar() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { userName, campus, role } = useSelector(state => state.root);
    const savedRole = localStorage.getItem('role');
    const name = savedRole === 'admin' ? 'Admin' : userName || '';
    const initials = name ? name[0].toUpperCase() : '?';

    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            const endpoint = role === 'admin' ? '/admin/logout' : '/staff/logout';
            const response = await axiosInstance.get(endpoint, { withCredentials: true });
            if (response.data.sucess === true) {
                localStorage.removeItem('role');
                localStorage.removeItem('token');
                dispatch({ type: 'logout', payload: { userName: null, role: null, campus: null } });
                localStorage.setItem('logoutEvent', Date.now().toString());
                toast.success('Logged out', { position: toast.POSITION.TOP_CENTER, autoClose: 2000 });
                savedRole === 'admin' ? navigate('/adminLogin') : navigate('/');
            }
        } catch (err) {
            console.log(err.message);
        }
    };

    const staffLinks = [
        { to: '/createStudent', label: 'Create Student', icon: <UserPlus size={16} /> },
        { to: '/allstudents',   label: 'All Students',   icon: <Users size={16} /> },
        { to: '/createclass',   label: 'Create Class',   icon: <BookOpen size={16} /> },
        { to: '/feeReport',     label: 'Fee Report',     icon: <BarChart2 size={16} /> },
        { to: '/defaulterList', label: 'Defaulter List', icon: <AlertTriangle size={16} /> },
    ];

    const adminLinks = [
        { to: '/admin/createStaff',  label: 'Create Staff',  icon: <UserPlus size={16} /> },
        { to: '/admin/allStaff',     label: 'All Staff',     icon: <UserCog size={16} /> },
        { to: '/admin/studentCount', label: 'Student Data',  icon: <Database size={16} /> },
    ];

    const links = savedRole === 'admin' ? adminLinks : staffLinks;

    return (
        <div className="sb-root">
            {/* Brand */}
            <div className="sb-brand">
                <div className="sb-brand-icon"><GraduationCap size={20} /></div>
                <div>
                    <div className="sb-brand-name">GPS Fee</div>
                    <div className="sb-brand-sub">Management System</div>
                </div>
            </div>

            {/* Profile */}
            <div className="sb-profile">
                <div className="sb-avatar">{initials}</div>
                <div className="sb-profile-info">
                    <div className="sb-profile-name">{name}</div>
                    {savedRole !== 'admin' && campus && (
                        <div className="sb-profile-campus">Campus {campus}</div>
                    )}
                </div>
            </div>

            {/* Nav */}
            <nav className="sb-nav">
                <div className="sb-nav-label">Menu</div>
                {links.map(({ to, label, icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            isActive ? 'sb-link sb-link-active' : 'sb-link'
                        }
                    >
                        <span className="sb-link-icon">{icon}</span>
                        <span>{label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Logout */}
            <button className="sb-logout" onClick={handleLogout}>
                <LogOut size={15} /> Logout
            </button>
        </div>
    );
}
