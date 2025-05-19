import React, { useState, useEffect } from 'react'
import {
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CFormLabel,
  CFormTextarea,
} from '@coreui/react'

const initialCita = {
  title: '',
  date: '',
  description: '',
}

const CitaModal = ({ visible, onClose, onSave, initialData = {}, modo = 'agregar' }) => {
  const [cita, setCita] = useState(initialCita)

  useEffect(() => {
    if (initialData) {
      setCita({
        title: initialData.title || '',
        date: initialData.date || '',
        description: initialData.description || '',
      })
    }
  }, [initialData, visible])

  const handleChange = (e) => {
    const { name, value } = e.target
    setCita((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(cita)
  }

  return (
    <CModal visible={visible} onClose={onClose}>
      <CModalHeader onClose={onClose}>
        <CModalTitle>{modo === 'agregar' ? 'Agregar Cita' : 'Editar Cita'}</CModalTitle>
      </CModalHeader>
      <CForm onSubmit={handleSubmit}>
        <CModalBody>
          <CFormLabel>Título</CFormLabel>
          <CFormInput name="title" value={cita.title} onChange={handleChange} required />
          <CFormLabel className="mt-2">Fecha y hora</CFormLabel>
          <CFormInput
            type="datetime-local"
            name="date"
            value={cita.date}
            onChange={handleChange}
            required
          />
          <CFormLabel className="mt-2">Descripción</CFormLabel>
          <CFormTextarea
            name="description"
            value={cita.description}
            onChange={handleChange}
            rows={3}
          />
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={onClose}>
            Cancelar
          </CButton>
          <CButton color="primary" type="submit">
            {modo === 'agregar' ? 'Agregar' : 'Guardar'}
          </CButton>
        </CModalFooter>
      </CForm>
    </CModal>
  )
}

export default CitaModal
