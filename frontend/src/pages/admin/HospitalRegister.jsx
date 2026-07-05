import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { registerHospital } from "../../services/api"
import { useAuth } from "../../context/AuthContext"
import { Building, MapPin, Phone, User, Lock, UserPlus, Compass, ArrowLeft, AlertCircle } from "lucide-react"

export default function HospitalRegister() {
  const navigate = useNavigate()
  const { login } = useAuth()
  
  const [formData, setFormData] = useState({
    hospital_name: "",
    hospital_address: "",
    hospital_phone_number: "",
    latitude: 4.15,
    longitude: 9.24,
    username: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    password: "",
    password2: ""
  })
  
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [locating, setLocating] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: (name === "latitude" || name === "longitude") ? parseFloat(value) || 0 : value
    })
  }

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.")
      return
    }
    setLocating(true)
    setError("")
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: parseFloat(position.coords.latitude.toFixed(6)),
          longitude: parseFloat(position.coords.longitude.toFixed(6))
        }))
        setLocating(false)
      },
      (err) => {
        setError("Unable to retrieve location. Please enter manually.")
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    if (formData.password !== formData.password2) {
      setError("Admin passwords do not match.")
      return
    }

    setLoading(true)
    try {
      const response = await registerHospital(formData)

      if (response.access) {
        setSuccess(true)
        // Log in immediately as the new Admin!
        setTimeout(() => {
          login(response.user, response.access, response.refresh)
          navigate("/admin/dashboard")
        }, 2000)
      } else {
        // Handle validation errors from backend
        let errMsg = "Registration failed. Check inputs."
        if (response.password) errMsg = `Password: ${response.password[0]}`
        else if (response.username) errMsg = `Username: ${response.username[0]}`
        else if (response.hospital_name) errMsg = `Hospital Name: ${response.hospital_name[0]}`
        else if (response.error) errMsg = response.error
        else if (typeof response === "object") {
          // Flatten dictionary errors
          const firstKey = Object.keys(response)[0]
          if (firstKey) {
            errMsg = `${firstKey}: ${response[firstKey]}`
          }
        }
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
      <div className="bg-white rounded-3xl shadow-lg border border-slate-100 w-full max-w-5xl overflow-hidden min-h-[600px]">
        
        {/* Top Header / Back link */}
        <div className="px-8 pt-6 pb-2 border-b border-slate-50 flex items-center justify-between">
          <Link to="/register" className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-700 transition uppercase tracking-wider">
            <ArrowLeft className="h-4 w-4" /> Back to Patient Sign Up
          </Link>
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-400 font-bold">MediQueue for Facilities</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8 text-left">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-800">Register Your Facility</h1>
              <p className="text-xs text-blue-600 font-bold mt-1 uppercase tracking-wider">Hospital Onboarding & Administrator Account Creation</p>
            </div>
            <div className="bg-blue-50 text-blue-900 border border-blue-100 rounded-2xl px-4 py-2.5 max-w-sm text-xs font-semibold leading-relaxed">
              Registering on MediQueue enables patients to see wait estimates and book appointments with your doctors.
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-xs p-4 rounded-2xl font-semibold flex items-center gap-3 animate-shake">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-100 text-green-600 text-xs p-4 rounded-2xl font-semibold">
              Facility Registered Successfully! Setting up admin space and redirecting to dashboard...
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* COLUMN 1: Hospital Details */}
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Building className="h-4.5 w-4.5 text-blue-600" /> Facility Information
                </h3>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                  Hospital / Clinic Name
                </label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="text"
                    name="hospital_name"
                    value={formData.hospital_name}
                    onChange={handleChange}
                    required
                    className="w-full pl-11 pr-4 py-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition font-medium"
                    placeholder="General Referral Hospital"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                  Facility Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="text"
                    name="hospital_address"
                    value={formData.hospital_address}
                    onChange={handleChange}
                    required
                    className="w-full pl-11 pr-4 py-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition font-medium"
                    placeholder="Molyko, Buea Road"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                  Contact Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="tel"
                    name="hospital_phone_number"
                    value={formData.hospital_phone_number}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition font-medium"
                    placeholder="+2376XXXXXXXX"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition font-medium"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleGetLocation}
                disabled={locating}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 border border-slate-200"
              >
                <Compass className={`h-4 w-4 text-blue-600 ${locating ? "animate-spin" : ""}`} />
                <span>{locating ? "Detecting Coordinates..." : "Detect Current Browser Geolocation"}</span>
              </button>
            </div>

            {/* COLUMN 2: Admin Account Credentials */}
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <User className="h-4.5 w-4.5 text-blue-600" /> Administrator Account Credentials
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition font-medium"
                    placeholder="Jane"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition font-medium"
                    placeholder="Smith"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                    Admin Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition font-medium"
                    placeholder="janesmith_admin"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                    Admin Phone
                  </label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition font-medium"
                    placeholder="+2376YYYYYYYY"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full pl-11 pr-4 py-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition font-medium"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="password"
                    name="password2"
                    value={formData.password2}
                    onChange={handleChange}
                    required
                    className="w-full pl-11 pr-4 py-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition font-medium"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-400 font-semibold text-center sm:text-left">
              By clicking "Onboard Facility", you agree to register this clinical office on the MediQueue provider portal network.
            </p>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-blue-900 text-white px-8 py-3.5 rounded-xl font-extrabold text-sm hover:bg-blue-950 transition disabled:opacity-50 shadow-md shadow-blue-900/10 flex items-center justify-center gap-2 flex-shrink-0"
            >
              <UserPlus className="h-4.5 w-4.5" />
              <span>{loading ? "Onboarding Facility..." : "Onboard Facility & Log In"}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
