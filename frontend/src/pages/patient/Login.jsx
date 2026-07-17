import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { loginUser } from "../../services/api"
import { useAuth } from "../../context/AuthContext"
import { Lock, LogIn, User, AlertCircle, Stethoscope } from "lucide-react"

const TRANSLATIONS = {
  en: {
    welcome_title: "Welcome back to MediQueue.",
    welcome_desc: "Access your active queue numbers, review scheduled consultations, and check symptoms with our virtual assistant.",
    log_in: "Log In",
    portal: "Patient Portal",
    username: "Username",
    username_placeholder: "Enter your username",
    password: "Password",
    password_placeholder: "Enter your password",
    logging_in: "Logging in...",
    login_btn: "Login",
    no_account: "Don't have an account?",
    register_here: "Register here",
    staff_login: "Staff / Doctor Login",
    invalid_err: "Invalid username or password",
    wrong_err: "Something went wrong. Please try again."
  },
  fr: {
    welcome_title: "Bon retour sur MediQueue.",
    welcome_desc: "Accédez à vos numéros de file actifs, gérez vos consultations et vérifiez vos symptômes avec l'assistant virtuel.",
    log_in: "Se Connecter",
    portal: "Portail Patient",
    username: "Nom d'utilisateur",
    username_placeholder: "Entrez votre nom d'utilisateur",
    password: "Mot de passe",
    password_placeholder: "Entrez votre mot de passe",
    logging_in: "Connexion en cours...",
    login_btn: "Connexion",
    no_account: "Vous n'avez pas de compte ?",
    register_here: "Inscrivez-vous ici",
    staff_login: "Connexion Personnel / Médecin",
    invalid_err: "Nom d'utilisateur ou mot de passe incorrect",
    wrong_err: "Une erreur est survenue. Veuillez réessayer."
  }
}

export default function Login() { 
    const navigate = useNavigate()
    const { login } = useAuth()
    const [lang, setLang] = useState(localStorage.getItem("lang") || "en")

    const t = TRANSLATIONS[lang]

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

    const handleLangToggle = () => {
        const nextLang = lang === "en" ? "fr" : "en"
        setLang(nextLang)
        localStorage.setItem("lang", nextLang)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
    
        try {
            const response = await loginUser(formData)

            if (response.access) {
                // Successful login
                login(response.user, response.access, response.refresh)
                navigate('/dashboard')
            } else {
                setError(response.error ? t.invalid_err : t.invalid_err)
            }
        } catch (err) {
            setError(t.wrong_err)
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
                            {t.welcome_title}
                        </h2>
                        <p className="text-sm text-blue-100 leading-relaxed font-medium">
                            {t.welcome_desc}
                        </p>
                    </div>

                    <div className="text-xs text-blue-300 font-semibold relative z-10">
                        © {new Date().getFullYear()} MediQueue. All rights reserved.
                    </div>
                </div>

                {/* Right Side: Login Form */}
                <div className="p-8 md:p-12 md:w-7/12 flex flex-col justify-center text-left">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-2xl font-black text-slate-800">{t.log_in}</h1>
                            <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wider">{t.portal}</p>
                        </div>
                        <button
                            type="button"
                            onClick={handleLangToggle}
                            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition cursor-pointer"
                        >
                            {lang.toUpperCase()}
                        </button>
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
                                {t.username}
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
                                    placeholder={t.username_placeholder}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                                {t.password}
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
                                    placeholder={t.password_placeholder}
                                />
                            </div>
                        </div>
                        
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 rounded-xl font-extrabold text-sm hover:bg-blue-700 transition disabled:opacity-50 shadow-md shadow-blue-200 flex items-center justify-center gap-2 mt-2"
                        >
                            <LogIn className="h-4.5 w-4.5" />
                            <span>{loading ? t.logging_in : t.login_btn}</span>
                        </button>
                    </form>
                    
                    <p className="text-center text-xs text-slate-500 mt-8 font-semibold">
                        {t.no_account}{' '}
                        <Link to="/register" className="text-blue-600 hover:underline">
                            {t.register_here}
                        </Link>
                    </p>

                    <p className="text-center text-xs text-slate-400 mt-4 font-semibold">
                        <Link to="/admin/login" className="hover:underline hover:text-slate-500">
                            {t.staff_login}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
 }
