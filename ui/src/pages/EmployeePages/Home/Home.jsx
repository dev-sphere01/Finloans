import { useState, useEffect } from "react";
import {
  User,
  CalendarCheck,
  DollarSign,
  ListChecks,
  Bell,
  LogOut,
  Menu,
  Clock4,
  ThumbsUp,
  BadgeCheck,
  CheckCircle,
  XCircle,
  Calendar,
} from "lucide-react";
import { Pie, Bar, Line } from "react-chartjs-2";
import {
  Chart,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
} from "chart.js";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import getBaseFileURL from '@/utils/getBaseFileUrl';
import useAuthStore from '@/store/authStore';
import useEmpDataStore from '@/store/empDataStore';
import { FiUser } from "react-icons/fi";
import TopTiles from "@/pages/EmployeePages/Home/components/TopTiles";
import AttendanceCard from "@/pages/EmployeePages/Home/components/AttendanceCard";
import LeaveBalanceCard from "@/pages/EmployeePages/Home/components/LeaveBalanceCard";
import PayrollCard from "@/pages/EmployeePages/Home/components/PayrollCard";
import LargePanel from "@/pages/EmployeePages/Home/components/LargePanel";
import PendingAlerts from "@/pages/EmployeePages/Home/components/PendingAlerts";
//Pending fields service
import { PendingFields } from "@/services";

