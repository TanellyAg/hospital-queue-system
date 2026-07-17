import { useState } from "react"
import { Link } from "react-router-dom"
import {
  Menu, X, CalendarCheck, Bot, Users,
  MessageSquare, Hash, UserPlus, ArrowRight,
  Heart, MapPin, Mail, Phone,
  ListOrdered, Brain, CheckCircle, Share2,
  Stethoscope
} from "lucide-react"

const TRANSLATIONS = {
  en: {
    nav_home: "Home",
    nav_features: "Features",
    nav_how: "How It Works",
    nav_about: "About Us",
    nav_contact: "Contact",
    login: "Login",
    register: "Register",
    welcome: "Welcome to MediQueue",
    hero_title: "Smarter Appointments.",
    hero_subtitle: "Better Healthcare.",
    hero_desc: "MediQueue is a cloud-based hospital queue and appointment management system with an AI-powered patient assistant. Book appointments, get real-time updates, and reduce waiting time.",
    hero_btn_book: "Book an Appointment",
    hero_btn_login: "Login to Account",
    features_title: "Our Key Features",
    features_subtitle: "Everything you need for a safer, smarter, and faster hospital experience in Cameroon.",
    feat1_title: "Online Appointment Booking",
    feat1_desc: "Book appointments easily from anywhere, anytime without visiting the hospital.",
    feat2_title: "AI Patient Assistant",
    feat2_desc: "Chat with our AI assistant for symptom checks and health guidance 24/7.",
    feat3_title: "Symptom-Based Triage",
    feat3_desc: "AI-powered triage helps prioritize care based on your reported symptoms.",
    feat4_title: "Queue Tracking",
    feat4_desc: "Track your queue position and estimated waiting time in real-time.",
    feat5_title: "SMS Notifications",
    feat5_desc: "Receive SMS alerts for appointment confirmations and queue updates.",
    feat6_title: "Smart Insights",
    feat6_desc: "Hospitals get AI-powered insights to improve service and efficiency.",
    how_title: "How It Works",
    how_subtitle: "From sign-up to consultation in five simple steps",
    how1_title: "Register / Login",
    how1_desc: "Create an account or log in to get started.",
    how2_title: "Book Appointment",
    how2_desc: "Choose a department, doctor, and time that suits you.",
    how3_title: "Get in Queue",
    how3_desc: "Receive a queue number and estimated waiting time.",
    how4_title: "Stay Updated",
    how4_desc: "Get SMS notifications and real-time updates on your queue.",
    how5_title: "Visit Hospital",
    how5_desc: "Arrive on time and receive better, faster care.",
    about_badge: "About Us",
    about_title: "Built for Cameroon's Healthcare System",
    about_desc1: "MediQueue was developed as a final year project at the Catholic University Institute of Buea (CUIB) to address the critical challenge of long waiting times and inefficient queue management in Cameroonian hospitals.",
    about_desc2: "By combining cloud technology, artificial intelligence, and SMS notifications that work on MTN and Orange networks, MediQueue makes quality healthcare more accessible for every patient in Cameroon.",
    cta_title: "Ready to transform your hospital experience?",
    cta_desc: "Join hospitals across Cameroon already saving hours every day with MediQueue.",
    cta_btn: "Get Started Free",
    footer_desc: "MediQueue is dedicated to improving patient experience and hospital efficiency through smart technology built for Cameroon.",
    footer_links: "Quick Links",
    footer_contact: "Contact"
  },
  fr: {
    nav_home: "Accueil",
    nav_features: "Fonctionnalités",
    nav_how: "Comment ça marche",
    nav_about: "À propos",
    nav_contact: "Contact",
    login: "Connexion",
    register: "S'inscrire",
    welcome: "Bienvenue sur MediQueue",
    hero_title: "Rendez-vous Intelligents.",
    hero_subtitle: "Meilleure Santé.",
    hero_desc: "MediQueue est un système cloud de gestion des files d'attente et des rendez-vous avec un assistant IA. Planifiez vos rendez-vous, suivez votre statut en temps réel et réduisez les attentes.",
    hero_btn_book: "Prendre un Rendez-vous",
    hero_btn_login: "Se Connecter",
    features_title: "Nos Fonctionnalités Clés",
    features_subtitle: "Tout ce dont vous avez besoin pour une expérience hospitalière plus sûre, plus intelligente et plus rapide au Cameroun.",
    feat1_title: "Prise de RDV en Ligne",
    feat1_desc: "Prenez rendez-vous facilement où que vous soyez, à tout moment, sans avoir à vous déplacer.",
    feat2_title: "Assistant Patient par IA",
    feat2_desc: "Discutez 24h/24 et 7j/7 avec notre assistant virtuel pour vérifier vos symptômes.",
    feat3_title: "Triage des Symptômes",
    feat3_desc: "Le triage automatique priorise votre prise en charge selon la gravité de vos symptômes.",
    feat4_title: "Suivi de File d'Attente",
    feat4_desc: "Suivez en temps réel votre position dans la file d'attente et votre heure de passage estimée.",
    feat5_title: "Notifications SMS",
    feat5_desc: "Recevez des alertes SMS pour les confirmations de rendez-vous et les mises à jour de passage.",
    feat6_title: "Statistiques Intelligentes",
    feat6_desc: "Les hôpitaux reçoivent des analyses IA pour optimiser la qualité du service.",
    how_title: "Comment ça marche",
    how_subtitle: "De l'inscription à la consultation en cinq étapes simples",
    how1_title: "S'inscrire / Se Connecter",
    how1_desc: "Créez votre compte ou connectez-vous pour commencer.",
    how2_title: "Prendre un Rendez-vous",
    how2_desc: "Choisissez le service, le médecin et le créneau horaire qui vous conviennent.",
    how3_title: "Entrer en File d'Attente",
    how3_desc: "Recevez un numéro de passage et votre temps d'attente estimé.",
    how4_title: "Suivi de Position",
    how4_desc: "Recevez des alertes SMS et suivez votre statut en temps réel.",
    how5_title: "Consulter le Médecin",
    how5_desc: "Présentez-vous à l'heure pour votre consultation simplifiée.",
    about_badge: "À propos de nous",
    about_title: "Conçu pour le Système de Santé Camerounais",
    about_desc1: "MediQueue a été développé comme projet de fin d'études à l'Université Catholique de Buea (CUIB) pour résoudre le problème des longues files d'attente dans nos hôpitaux.",
    about_desc2: "En associant les technologies cloud, l'intelligence artificielle et des SMS compatibles avec MTN et Orange, MediQueue rend les soins de santé plus accessibles à tous au Cameroun.",
    cta_title: "Prêt à transformer votre expérience hospitalière ?",
    cta_desc: "Rejoignez les hôpitaux camerounais qui gagnent du temps chaque jour grâce à MediQueue.",
    cta_btn: "Commencer Gratuitement",
    footer_desc: "MediQueue s'engage à optimiser l'expérience des patients et l'efficacité des soins grâce à une technologie adaptée au Cameroun.",
    footer_links: "Liens Rapides",
    footer_contact: "Contact"
  }
}

