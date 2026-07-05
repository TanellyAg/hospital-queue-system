import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { registerUser } from "../../services/api"
import { Lock, Phone, Stethoscope, User, UserPlus } from "lucide-react"

export default function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    role: "patient",
    password: "",
    password2: ""
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    if (formData.password !== formData.password2) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)
    try {
      const response = await registerUser(formData)

      if (response.id || response.username) {
        setSuccess(true)
        setTimeout(() => {
          navigate("/login")
        }, 2000)
      } else {
        // Handle validation errors from backend
        let errMsg = "Registration failed. Check inputs."
        if (response.password) errMsg = response.password[0]
        else if (response.username) errMsg = `Username: ${response.username[0]}`
        else if (response.email) errMsg = `Email: ${response.email[0]}`
        else if (response.error) errMsg = response.error
        setError(errMsg)
      }
    } catch (err) {
      setError("Something went wrong. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="bg-white rounded-3xl shadow-lg border border-slate-100 flex flex-col md:flex-row w-full max-w-4xl overflow-hidden min-h-[550px]">
        
        {/* Left Side: Branding / Intro Card */}
        <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white p-8 md:p-12 md:w-5/12 flex flex-col justify-between relative overflow-hidden text-left">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -translate-x-1/4 translate-y-1/4" />
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="h-10 w-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
              <Stethoscope className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight block">MediQueue</span>
              <p className="text-[10px] text-blue-300 font-semibold leading-none">Smart Care. Less Wait.</p>
            </div>
          </div>

          <div className="my-8 md:my-0 relative z-10">
            <h2 className="text-3xl font-black leading-tight mb-4">
              Join us to optimize your care.
            </h2>
            <p className="text-sm text-blue-100 leading-relaxed font-medium">
              Create an account to book consultations, track waiting lists in real-time, and get AI-assisted symptoms triage.
            </p>
          </div>

          <div className="text-xs text-blue-300 font-semibold relative z-10">
            © {new Date().getFullYear()} MediQueue. All rights reserved.
          </div>
        </div>

        {/* Right Side: Signup Form */}
        <div className="p-8 md:p-12 md:w-7/12 flex flex-col justify-center text-left">
          <div className="mb-6">
            <h1 className="text-2xl font-black text-slate-800">Create Account</h1>
            <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wider">Patient Registration</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-xs p-3.5 rounded-xl mb-4 font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-100 text-green-600 text-xs p-3.5 rounded-xl mb-4 font-semibold">
              Account created successfully! Redirecting to login...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition font-medium"
                    placeholder="John"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                  Last Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition font-medium"
                    placeholder="Doe"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition font-medium"
                    placeholder="johndoe12"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition font-medium"
                    placeholder="+2376XXXXXXXX"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition font-medium"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    name="password2"
                    value={formData.password2}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition font-medium"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-extrabold text-sm hover:bg-blue-700 transition disabled:opacity-50 shadow-md shadow-blue-200 flex items-center justify-center gap-2 mt-4"
            >
              <UserPlus className="h-4.5 w-4.5" />
              <span>{loading ? "Registering..." : "Create Account"}</span>
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-6 font-semibold flex flex-col gap-2">
            <span>
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 hover:underline">
                Log in here
              </Link>
            </span>
            <span className="text-slate-400">
              Are you a clinic/hospital?{" "}
              <Link to="/register-hospital" className="text-blue-600 hover:underline font-bold">
                Register facility on MediQueue
              </Link>
            </span>
          </p>
        </div>

      </div>
    </div>
  )
}

// Add simple alert fallback for AlertCircle imports
function AlertCircle(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
  )
}