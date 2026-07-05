import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { getMyQueueStatus, getMyAppointments, joinQueue } from "../../services/api"
import {
  LayoutDashboard,
  Calendar,
  Clock,
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
  CheckCircle,
  ChevronRight,
  TrendingUp,
  Activity,
  Users,
  Compass,
  Stethoscope
} from "lucide-react"

export default function QueueTracker() {
  const navigate = useNavigate()
  const { logout, user: authUser } = useAuth()

  // State variables
  const [queueStatus, setQueueStatus] = useState(null)
  const [todayAppointment, setTodayAppointment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [checkingIn, setCheckingIn] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState("")
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)

  // Fetch Queue Status & Today's Confirmed Appointment on mount
  useEffect(() => {
    async function loadQueueData() {
      try {
        setLoading(true)
        setError(null)

        // 1. Fetch current queue status
        const queue = await getMyQueueStatus()
        if (queue && queue.queue_number !== undefined) {
          setQueueStatus(queue)
        } else {
          setQueueStatus(null)
          
          // 2. If not in queue, fetch today's confirmed appointment to allow check-in
          const appointments = await getMyAppointments()
          if (Array.isArray(appointments)) {
            const todayStr = new Date().toISOString().split("T")[0]
            const todayApp = appointments.find(
              (app) => app.status === "confirmed" && app.appointment_date === todayStr
            )
            setTodayAppointment(todayApp || null)
          }
        }
      } catch (err) {
        setError("Failed to connect to the queue system. Check server connection.")
      } finally {
        setLoading(false)
      }
    }
    loadQueueData()
  }, [])

  // Call Join Queue API
  const handleCheckIn = async () => {
    if (!todayAppointment) return
    setCheckingIn(true)
    setError(null)
    setSuccess("")

    try {
      const response = await joinQueue(todayAppointment.id)
      if (response.id || response.queue_number !== undefined) {
        setSuccess("Checked in successfully! You are now in the active queue.")
        setQueueStatus(response)
        setTodayAppointment(null)
      } else {
        setError(response.error || "Check-in failed. Please try again.")
      }
    } catch (err) {
      setError("Network error occurred during check-in.")
    } finally {
      setCheckingIn(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const patientName = authUser?.first_name 
    ? `${authUser.first_name} ${authUser.last_name || ""}`.trim()
    : authUser?.username || "Patient"

  const displayAvatarLetter = patientName.charAt(0).toUpperCase()
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
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition"
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
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold bg-blue-50 text-blue-600 transition"
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
            <h1 className="text-slate-800 font-extrabold text-xl sm:text-2xl tracking-tight leading-none truncate text-left">
              Real-time Queue Tracker
            </h1>
            <p className="text-xs text-slate-400 font-semibold mt-1 truncate text-left">View your live consultation wait prediction.</p>
          </div>

          {/* Controls */}
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
                    className="block px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-800 text-left"
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

        {/* ==================== SCROLLABLE MAIN ==================== */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 sm:space-y-8 text-left">
          
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl p-4 text-sm font-semibold flex items-center gap-3 shadow-sm">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-100 text-green-600 rounded-2xl p-4 text-sm font-semibold flex items-center gap-3 shadow-sm">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {loading ? (
            <p className="text-center py-12 text-slate-400 font-semibold text-xs">Connecting to queue status tracker...</p>
          ) : queueStatus ? (
            
            // USER IS ACTIVE IN QUEUE
            <div className="space-y-8">

              {/* Active Emergency Alert Banner */}
              {queueStatus.active_emergency && (
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
              
              {/* Tracker Hero Board */}
              <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-4 text-center md:text-left">
                  <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                    queueStatus.triage_level === "emergency"
                      ? "bg-red-600 text-white animate-pulse"
                      : "bg-green-50 text-green-700 border border-green-100"
                  }`}>
                    {queueStatus.triage_level === "emergency" ? "Critical Emergency" : "Checked In & Waiting"}
                  </span>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Your Queue Position</p>
                    <h2 className="text-6xl font-black text-blue-900 tracking-tight mt-1">A{queueStatus.queue_number}</h2>
                  </div>
                  <p className="text-sm text-slate-500 font-semibold flex items-center justify-center md:justify-start gap-1.5">
                    <Users className="h-4.5 w-4.5 text-slate-400" />
                    <span>{queueStatus.patients_ahead} patients ahead of you</span>
                  </p>
                </div>

                <div className="h-px w-full md:h-24 md:w-px bg-slate-100" />

                {/* Predictor Panel */}
                <div className="bg-blue-50/50 border border-blue-100/50 rounded-2xl p-6 max-w-sm w-full space-y-3">
                  <h3 className="font-extrabold text-sm text-blue-900 flex items-center gap-2">
                    <Sparkles className="h-4.5 w-4.5 text-blue-600 animate-pulse" />
                    <span>ML Predicted Wait Time</span>
                  </h3>
                  <div>
                    <h1 className="text-4xl font-black text-blue-900 tracking-tight">
                      {queueStatus.triage_level === "emergency"
                        ? "Immediate"
                        : `${queueStatus.ml_predicted_wait_time ?? queueStatus.display_wait_time} mins`}
                    </h1>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 block">
                      Generated by Random Forest predictor
                    </p>
                  </div>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Calculated dynamically based on doctor type, patient logs, and today's load.
                  </p>
                </div>
              </div>

              {/* Progress timeline */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm">
                <h3 className="font-extrabold text-slate-800 text-sm mb-8">Consultation Progress Timeline</h3>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 sm:gap-4 relative px-4">
                  {/* Progress Line */}
                  <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 hidden sm:block z-0" />
                  
                  {/* Step 1 */}
                  <div className="flex sm:flex-col items-center gap-4 sm:gap-2 relative z-10 w-full sm:w-1/3">
                    <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-200">
                      1
                    </div>
                    <div className="text-left sm:text-center">
                      <p className="text-xs font-bold text-slate-800">Checked In</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Checked in at clinic</p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex sm:flex-col items-center gap-4 sm:gap-2 relative z-10 w-full sm:w-1/3">
                    <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold border-2 border-blue-600">
                      2
                    </div>
                    <div className="text-left sm:text-center">
                      <p className="text-xs font-bold text-blue-900">Waiting Room</p>
                      <p className="text-[10px] text-blue-600 font-extrabold mt-0.5">Position A{queueStatus.queue_number}</p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex sm:flex-col items-center gap-4 sm:gap-2 relative z-10 w-full sm:w-1/3">
                    <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center font-bold">
                      3
                    </div>
                    <div className="text-left sm:text-center">
                      <p className="text-xs font-bold text-slate-400">Consultation</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Called by doctor</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Advanced Comparison Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* ML Engine Comparison */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                  <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                    <TrendingUp className="h-4.5 w-4.5 text-blue-600" />
                    <span>ML Prediction Analytics</span>
                  </h4>
                  
                  <div className="space-y-3.5">
                    <div>
                      <div className="flex justify-between items-center text-xs font-bold text-slate-500 mb-1">
                        <span>Standard Queue Calculation (Static)</span>
                        <span className="text-slate-800">
                          {queueStatus.triage_level === "emergency" ? "0 mins (Immediate)" : `${queueStatus.estimated_wait_time} mins`}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-slate-400 h-full rounded-full" style={{ width: `${queueStatus.triage_level === "emergency" ? 0 : Math.min(100, (queueStatus.estimated_wait_time / 120) * 100)}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-xs font-bold text-blue-600 mb-1">
                        <span>ML Predicted Model Time (Random Forest)</span>
                        <span className="font-extrabold text-blue-900">
                          {queueStatus.triage_level === "emergency" ? "0 mins (Immediate)" : `${queueStatus.ml_predicted_wait_time ?? queueStatus.display_wait_time} mins`}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full rounded-full" style={{ width: `${queueStatus.triage_level === "emergency" ? 0 : Math.min(100, ((queueStatus.ml_predicted_wait_time ?? queueStatus.display_wait_time) / 120) * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-[10px] text-slate-400 font-semibold leading-relaxed pt-2">
                    💡 **Model Insight**: The Random Forest predictor factors in current check-ins, the weekday triage history, and the doctor's specific consultation duration trends to give a customized wait estimate instead of a simple static average.
                  </p>
                </div>

                {/* Consultation Details */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2 mb-4">
                      <UserCheck className="h-4.5 w-4.5 text-blue-600" />
                      <span>Consultation Details</span>
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs font-bold">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Assigned Doctor</span>
                        <span className="text-slate-800 font-extrabold block mt-0.5">Dr. {queueStatus.doctor_name || "Simon Peter"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Department Office</span>
                        <span className="text-slate-800 font-extrabold block mt-0.5">{queueStatus.hospital_name || "Mt Mary Hospital"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Triage Classification</span>
                        <span className="text-orange-600 font-extrabold block mt-0.5 uppercase tracking-wide">{queueStatus.triage_level || "Routine"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Est. Consultation</span>
                        <span className="text-slate-800 font-extrabold block mt-0.5">{queueStatus.avg_consultation_time || 15} mins</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 font-semibold leading-relaxed border-t border-slate-50 pt-3 mt-4">
                    ⚠️ Please remain in the waiting area. You will receive an SMS text notification on your phone when the doctor is ready to see you.
                  </p>
                </div>

              </div>

            </div>
          ) : todayAppointment ? (
            
            // USER HAS A CONFIRMED APPOINTMENT TODAY BUT HAS NOT CHECKED IN
            <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm text-center max-w-xl mx-auto space-y-6 mt-8">
              <div className="h-16 w-16 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-900 mx-auto">
                <Calendar className="h-8 w-8" />
              </div>
              
              <div className="space-y-2">
                <h3 className="font-extrabold text-slate-800 text-lg">Check in for Today's Appointment</h3>
                <p className="text-slate-400 text-xs max-w-md mx-auto leading-relaxed">
                  You have a confirmed appointment with <strong className="text-slate-700">Dr. {todayAppointment.doctor_name}</strong> scheduled for today at <strong className="text-slate-700">{todayAppointment.appointment_time}</strong>. Please check in below to get your queue number and wait estimate.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 max-w-md mx-auto text-left text-xs font-bold text-slate-500 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Facility Office</span>
                  <span className="text-slate-700 block mt-0.5">{todayAppointment.hospital_name || "Mt Mary Hospital"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Scheduled Time</span>
                  <span className="text-slate-700 block mt-0.5">{todayAppointment.appointment_time}</span>
                </div>
              </div>

              <button
                onClick={handleCheckIn}
                disabled={checkingIn}
                className="w-full max-w-md bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-extrabold text-sm transition disabled:opacity-50 shadow-md shadow-blue-200 flex items-center justify-center gap-2 mx-auto"
              >
                <Compass className={`h-4.5 w-4.5 ${checkingIn ? "animate-spin" : ""}`} />
                <span>{checkingIn ? "Checking in..." : "Check In to Waiting Room"}</span>
              </button>
            </div>
          ) : (
            
            // NO ACTIVE APPOINTMENT TODAY & NOT IN QUEUE
            <div className="bg-white border border-slate-100 p-16 rounded-3xl shadow-sm text-center max-w-xl mx-auto mt-8">
              <Clock className="h-16 w-16 text-slate-200 mx-auto mb-4" />
              <h3 className="font-extrabold text-slate-800 text-lg">No active queue entries</h3>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                You are not currently in any waiting room queue today, and you don't have any confirmed appointments scheduled for today.
              </p>
              <div className="flex gap-3 justify-center mt-6">
                <Link
                  to="/book-appointment"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl hover:bg-blue-700 transition shadow-sm"
                >
                  Schedule an Appointment
                </Link>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-600 font-extrabold text-xs px-5 py-2.5 rounded-xl transition border border-slate-100/50"
                >
                  Back to Dashboard
                </Link>
              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  )
}
