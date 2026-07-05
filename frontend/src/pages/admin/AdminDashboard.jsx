import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import {
  getTodayQueue,
  updateQueueStatus,
  getAllAppointments,
  updateAppointmentStatus,
  getDoctors,
  getDoctorAvailability,
  toggleDoctorStatus,
  toggleDoctorAvailability,
  createDoctor,
  logEmergencyWalkin
} from "../../services/api"
import {
  LayoutDashboard,
  Clock,
  Calendar,
  Users,
  Bell,
  LogOut,
  CheckCircle,
  XCircle,
  Play,
  RotateCcw,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Shield,
  Activity,
  CalendarDays,
  UserCheck,
  ChevronRight,
  UserCheck2,
  ListOrdered,
  Stethoscope,
  X,
  AlertCircle
} from "lucide-react"

export default function AdminDashboard({ defaultTab = "queue" }) {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  
  // Navigation tabs
  const [activeTab, setActiveTab] = useState(defaultTab) // "queue", "appointments", "doctors"

  // Data states
  const [queue, setQueue] = useState([])
  const [appointments, setAppointments] = useState([])
  const [doctors, setDoctors] = useState([])
  const [selectedDoctorAvailability, setSelectedDoctorAvailability] = useState([])
  const [selectedDoctorId, setSelectedDoctorId] = useState(null)
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [refreshCount, setRefreshCount] = useState(0)

  // Onboard Doctor Modal States
  const [showOnboardModal, setShowOnboardModal] = useState(false)
  const [onboardForm, setOnboardForm] = useState({
    username: "",
    password: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    specialization: "",
    doctor_type: "general",
    avg_consultation_time: 15
  })
  const [onboardError, setOnboardError] = useState("")
  const [onboardSuccess, setOnboardSuccess] = useState("")
  const [onboardLoading, setOnboardLoading] = useState(false)

  // Emergency Walk-in Modal States
  const [showEmergencyModal, setShowEmergencyModal] = useState(false)
  const [emergencyForm, setEmergencyForm] = useState({
    patient_name: "Accident Victim",
    doctor_id: ""
  })
  const [emergencyError, setEmergencyError] = useState("")
  const [emergencySuccess, setEmergencySuccess] = useState("")
  const [emergencyLoading, setEmergencyLoading] = useState(false)

  const handleEmergencySubmit = async (e) => {
    e.preventDefault()
    setEmergencyError("")
    setEmergencySuccess("")
    
    if (!emergencyForm.doctor_id) {
      setEmergencyError("Please assign a doctor for the emergency case.")
      return
    }

    setEmergencyLoading(true)
    try {
      const response = await logEmergencyWalkin(emergencyForm)
      if (response.id || response.queue_number !== undefined) {
        setEmergencySuccess("Emergency walk-in registered! Alert SMS messages dispatched to other waiting patients.")
        setRefreshCount(prev => prev + 1)
        setTimeout(() => {
          setShowEmergencyModal(false)
          setEmergencyForm({
            patient_name: "Accident Victim",
            doctor_id: ""
          })
          setEmergencySuccess("")
        }, 2000)
      } else {
        setEmergencyError(response.error || "Failed to admit emergency case.")
      }
    } catch (err) {
      setEmergencyError("Network error occurred during walk-in admission.")
    } finally {
      setEmergencyLoading(false)
    }
  }

  const handleOnboardSubmit = async (e) => {
    e.preventDefault()
    setOnboardError("")
    setOnboardSuccess("")
    setOnboardLoading(true)

    try {
      const response = await createDoctor(onboardForm)
      if (response.id || response.username) {
        setOnboardSuccess("Doctor onboarded successfully!")
        setRefreshCount(prev => prev + 1)
        setTimeout(() => {
          setShowOnboardModal(false)
          // Reset form
          setOnboardForm({
            username: "",
            password: "",
            first_name: "",
            last_name: "",
            phone_number: "",
            specialization: "",
            doctor_type: "general",
            avg_consultation_time: 15
          })
          setOnboardSuccess("")
        }, 1500)
      } else {
        let msg = "Onboarding failed. Please check your inputs."
        if (response.username) msg = `Username: ${response.username[0]}`
        else if (response.error) msg = response.error
        else if (typeof response === "object") {
          const firstKey = Object.keys(response)[0]
          if (firstKey) {
            msg = `${firstKey}: ${response[firstKey]}`
          }
        }
        setOnboardError(msg)
      }
    } catch (err) {
      setOnboardError("Something went wrong. Please try again.")
    } finally {
      setOnboardLoading(false)
    }
  }

  // Fetch Dashboard Data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError("")

        if (activeTab === "queue") {
          const queueData = await getTodayQueue()
          if (Array.isArray(queueData)) {
            setQueue(queueData)
          } else {
            setQueue([])
          }
          // Load doctors list so it is populated for the Emergency Walk-in modal
          const docData = await getDoctors()
          if (Array.isArray(docData)) {
            setDoctors(docData)
          } else {
            setDoctors([])
          }
        } else if (activeTab === "appointments") {
          const appData = await getAllAppointments()
          if (Array.isArray(appData)) {
            setAppointments(appData)
          } else {
            setAppointments([])
          }
        } else if (activeTab === "doctors") {
          const docData = await getDoctors()
          if (Array.isArray(docData)) {
            setDoctors(docData)
          } else {
            setDoctors([])
          }
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err)
        setError("Failed to fetch backend data. Verify server connection.")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [activeTab, refreshCount])

  // Poll queue data every 30 seconds for simulated real-time updates
  useEffect(() => {
    if (activeTab !== "queue") return
    
    const interval = setInterval(() => {
      setRefreshCount(prev => prev + 1)
    }, 30000)

    return () => clearInterval(interval)
  }, [activeTab])

  // Queue Status Updates
  const handleUpdateQueueStatus = async (queueId, newStatus) => {
    try {
      const updated = await updateQueueStatus(queueId, newStatus)
      if (updated && !updated.error) {
        setRefreshCount(prev => prev + 1)
        alert(`Queue entry status updated to: ${newStatus}`)
      } else {
        alert(updated.error || "Failed to update queue status.")
      }
    } catch (e) {
      alert("Error updating queue status. Try again.")
    }
  }

  // Appointment Status Updates
  const handleUpdateAppointment = async (appId, newStatus) => {
    try {
      const updated = await updateAppointmentStatus(appId, newStatus)
      if (updated && !updated.error) {
        setRefreshCount(prev => prev + 1)
        alert(`Appointment status updated to: ${newStatus}`)
      } else {
        alert(updated.error || "Failed to update appointment.")
      }
    } catch (e) {
      alert("Error updating appointment. Try again.")
    }
  }

  // Doctor Status Updates
  const handleToggleDoctorStatus = async (docId, currentStatus) => {
    try {
      const res = await toggleDoctorStatus(docId, !currentStatus)
      if (res && !res.error) {
        setRefreshCount(prev => prev + 1)
      } else {
        alert(res.error || "Failed to toggle status.")
      }
    } catch (e) {
      alert("Error communicating with server.")
    }
  }

  // Doctor Schedule Updates
  const handleSelectDoctor = async (docId) => {
    try {
      setSelectedDoctorId(docId)
      const availability = await getDoctorAvailability(docId)
      if (Array.isArray(availability)) {
        setSelectedDoctorAvailability(availability)
      } else {
        setSelectedDoctorAvailability([])
      }
    } catch (e) {
      alert("Failed to fetch doctor schedule slots.")
    }
  }

  const handleToggleAvailabilitySlot = async (slotId, currentStatus) => {
    try {
      const res = await toggleDoctorAvailability(slotId, !currentStatus)
      if (res && !res.error) {
        // Refresh local selected availability
        if (selectedDoctorId) {
          handleSelectDoctor(selectedDoctorId)
        }
      } else {
        alert(res.error || "Failed to update availability slot.")
      }
    } catch (e) {
      alert("Error updating availability slot.")
    }
  }

  const handleLogout = () => {
    logout()
    navigate("/admin/login")
  }

  // Metric aggregates
  const queueWaitingCount = queue.filter(q => q.status === "waiting").length
  const queueActiveCount = queue.filter(q => q.status === "in_progress").length
  const queueCompletedCount = queue.filter(q => q.status === "completed").length
  
  // Calculate average waiting time today
  const activeWaitTimes = queue.filter(q => q.status === "waiting").map(q => q.display_wait_time)
  const avgWaitTime = activeWaitTimes.length 
    ? Math.round(activeWaitTimes.reduce((a, b) => a + b, 0) / activeWaitTimes.length) 
    : 0

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* ==================== LEFT SIDEBAR ==================== */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col justify-between h-full flex-shrink-0">
        <div>
          {/* Logo / Header */}
          <div className="p-6 border-b border-slate-50 flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-200 flex-shrink-0 animate-pulse-slow">
              <Stethoscope className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <span className="text-xl font-black text-slate-800 tracking-tight block truncate text-left">MediQueue</span>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none text-left">Admin Portal</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <button
              onClick={() => setActiveTab("queue")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === "queue" 
                  ? "bg-blue-50 text-blue-600" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              <ListOrdered className="h-5 w-5 flex-shrink-0" />
              <span>Queue Desk</span>
            </button>
            
            <button
              onClick={() => setActiveTab("appointments")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === "appointments" 
                  ? "bg-blue-50 text-blue-600" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              <CalendarDays className="h-5 w-5 flex-shrink-0" />
              <span>Appointment Approvals</span>
            </button>

            <button
              onClick={() => setActiveTab("doctors")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === "doctors" 
                  ? "bg-blue-50 text-blue-600" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              <Users className="h-5 w-5 flex-shrink-0" />
              <span>Doctor Roster</span>
            </button>
          </nav>
        </div>

        {/* Support Card & Logout */}
        <div className="p-4 border-t border-slate-100 flex-shrink-0">
          <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 mb-4 text-left">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-bold text-slate-800">Session Secure</span>
            </div>
            <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
              Log out when leaving the workstation to maintain security and compliance.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 hover:text-red-600 transition"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ==================== MAIN CONTENT WRAPPER ==================== */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* ==================== TOP HEADER ==================== */}
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 flex-shrink-0">
          <div className="text-left min-w-0">
            <h1 className="text-slate-800 font-extrabold text-2xl tracking-tight leading-none uppercase">
              {activeTab === "queue" && "Queue Desk"}
              {activeTab === "appointments" && "Appointments Approvals"}
              {activeTab === "doctors" && "Doctor Roster Management"}
            </h1>
            <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wider">
              Hospital Queue and Triage Systems
            </p>
          </div>

          {/* Controls: Refresh button */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {activeTab === "queue" && (
              <button 
                onClick={() => setShowEmergencyModal(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-md shadow-red-200"
              >
                <AlertCircle className="h-3.5 w-3.5" />
                <span>Admit Emergency Case</span>
              </button>
            )}
            <button 
              onClick={() => setRefreshCount(prev => prev + 1)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-extrabold rounded-xl transition flex items-center gap-1.5 shadow-sm border border-slate-200/30"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Refresh Desk</span>
            </button>
            <div className="h-10 w-10 bg-blue-100 text-blue-700 font-bold rounded-xl flex items-center justify-center shadow-inner">
              AD
            </div>
          </div>
        </header>

        {/* ==================== SCROLLABLE CORE ==================== */}
        <main className="flex-1 overflow-y-auto p-8 space-y-8">
          
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl p-4 text-sm font-semibold flex items-center gap-3 shadow-sm text-left">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ==================== QUEUE TAB ==================== */}
          {activeTab === "queue" && (
            <div className="space-y-8">
              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-4 text-left min-w-0">
                  <div className="h-12 w-12 bg-amber-50 rounded-2xl flex items-center justify-center flex-shrink-0 text-amber-600">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Waiting Patients</p>
                    <p className="text-2xl font-black text-amber-600 tracking-tight mt-0.5">{queueWaitingCount}</p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5 block truncate">In line today</p>
                  </div>
                </div>

                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-4 text-left min-w-0">
                  <div className="h-12 w-12 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0 text-blue-600">
                    <Play className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Active Consultations</p>
                    <p className="text-2xl font-black text-blue-600 tracking-tight mt-0.5">{queueActiveCount}</p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5 block truncate">Currently with doctors</p>
                  </div>
                </div>

                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-4 text-left min-w-0">
                  <div className="h-12 w-12 bg-green-50 rounded-2xl flex items-center justify-center flex-shrink-0 text-green-600">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Total Completed</p>
                    <p className="text-2xl font-black text-green-600 tracking-tight mt-0.5">{queueCompletedCount}</p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5 block truncate">Consultations completed</p>
                  </div>
                </div>

                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-4 text-left min-w-0">
                  <div className="h-12 w-12 bg-purple-50 rounded-2xl flex items-center justify-center flex-shrink-0 text-purple-600">
                    <Activity className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Avg. Wait Time</p>
                    <p className="text-2xl font-black text-purple-600 tracking-tight mt-0.5">{avgWaitTime} mins</p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5 block truncate">Average waiting estimate</p>
                  </div>
                </div>
              </div>

              {/* Queue List Table */}
              <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                  <h3 className="font-extrabold text-slate-800 text-sm">Today's Patients Queue List</h3>
                  <span className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1.5 rounded-full">
                    {queue.length} Total Checked-in today
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                        <th className="px-6 py-4">Queue #</th>
                        <th className="px-6 py-4">Patient Name</th>
                        <th className="px-6 py-4">Doctor assigned</th>
                        <th className="px-6 py-4">Triage Priority</th>
                        <th className="px-6 py-4">Wait Estimate</th>
                        <th className="px-6 py-4">Current Status</th>
                        <th className="px-6 py-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                      {loading ? (
                        <tr>
                          <td colSpan="7" className="px-6 py-12 text-center text-slate-400">Loading Queue...</td>
                        </tr>
                      ) : queue.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="px-6 py-12 text-center text-slate-400">No patients in the queue today.</td>
                        </tr>
                      ) : (
                        queue.map((entry) => (
                          <tr key={entry.id} className="hover:bg-slate-50/50 transition">
                            <td className="px-6 py-4 font-extrabold text-slate-900">A{entry.queue_number}</td>
                            <td className="px-6 py-4 font-bold">{entry.patient_name}</td>
                            <td className="px-6 py-4 font-semibold text-slate-500">{entry.doctor_name}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                entry.triage_level === "emergency"
                                  ? "bg-red-600 text-white border border-red-700 animate-pulse shadow-sm shadow-red-200"
                                  : entry.triage_level === "urgent" 
                                    ? "bg-red-50 text-red-600 border border-red-100" 
                                    : "bg-slate-100 text-slate-600"
                              }`}>
                                {entry.triage_level}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-semibold">{entry.display_wait_time} mins</td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                entry.status === "waiting" && "bg-amber-50 text-amber-700"
                              } ${
                                entry.status === "in_progress" && "bg-blue-600 text-white"
                              } ${
                                entry.status === "completed" && "bg-green-50 text-green-700"
                              } ${
                                entry.status === "skipped" && "bg-slate-200 text-slate-700"
                              }`}>
                                {entry.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 flex gap-2 justify-center">
                              {entry.status === "waiting" && (
                                <button
                                  onClick={() => handleUpdateQueueStatus(entry.id, "in_progress")}
                                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition shadow-sm flex items-center gap-1"
                                >
                                  <Play className="h-3 w-3" /> Call Patient
                                </button>
                              )}
                              {entry.status === "in_progress" && (
                                <>
                                  <button
                                    onClick={() => handleUpdateQueueStatus(entry.id, "completed")}
                                    className="px-3.5 py-1.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-lg transition shadow-sm"
                                  >
                                    Complete
                                  </button>
                                  <button
                                    onClick={() => handleUpdateQueueStatus(entry.id, "skipped")}
                                    className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs rounded-lg transition"
                                  >
                                    Skip
                                  </button>
                                </>
                              )}
                              {(entry.status === "completed" || entry.status === "skipped") && (
                                <span className="text-slate-400 text-xs font-semibold py-1">No Actions</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================== APPOINTMENTS TAB ==================== */}
          {activeTab === "appointments" && (
            <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                <h3 className="font-extrabold text-slate-800 text-sm">Outpatient Bookings Approval Desk</h3>
                <span className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1.5 rounded-full">
                  {appointments.length} Appointments Total
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Time</th>
                      <th className="px-6 py-4">Patient Name</th>
                      <th className="px-6 py-4">Doctor Name</th>
                      <th className="px-6 py-4">Reported Symptoms</th>
                      <th className="px-6 py-4">Triage status</th>
                      <th className="px-6 py-4">Appointment Status</th>
                      <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                    {loading ? (
                      <tr>
                        <td colSpan="8" className="px-6 py-12 text-center text-slate-400">Loading Bookings...</td>
                      </tr>
                    ) : appointments.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="px-6 py-12 text-center text-slate-400">No appointments recorded.</td>
                      </tr>
                    ) : (
                      appointments.map((app) => (
                        <tr key={app.id} className="hover:bg-slate-50/50 transition">
                          <td className="px-6 py-4 font-bold">{app.appointment_date}</td>
                          <td className="px-6 py-4 font-semibold text-slate-500">{app.appointment_time}</td>
                          <td className="px-6 py-4 font-bold">{app.patient_name}</td>
                          <td className="px-6 py-4 font-semibold text-slate-500">{app.doctor_name}</td>
                          <td className="px-6 py-4 text-xs font-semibold text-slate-500 max-w-[200px] truncate" title={app.symptoms}>
                            {app.symptoms || "No symptoms logged"}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              app.triage_level === "emergency" ? "bg-red-600 text-white animate-pulse" : app.triage_level === "urgent" ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-500"
                            }`}>
                              {app.triage_level}
                            </span>
                          </td>
                          <td className="px-6 py-4">
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
                          </td>
                          <td className="px-6 py-4 flex gap-2 justify-center">
                            {app.status === "pending" && (
                              <>
                                <button
                                  onClick={() => handleUpdateAppointment(app.id, "confirmed")}
                                  className="px-3.5 py-1.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-lg transition shadow-sm"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => handleUpdateAppointment(app.id, "cancelled")}
                                  className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition"
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                            {app.status === "confirmed" && (
                              <button
                                onClick={() => handleUpdateAppointment(app.id, "cancelled")}
                                className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-lg transition"
                              >
                                Cancel Booking
                              </button>
                            )}
                            {(app.status === "cancelled" || app.status === "completed") && (
                              <span className="text-slate-400 text-xs font-semibold py-1">No Actions</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================== DOCTORS TAB ==================== */}
          {activeTab === "doctors" && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              
              {/* Doctor List (2/3 width) */}
              <div className="xl:col-span-2 space-y-6">
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm text-left">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-extrabold text-slate-800 text-sm">Clinic Doctors Availability</h3>
                    <button
                      onClick={() => setShowOnboardModal(true)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition"
                    >
                      Onboard New Doctor
                    </button>
                  </div>
                  
                  {loading ? (
                    <p className="text-center py-6 text-slate-400 font-semibold text-xs">Loading doctors list...</p>
                  ) : doctors.length === 0 ? (
                    <p className="text-center py-6 text-slate-400 font-semibold text-xs">No doctors recorded.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {doctors.map((doc) => (
                        <div 
                          key={doc.id}
                          onClick={() => handleSelectDoctor(doc.id)}
                          className={`p-5 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                            selectedDoctorId === doc.id 
                              ? "border-blue-600 bg-blue-50/10 shadow-sm" 
                              : "border-slate-100 hover:border-blue-100 bg-white"
                          }`}
                        >
                          <div className="text-left min-w-0">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-wide">
                              {doc.doctor_type}
                            </span>
                            <h4 className="font-extrabold text-slate-800 text-base mt-2 truncate">Dr. {doc.name}</h4>
                            <p className="text-xs text-slate-400 font-semibold truncate mt-0.5">{doc.specialization || "General Medicine"}</p>
                            <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-wide">
                              Avg. Time: <span className="text-blue-600 font-extrabold">{doc.avg_consultation_time} mins</span>
                            </p>
                          </div>

                          {/* Availability Toggle */}
                          <div className="flex items-center justify-between border-t border-slate-100/50 pt-4 mt-4">
                            <span className="text-xs font-bold text-slate-500">Active status</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleDoctorStatus(doc.id, doc.is_available ?? true);
                              }}
                              className="focus:outline-none flex-shrink-0"
                            >
                              {doc.is_available ?? true ? (
                                <ToggleRight className="h-7 w-7 text-blue-600" />
                              ) : (
                                <ToggleLeft className="h-7 w-7 text-slate-300" />
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Doctor Schedule Details (1/3 width) */}
              <div className="space-y-6">
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm text-left">
                  <h3 className="font-extrabold text-slate-800 text-sm mb-6 flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-blue-600" />
                    <span>Selected Schedule Details</span>
                  </h3>

                  {selectedDoctorId ? (
                    selectedDoctorAvailability.length === 0 ? (
                      <p className="text-center py-12 text-slate-400 font-semibold text-xs leading-relaxed">
                        No working schedule entries defined for this doctor.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {selectedDoctorAvailability.map((slot) => (
                          <div 
                            key={slot.id}
                            className="p-3.5 border border-slate-100 rounded-xl flex items-center justify-between shadow-sm"
                          >
                            <div>
                              <p className="text-xs font-bold text-slate-800">{slot.day_of_week_display}</p>
                              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                                {slot.start_time} - {slot.end_time}
                              </p>
                            </div>
                            
                            <button
                              onClick={() => handleToggleAvailabilitySlot(slot.id, slot.is_available)}
                              className="focus:outline-none flex-shrink-0"
                            >
                              {slot.is_available ? (
                                <ToggleRight className="h-7 w-7 text-blue-600" />
                              ) : (
                                <ToggleLeft className="h-7 w-7 text-slate-300" />
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    )
                  ) : (
                    <div className="text-center py-12 text-slate-400 font-semibold text-xs leading-relaxed">
                      <Users className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                      Select a doctor to view and manage their weekly availability hours.
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

        </main>
      </div>

      {/* Onboard Doctor Modal */}
      {showOnboardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Onboard New Doctor</h3>
              <button 
                onClick={() => {
                  setShowOnboardModal(false);
                  setOnboardError("");
                  setOnboardSuccess("");
                }} 
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleOnboardSubmit} className="p-6 space-y-4 text-left">
              {onboardError && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-xs p-3 rounded-xl font-semibold flex items-center gap-2">
                  <AlertCircle className="h-4.5 w-4.5 text-red-500" />
                  <span>{onboardError}</span>
                </div>
              )}
              {onboardSuccess && (
                <div className="bg-green-50 border border-green-100 text-green-600 text-xs p-3 rounded-xl font-semibold">
                  {onboardSuccess}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">First Name</label>
                  <input
                    type="text"
                    required
                    value={onboardForm.first_name}
                    onChange={(e) => setOnboardForm({ ...onboardForm, first_name: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition font-medium"
                    placeholder="E.g. Samuel"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Last Name</label>
                  <input
                    type="text"
                    required
                    value={onboardForm.last_name}
                    onChange={(e) => setOnboardForm({ ...onboardForm, last_name: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition font-medium"
                    placeholder="E.g. Eto'o"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Username</label>
                  <input
                    type="text"
                    required
                    value={onboardForm.username}
                    onChange={(e) => setOnboardForm({ ...onboardForm, username: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition font-medium"
                    placeholder="E.g. dr_samuel"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={onboardForm.phone_number}
                    onChange={(e) => setOnboardForm({ ...onboardForm, phone_number: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition font-medium"
                    placeholder="+2376XXXXXXXX"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Password</label>
                  <input
                    type="password"
                    required
                    value={onboardForm.password}
                    onChange={(e) => setOnboardForm({ ...onboardForm, password: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition font-medium"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Average Consult (Mins)</label>
                  <input
                    type="number"
                    required
                    value={onboardForm.avg_consultation_time}
                    onChange={(e) => setOnboardForm({ ...onboardForm, avg_consultation_time: parseInt(e.target.value) || 15 })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition font-medium"
                    min="5"
                    max="180"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Doctor Type</label>
                  <select
                    value={onboardForm.doctor_type}
                    onChange={(e) => setOnboardForm({ ...onboardForm, doctor_type: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none bg-white transition font-medium"
                  >
                    <option value="general">General Practitioner</option>
                    <option value="specialist">Specialist</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Specialization</label>
                  <input
                    type="text"
                    value={onboardForm.specialization}
                    onChange={(e) => setOnboardForm({ ...onboardForm, specialization: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition font-medium"
                    placeholder="E.g. Cardiology, Pediatrics"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowOnboardModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={onboardLoading}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-200 transition disabled:opacity-50"
                >
                  {onboardLoading ? "Onboarding..." : "Onboard Doctor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Emergency Walk-in Modal */}
      {showEmergencyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span>Admit Emergency Walk-in</span>
              </h3>
              <button 
                onClick={() => {
                  setShowEmergencyModal(false);
                  setEmergencyError("");
                  setEmergencySuccess("");
                }} 
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEmergencySubmit} className="p-6 space-y-4 text-left">
              {emergencyError && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-xs p-3 rounded-xl font-semibold flex items-center gap-2">
                  <AlertCircle className="h-4.5 w-4.5 text-red-500" />
                  <span>{emergencyError}</span>
                </div>
              )}
              {emergencySuccess && (
                <div className="bg-green-50 border border-green-100 text-green-600 text-xs p-3 rounded-xl font-semibold">
                  {emergencySuccess}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">Patient Description/Name</label>
                  <input
                    type="text"
                    required
                    value={emergencyForm.patient_name}
                    onChange={(e) => setEmergencyForm({ ...emergencyForm, patient_name: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-600 outline-none transition font-medium"
                    placeholder="E.g. Accident Victim, Unconscious Male"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">Assign On-Duty Doctor</label>
                  <select
                    required
                    value={emergencyForm.doctor_id}
                    onChange={(e) => setEmergencyForm({ ...emergencyForm, doctor_id: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-600 outline-none transition font-semibold"
                  >
                    <option value="">-- Select Doctor --</option>
                    {doctors.filter(d => d.is_available ?? true).map(doc => (
                      <option key={doc.id} value={doc.id}>
                        Dr. {doc.name || doc.user_name} ({doc.specialization || "General"})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEmergencyModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={emergencyLoading}
                  className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md shadow-red-200 transition disabled:opacity-50"
                >
                  {emergencyLoading ? "Processing..." : "Confirm Emergency Walk-in"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
