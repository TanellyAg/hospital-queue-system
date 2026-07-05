import { useState } from "react"
import { Link } from "react-router-dom"
import {
  Menu, X, CalendarCheck, Bot, Users,
  MessageSquare, Hash, UserPlus, ArrowRight,
  Heart, MapPin, Mail, Phone,
  ListOrdered, Brain, CheckCircle, Share2,
  Stethoscope
} from "lucide-react"

const NAV_LINKS = ["Home", "Features", "How It Works", "About Us", "Contact"]

function Navbar() {
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="h-10 w-10 bg-blue-700 rounded-xl flex items-center justify-center shadow-lg">
            <Stethoscope className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-blue-900">MediQueue</span>
            <p className="text-s text-blue-400 leading-none">Smart Care. Less Wait.</p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((item) => (
            <a key={item}
              href={`#${item.toLowerCase().replace(" ", "-")}`}
              className="text-sm font-medium text-gray-600 hover:text-blue-700 transition border-b-2 border-transparent hover:border-blue-700 pb-0.5">
              {item}
            </a>
          ))}
        </nav>

        {/* Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/login"
            className="px-6 py-2 text-sm font-semibold text-blue-700 border-2 border-blue-700 rounded-lg hover:bg-blue-50 transition">
            Login
          </Link>
          <Link to="/register"
            className="px-6 py-2 text-sm font-semibold text-white bg-blue-700 rounded-lg shadow-lg hover:bg-blue-800 transition">
            Register
          </Link>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="md:hidden">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-3">
          {NAV_LINKS.map((item) => (
            <a key={item} href={`#${item.toLowerCase().replace(" ", "-")}`}
              onClick={() => setOpen(false)}
              className="block text-sm font-medium text-gray-600 py-2">
              {item}
            </a>
          ))}
          <Link to="/login" className="block text-center py-2 border-2 border-blue-700 text-blue-700 rounded-lg font-semibold text-sm">Login</Link>
          <Link to="/register" className="block text-center py-2 bg-blue-700 text-white rounded-lg font-semibold text-sm">Register</Link>
        </div>
      )}
    </header>
  )
}

function Hero() {
  return (
    <section id="home" className="relative overflow-hidden min-h-[600px]">
      {/* Background hospital image */}
      <div className="absolute inset-0">
         <img
          src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1600&auto=format&fit=crop&q=80"
          alt="Hospital"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-blue-900/70 to-blue-900/30" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-6">
              <Stethoscope className="h-3.5 w-3.5" /> Welcome to MediQueue
            </div>

            <h1 className="text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
              Smarter
              <br />
              Appointments.
              <br />
              <span className="text-blue-300">Better Healthcare.</span>
            </h1>

            <p className="text-lg text-blue-100 mb-8 max-w-lg leading-relaxed">
              MediQueue is a cloud-based hospital queue and appointment management
              system with an AI-powered patient assistant. Book appointments,
              get real-time updates, and reduce waiting time.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/register"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-7 py-3.5 rounded-lg font-bold shadow-xl hover:bg-blue-700 transition">
                <CalendarCheck className="h-5 w-5" />
                Book an Appointment
              </Link>
              <Link to="/login"
                className="inline-flex items-center gap-2 bg-white/10 border-2 border-white/40 text-white px-7 py-3.5 rounded-lg font-semibold hover:bg-white/20 transition">
                <Users className="h-5 w-5" />
                Login to Account
              </Link>
            </div>
          </div>

           
        </div>
      </div>
    </section>
  )
}

