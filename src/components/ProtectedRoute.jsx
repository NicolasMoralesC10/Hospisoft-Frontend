import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const ProtectedRoute = ({ redirectPath = '/login' }) => {
  const { token, loading } = useAuth()

  if (loading) {
    // Mientras se verifica el estado
    return <div>Cargando...</div>
  }

  if (!token) {
    // Si no hay token, redirige a login
    return <Navigate to={redirectPath} replace />
  }

  // Si está autenticado, renderiza las rutas hijas
  return <Outlet />
}

export default ProtectedRoute