function Navbar({ lang, setLang }) {
  const [open, setOpen] = useState(false)
  const t = TRANSLATIONS[lang]

  const navItems = [
    { label: t.nav_home, link: "#home" },
    { label: t.nav_features, link: "#features" },
    { label: t.nav_how, link: "#how-it-works" },
    { label: t.nav_about, link: "#about-us" },
    { label: t.nav_contact, link: "#contact" }
  ]

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="h-10 w-10 bg-blue-700 rounded-xl flex items-center justify-center shadow-lg">
            <Stethoscope className="h-5 w-5 text-white" />
          </div>
          <div className="text-left">
            <span className="text-2xl font-extrabold text-blue-900">MediQueue</span>
            <p className="text-[10px] text-blue-400 leading-none">Smart Care. Less Wait.</p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a key={item.label}
              href={item.link}
              className="text-sm font-medium text-gray-600 hover:text-blue-700 transition border-b-2 border-transparent hover:border-blue-700 pb-0.5">
              {item.label}
            </a>
          ))}
        </nav>

        {/* Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => setLang(lang === "en" ? "fr" : "en")}
            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition cursor-pointer"
          >
            {lang.toUpperCase()}
          </button>
          <Link to="/login"
            className="px-6 py-2 text-sm font-semibold text-blue-700 border-2 border-blue-700 rounded-lg hover:bg-blue-50 transition">
            {t.login}
          </Link>
          <Link to="/register"
            className="px-6 py-2 text-sm font-semibold text-white bg-blue-700 rounded-lg shadow-lg hover:bg-blue-800 transition">
            {t.register}
          </Link>
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={() => setLang(lang === "en" ? "fr" : "en")}
            className="px-3 py-1 bg-slate-100 text-slate-700 font-extrabold text-xs rounded-xl"
          >
            {lang.toUpperCase()}
          </button>
          <button onClick={() => setOpen(!open)}>
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-3 text-left">
          {navItems.map((item) => (
            <a key={item.label} href={item.link}
              onClick={() => setOpen(false)}
              className="block text-sm font-medium text-gray-600 py-2">
              {item.label}
            </a>
          ))}
          <Link to="/login" className="block text-center py-2 border-2 border-blue-700 text-blue-700 rounded-lg font-semibold text-sm">{t.login}</Link>
          <Link to="/register" className="block text-center py-2 bg-blue-700 text-white rounded-lg font-semibold text-sm">{t.register}</Link>
        </div>
      )}
    </header>
  )
}

function Hero({ lang }) {
  const t = TRANSLATIONS[lang]
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
          <div className="text-left">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-6">
              <Stethoscope className="h-3.5 w-3.5" /> {t.welcome}
            </div>

            <h1 className="text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
              {lang === "en" ? (
                <>
                  Smarter
                  <br />
                  Appointments.
                  <br />
                  <span className="text-blue-300">Better Healthcare.</span>
                </>
              ) : (
                <>
                  Rendez-vous
                  <br />
                  Intelligents.
                  <br />
                  <span className="text-blue-300">Meilleure Santé.</span>
                </>
              )}
            </h1>

            <p className="text-lg text-blue-100 mb-8 max-w-lg leading-relaxed font-medium">
              {t.hero_desc}
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/register"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-7 py-3.5 rounded-lg font-bold shadow-xl hover:bg-blue-700 transition">
                <CalendarCheck className="h-5 w-5" />
                {t.hero_btn_book}
              </Link>
              <Link to="/login"
                className="inline-flex items-center gap-2 bg-white/10 border-2 border-white/40 text-white px-7 py-3.5 rounded-lg font-semibold hover:bg-white/20 transition">
                <Users className="h-5 w-5" />
                {t.hero_btn_login}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Features({ lang }) {
  const t = TRANSLATIONS[lang]
  const features = [
    { icon: CalendarCheck, title: t.feat1_title, desc: t.feat1_desc, color: "bg-blue-50 text-blue-600" },
    { icon: Bot, title: t.feat2_title, desc: t.feat2_desc, color: "bg-purple-50 text-purple-600" },
    { icon: Stethoscope, title: t.feat3_title, desc: t.feat3_desc, color: "bg-green-50 text-green-600" },
    { icon: ListOrdered, title: t.feat4_title, desc: t.feat4_desc, color: "bg-orange-50 text-orange-600" },
    { icon: MessageSquare, title: t.feat5_title, desc: t.feat5_desc, color: "bg-pink-50 text-pink-600" },
    { icon: Brain, title: t.feat6_title, desc: t.feat6_desc, color: "bg-indigo-50 text-indigo-600" },
  ]

  return (
    <section id="features" className="py-24 bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 text-left">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-gray-900 mb-4">{t.features_title}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t.features_subtitle}
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

function HowItWorks({ lang }) {
  const t = TRANSLATIONS[lang]
  const steps = [
    { icon: UserPlus, title: t.how1_title, desc: t.how1_desc },
    { icon: CalendarCheck, title: t.how2_title, desc: t.how2_desc },
    { icon: Hash, title: t.how3_title, desc: t.how3_desc },
    { icon: MessageSquare, title: t.how4_title, desc: t.how4_desc },
    { icon: CheckCircle, title: t.how5_title, desc: t.how5_desc },
  ]

  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-black text-gray-900 mb-4">{t.how_title}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t.how_subtitle}
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

function AboutUs({ lang }) {
  const t = TRANSLATIONS[lang]
  return (
    <section id="about-us" className="py-24 bg-blue-50">
      <div className="mx-auto max-w-7xl px-6 text-left">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-blue-600 mb-3">{t.about_badge}</p>
            <h2 className="text-4xl font-black text-gray-900 mb-6">
              {t.about_title}
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              {t.about_desc1}
            </p>
            <p className="text-gray-600 leading-relaxed mb-8">
              {t.about_desc2}
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
              src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&auto=format&fit=crop&q=80"
              alt="Hospital"
              className="w-full h-80 object-cover rounded-3xl shadow-xl"
            />
            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-6">
              <p className="text-4xl font-black text-blue-700">98%</p>
              <p className="text-gray-600 text-sm">{lang === "en" ? "Patient Satisfaction" : "Satisfaction des Patients"}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function CTA({ lang }) {
  const t = TRANSLATIONS[lang]
  return (
    <section className="py-20 px-6 bg-white">
      <div className="mx-auto max-w-5xl bg-gradient-to-br from-blue-800 to-blue-600 rounded-3xl p-16 text-center relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 translate-y-1/2" />
        <h2 className="relative text-4xl font-black text-white mb-4">
          {t.cta_title}
        </h2>
        <p className="relative text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
          {t.cta_desc}
        </p>
        <div className="relative flex flex-wrap justify-center gap-4">
          <Link to="/register"
            className="inline-flex items-center gap-2 bg-white text-blue-800 px-8 py-4 rounded-lg font-bold shadow-xl hover:bg-blue-50 transition">
            {t.cta_btn} <ArrowRight className="h-4 w-4" />
          </Link>
          <a href="#contact"
            className="inline-flex items-center gap-2 border-2 border-white/40 text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition">
            {t.nav_contact}
          </a>
        </div>
      </div>
    </section>
  )
}

function Footer({ lang }) {
  const t = TRANSLATIONS[lang]
  return (
    <footer id="contact" className="bg-blue-900 text-blue-50 text-left">
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
              {t.footer_desc}
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
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">{t.footer_links}</h4>
            <ul className="space-y-2 text-sm text-blue-200">
              <li><a href="#home" className="hover:text-white transition">{t.nav_home}</a></li>
              <li><a href="#features" className="hover:text-white transition">{t.nav_features}</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition">{t.nav_how}</a></li>
              <li><a href="#about-us" className="hover:text-white transition">{t.nav_about}</a></li>
              <li><a href="#contact" className="hover:text-white transition">{t.nav_contact}</a></li>
              <li><Link to="/login" className="hover:text-white transition">{t.login}</Link></li>
              <li><Link to="/register" className="hover:text-white transition">{t.register}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">{t.footer_contact}</h4>
            <ul className="space-y-3 text-sm text-blue-200">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 flex-shrink-0" /> +237 600 123 456
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
  const [lang, setLang] = useState(localStorage.getItem("lang") || "en")

  const handleSetLang = (newLang) => {
    setLang(newLang)
    localStorage.setItem("lang", newLang)
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar lang={lang} setLang={handleSetLang} />
      <main>
        <Hero lang={lang} />
        <Features lang={lang} />
        <HowItWorks lang={lang} />
        <AboutUs lang={lang} />
        <CTA lang={lang} />
      </main>
      <Footer lang={lang} />
    </div>
  )
}