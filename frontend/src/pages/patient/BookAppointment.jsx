import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { getDoctors, getDoctorAvailability, bookAppointment } from "../../services/api"
import { Building, User, Calendar, Clock, MapPin, Compass, ArrowLeft, ChevronRight, CheckCircle, AlertCircle, FileText, Search } from "lucide-react"

export default function BookAppointment() {
  const navigate = useNavigate()

  // Booking process steps: "hospital" -> "doctor" -> "datetime" -> "confirm"
  const [step, setStep] = useState("hospital")
  const [doctors, setDoctors] = useState([])
  const [hospitals, setHospitals] = useState([])
  const [searchQuery, setSearchQuery] = useState("")

  // Location states
  const [userCoords, setUserCoords] = useState(null)
  const [locating, setLocating] = useState(false)
  const [locationMessage, setLocationMessage] = useState("")

  // Selections
  const [selectedHospital, setSelectedHospital] = useState(null)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [appointmentDate, setAppointmentDate] = useState("")
  const [availableSlots, setAvailableSlots] = useState([])
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("")
  const [symptoms, setSymptoms] = useState("")
  const [notes, setNotes] = useState("")

  // Status states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // 1. Fetch Doctors and Prompt Geolocation on mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const docsList = await getDoctors()
        if (Array.isArray(docsList)) {
          setDoctors(docsList)
        }
      } catch (err) {
        setError("Failed to retrieve doctors list. Please check your network connection.")
      } finally {
        setLoading(false)
      }
    }
    loadData()
    handleRequestLocation()
  }, [])

  // Geolocation trigger
  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage("Browser does not support geolocation.")
      return
    }
    setLocating(true)
    setLocationMessage("Locating nearest facilities...")
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        })
        setLocationMessage("Location retrieved. Nearest hospitals sorted first.")
        setLocating(false)
      },
      (err) => {
        setLocationMessage("Location access denied. Sorting hospitals alphabetically.")
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  // Haversine formula for distance calculation
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371 // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // 2. Group doctors into hospitals, compute distances, and sort
  useEffect(() => {
    if (doctors.length === 0) return

    const hospitalsMap = {}
    doctors.forEach((doc) => {
      if (doc.hospital_id) {
        if (!hospitalsMap[doc.hospital_id]) {
          hospitalsMap[doc.hospital_id] = {
            id: doc.hospital_id,
            name: doc.hospital_name,
            address: doc.hospital_address,
            latitude: doc.hospital_lat,
            longitude: doc.hospital_lng,
            doctors: []
          }
        }
        hospitalsMap[doc.hospital_id].doctors.push(doc)
      }
    })

    const list = Object.values(hospitalsMap).map((hosp) => {
      let distance = null
      if (userCoords && hosp.latitude && hosp.longitude) {
        distance = calculateDistance(
          userCoords.latitude,
          userCoords.longitude,
          hosp.latitude,
          hosp.longitude
        )
      }
      return {
        ...hosp,
        distance: distance
      }
    })

    // Sort by distance (if available), otherwise alphabetically
    list.sort((a, b) => {
      if (a.distance !== null && b.distance !== null) {
        return a.distance - b.distance
      }
      return a.name.localeCompare(b.name)
    })

    setHospitals(list)
  }, [doctors, userCoords])

  // 3. Fetch availability and compute slots when Doctor and Date are chosen
  useEffect(() => {
    if (!selectedDoctor || !appointmentDate) {
      setAvailableSlots([])
      return
    }

    async function loadDoctorAvailability() {
      try {
        setError("")
        const res = await getDoctorAvailability(selectedDoctor.id, appointmentDate)
        const availList = res.schedule || []
        const bookedSlots = res.booked_slots || []
        
        // Find availability for chosen day
        const dateObj = new Date(appointmentDate)
        const jsDay = dateObj.getDay() // 0=Sunday, 1=Monday, ..., 6=Saturday
        const djangoDay = jsDay === 0 ? 6 : jsDay - 1 // Sunday=6, Monday=0...

        const daySchedule = availList.find(
          (av) => av.day_of_week === djangoDay && av.is_available
        )

        if (!daySchedule) {
          setAvailableSlots([])
          setError("This doctor has no available scheduling slots on this weekday.")
          return
        }

        // Generate 30-minute slots between start_time and end_time
        const slots = []
        const [sh, sm] = daySchedule.start_time.split(":").map(Number)
        const [eh, em] = daySchedule.end_time.split(":").map(Number)

        let current = new Date()
        current.setHours(sh, sm, 0, 0)
        const end = new Date()
        end.setHours(eh, em, 0, 0)

        const formatTime = (d) => {
          const hh = String(d.getHours()).padStart(2, "0")
          const mm = String(d.getMinutes()).padStart(2, "0")
          return `${hh}:${mm}`
        }

        // Check if selected date is today, to filter out past slots
        const isToday = new Date().toDateString() === dateObj.toDateString()
        const now = new Date()

        while (current < end) {
          const timeStr = formatTime(current)
          if ((!isToday || current > now) && !bookedSlots.includes(timeStr)) {
            slots.push(timeStr)
          }
          // Increment by 30 mins
          current.setMinutes(current.getMinutes() + 30)
        }

        setAvailableSlots(slots)
        if (slots.length === 0) {
          setError("No remaining consultation times available for today.")
        }
      } catch (err) {
        setError("Failed to fetch slots availability.")
      }
    }

    loadDoctorAvailability()
  }, [selectedDoctor, appointmentDate])

  const handleSelectHospital = (hosp) => {
    setSelectedHospital(hosp)
    setStep("doctor")
  }

  const handleSelectDoctor = (doc) => {
    setSelectedDoctor(doc)
    // Preset appointment date to tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    setAppointmentDate(tomorrow.toISOString().split("T")[0])
    setStep("datetime")
  }

  const handleBook = async (e) => {
    e.preventDefault()
    if (!selectedTimeSlot) {
      setError("Please select a valid consultation time slot.")
      return
    }

    setError("")
    setLoading(true)

    const payload = {
      doctor: selectedDoctor.id,
      appointment_date: appointmentDate,
      appointment_time: selectedTimeSlot,
      symptoms: symptoms,
      notes: notes
    }

    try {
      const response = await bookAppointment(payload)
      if (response.id) {
        setSuccess(true)
        setTimeout(() => {
          navigate("/dashboard")
        }, 2000)
      } else {
        let errMsg = ""
        if (response.non_field_errors) {
          errMsg = response.non_field_errors[0]
        } else if (response.error) {
          errMsg = response.error
        } else if (typeof response === "object") {
          const firstKey = Object.keys(response)[0]
          if (firstKey) {
            const val = response[firstKey]
            errMsg = `${firstKey}: ${Array.isArray(val) ? val[0] : val}`
          }
        }
        setError(errMsg || "Booking failed. Slot may already be reserved.")
      }
    } catch (err) {
      setError("Failed to book appointment. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Filter hospitals based on search query
  const filteredHospitals = hospitals.filter((hosp) =>
    hosp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hosp.address.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="p-2 hover:bg-slate-50 rounded-xl transition text-slate-500 hover:text-slate-800">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h2 className="text-lg font-black text-slate-800 tracking-tight text-left">Book Consultation</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-left">Patient Portal</p>
            </div>
          </div>
          <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full">
            MediQueue Network
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-6 mt-8">
        
        {/* Step Flow Indicators */}
        <div className="flex items-center justify-center gap-2 mb-8 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm max-w-lg mx-auto">
          <span className={`text-xs font-bold px-3 py-1.5 rounded-xl transition ${
            step === "hospital" ? "bg-blue-900 text-white" : "bg-slate-50 text-slate-500"
          }`}>1. Select Facility</span>
          <ChevronRight className="h-4 w-4 text-slate-300" />
          <span className={`text-xs font-bold px-3 py-1.5 rounded-xl transition ${
            step === "doctor" ? "bg-blue-900 text-white" : "bg-slate-50 text-slate-500"
          }`}>2. Select Doctor</span>
          <ChevronRight className="h-4 w-4 text-slate-300" />
          <span className={`text-xs font-bold px-3 py-1.5 rounded-xl transition ${
            step === "datetime" ? "bg-blue-900 text-white" : "bg-slate-50 text-slate-500"
          }`}>3. Schedule Slot</span>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-xs p-4 rounded-2xl font-semibold mb-6 flex items-center gap-3 text-left">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-100 text-green-600 text-xs p-4 rounded-2xl font-semibold mb-6 flex items-center gap-3 text-left">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
            <span>Appointment Booked Successfully! Redirecting back to dashboard...</span>
          </div>
        )}

        {/* STEP 1: SELECT HOSPITAL */}
        {step === "hospital" && (
          <div className="space-y-6">
            
            {/* Search and Geolocation Banner */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white border border-slate-100 p-6 rounded-3xl shadow-sm text-left">
              <div className="w-full sm:max-w-md relative">
                <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search hospitals by name or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition font-medium"
                />
              </div>

              <button
                onClick={handleRequestLocation}
                disabled={locating}
                className="w-full sm:w-auto px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 border border-slate-200 flex-shrink-0"
              >
                <Compass className={`h-4.5 w-4.5 text-blue-600 ${locating ? "animate-spin" : ""}`} />
                <span>{locating ? "Locating..." : "Sort by Nearest"}</span>
              </button>
            </div>

            {locationMessage && (
              <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide text-left px-2">
                🧭 {locationMessage}
              </p>
            )}

            {loading ? (
              <p className="text-center py-12 text-slate-400 font-semibold text-xs">Fetching clinical offices...</p>
            ) : filteredHospitals.length === 0 ? (
              <div className="bg-white border border-slate-100 p-12 rounded-3xl shadow-sm text-center">
                <Building className="h-12 w-12 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500 font-extrabold text-sm">No registered clinics or hospitals found.</p>
                <p className="text-slate-400 text-xs mt-1">Refine your search parameters or check back later.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredHospitals.map((hosp) => (
                  <div
                    key={hosp.id}
                    onClick={() => handleSelectHospital(hosp)}
                    className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition cursor-pointer hover:border-blue-200 text-left flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-900 flex-shrink-0">
                          <Building className="h-5 w-5" />
                        </div>
                        
                        {hosp.distance !== null && (
                          <span className="bg-green-50 text-green-700 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide">
                            {hosp.distance < 1.0 
                              ? "Very Close (<1 km)" 
                              : `~${hosp.distance.toFixed(1)} km away`}
                          </span>
                        )}
                      </div>

                      <h3 className="font-extrabold text-slate-800 text-base mt-4">{hosp.name}</h3>
                      <p className="text-xs text-slate-400 font-semibold mt-1 flex items-start gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                        <span>{hosp.address}</span>
                      </p>
                    </div>

                    <div className="border-t border-slate-50 pt-4 mt-6 flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Onboarded Staff</span>
                      <span className="text-blue-900 font-extrabold">{hosp.doctors.length} Doctors</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 2: SELECT DOCTOR */}
        {step === "doctor" && selectedHospital && (
          <div className="space-y-6 text-left">
            <button
              onClick={() => setStep("hospital")}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-900 transition uppercase tracking-wider"
            >
              <ArrowLeft className="h-4 w-4" /> Back to hospitals list
            </button>

            <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Selected Facility</p>
              <h3 className="text-xl font-black text-slate-800 mt-1">{selectedHospital.name}</h3>
              <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-slate-400" /> {selectedHospital.address}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {selectedHospital.doctors.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => handleSelectDoctor(doc)}
                  className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm hover:shadow-md transition cursor-pointer hover:border-blue-200 flex flex-col justify-between"
                >
                  <div>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-wide">
                      {doc.doctor_type}
                    </span>
                    <h4 className="font-extrabold text-slate-800 text-base mt-3">Dr. {doc.name}</h4>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">{doc.specialization || "General Medicine"}</p>
                  </div>

                  <div className="border-t border-slate-50 pt-4 mt-6 flex justify-between items-center text-xs font-bold text-slate-500">
                    <span className="text-[10px] uppercase tracking-wider">Avg. Consult Duration</span>
                    <span className="text-blue-900">{doc.avg_consultation_time} mins</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: SCHEDULE DATE & TIME */}
        {step === "datetime" && selectedDoctor && (
          <div className="space-y-6 text-left">
            <button
              onClick={() => setStep("doctor")}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-900 transition uppercase tracking-wider"
            >
              <ArrowLeft className="h-4 w-4" /> Back to doctors list
            </button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Doctor Details Summary Card */}
              <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4 h-fit">
                <div className="h-12 w-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-900">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Chosen Provider</p>
                  <h4 className="font-extrabold text-slate-800 text-lg">Dr. {selectedDoctor.name}</h4>
                  <p className="text-xs text-slate-400 font-semibold">{selectedDoctor.specialization || "General Medicine"}</p>
                </div>
                <div className="border-t border-slate-50 pt-3 text-xs font-semibold text-slate-500">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Hospital Office</p>
                  <p className="text-slate-700 mt-1">{selectedDoctor.hospital_name}</p>
                </div>
              </div>

              {/* Date, Time Slots & Symptoms Form */}
              <div className="md:col-span-2 bg-white border border-slate-100 p-8 rounded-3xl shadow-sm">
                <form onSubmit={handleBook} className="space-y-6">
                  
                  {/* Select Date */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" /> 1. Select Date
                    </label>
                    <input
                      type="date"
                      required
                      value={appointmentDate}
                      onChange={(e) => {
                        setAppointmentDate(e.target.value)
                        setSelectedTimeSlot("")
                      }}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition font-medium"
                    />
                  </div>

                  {/* Select Time Slot */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" /> 2. Select Consult Time Slot
                    </label>
                    
                    {availableSlots.length === 0 ? (
                      <p className="text-xs text-slate-400 font-semibold bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                        No appointments slots available for this day. Select a different date.
                      </p>
                    ) : (
                      <div className="grid grid-cols-4 gap-2">
                        {availableSlots.map((time) => (
                          <button
                            key={time}
                            type="button"
                            onClick={() => setSelectedTimeSlot(time)}
                            className={`py-2 text-xs font-bold rounded-xl transition border text-center ${
                              selectedTimeSlot === time
                                ? "bg-blue-900 border-blue-900 text-white shadow-sm"
                                : "bg-white border-slate-200 text-slate-600 hover:border-blue-600 hover:text-blue-900"
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Log Symptoms */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600" /> 3. Symptoms / Reason for Visit
                    </label>
                    <textarea
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      required
                      rows="3"
                      placeholder="Please describe symptoms (e.g., headache, fever, cough)..."
                      className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition font-medium"
                    />
                  </div>

                  {/* Submit Booking */}
                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button
                      type="submit"
                      disabled={loading || !selectedTimeSlot || !symptoms}
                      className="w-full sm:w-auto bg-blue-900 text-white px-8 py-3.5 rounded-xl font-extrabold text-sm hover:bg-blue-950 transition disabled:opacity-50 shadow-md shadow-blue-950/10 flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="h-4.5 w-4.5" />
                      <span>{loading ? "Confirming Booking..." : "Confirm Consult Booking"}</span>
                    </button>
                  </div>

                </form>
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  )
}
