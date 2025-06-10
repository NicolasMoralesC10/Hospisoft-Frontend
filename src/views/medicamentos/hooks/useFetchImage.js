import { useState, useCallback } from 'react'
import { apiFetch } from '../../../helpers/apiFetch.js'

const PLACEHOLDER = 'https://via.placeholder.com/400x250.png?text=Sin+Imagen'

export const useFetchImage = () => {
  const fetchImage = useCallback(async (imagePath) => {
    if (!imagePath) return PLACEHOLDER
    try {
      const blob = await apiFetch(`http://127.0.0.1:3000/api/medicaments/image/${imagePath}`)
      return URL.createObjectURL(blob)
    } catch (error) {
      console.error('Error al cargar imagen:', error)
      return PLACEHOLDER
    }
  }, [])

  return { fetchImage }
}
