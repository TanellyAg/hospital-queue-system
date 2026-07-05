import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-sans font-bold text-slate-400 text-sm bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Verifying credentials...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    const isAdminRoute = allowedRoles.includes('admin') || allowedRoles.includes('doctor')
    return <Navigate to={isAdminRoute ? "/admin/login" : "/login"} replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'patient' ? "/dashboard" : "/admin/dashboard"} replace />
  }

  return children
}
