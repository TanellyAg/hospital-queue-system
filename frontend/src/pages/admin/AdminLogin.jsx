import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { loginUser } from "../../services/api"
import { useAuth } from "../../context/AuthContext"
import { Lock, LogIn, ShieldAlert, User, AlertCircle, Stethoscope } from "lucide-react"

export default function AdminLogin() { 
    const navigate = useNavigate()
    const { login } = useAuth()

    const [formData, setFormData] = useState({
        username: '',
        password: ''
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
    
        try{
            const response = await loginUser(formData)

            if (response.access) {
                const userRole = response.user?.role
                if (userRole === 'admin' || userRole === 'doctor') {
                    // Successful staff login
                    login(response.user, response.access, response.refresh)
                    navigate('/admin/dashboard')
                } else {
                    setError('Access Denied. Only clinic staff and doctors are allowed in this portal.')
                }
            } else{
                setError(response.error || 'Invalid credentials')
            }
        } catch (err) {
            setError('Something went wrong. Please check your connection.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 font-sans">
            <div className="bg-white rounded-3xl shadow-lg border border-slate-100 flex flex-col md:flex-row w-full max-w-4xl overflow-hidden min-h-[500px]">
                
                {/* Left Side: Admin Branding */}
                <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white p-8 md:p-12 md:w-5/12 flex flex-col justify-between relative overflow-hidden text-left">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full translate-x-1/3 -translate-y-1/3" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -translate-x-1/4 translate-y-1/4" />
                    
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="h-10 w-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                            <Stethoscope className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <span className="text-xl font-black tracking-tight block">MediQueue</span>
                            <p className="text-[10px] text-blue-300 font-semibold leading-none">Admin Workspace</p>
                        </div>
                    </div>

                    <div className="my-8 md:my-0 relative z-10">
                        <h2 className="text-3xl font-black leading-tight mb-4">
                            Clinician & Admin Portal.
                        </h2>
                        <p className="text-sm text-blue-100 leading-relaxed font-medium">
                            Manage outpatient waiting queues, call pending triage levels, confirm appointment slots, and update schedule limits.
                        </p>
                    </div>

                    <div className="text-xs text-blue-300 font-semibold relative z-10">
                        © {new Date().getFullYear()} MediQueue. Internal Use Only.
                    </div>
                </div>

                {/* Right Side: Admin Form */}
                <div className="p-8 md:p-12 md:w-7/12 flex flex-col justify-center text-left">
                    <div className="mb-8">
                        <h1 className="text-2xl font-black text-slate-800">Staff Log In</h1>
                        <p className="text-xs text-blue-600 font-bold mt-1 uppercase tracking-wider">Credential Verification Required</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 text-xs p-3.5 rounded-xl mb-6 font-semibold flex items-center gap-2.5">
                            <ShieldAlert className="h-4.5 w-4.5 flex-shrink-0 text-red-500" />
                            <span className="leading-tight">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                                Username
                            </label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-11 pr-4 py-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition font-medium"
                                    placeholder="Enter staff username"
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
                                    placeholder="Enter your password"
                                />
                            </div>
                        </div>
                        
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 rounded-xl font-extrabold text-sm hover:bg-blue-700 transition disabled:opacity-50 shadow-md shadow-blue-200 flex items-center justify-center gap-2 mt-2"
                        >
                            <LogIn className="h-4.5 w-4.5" />
                            <span>{loading ? 'Authenticating...' : 'Sign In as Staff'}</span>
                        </button>
                    </form>
                    
                    <p className="text-center text-xs text-slate-500 mt-8 font-semibold">
                        Are you a patient?{" "}
                        <Link to="/login" className="text-blue-600 hover:underline">
                            Go to Patient Portal
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
 }
