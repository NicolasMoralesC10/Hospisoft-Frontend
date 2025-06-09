// Obtener token JWT almacenado
const getToken = () => localStorage.getItem('token')

/**
 * Wrapper para fetch que incluye token JWT en headers y maneja errores.
 * @param {string} url - URL de la petición
 * @param {object} options - Opciones de fetch (method, headers, body, etc.)
 * @returns {Promise<object>} - Respuesta parseada en JSON
 */
export const apiFetch = async (url, options = {}) => {
  const token = getToken()

  // Construir headers por defecto y combinar con headers pasados en options
  const headers = { ...options.headers } // Usar spread para no modificar options original

  // Agregar 'Authorization' si hay token
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // No establecer Content-Type si el body es FormData
  if (options.body instanceof FormData) {
    delete headers['Content-Type'] // Eliminar Content-Type si existe
  } else {
    headers['Content-Type'] = 'application/json' // Establecer si no es FormData
  }

  // Configurar opciones finales para fetch
  const config = {
    ...options,
    headers,
  }

  // Realizar la petición
  const response = await fetch(url, config)

  // Manejar errores HTTP
  if (!response.ok) {
    let errorMessage = `Error ${response.status}`
    try {
      const errorData = await response.json()
      errorMessage = errorData.message || errorMessage
    } catch {
      // No JSON en la respuesta de error
    }
    throw new Error(errorMessage)
  }

  // Parsear y devolver JSON
  return response.json()
}

export default apiFetch
