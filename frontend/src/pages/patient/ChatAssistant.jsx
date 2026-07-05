import { useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { getProfile, sendChatMessage } from "../../services/api"
import {
  LayoutDashboard,
  Calendar,
  Clock,
  User,
  Bell,
  LogOut,
  Sparkles,
  Send,
  Activity,
  MapPin,
  MessageSquare,
  CalendarDays,
  ChevronDown,
  AlertCircle,
  Stethoscope
} from "lucide-react"

export default function ChatAssistant() {
  const navigate = useNavigate()
  const { logout, user: authUser } = useAuth()
  
  const [profile, setProfile] = useState(null)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [inputText, setInputText] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isLiveAssistant, setIsLiveAssistant] = useState(false)
  
  // Chat history list
  const [messages, setMessages] = useState([
    {
      id: "initial-greet",
      sender: "bot",
      text: "Hello! I am your MediQueue AI Triage Assistant. I can help analyze your symptoms, answer FAQs about registered hospitals' locations and hours, or guide you on how to book an appointment. How can I help you today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isLiveAi: false
    }
  ])

  const chatEndRef = useRef(null)

  // Fetch user profile on mount
  useEffect(() => {
    async function loadProfile() {
      try {
        const userProfile = await getProfile()
        setProfile(userProfile)
      } catch (e) {
        console.error("Failed to load profile:", e)
        setProfile(authUser)
      }
    }
    loadProfile()
  }, [authUser])

  // Auto-scroll chat window when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputText
    if (!text.trim()) return

    // Clear input if sending from keyboard
    if (!textToSend) {
      setInputText("")
    }

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: text,
      time: timestamp
    }

    // 1. Add User Message
    setMessages(prev => [...prev, userMsg])
    setLoading(true)
    setError("")

    try {
      // 2. Fetch bot reply
      const res = await sendChatMessage(text)
      
      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: res.response || "I couldn't process that request.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isLiveAi: res.is_live_ai ?? false
      }

      setIsLiveAssistant(res.is_live_ai ?? false)
      setMessages(prev => [...prev, botMsg])
    } catch (err) {
      console.error("Chat error:", err)
      const errorMsg = {
        id: `bot-err-${Date.now()}`,
        sender: "bot",
        text: "I am having trouble connecting to the triage engine right now. Please try again in a few moments.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isLiveAi: false
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSendMessage()
    }
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
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold bg-blue-50 text-blue-600 transition"
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
              AI Health Assistant
            </h1>
            <p className="text-xs text-slate-400 font-semibold mt-1 truncate">Get symptom analysis and general support.</p>
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

        {/* ==================== CORE CHAT VIEWPORT ==================== */}
        <main className="flex-1 flex flex-col bg-slate-50 overflow-hidden relative">
          
          {/* Chat Assistant Status Banner */}
          <div className="bg-white border-b border-slate-100 px-6 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider leading-none">MediQueue Triage Bot</h4>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`h-2 w-2 rounded-full ${isLiveAssistant ? "bg-green-500 animate-pulse" : "bg-amber-400"}`} />
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    {isLiveAssistant ? "Claude AI Live" : "Local Smart Fallback"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Messages Scrollbox */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex gap-3 max-w-[85%] sm:max-w-[70%] ${
                  msg.sender === "user" ? "ml-auto flex-row-reverse text-right" : "mr-auto text-left"
                }`}
              >
                {/* Avatar Icon */}
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0 ${
                  msg.sender === "user" 
                    ? "bg-blue-600 text-white" 
                    : "bg-white border border-slate-100 text-blue-600"
                }`}>
                  {msg.sender === "user" ? displayAvatarLetter : "AI"}
                </div>

                <div className="space-y-1">
                  <div className={`rounded-2xl px-4 py-3 text-sm font-medium leading-relaxed whitespace-pre-line shadow-sm border ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white border-blue-600 rounded-tr-none text-left"
                      : "bg-white text-slate-700 border-slate-100 rounded-tl-none"
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold block px-1">
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}

            {/* Typing status bubble */}
            {loading && (
              <div className="flex gap-3 max-w-[70%] text-left">
                <div className="h-9 w-9 bg-white border border-slate-100 text-blue-600 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0 animate-pulse">
                  AI
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-1.5 h-10">
                  <span className="h-2 w-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-2 w-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="h-2 w-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick-Action suggestions bar (Professional Lucide Icons, no emojis) */}
          <div className="px-6 py-2 bg-slate-50 flex flex-wrap gap-2 justify-center flex-shrink-0">
            <button
              onClick={() => handleSendMessage("Analyze my symptoms: ")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-blue-400 text-slate-600 hover:text-blue-600 text-xs font-bold rounded-full transition shadow-sm"
              disabled={loading}
            >
              <Activity className="h-3.5 w-3.5" />
              <span>Analyze Symptoms</span>
            </button>
            <button
              onClick={() => handleSendMessage("What are the clinic opening hours?")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-blue-400 text-slate-600 hover:text-blue-600 text-xs font-bold rounded-full transition shadow-sm"
              disabled={loading}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Clinic Hours</span>
            </button>
            <button
              onClick={() => handleSendMessage("Where are your hospitals located?")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-blue-400 text-slate-600 hover:text-blue-600 text-xs font-bold rounded-full transition shadow-sm"
              disabled={loading}
            >
              <MapPin className="h-3.5 w-3.5" />
              <span>Locations</span>
            </button>
            <button
              onClick={() => handleSendMessage("How do I book an appointment?")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-blue-400 text-slate-600 hover:text-blue-600 text-xs font-bold rounded-full transition shadow-sm"
              disabled={loading}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Booking Guide</span>
            </button>
          </div>

          {/* Message Input Footer box */}
          <div className="p-4 bg-white border-t border-slate-100 flex-shrink-0">
            <div className="max-w-4xl mx-auto flex gap-3 relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message or symptom details here..."
                disabled={loading}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-sm font-medium transition"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={loading || !inputText.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-5 flex items-center justify-center transition shadow-md shadow-blue-200 disabled:opacity-50 disabled:shadow-none flex-shrink-0"
              >
                <Send className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>

        </main>
      </div>

    </div>
  )
}
