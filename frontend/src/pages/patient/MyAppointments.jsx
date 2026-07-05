import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { getMyAppointments, cancelAppointment } from "../../services/api"
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
  X,
  Plus,
  Trash2,
  Stethoscope
} from "lucide-react"

export default function MyAppointments() {
  const navigate = useNavigate()
  const { logout, user: authUser } = useAuth()

  // Data states
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshCount, setRefreshCount] = useState(0)

  // UI state
  const [activeFilter, setActiveFilter] = useState("all") // "all", "upcoming", "pending", "completed", "cancelled"
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [appointmentToCancel, setAppointmentToCancel] = useState(null)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [cancelSuccess, setCancelSuccess] = useState("")

  // Fetch Appointments on mount & refresh
  useEffect(() => {
    async function loadAppointments() {
      try {
        setLoading(true)
        setError(null)
        const data = await getMyAppointments()
        if (Array.isArray(data)) {
          setAppointments(data)
        } else {
          setAppointments([])
        }
      } catch (err) {
        setError("Failed to load appointments. Verify server connection.")
      } finally {
        setLoading(false)
      }
    }
    loadAppointments()
  }, [refreshCount])

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const handleCancelClick = (app) => {
    setAppointmentToCancel(app)
    setShowCancelModal(true)
  }

  const handleConfirmCancel = async () => {
    if (!appointmentToCancel) return
    setCancelLoading(true)
    setError(null)
    try {
      const response = await cancelAppointment(appointmentToCancel.id)
      if (response.id || response.status === "cancelled") {
        setCancelSuccess("Appointment cancelled successfully.")
        setRefreshCount((prev) => prev + 1)
        setTimeout(() => {
          setShowCancelModal(false)
          setAppointmentToCancel(null)
          setCancelSuccess("")
        }, 1500)
      } else {
        setError(response.error || "Failed to cancel appointment.")
        setShowCancelModal(false)
      }
    } catch (err) {
      setError("Something went wrong. Please try again.")
      setShowCancelModal(false)
    } finally {
      setCancelLoading(false)
    }
  }

  // Filtered Appointments list
  const filteredAppointments = appointments.filter((app) => {
    const todayStr = new Date().toISOString().split("T")[0]
    if (activeFilter === "upcoming") {
      return app.status === "confirmed" && app.appointment_date >= todayStr
    }
    if (activeFilter === "pending") {
      return app.status === "pending"
    }
    if (activeFilter === "completed") {
      return app.status === "completed"
    }
    if (activeFilter === "cancelled") {
      return app.status === "cancelled"
    }
    return true // "all"
  })

  // Patient metadata display details
  const patientName = authUser?.first_name 
    ? `${authUser.first_name} ${authUser.last_name || ""}`.trim()
    : authUser?.username || "Jane N. Awah"

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
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold bg-blue-50 text-blue-600 transition"
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
            <h1 className="text-slate-800 font-extrabold text-xl sm:text-2xl tracking-tight leading-none truncate text-left">
              My Appointments
            </h1>
            <p className="text-xs text-slate-400 font-semibold mt-1 truncate text-left">Track pending, confirmed, and historical visits.</p>
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

        {/* ==================== CORE SCROLLABLE AREA ==================== */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 sm:space-y-8 text-left">
          
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl p-4 text-sm font-semibold flex items-center gap-3 shadow-sm">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Row & Tabs filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-2xl w-fit">
              {["all", "upcoming", "pending", "completed", "cancelled"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition ${
                    activeFilter === filter
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Book Button */}
            <Link
              to="/book-appointment"
              className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-extrabold text-sm hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-sm shadow-blue-200 self-start sm:self-auto"
            >
              <Plus className="h-4.5 w-4.5" />
              <span>Book Appointment</span>
            </Link>
          </div>

          {/* Appointments Grid */}
          {loading ? (
            <p className="text-center py-12 text-slate-400 font-semibold text-xs">Loading appointments schedule...</p>
          ) : filteredAppointments.length === 0 ? (
            <div className="bg-white border border-slate-100 p-16 rounded-3xl shadow-sm text-center max-w-xl mx-auto mt-8">
              <Calendar className="h-16 w-16 text-slate-200 mx-auto mb-4" />
              <h3 className="font-extrabold text-slate-800 text-lg">No appointments found</h3>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                There are no consultations matches under the "{activeFilter}" filter. Check other filters or schedule a new appointment.
              </p>
              <Link
                to="/book-appointment"
                className="mt-6 inline-flex items-center gap-2 bg-blue-50 text-blue-700 font-extrabold text-xs px-5 py-2.5 rounded-xl hover:bg-blue-100 transition border border-blue-100/50"
              >
                Schedule First Appointment
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredAppointments.map((app) => {
                const todayStr = new Date().toISOString().split("T")[0]
                const isConfirmedToday = app.status === "confirmed" && app.appointment_date === todayStr
                
                return (
                  <div
                    key={app.id}
                    className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wide ${
                            app.doctor_type === "specialist" ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600"
                          }`}>
                            {app.doctor_type === "specialist" ? "Specialist" : "General"}
                          </span>
                          <h3 className="font-extrabold text-slate-800 text-base mt-2">Dr. {app.doctor_name}</h3>
                        </div>

                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          app.status === "pending" && "bg-amber-50 text-amber-700"
                        } ${
                          app.status === "confirmed" && "bg-green-50 text-green-700"
                        } ${
                          app.status === "cancelled" && "bg-red-50 text-red-700"
                        } ${
                          app.status === "completed" && "bg-slate-100 text-slate-700"
                        }`}>
                          {app.status}
                        </span>
                      </div>

                      <div className="flex gap-2 mb-4">
                        <span className="flex items-center gap-1.5 bg-slate-50 text-slate-600 font-bold text-[11px] px-3 py-1.5 rounded-xl border border-slate-100/50">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span>{app.appointment_date}</span>
                        </span>
                        <span className="flex items-center gap-1.5 bg-slate-50 text-slate-600 font-bold text-[11px] px-3 py-1.5 rounded-xl border border-slate-100/50">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <span>{app.appointment_time}</span>
                        </span>
                      </div>

                      <div className="text-xs space-y-2 bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50 mb-6">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Symptoms Logged</span>
                          <p className="text-slate-600 font-medium mt-0.5 leading-relaxed">{app.symptoms || "No symptoms logged."}</p>
                        </div>
                        {app.notes && (
                          <div className="pt-2 border-t border-slate-100">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Doctor Notes</span>
                            <p className="text-slate-600 font-medium mt-0.5 leading-relaxed">{app.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between gap-4 mt-auto">
                      {isConfirmedToday ? (
                        <Link
                          to="/queue-tracker"
                          className="flex-1 bg-green-600 text-white font-extrabold text-xs py-2.5 rounded-xl hover:bg-green-700 transition text-center shadow-sm"
                        >
                          Check In & Track Queue
                        </Link>
                      ) : (
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          {app.status === "confirmed" ? "📅 Verified Slot" : "⏳ Awaiting Review"}
                        </div>
                      )}

                      {(app.status === "pending" || app.status === "confirmed") && (
                        <button
                          onClick={() => handleCancelClick(app)}
                          className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold text-xs transition flex items-center gap-1.5"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Cancel</span>
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

        </main>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && appointmentToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Cancel Appointment</h3>
              <button 
                onClick={() => setShowCancelModal(false)} 
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 text-left space-y-4">
              {cancelSuccess && (
                <div className="bg-green-50 border border-green-100 text-green-600 text-xs p-3.5 rounded-xl font-semibold">
                  {cancelSuccess}
                </div>
              )}

              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                Are you sure you want to cancel your consultation with <strong className="text-slate-800">Dr. {appointmentToCancel.doctor_name}</strong> on <strong className="text-slate-800">{appointmentToCancel.appointment_date}</strong> at <strong className="text-slate-800">{appointmentToCancel.appointment_time}</strong>?
              </p>
              <p className="text-xs text-red-500 font-bold bg-red-50 p-3 rounded-xl border border-red-100/50 leading-relaxed">
                ⚠️ Warning: Cancelled slots are released immediately and cannot be recovered. You will need to book a new appointment if you change your mind.
              </p>

              <div className="pt-4 border-t border-slate-50 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  Close
                </button>
                <button
                  onClick={handleConfirmCancel}
                  disabled={cancelLoading}
                  className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md shadow-red-200 transition disabled:opacity-50"
                >
                  {cancelLoading ? "Cancelling..." : "Confirm Cancellation"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
