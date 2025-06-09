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
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  // Agregar 'Authorization' si hay token
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
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
      errorMessage = errorData.error || errorData.message || errorMessage
    } catch (err) {
      // No JSON en la respuesta de error
      console.warn('No se pudo parsear el cuerpo JSON del error:', err)
    }
    throw new Error(errorMessage)
  }

  // Parsear y devolver JSON
  return response.json()
}

export default apiFetch