function Features() {
  const features = [
    { icon: CalendarCheck, title: "Online Appointment Booking", desc: "Book appointments easily from anywhere, anytime without visiting the hospital.", color: "bg-blue-50 text-blue-600" },
    { icon: Bot, title: "AI Patient Assistant", desc: "Chat with our AI assistant for symptom checks and health guidance 24/7.", color: "bg-purple-50 text-purple-600" },
    { icon: Stethoscope, title: "Symptom-Based Triage", desc: "AI-powered triage helps prioritize care based on your reported symptoms.", color: "bg-green-50 text-green-600" },
    { icon: ListOrdered, title: "Queue Tracking", desc: "Track your queue position and estimated waiting time in real-time.", color: "bg-orange-50 text-orange-600" },
    { icon: MessageSquare, title: "SMS Notifications", desc: "Receive SMS alerts for appointment confirmations and queue updates.", color: "bg-pink-50 text-pink-600" },
    { icon: Brain, title: "Smart Insights", desc: "Hospitals get AI-powered insights to improve service and efficiency.", color: "bg-indigo-50 text-indigo-600" },
  ]

  return (
    <section id="features" className="py-24 bg-gray-50">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-gray-900 mb-4">Our Key Features</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Everything you need for a smarter, faster hospital experience
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition duration-300">
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  const steps = [
    { icon: UserPlus, title: "Register / Login", desc: "Create an account or log in to get started." },
    { icon: CalendarCheck, title: "Book Appointment", desc: "Choose a department, doctor, and time that suits you." },
    { icon: Hash, title: "Get in Queue", desc: "Receive a queue number and estimated waiting time." },
    { icon: MessageSquare, title: "Stay Updated", desc: "Get SMS notifications and real-time updates on your queue." },
    { icon: CheckCircle, title: "Visit Hospital", desc: "Arrive on time and receive better, faster care." },
  ]

  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-black text-gray-900 mb-4">How It Works</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            From sign-up to consultation in five simple steps
          </p>
        </div>

        <div className="relative flex flex-col md:flex-row items-start justify-between gap-8">
          {/* Connector line */}
          <div className="hidden md:block absolute top-8 left-[8%] right-[8%] h-0.5 bg-blue-100" />

          {steps.map((s, i) => (
            <div key={s.title} className="flex flex-col items-center text-center flex-1 relative">
              <div className="h-16 w-16 bg-blue-700 rounded-full flex items-center justify-center text-white font-black text-xl shadow-lg ring-4 ring-white relative z-10 mb-4">
                {i + 1}
              </div>
              {i < steps.length - 1 && (
                <ArrowRight className="hidden md:block absolute top-5 -right-4 h-6 w-6 text-blue-300 z-20" />
              )}
              <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center mb-3">
                <s.icon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{s.title}</h3>
              <p className="text-xs text-gray-500 max-w-[140px]">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function AboutUs() {
  return (
    <section id="about-us" className="py-24 bg-blue-50">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-blue-600 mb-3">About Us</p>
            <h2 className="text-4xl font-black text-gray-900 mb-6">
              Built for Cameroon's Healthcare System
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              MediQueue was developed as a final year project at the Catholic University
              Institute of Buea (CUIB) to address the critical challenge of long waiting
              times and inefficient queue management in Cameroonian hospitals.
            </p>
            <p className="text-gray-600 leading-relaxed mb-8">
              By combining cloud technology, artificial intelligence, and SMS notifications
              that work on MTN and Orange networks, MediQueue makes quality healthcare
              more accessible for every patient in Cameroon.
            </p>
            <div className="flex flex-wrap gap-4">
              {["AI-Powered", "SMS via MTN & Orange", "Cloud-Based", "Real-time"].map((tag) => (
                <span key={tag} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="relative">
           <img
          src="/landing_hero.png"
          alt="Hospital"
          className="w-full h-80 object-cover"
        />
            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-6">
              <p className="text-4xl font-black text-blue-700">98%</p>
              <p className="text-gray-600 text-sm">Patient Satisfaction</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function CTA() {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="mx-auto max-w-5xl bg-gradient-to-br from-blue-800 to-blue-600 rounded-3xl p-16 text-center relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 translate-y-1/2" />
        <h2 className="relative text-4xl font-black text-white mb-4">
          Ready to transform your hospital experience?
        </h2>
        <p className="relative text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
          Join hospitals across Cameroon already saving hours every day with MediQueue.
        </p>
        <div className="relative flex flex-wrap justify-center gap-4">
          <Link to="/register"
            className="inline-flex items-center gap-2 bg-white text-blue-800 px-8 py-4 rounded-lg font-bold shadow-xl hover:bg-blue-50 transition">
            Get Started Free <ArrowRight className="h-4 w-4" />
          </Link>
          <a href="#contact"
            className="inline-flex items-center gap-2 border-2 border-white/40 text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition">
            Contact Us
          </a>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer id="contact" className="bg-blue-900 text-blue-50">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-4 mb-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center">
                <Stethoscope className="h-5 w-5 text-blue-800" />
              </div>
              <div>
                <span className="text-xl font-extrabold text-white">MediQueue</span>
                <p className="text-xs text-blue-300 leading-none">Smart Care. Less Wait.</p>
              </div>
            </div>
            <p className="text-blue-200 max-w-sm leading-relaxed mb-6">
              MediQueue is dedicated to improving patient experience and hospital
              efficiency through smart technology built for Cameroon.
            </p>
            <div className="flex gap-3">
              {[Share2, Mail, Phone, MapPin].map((Icon, i) => (
                <a key={i} href="#"
                  className="h-9 w-9 bg-blue-800 hover:bg-blue-700 rounded-lg flex items-center justify-center transition">
                  <Icon className="h-4 w-4 text-blue-200" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-blue-200">
              {NAV_LINKS.map((item) => (
                <li key={item}>
                  <a href={`#${item.toLowerCase().replace(" ", "-")}`}
                    className="hover:text-white transition">{item}</a>
                </li>
              ))}
              <li><Link to="/login" className="hover:text-white transition">Login</Link></li>
              <li><Link to="/register" className="hover:text-white transition">Register</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-blue-200">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 flex-shrink-0" /> +256 700 123 456
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 flex-shrink-0" /> info@mediqueue.cm
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 flex-shrink-0" /> Yaoundé, Cameroon
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-blue-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-blue-400">© {new Date().getFullYear()} MediQueue. All rights reserved.</p>
          <p className="flex items-center gap-2 text-sm text-blue-300">
            <Heart className="h-4 w-4 text-blue-400" />
            Built for Cameroon's Healthcare System
          </p>
        </div>
      </div>
    </footer>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <AboutUs />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}