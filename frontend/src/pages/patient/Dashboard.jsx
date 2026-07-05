import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import {
  getProfile,
  getMyAppointments,
  getMyQueueStatus
} from "../../services/api"
import {
  LayoutDashboard,
  Calendar,
  Clock,
  Activity,
  User,
  Bell,
  LogOut,
  MessageSquare,
  HelpCircle,
  AlertCircle,
  ChevronDown,
  Sparkles,
  BookOpen,
  CalendarDays,
  UserCheck,
  ChevronRight,
  Stethoscope
} from "lucide-react"

export default function Dashboard() {
  const navigate = useNavigate()
  const { logout, user: authUser } = useAuth()
  
  // States
  const [profile, setProfile] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [queueStatus, setQueueStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true)
        setError(null)

        // 1. Fetch Profile
        let userProfile = authUser
        try {
          userProfile = await getProfile()
          setProfile(userProfile)
        } catch (e) {
          console.error("Failed to load backend profile, falling back to auth context:", e)
          setProfile(authUser)
        }

        // 2. Fetch Appointments
        let userAppointments = []
        try {
          userAppointments = await getMyAppointments()
          setAppointments(userAppointments)
        } catch (e) {
          console.error("Failed to load appointments:", e)
        }

        // 3. Fetch Queue Status for today
        try {
          const queue = await getMyQueueStatus()
          if (queue && queue.queue_number !== undefined) {
            setQueueStatus(queue)
          } else {
            setQueueStatus(null)
          }
        } catch (e) {
          console.error("Failed to load queue status:", e)
          setQueueStatus(null)
        }

      } catch (err) {
        console.error("Error loading dashboard data:", err)
        setError("Could not retrieve some account details. Check connection.")
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [authUser])

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  // Helper calculations
  const patientName = profile?.first_name 
    ? `${profile.first_name} ${profile.last_name || ""}`.trim()
    : profile?.username || "Jane N. Awah"

  const displayAvatarLetter = patientName.charAt(0).toUpperCase()

  // Get next upcoming confirmed appointment
  const todayStr = new Date().toISOString().split("T")[0]
  const upcomingAppointment = appointments
    .filter(app => app.status === "confirmed" && app.appointment_date >= todayStr)
    .sort((a, b) => {
      const dateTimeA = new Date(`${a.appointment_date}T${a.appointment_time}`)
      const dateTimeB = new Date(`${b.appointment_date}T${b.appointment_time}`)
      return dateTimeA - dateTimeB
    })[0] || null

  // Calculate total appointments this month
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const appointmentsThisMonth = appointments.filter(app => {
    const appDate = new Date(app.appointment_date)
    return appDate.getMonth() === currentMonth && appDate.getFullYear() === currentYear
  }).length

  // Notification items count placeholder
  const unreadNotifications = 3

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* ==================== LEFT SIDEBAR ==================== */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col justify-between h-full flex-shrink-0 hidden lg:flex">
        <div className="overflow-y-auto">
          {/* Logo / Header */}
          <div className="p-6 border-b border-slate-50 flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-200 flex-shrink-0">
              <Stethoscope className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <span className="text-lg font-black text-slate-800 tracking-tight block truncate">MediQueue</span>
              <p className="text-xs text-slate-400 font-semibold leading-none truncate">Smart Care. Less Wait.</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <Link
              to="/dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold bg-blue-50 text-blue-600 transition"
            >
              <LayoutDashboard className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">Dashboard</span>
            </Link>
            
            <Link
              to="/book-appointment"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition"
            >
              <Calendar className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">Book Appointment</span>
            </Link>

            <Link
              to="/my-appointments"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition"
            >
              <CalendarDays className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">My Appointments</span>
            </Link>

            <Link
              to="/queue-tracker"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition"
            >
              <Clock className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">Queue Status</span>
            </Link>

            <Link
              to="/chat"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition"
            >
              <Sparkles className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">AI Health Assistant</span>
            </Link>

            <div
              onClick={() => alert("Recent Notifications feed is shown at the bottom of the dashboard.")}
              className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Bell className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">Notifications</span>
              </div>
              <span className="h-5 w-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                {unreadNotifications}
              </span>
            </div>

            <Link
              to="/profile"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition"
            >
              <User className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">My Profile</span>
            </Link>

            <div
              onClick={() => alert("Medical History feature coming soon!")}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition cursor-pointer"
            >
              <BookOpen className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">Medical History</span>
            </div>

            <div
              onClick={() => alert("Help & Support is available 24/7 via the Support chat card below.")}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition cursor-pointer"
            >
              <HelpCircle className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">Help & Support</span>
            </div>
          </nav>
        </div>

        {/* Support Card & Logout */}
        <div className="p-4 border-t border-slate-100 flex-shrink-0">
          <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 mb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <MessageSquare className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-bold text-slate-800">Need Help?</span>
            </div>
            <p className="text-xs text-slate-500 font-medium mb-3 leading-relaxed">
              Our support team is available 24/7 to assist.
            </p>
            <button 
              onClick={() => alert("Opening support channel...")}
              className="w-full bg-blue-600 text-white font-bold text-xs py-2 rounded-xl hover:bg-blue-700 transition shadow-sm"
            >
              Chat with Support
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 hover:text-red-600 transition"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            <span className="truncate">Logout</span>
          </button>
        </div>
      </aside>

      {/* ==================== MAIN CONTENT WRAPPER ==================== */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* ==================== TOP HEADER ==================== */}
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-6 sm:px-8 flex-shrink-0">
          <div className="min-w-0">
            <h1 className="text-slate-800 font-extrabold text-xl sm:text-2xl tracking-tight leading-none truncate">
              Welcome back, {profile?.first_name || "Jane"} 👋
            </h1>
            <p className="text-xs text-slate-400 font-semibold mt-1 truncate">Here's what's happening with your health today.</p>
          </div>

          {/* Controls: Notifications + Profile Dropdown */}
          <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
            <button 
              onClick={() => alert("Opening notifications center...")}
              className="h-10 w-10 border border-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-50 transition relative flex-shrink-0"
            >
              <Bell className="h-5 w-5 text-slate-500" />
              <span className="absolute top-2 right-2 h-4 w-4 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-black">
                {unreadNotifications}
              </span>
            </button>

            <div className="relative">
              <button 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 sm:gap-3 p-1.5 hover:bg-slate-50 border border-slate-100/50 rounded-2xl transition"
              >
                <div className="h-9 w-9 bg-blue-100 text-blue-700 font-bold rounded-xl flex items-center justify-center shadow-inner flex-shrink-0">
                  {displayAvatarLetter}
                </div>
                <div className="text-left hidden sm:block min-w-0 max-w-[120px]">
                  <p className="text-sm font-bold text-slate-800 leading-none truncate">{patientName}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 truncate">Patient</p>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400 hidden sm:block flex-shrink-0" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-lg py-1 z-50">
                  <Link 
                    to="/profile" 
                    className="block px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    View Profile
                  </Link>
                  <button 
                    onClick={() => { setProfileDropdownOpen(false); handleLogout(); }}
                    className="w-full text-left px-4 py-2 text-sm font-semibold text-red-500 hover:bg-slate-50"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ==================== SCROLLABLE CORE ==================== */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 sm:space-y-8">

          {queueStatus?.active_emergency && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-3xl p-5 shadow-sm text-left flex items-start gap-4 animate-pulse">
              <div className="h-10 w-10 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0 text-red-600">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-red-900">Emergency Case Admitted</h4>
                <p className="text-xs font-semibold text-red-700 mt-0.5 leading-relaxed">
                  A critical walk-in patient is currently being attended to. All regular consultations are temporarily delayed. Thank you for your cooperation and patience.
                </p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl p-4 text-sm font-semibold flex items-center gap-3 shadow-sm text-left">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ==================== ROW 1: HERO + UPCOMING APPOINTMENT ==================== */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
            
            {/* Hero Banner (2/3 width) */}
            <div className="xl:col-span-2 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 rounded-3xl overflow-hidden relative shadow-md shadow-blue-100 min-h-[220px] flex items-center">
              {/* Marketing background image */}
              <div className="absolute inset-0">
                <img 
                  src="/patient_waiting_room.png" 
                  alt="Waiting Room" 
                  className="w-full h-full object-cover opacity-20 object-right"
                />
              </div>
              <div className="relative p-6 sm:p-8 max-w-md text-left">
                <div className="h-10 w-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center mb-4 border border-white/20">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-white text-xl lg:text-2xl font-black leading-tight mb-4">
                  Book appointments, track your queue, and get smarter healthcare support.
                </h2>
                <Link
                  to="/book-appointment"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white font-extrabold text-sm px-5 py-2.5 rounded-xl hover:bg-blue-700 transition shadow-md shadow-blue-900/30"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Book an Appointment</span>
                </Link>
              </div>
            </div>

            {/* Upcoming Appointment Widget (1/3 width) */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between text-left min-w-0">
              <div className="min-w-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 min-w-0">
                    <Calendar className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <span className="text-slate-800 font-extrabold text-sm truncate">Upcoming Appointment</span>
                  </div>
                  <button 
                    onClick={() => alert("Appointment details actions")}
                    className="text-slate-400 hover:text-slate-600 font-extrabold text-lg leading-none pb-2 flex-shrink-0"
                  >
                    ...
                  </button>
                </div>

                {upcomingAppointment ? (
                  <div className="space-y-4 min-w-0">
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-slate-800 text-base leading-snug whitespace-normal break-words">
                        {upcomingAppointment.doctor_type === "specialist" ? "Specialist Consultation" : "General Consultation"}
                      </h3>
                      <p className="text-xs text-slate-400 font-semibold mt-1 truncate">
                        Dr. {upcomingAppointment.doctor_name || "Mary N. Tchoua"}
                      </p>
                      <p className="text-xs text-slate-400 font-semibold truncate">
                        Holy Family Hospital, Buea
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      <div className="flex items-center gap-1.5 bg-blue-50 text-blue-600 font-bold text-xs px-2.5 py-1.5 rounded-lg flex-shrink-0">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{upcomingAppointment.appointment_date}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-blue-50 text-blue-600 font-bold text-xs px-2.5 py-1.5 rounded-lg flex-shrink-0">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{upcomingAppointment.appointment_time}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400 font-semibold text-xs leading-relaxed">
                    <Calendar className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                    No upcoming appointments found.
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-50 mt-6">
                <Link
                  to="/my-appointments"
                  className="w-full bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center transition border border-slate-100/50"
                >
                  View Appointment
                </Link>
              </div>
            </div>
          </div>

          {/* ==================== ROW 2: STATUS CARDS ==================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            
            {/* Queue Number */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-4 text-left min-w-0">
              <div className="h-12 w-12 bg-green-50 rounded-2xl flex items-center justify-center flex-shrink-0 text-green-600">
                <UserCheck className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider block whitespace-normal">Queue Number</p>
                <p className="text-2xl font-black text-green-600 tracking-tight mt-0.5 break-words">
                  {queueStatus ? `A${queueStatus.queue_number}` : "None"}
                </p>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5 block whitespace-normal leading-tight">Your current queue number</p>
              </div>
            </div>

            {/* Estimated Wait Time */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-4 text-left min-w-0">
              <div className="h-12 w-12 bg-purple-50 rounded-2xl flex items-center justify-center flex-shrink-0 text-purple-600">
                <Clock className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider block whitespace-normal">Estimated Waiting Time</p>
                <p className="text-2xl font-black text-purple-600 tracking-tight mt-0.5 break-words">
                  {queueStatus 
                    ? (queueStatus.triage_level === "emergency" ? "Immediate" : `${queueStatus.display_wait_time} mins`) 
                    : "N/A"}
                </p>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5 block whitespace-normal leading-tight">Approx. time to be seen</p>
              </div>
            </div>

            {/* Your Status / Priority */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-4 text-left min-w-0">
              <div className="h-12 w-12 bg-orange-50 rounded-2xl flex items-center justify-center flex-shrink-0 text-orange-600">
                <Activity className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider block whitespace-normal">Your Status</p>
                <p className="text-2xl font-black text-orange-600 tracking-tight mt-0.5 capitalize break-words">
                  {queueStatus?.triage_level || upcomingAppointment?.triage_level || "Routine"}
                </p>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5 block whitespace-normal leading-tight">Priority Level</p>
              </div>
            </div>

            {/* Total Appointments */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-4 text-left min-w-0">
              <div className="h-12 w-12 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0 text-blue-600">
                <Calendar className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider block whitespace-normal">Appointments</p>
                <p className="text-2xl font-black text-blue-600 tracking-tight mt-0.5 break-words">
                  {appointmentsThisMonth}
                </p>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5 block whitespace-normal leading-tight">This month</p>
              </div>
            </div>
          </div>

          {/* ==================== ROW 3: DETAILED BLOCKS ==================== */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
            
            {/* Left Block (Queue Tracker + Notifications) - 2/3 width */}
            <div className="xl:col-span-2 space-y-6 sm:space-y-8 min-w-0">
              
              {/* Queue Status Tracker */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm text-left min-w-0">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-slate-800 font-extrabold text-sm flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <span>Queue Status</span>
                  </h3>
                  <Link to="/queue-tracker" className="text-xs text-blue-600 font-bold hover:underline">
                    View Details
                  </Link>
                </div>

                {queueStatus ? (
                  <div className="space-y-6 min-w-0">
                    <p className="text-slate-800 font-extrabold text-sm">
                      You are number <span className="text-blue-600">{queueStatus.patients_ahead + 1}</span> in the queue
                    </p>

                    {/* Stepper Graphic */}
                    <div className="relative pt-6 pb-2">
                      <div className="absolute top-[37px] left-[10%] right-[10%] h-0.5 bg-slate-100" />
                      
                      {/* Highlighted track */}
                      {queueStatus.patients_ahead > 0 && (
                        <div 
                          className="absolute top-[37px] left-[10%] h-0.5 bg-blue-500 transition-all" 
                          style={{ width: "40%" }}
                        />
                      )}

                      <div className="flex justify-between items-center relative">
                        {/* Point 1: Being Served */}
                        <div className="flex flex-col items-center w-24 text-center">
                          <div className="h-7 w-7 rounded-full bg-slate-200 border-4 border-white flex items-center justify-center text-[10px] font-bold text-slate-600 shadow-sm z-10">
                            1
                          </div>
                          <span className="text-[10px] text-slate-400 font-bold mt-2 max-w-[80px] leading-tight block whitespace-normal">Being Served</span>
                        </div>

                        {/* Point 2: You */}
                        <div className="flex flex-col items-center w-24 text-center">
                          <div className="h-9 w-9 rounded-full bg-blue-600 border-4 border-white flex items-center justify-center text-xs font-bold text-white shadow-md shadow-blue-200 z-10">
                            A{queueStatus.queue_number}
                          </div>
                          <span className="text-[10px] text-blue-600 font-black mt-1.5 max-w-[80px] leading-tight block whitespace-normal">You</span>
                        </div>

                        {/* Point 3: End of Queue */}
                        <div className="flex flex-col items-center w-24 text-center">
                          <div className="h-7 w-7 rounded-full bg-slate-100 border-4 border-white flex items-center justify-center text-[10px] font-bold text-slate-400 shadow-sm z-10">
                            {queueStatus.queue_number + 1}
                          </div>
                          <span className="text-[10px] text-slate-400 font-bold mt-2 max-w-[80px] leading-tight block whitespace-normal">Next in Line</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 text-blue-700 rounded-2xl p-4 text-xs font-semibold flex items-center gap-3">
                      <AlertCircle className="h-4.5 w-4.5 text-blue-600 flex-shrink-0" />
                      <span className="block whitespace-normal leading-normal">Please stay close. You will receive an SMS when it's almost your turn.</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400 font-semibold text-xs leading-relaxed">
                    <Clock className="h-12 w-12 text-slate-200 mx-auto mb-3" />
                    You are not currently active in any queue today.
                    {upcomingAppointment && (
                      <div className="mt-4">
                        <Link 
                          to="/queue-tracker"
                          className="inline-flex items-center gap-2 bg-blue-600 text-white font-bold text-xs px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm"
                        >
                          Check Queue Status
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Recent Notifications */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm text-left min-w-0">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-slate-800 font-extrabold text-sm flex items-center gap-2">
                    <Bell className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <span>Recent Notifications</span>
                  </h3>
                  <button 
                    onClick={() => alert("Viewing all notifications...")}
                    className="text-xs text-blue-600 font-bold hover:underline"
                  >
                    View All
                  </button>
                </div>

                <div className="space-y-4 min-w-0">
                  {upcomingAppointment ? (
                    <div className="flex items-start justify-between py-2.5 border-b border-slate-50 last:border-none min-w-0">
                      <div className="flex items-start gap-3 min-w-0 w-full">
                        <div className="h-8 w-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0 text-green-600">
                          <Calendar className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-700 whitespace-normal break-words leading-normal">
                            Your appointment on {upcomingAppointment.appointment_date} at {upcomingAppointment.appointment_time} is confirmed.
                          </p>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">2 hours ago</p>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {queueStatus ? (
                    <div className="flex items-start justify-between py-2.5 border-b border-slate-50 last:border-none min-w-0">
                      <div className="flex items-start gap-3 min-w-0 w-full">
                        <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-600">
                          <Clock className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-700 whitespace-normal break-words leading-normal">
                            Your queue number is A{queueStatus.queue_number}. Estimated waiting time is {queueStatus.display_wait_time} minutes.
                          </p>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">2 hours ago</p>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <div className="flex items-start justify-between py-2.5 border-b border-slate-50 last:border-none min-w-0">
                    <div className="flex items-start gap-3 min-w-0 w-full">
                      <div className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0 text-orange-600">
                        <AlertCircle className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-700 whitespace-normal break-words leading-normal">
                          Reminder: Please arrive 15 minutes before your scheduled appointment time.
                        </p>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">1 day ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Block (AI Health Assistant Card) - 1/3 width */}
            <div className="min-w-0">
              
              {/* AI Health Assistant */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[400px] text-left min-w-0">
                <div className="min-w-0">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-slate-800 font-extrabold text-sm flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-blue-600 flex-shrink-0" />
                      <span>AI Health Assistant</span>
                    </h3>
                    <button 
                      onClick={() => alert("AI settings...")}
                      className="text-slate-400 hover:text-slate-600 font-extrabold leading-none pb-2 text-lg flex-shrink-0"
                    >
                      ...
                    </button>
                  </div>

                  <div className="mb-6">
                    <p className="text-xs font-semibold text-slate-500">Hello {profile?.first_name || "Jane"}! 👋</p>
                    <p className="text-sm font-extrabold text-slate-800 mt-1">How can I help you today?</p>
                  </div>

                  {/* Suggestion List */}
                  <div className="space-y-3 min-w-0">
                    {[
                      { title: "Check symptoms", desc: "Get guidance for your symptoms" },
                      { title: "Find a department", desc: "Connect with the right department" },
                      { title: "General questions", desc: "Ask about services, visiting hours, etc." }
                    ].map((item) => (
                      <div 
                        key={item.title}
                        onClick={() => navigate("/chat")}
                        className="p-3 border border-slate-100 hover:border-blue-100 hover:bg-blue-50/20 rounded-2xl flex items-center justify-between cursor-pointer transition min-w-0"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="h-8 w-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <MessageSquare className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-800 truncate">{item.title}</p>
                            <p className="text-[10px] text-slate-400 font-semibold truncate">{item.desc}</p>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0 ml-1" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-50 mt-6 flex-shrink-0">
                  <Link
                    to="/chat"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition shadow-md shadow-blue-200"
                  >
                    <Sparkles className="h-4.5 w-4.5" />
                    <span>Start Chat</span>
                  </Link>
                </div>
              </div>

            </div>

          </div>

        </main>
      </div>

    </div>
  )
}