// helpers/apiFetch.js

const getToken = () => localStorage.getItem('token')

/**
 * Wrapper para fetch que incluye JWT y maneja respuestas JSON o binarios (como imágenes).
 * @param {string} url
 * @param {object} options
 * @returns {Promise<object|Blob>}
 */
export const apiFetch = async (url, options = {}) => {
  const token = getToken()

  const headers = { ...options.headers }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const isFormData = options.body instanceof FormData

  // Solo agregar Content-Type si hay body y no es FormData
  if (options.body && !isFormData) {
    headers['Content-Type'] = 'application/json'
  }

  const config = {
    ...options,
    headers,
  }

  const response = await fetch(url, config)

  if (!response.ok) {
    let errorMessage = `Error ${response.status}`
    try {
      const errorData = await response.json()
      errorMessage = errorData.message || errorMessage
    } catch {
      // Respuesta no JSON
    }
    throw new Error(errorMessage)
  }

  const contentType = response.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    return response.json()
  }

  return response.blob()
}

export default apiFetch