const Home = () => {
  const {
    currentEmployee,
    fetchEmployeeById,
    getEmployeeDisplayName,
    clearEmployeeData,
    loading: empLoading
  } = useEmpDataStore();
  const [pendingData, setPendingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // console.log('Current Employee:', currentEmployee);
  
  useEffect(() => {
    if (currentEmployee?.EmpID) {
      fetchPendingFields();
    }
  }, [currentEmployee?.EmpID]);

  const fetchPendingFields = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await PendingFields(currentEmployee.EmpID);
      setPendingData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  const user = useAuthStore((state) => state.user);
  // console.log('Current Employee:', currentEmployee);
  // console.log('User:', user);

  const baseFileURL = getBaseFileURL();

  // All hooks must be called before any early returns
  const navigate = useNavigate();

  // Initialize state with default data that will be updated when currentEmployee is available
  const [announcements, setAnnouncements] = useState([
    { title: "Annual meet on 10th Aug", date: "1 Aug 2025", read: false },
    { title: "Health checkups this Friday", date: "28 Jul 2025", read: true },
    { title: "Payroll processed", date: "31 Jul 2025", read: true },
  ]);
  const [leaveReqs, setLeaveReqs] = useState([
    { id: 1, type: "Casual", days: 3, status: "pending", date: "2 Aug 2025" },
    { id: 2, type: "Sick", days: 1, status: "approved", date: "28 Jul 2025" },
  ]);

  // Fetch employee data when component mounts
  useEffect(() => {
    if (user?.empId && !currentEmployee) {
      console.log('Fetching employee data for empId:', user.empId);
      fetchEmployeeById(user.empId);
    }
  }, [user?.empId, currentEmployee, fetchEmployeeById]);

  Chart.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement
  );

  // Show loading state while employee data is being fetched
  if (empLoading || !currentEmployee) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading employee data...</p>
        </div>
      </div>
    );
  }

  // Mock Data, adapt for your APIs/backend
  const data = {
    user: {
      name: currentEmployee.FirstName + " " + (currentEmployee?.LastName || ""),
      profilePhoto: `${baseFileURL}${currentEmployee?.ProfilePicture}`,
      employeeId: "EMP000" + currentEmployee.EmpID,
      dept: "Engineering",
    },
    attendance: { present: 12, absent: 2, late: 1, hoursMonth: 112, hoursWeek: 27 },
    leaveBalance: { Paid: 10, Casual: 5, Sick: 2, Unpaid: 1 },
    leavesTaken: 5,
    pendingLeaves: 2,
    lastSalary: { amount: 45000, date: "31 Jul 2025" },
    nextPayday: "31 Aug 2025",
    payHistory: [
      { month: "May", amount: 45000 },
      { month: "Jun", amount: 46000 },
      { month: "Jul", amount: 45000 },
    ],
    tasks: { completed: 18, total: 22, ongoing: 4, pending: 2 },
    performanceRating: 4.2,
    recognitions: 3,
    announcements: [
      { title: "Annual meet on 10th Aug", date: "1 Aug 2025", read: false },
      { title: "Health checkups this Friday", date: "28 Jul 2025", read: true },
      { title: "Payroll processed", date: "31 Jul 2025", read: true },
    ],
    activity: [
      { type: "Leave Approved", timestamp: "31 Jul 10:00" },
      { type: "Checked In", timestamp: "31 Jul 09:04" },
      { type: "Payslip Downloaded", timestamp: "30 Jul 15:22" },
    ],

    leaveRequests: [
      { id: 1, type: "Casual", days: 3, status: "pending", date: "2 Aug 2025" },
      { id: 2, type: "Sick", days: 1, status: "approved", date: "28 Jul 2025" },
    ],
  };

  // Chart Data/Options — adjust to match your needs
  const leavePieData = {
    labels: Object.keys(data.leaveBalance),
    datasets: [
      {
        data: Object.values(data.leaveBalance),
        backgroundColor: ["#8e44ad", "#1abc9c", "#f1c40f", "#e74c3c"],
        borderWidth: 2,
      },
    ],
  };

  const attendancePieData = {
    labels: ["Present", "Absent", "Late"],
    datasets: [
      {
        data: [
          data.attendance.present,
          data.attendance.absent,
          data.attendance.late,
        ],
        backgroundColor: ["#4caf50", "#f44336", "#ff9800"],
        borderWidth: 2,
      },
    ],
  };

  function Tile({ title, value, icon, color, hint }) {
    return (
      <motion.div
        layout
        className="bg-gradient-to-br from-slate-200 via-white to-white rounded-xl shadow flex items-center p-5 gap-4"
        whileHover={{ scale: 1.05 }}
      >
        <div className={`bg-white p-2 rounded-lg shadow-inner ${color} flex items-center justify-center w-12 h-12`}>
          {icon}
        </div>
        <div>
          <div className="font-bold text-xl">{value}</div>
          <div className="text-gray-600 tracking-tight text-sm">{title}</div>
          {hint && <div className="text-xs text-gray-400">{hint}</div>}
        </div>
      </motion.div>
    );
  }


  // Calculate salary growth %
  const salaryCurrent = data.payHistory[data.payHistory.length - 1].amount;
  const salaryPrev = data.payHistory.length > 1 ? data.payHistory[data.payHistory.length - 2].amount : 0;
  const salaryGrowth =
    salaryPrev > 0 ? (((salaryCurrent - salaryPrev) / salaryPrev) * 100).toFixed(1) : null;

  // Announcement count unread
  const unreadCount = announcements.filter((a) => !a.read).length;

  // Handlers
  const toggleAnnouncementRead = (index) => {
    const updated = [...announcements];
    updated[index].read = !updated[index].read;
    setAnnouncements(updated);
  };

  const approveLeave = (id) => {
    setLeaveReqs((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: "approved" } : req))
    );
  };

  const rejectLeave = (id) => {
    setLeaveReqs((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: "rejected" } : req))
    );
  };

  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const handleRequestLeave = () => {
    navigate("/dashboard/leave-management/apply");
  }

  const handleProfileClick = () => {
    navigate("/profile");
  };


  return (
    <div className="flex rounded-lg bg-slate-100 min-h-screen relative">
      <main
        className={`flex-1 transition-all ml-1 duration-300 px-6 py-4`}
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-800">
              Welcome, {data.user.name}!
            </h1>
            <div className="text-sm text-gray-500">
              {data.user.employeeId} &bull; {data.user.dept}
            </div>
            <div className="mt-1 text-sm text-slate-600 font-medium">{formattedDate}</div>
          </div>

          {/* Profile Photo */}
          {currentEmployee?.ProfilePicture ? <motion.img
            src={data.user.profilePhoto}
            alt="Profile"
            className="rounded-full w-24 h-24 border-4 border-slate-200 object-cover shadow-md cursor-pointer"
            initial={{ rotate: -6, scale: 0.93 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
            onClick={handleProfileClick}
          /> : <FiUser className="rounded-full w-16 h-16 border-4 p-2 text-gray-700 border-slate-200 object-cover shadow-md cursor-pointer" onClick={handleProfileClick} />}

        </div>

        {/* Pending Alerts */}
        <PendingAlerts
          pendingData={pendingData}
          loading={loading}
          error={error}
        />

        {/* Top Tiles */}
        <TopTiles Clock4={Clock4} CalendarCheck={CalendarCheck} ThumbsUp={ThumbsUp} Tile={Tile} data={data} />

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-3 gap-8">
          {/* Attendance Card */}
          <AttendanceCard attendancePieData={attendancePieData} data={data} motion={motion} CalendarCheck={CalendarCheck} Pie={Pie} />

          {/* Leave Balance Card */}
          <LeaveBalanceCard data={data} leavePieData={leavePieData} motion={motion} User={User} Pie={Pie} handleRequestLeave={handleRequestLeave} />

          {/* Payroll Card */}
          <PayrollCard data={data} salaryGrowth={salaryGrowth} motion={motion} />
        </div>

        {/* Large Panels */}
        <LargePanel data={data} leaveReqs={leaveReqs} announcements={announcements} unreadCount={unreadCount} toggleAnnouncementRead={toggleAnnouncementRead} approveLeave={approveLeave} rejectLeave={rejectLeave} motion={motion} Bell={Bell} CheckCircle={CheckCircle} XCircle={XCircle} Clock4={Clock4} Calendar={Calendar} />
      </main>
    </div>
  );
};


export default Home;
