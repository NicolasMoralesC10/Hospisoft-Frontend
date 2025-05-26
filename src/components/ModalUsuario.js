import React, { useState } from 'react'
import {
  CButton,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormCheck,
  CFormFeedback,
  CInputGroup,
  CInputGroupText,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CProgress,
} from '@coreui/react'

// Estilo del stepper
const stepTitles = ['Información básica', 'Dirección', 'Confirmación']

const StepIndicator = ({ currentStep }) => (
  <div className="d-flex justify-content-between mb-4 px-4">
    {stepTitles.map((title, index) => (
      <div key={index} className="text-center" style={{ flex: 1 }}>
        <div
          className={`rounded-circle mx-auto mb-1 ${
            currentStep === index + 1 ? 'bg-primary' : 'bg-secondary'
          }`}
          style={{
            width: '30px',
            height: '30px',
            lineHeight: '30px',
            color: 'white',
          }}
        >
          {index + 1}
        </div>
        <small className={currentStep === index + 1 ? 'text-primary' : 'text-muted'}>{title}</small>
      </div>
    ))}
  </div>
)

const ModalUsuario = ({ user, isModalVisible, setModalVisible, handleSubmitUser }) => {
  const [formData, setFormData] = useState(user)
  const [step, setStep] = useState(1)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleNext = () => {
    if (step < 3) setStep(step + 1)
  }

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    handleSubmitUser(formData)
    setModalVisible(false)
    setStep(1)
  }

  return (
    <CModal
      backdrop="static"
      size="xl"
      visible={isModalVisible}
      onClose={() => setModalVisible(false)}
    >
      <CModalHeader>
        <CModalTitle>Crear/Actualizar Usuario</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <StepIndicator currentStep={step} />
        <CProgress value={(step / 3) * 100} className="mb-4" />
        <CForm className="row g-3 needs-validation" noValidate onSubmit={handleSubmit}>
          {/* Paso 1 */}
          {step === 1 && (
            <>
              <CCol md={4}>
                <CFormInput
                  type="email"
                  label="Email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  required
                />
              </CCol>
              <CCol md={4}>
                <CFormInput
                  type="email"
                  label="Confirmar Email"
                  name="repeatEmail"
                  value={formData.repeatEmail || ''}
                  onChange={handleChange}
                  required
                />
              </CCol>
              <CCol md={4}>
                <CFormLabel>Username</CFormLabel>
                <CInputGroup>
                  <CInputGroupText>@</CInputGroupText>
                  <CFormInput
                    type="text"
                    name="username"
                    value={formData.username || ''}
                    onChange={handleChange}
                    required
                  />
                </CInputGroup>
              </CCol>
            </>
          )}

          {/* Paso 2 */}
          {step === 2 && (
            <>
              <CCol md={6}>
                <CFormInput
                  type="text"
                  label="Ciudad"
                  name="city"
                  value={formData.city || ''}
                  onChange={handleChange}
                  required
                />
              </CCol>
              <CCol md={3}>
                <CFormSelect
                  label="Departamento"
                  name="state"
                  value={formData.state || ''}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione...</option>
                  <option value="Antioquia">Antioquia</option>
                  <option value="Cundinamarca">Cundinamarca</option>
                  <option value="Valle">Valle del Cauca</option>
                </CFormSelect>
              </CCol>
              <CCol md={3}>
                <CFormInput
                  type="text"
                  label="Código postal"
                  name="zip"
                  value={formData.zip || ''}
                  onChange={handleChange}
                  required
                />
              </CCol>
            </>
          )}

          {/* Paso 3 - Resumen */}
          {step === 3 && (
            <>
              <CCol xs={12}>
                <h6>Revisar la información:</h6>
                <ul>
                  <li>
                    <strong>Email:</strong> {formData.email}
                  </li>
                  <li>
                    <strong>Username:</strong> {formData.username}
                  </li>
                  <li>
                    <strong>Ciudad:</strong> {formData.city}
                  </li>
                  <li>
                    <strong>Departamento:</strong> {formData.state}
                  </li>
                  <li>
                    <strong>Código postal:</strong> {formData.zip}
                  </li>
                </ul>
              </CCol>
              <CCol xs={12}>
                <CFormCheck
                  type="checkbox"
                  label="Acepto los términos y condiciones"
                  name="terms"
                  checked={formData.terms || false}
                  onChange={(e) => setFormData({ ...formData, terms: e.target.checked })}
                  required
                />
                <CFormFeedback invalid>Debe aceptar antes de enviar.</CFormFeedback>
              </CCol>
            </>
          )}

          <CCol xs={12}>
            <div className="d-flex justify-content-end">
              {step > 1 && (
                <CButton
                  color="secondary"
                  onClick={handlePrevious}
                  type="button"
                  className="me-2" // margen derecho para separar botones
                >
                  Anterior
                </CButton>
              )}
              {step < 3 && (
                <CButton color="primary" onClick={handleNext} type="button">
                  Siguiente
                </CButton>
              )}
              {step === 3 && (
                <CButton color="success" type="submit">
                  Enviar
                </CButton>
              )}
            </div>
          </CCol>
        </CForm>
      </CModalBody>
    </CModal>
  )
}

export default ModalUsuario
