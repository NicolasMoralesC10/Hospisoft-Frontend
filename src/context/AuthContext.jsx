import React, { createContext, useContext, useState, useEffect } from 'react'

// Crear el contexto
const AuthContext = createContext()

// Proveedor del contexto
export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    token: null,
    user: null,
    rol: null,
    loading: true,
  })

  // Al cargar la app, revisar si hay token y usuario guardados en localStorage
  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    const rol = localStorage.getItem('rol')

    if (token && user && rol) {
      setAuthState({
        token,
        user: JSON.parse(user),
        rol,
        loading: false,
      })
    } else {
      setAuthState((prev) => ({ ...prev, loading: false }))
    }
  }, [])

  // Función para iniciar sesión y guardar token + usuario
  const login = (token, user, rol) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('rol', rol)
    setAuthState({ token, user, rol, loading: false })
  }

  // Función para cerrar sesión y limpiar estado
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('rol')
    setAuthState({ token: null, user: null, rol: null, loading: false })
  }

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>{children}</AuthContext.Provider>
  )
}

// Hook para usar el contexto fácilmente
export const useAuth = () => useContext(AuthContext)
