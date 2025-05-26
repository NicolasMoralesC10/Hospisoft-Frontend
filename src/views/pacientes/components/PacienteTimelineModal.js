// src/components/PacienteTimelineModal.jsx
import React, { useState } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CForm,
  CFormLabel,
  CFormInput,
  CFormFeedback,
  CRow,
  CCol,
} from '@coreui/react'
import { User, Lock } from 'lucide-react'

const initialClient = {
  nombre: '',
  documento: '',
  telefono: '',
  email: '',
}
const initialUser = {
  username: '',
  password: '',
  confirmPassword: '',
}

const PacienteTimelineModal = ({ visible, setVisible, onSubmit }) => {
  const [step, setStep] = useState(1)
  const [client, setClient] = useState(initialClient)
  const [user, setUser] = useState(initialUser)
  const [errors, setErrors] = useState({})

  const validateStep1 = () => {
    const errs = {}
    if (!client.nombre) errs.nombre = 'Nombre es requerido'
    if (!client.documento) errs.documento = 'Documento es requerido'
    if (!client.telefono) errs.telefono = 'Teléfono es requerido'
    if (!client.email) errs.email = 'Email es requerido'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const validateStep2 = () => {
    const errs = {}
    if (!user.username) errs.username = 'Usuario es requerido'
    if (!user.password) errs.password = 'Contraseña es requerida'
    if (user.password !== user.confirmPassword)
      errs.confirmPassword = 'Las contraseñas no coinciden'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2)
    else if (step === 2 && validateStep2()) {
      onSubmit({ client, user })
      setVisible(false)
      setStep(1)
      setClient(initialClient)
      setUser(initialUser)
      setErrors({})
    }
  }

  const handlePrev = () => setStep((s) => Math.max(1, s - 1))

  return (
    <CModal visible={visible} onClose={() => setVisible(false)} size="lg">
      <CModalHeader className="bg-primary text-light">
        <CModalTitle>{step === 1 ? 'Registrar Paciente' : 'Crear Usuario'}</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <div className="d-flex align-items-center justify-content-between mb-1 px-4">
          <div className="d-flex align-items-center" style={{ width: '100%' }}>
            <div
              style={{
                flex: 1,
                height: '6px',
                backgroundColor: step >= 1 ? '#0d6efd' : '#dee2e6',
                borderRadius: '10px 0 0 10px',
              }}
            />
            <div
              className={`d-flex align-items-center justify-content-center rounded-circle mx-2 ${step >= 1 ? 'bg-primary text-white' : 'bg-light text-muted'}`}
              style={{ width: '48px', height: '48px' }}
            >
              <User size={24} />
            </div>
            <div
              style={{
                flex: 2,
                height: '6px',
                backgroundColor: step === 2 ? '#0d6efd' : '#dee2e6',
              }}
            />
            <div
              className={`d-flex align-items-center justify-content-center rounded-circle mx-2 ${step >= 2 ? 'bg-primary text-white' : 'bg-light text-muted'}`}
              style={{ width: '48px', height: '48px' }}
            >
              <Lock size={24} />
            </div>
            <div
              style={{
                flex: 1,
                height: '6px',
                backgroundColor: '#dee2e6',
                borderRadius: '0 10px 10px 0',
              }}
            />
          </div>
        </div>
        <div className="d-flex justify-content-between px-4 mb-4">
          <div className="d-flex flex-column align-items-center" style={{ width: '48px', marginLeft: '21.5%' }}>
            <small className={`${step >= 1 ? 'text-primary' : 'text-muted'}`}>Paciente</small>
          </div>

          <div className="d-flex flex-column align-items-center" style={{ width: '48px', marginRight: '21.5%' }}>
            <small className={`${step >= 2 ? 'text-primary' : 'text-muted'}`}>Usuario</small>
          </div>
        </div>

        <CForm className="px-4">
          {step === 1 && (
            <CRow>
              <CCol md={6} className="mb-3">
                <CFormLabel>Nombre completo</CFormLabel>
                <CFormInput
                  value={client.nombre}
                  invalid={!!errors.nombre}
                  onChange={(e) => setClient({ ...client, nombre: e.target.value })}
                />
                <CFormFeedback invalid>{errors.nombre}</CFormFeedback>
              </CCol>
              <CCol md={6} className="mb-3">
                <CFormLabel>Documento</CFormLabel>
                <CFormInput
                  value={client.documento}
                  invalid={!!errors.documento}
                  onChange={(e) => setClient({ ...client, documento: e.target.value })}
                />
                <CFormFeedback invalid>{errors.documento}</CFormFeedback>
              </CCol>
              <CCol md={6} className="mb-3">
                <CFormLabel>Teléfono</CFormLabel>
                <CFormInput
                  value={client.telefono}
                  invalid={!!errors.telefono}
                  onChange={(e) => setClient({ ...client, telefono: e.target.value })}
                />
                <CFormFeedback invalid>{errors.telefono}</CFormFeedback>
              </CCol>
              <CCol md={6} className="mb-3">
                <CFormLabel>Email</CFormLabel>
                <CFormInput
                  type="email"
                  value={client.email}
                  invalid={!!errors.email}
                  onChange={(e) => setClient({ ...client, email: e.target.value })}
                />
                <CFormFeedback invalid>{errors.email}</CFormFeedback>
              </CCol>
            </CRow>
          )}

          {step === 2 && (
            <CRow>
              <CCol md={6} className="mb-3">
                <CFormLabel>Usuario</CFormLabel>
                <CFormInput
                  value={user.username}
                  invalid={!!errors.username}
                  onChange={(e) => setUser({ ...user, username: e.target.value })}
                />
                <CFormFeedback invalid>{errors.username}</CFormFeedback>
              </CCol>
              <CCol md={6} className="mb-3">
                <CFormLabel>Contraseña</CFormLabel>
                <CFormInput
                  type="password"
                  value={user.password}
                  invalid={!!errors.password}
                  onChange={(e) => setUser({ ...user, password: e.target.value })}
                />
                <CFormFeedback invalid>{errors.password}</CFormFeedback>
              </CCol>
              <CCol md={6} className="mb-3">
                <CFormLabel>Confirmar Contraseña</CFormLabel>
                <CFormInput
                  type="password"
                  value={user.confirmPassword}
                  invalid={!!errors.confirmPassword}
                  onChange={(e) => setUser({ ...user, confirmPassword: e.target.value })}
                />
                <CFormFeedback invalid>{errors.confirmPassword}</CFormFeedback>
              </CCol>
            </CRow>
          )}
        </CForm>
      </CModalBody>
      <CModalFooter className="bg-primary">
        {step > 1 && (
          <CButton color="secondary" onClick={handlePrev}>
            Atrás
          </CButton>
        )}
        <CButton color="secondary" onClick={handleNext}>
          {step === 2 ? 'Guardar' : 'Siguiente'}
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default PacienteTimelineModal
