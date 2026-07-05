import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { loginUser } from "../../services/api"
import { useAuth } from "../../context/AuthContext"
import { Lock, LogIn, User, AlertCircle, Stethoscope } from "lucide-react"

export default function Login() { 
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
                // Successful login
                login(response.user, response.access, response.refresh)
                navigate('/dashboard')
            } else{
                setError(response.error || 'Invalid username or password')
            }
        } catch (err) {
            setError('Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 font-sans">
            <div className="bg-white rounded-3xl shadow-lg border border-slate-100 flex flex-col md:flex-row w-full max-w-4xl overflow-hidden min-h-[500px]">
                
                {/* Left Side: Branding / Marketing Column */}
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
                            Welcome back to MediQueue.
                        </h2>
                        <p className="text-sm text-blue-100 leading-relaxed font-medium">
                            Access your active queue numbers, review scheduled consultations, and check symptoms with our virtual assistant.
                        </p>
                    </div>

                    <div className="text-xs text-blue-300 font-semibold relative z-10">
                        © {new Date().getFullYear()} MediQueue. All rights reserved.
                    </div>
                </div>

                {/* Right Side: Login Form */}
                <div className="p-8 md:p-12 md:w-7/12 flex flex-col justify-center text-left">
                    <div className="mb-8">
                        <h1 className="text-2xl font-black text-slate-800">Log In</h1>
                        <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wider">Patient Portal</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 text-xs p-3.5 rounded-xl mb-6 font-semibold flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            <span>{error}</span>
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
                                    placeholder="Enter your username"
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
                            <span>{loading ? 'Logging in...' : 'Login'}</span>
                        </button>
                    </form>
                    
                    <p className="text-center text-xs text-slate-500 mt-8 font-semibold">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-blue-600 hover:underline">
                            Register here
                        </Link>
                    </p>

                    <p className="text-center text-xs text-slate-400 mt-4 font-semibold">
                        <Link to="/admin/login" className="hover:underline hover:text-slate-500">
                            Staff / Doctor Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
 }
