import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { getProfile, updateProfile } from "../../services/api"
import {
  LayoutDashboard,
  Calendar,
  Clock,
  User,
  Bell,
  LogOut,
  Sparkles,
  Lock,
  Phone,
  CalendarDays,
  MapPin,
  ChevronDown,
  AlertCircle,
  Stethoscope,
  Activity,
  CheckCircle2
} from "lucide-react"

export default function Profile() {
  const navigate = useNavigate()
  const { logout, user: authUser } = useAuth()
  
  const [profile, setProfile] = useState(null)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  
  // Profile Form State
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    date_of_birth: "",
    gender: "",
    address: "",
    password: "",
    confirm_password: ""
  })

  // Load profile data on mount
  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true)
        const userProfile = await getProfile()
        setProfile(userProfile)
        setFormData({
          first_name: userProfile.first_name || "",
          last_name: userProfile.last_name || "",
          phone_number: userProfile.phone_number || "",
          date_of_birth: userProfile.date_of_birth || "",
          gender: userProfile.gender || "",
          address: userProfile.address || "",
          password: "",
          confirm_password: ""
        })
      } catch (e) {
        console.error("Failed to load profile data:", e)
        setError("Failed to fetch profile details. Verify server connection.")
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [authUser])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validate passwords if changing
    if (formData.password) {
      if (formData.password !== formData.confirm_password) {
        setError("Passwords do not match.")
        return
      }
      if (formData.password.length < 6) {
        setError("Password should be at least 6 characters long.")
        return
      }
    }

    setLoading(true)
    try {
      const dataToSave = { ...formData }
      if (!dataToSave.password) {
        delete dataToSave.password
      }
      delete dataToSave.confirm_password

      const updatedProfile = await updateProfile(dataToSave)
      
      if (updatedProfile && !updatedProfile.error) {
        setProfile(updatedProfile)
        setSuccess("Profile settings updated successfully!")
        setFormData(prev => ({ ...prev, password: "", confirm_password: "" }))
      } else {
        setError(updatedProfile.error || "Failed to update profile settings.")
      }
    } catch (err) {
      console.error("Profile save error:", err)
      setError("Network error occurred while saving profile settings.")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const patientName = profile?.first_name 
    ? `${profile.first_name} ${profile.last_name || ""}`.trim() 
    : profile?.username || "Jane Doe"
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
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold bg-blue-50 text-blue-600 transition"
            >
              <User className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">My Profile</span>
            </Link>
          </nav>
        </div>

        {/* User Card / Logout */}
        <div className="p-4 border-t border-slate-50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 hover:text-red-600 transition"
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
              My Profile
            </h1>
            <p className="text-xs text-slate-400 font-semibold mt-1 truncate">Manage your personal settings and verification details.</p>
          </div>

          {/* Profile Dropdown */}
          <div className="flex items-center gap-4 flex-shrink-0">
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

        {/* ==================== CORE FORM LAYOUT ==================== */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 max-w-4xl mx-auto w-full text-left">
          
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl p-4 text-sm font-semibold flex items-center gap-3 shadow-sm">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-100 text-green-600 rounded-2xl p-4 text-sm font-semibold flex items-center gap-3 shadow-sm animate-in fade-in duration-300">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* 1. PERSONAL INFORMATION CARD */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-50">
                <User className="h-4.5 w-4.5 text-blue-600" />
                <span>Personal Information</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">First Name</label>
                  <input
                    type="text"
                    required
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl outline-none transition text-sm font-medium"
                    placeholder="John"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Last Name</label>
                  <input
                    type="text"
                    required
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl outline-none transition text-sm font-medium"
                    placeholder="Doe"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Date of Birth</label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl outline-none transition text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl outline-none transition text-sm font-semibold"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 2. CONTACT DETAILS CARD (SMS Alerts setup) */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-50">
                <Phone className="h-4.5 w-4.5 text-blue-600" />
                <span>Contact Details</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl outline-none transition text-sm font-semibold"
                    placeholder="E.g. +237670000001"
                  />
                  <span className="text-[10px] text-slate-400 font-semibold mt-1.5 block leading-normal">
                    This phone number is used to deliver real-time SMS notifications when your queue position updates or delays occur. Format: +[CountryCode][Number].
                  </span>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Home Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl outline-none transition text-sm font-medium resize-none"
                    placeholder="Molyko, Buea"
                  />
                </div>
              </div>
            </div>

            {/* 3. SECURITY CARD */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-50">
                <Lock className="h-4.5 w-4.5 text-blue-600" />
                <span>Account Security</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">New Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl outline-none transition text-sm font-semibold"
                    placeholder="Leave blank to keep current"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl outline-none transition text-sm font-semibold"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-md shadow-blue-200 transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {loading && <Clock className="h-4 w-4 animate-spin" />}
                <span>{loading ? "Saving Changes..." : "Save Settings"}</span>
              </button>
            </div>

          </form>
        </main>
      </div>

    </div>
  )
}
