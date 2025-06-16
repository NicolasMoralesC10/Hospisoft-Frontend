import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const ProtectedRoute = ({ allowedRoles = [], redirectPath = '/login', children }) => {
  const { token, rol, loading } = useAuth()

  if (loading) {
    // Mientras se verifica el estado
    return <div>Cargando...</div>
  }

  if (!token) {
    // Si no hay token, redirige a login
    return <Navigate to={redirectPath} replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(rol)) {
    // <-- Verificar si el rol del usuario está en allowedRoles
    return <Navigate to="/unauthorized" replace /> // Redirigir a una página de "no autorizado"
  }

  return children ? children : <Outlet /> // Renderizar children si se proporciona, o Outlet si no
}

export default ProtectedRoute
