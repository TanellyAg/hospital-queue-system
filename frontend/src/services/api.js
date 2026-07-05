// base url for django backend
const BASE_URL = 'http://127.0.0.1:8000/api'

// helper function to get auth token from localstorage
const getToken = () => localStorage.getItem('access_token')

//helper function to make authenticated requests
const authHeaders =  () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
})

// ------ AUTH --------------
export const registerUser = async (userData) => {
    const response = await fetch(`${BASE_URL}/accounts/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(userData)
    })
    return response.json()
}

export const loginUser = async (credentials) => {
    const response = await fetch(`${BASE_URL}/accounts/login/`,   {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  })
  return response.json()
}

export const getProfile = async () => {
  const response = await fetch(`${BASE_URL}/accounts/profile/`, {
    headers: authHeaders()
  })
  return response.json()
}

export const updateProfile = async (data) => {
  const response = await fetch(`${BASE_URL}/accounts/profile/`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(data)
  })
  return response.json()
}

// ─── APPOINTMENTS ────────────────────────────────────
export const getDoctors = async () => {
  const response = await fetch(`${BASE_URL}/appointments/doctors/`, {
    headers: authHeaders()
  })
  return response.json()
}

export const bookAppointment = async (data) => {
    const response = await fetch(`${BASE_URL}/appointments/book/`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data)
    })
    return response.json()
}

export const getMyAppointments = async () => {
    const response = await fetch(`${BASE_URL}/appointments/my/`, {
        headers: authHeaders(),
    })
    return response.json()
}

export const cancelAppointment = async (appointmentId) => {
    const response = await fetch(`${BASE_URL}/appointments/${appointmentId}/`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ status: 'cancelled' })
    })
    return response.json()
}

export const getDoctorAvailability = async (doctorId, date = "") => {
    const url = date 
      ? `${BASE_URL}/appointments/doctors/${doctorId}/availability/?date=${date}`
      : `${BASE_URL}/appointments/doctors/${doctorId}/availability/`
    const response = await fetch(url, {
        headers: authHeaders(),
    })
    return response.json()
}

//------------QUEUE--------------------------
export const joinQueue = async (appointmentId) => {
    const response = await fetch(`${BASE_URL}/queues/join/`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ appointment_id: appointmentId })
    })
    return response.json()
}

export const getMyQueueStatus = async () => {
    const response = await fetch(`${BASE_URL}/queues/my-status/`, {
        headers: authHeaders(),
    })
    return response.json()
}

export const getTodayQueue = async () => {
    const response = await fetch(`${BASE_URL}/queues/today/`, {
        headers: authHeaders(),
    })
    return response.json()
}

export const updateQueueStatus = async (queueId, status) => {
    const response = await fetch(`${BASE_URL}/queues/${queueId}/status/`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ status })
    })
    return response.json()
}

//-------------- ADMIN -----------------
export const getAllAppointments = async () => {
    const response = await fetch(`${BASE_URL}/appointments/admin/all/`, {
        headers: authHeaders(),
    })
    return response.json()
}

export const updateAppointmentStatus = async (appointmentId, status) => {
    const response = await fetch(`${BASE_URL}/appointments/admin/${appointmentId}/status/`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ status })
    })
    return response.json()
}

export const toggleDoctorStatus = async (doctorId, isAvailable) => {
    const response = await fetch(`${BASE_URL}/appointments/admin/doctors/${doctorId}/toggle-status/`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ is_available: isAvailable })
    })
    return response.json()
}

export const toggleDoctorAvailability = async (availabilityId, isAvailable) => {
    const response = await fetch(`${BASE_URL}/appointments/admin/availability/${availabilityId}/toggle/`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ is_available: isAvailable })
    })
    return response.json()
}

export const registerHospital = async (hospitalData) => {
    const response = await fetch(`${BASE_URL}/accounts/register-hospital/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hospitalData)
    })
    return response.json()
}

export const createDoctor = async (doctorData) => {
    const response = await fetch(`${BASE_URL}/accounts/admin/add-doctor/`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(doctorData)
    })
    return response.json()
}

export const logEmergencyWalkin = async (walkinData) => {
    const response = await fetch(`${BASE_URL}/queues/emergency-walkin/`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(walkinData)
    })
    return response.json()
}

export const sendChatMessage = async (message) => {
    const response = await fetch(`${BASE_URL}/chatbot/chat/`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ message })
    })
    return response.json()
}