import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Login from './pages/patient/Login'
import Register from './pages/patient/Register'
import HospitalRegister from './pages/admin/HospitalRegister'
import Dashboard from './pages/patient/Dashboard'
import BookAppointment from './pages/patient/BookAppointment'
import MyAppointments from './pages/patient/MyAppointments'
import QueueTracker from './pages/patient/QueueTracker'
import ChatAssistant from './pages/patient/ChatAssistant'
import Profile from './pages/patient/Profile'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import ProtectedRoute from './components/ProtectedRoute'

function App(){
  return (
    <Routes>
      <Route path='/' element={<LandingPage />} />
      <Route path='/login' element={<Login />} />
      <Route path='/register' element={<Register />} />
      <Route path='/register-hospital' element={<HospitalRegister />} />
      
      {/* Patient Routes */}
      <Route path='/dashboard' element={
        <ProtectedRoute allowedRoles={['patient']}>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path='/book-appointment' element={
        <ProtectedRoute allowedRoles={['patient']}>
          <BookAppointment />
        </ProtectedRoute>
      } />
      <Route path='/my-appointments' element={
        <ProtectedRoute allowedRoles={['patient']}>
          <MyAppointments />
        </ProtectedRoute>
      } />
      <Route path='/queue-tracker' element={
        <ProtectedRoute allowedRoles={['patient']}>
          <QueueTracker />
        </ProtectedRoute>
      } />
      <Route path='/chat' element={
        <ProtectedRoute allowedRoles={['patient']}>
          <ChatAssistant />
        </ProtectedRoute>
      } />
      <Route path='/profile' element={
        <ProtectedRoute allowedRoles={['patient']}>
          <Profile />
        </ProtectedRoute>
      } />
      
      {/* Admin / Doctor Routes */}
      <Route path='/admin/login' element={<AdminLogin />} />
      <Route path='/admin/dashboard' element={
        <ProtectedRoute allowedRoles={['admin', 'doctor']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path='/admin/queue' element={
        <ProtectedRoute allowedRoles={['admin', 'doctor']}>
          <AdminDashboard defaultTab="queue" />
        </ProtectedRoute>
      } />
      <Route path='/admin/doctors' element={
        <ProtectedRoute allowedRoles={['admin', 'doctor']}>
          <AdminDashboard defaultTab="doctors" />
        </ProtectedRoute>
      } />
    </Routes>
  )
}

export default App