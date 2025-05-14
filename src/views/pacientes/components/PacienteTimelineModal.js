// src/components/PacienteTimelineModal.jsx
import React, { useState } from 'react'
import { useEffect } from 'react'
import Swal from 'sweetalert2'
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
  CInputGroup,
  CInputGroupText,
  CFormSelect,
  CRow,
  CCol,
} from '@coreui/react'
import { User, Lock, Drill } from 'lucide-react'

const initialClient = {
  nombre: '',
  documento: '',
  telefono: '',
  nacimiento: '',
  eps: '',
  estadoCivil: '',
  sexo: '',
  direccion: '',
}
const initialUser = {
  nombreUsuario: '',
  emailUser: '',
  passwordUser: '',
  confirmPassword: '',
  rol: '',
}

const PacienteTimelineModal = ({ visible, setVisible, apiEndpoint }) => {
  const [step, setStep] = useState(1)
  const [client, setClient] = useState(initialClient)
  const [user, setUser] = useState(initialUser)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [roles, setRoles] = useState([])

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await fetch(`${apiEndpoint}roles/listarpacientes`)
        if (!res.ok) throw new Error('Error al cargar roles')
        const data = await res.json()
        const list = Array.isArray(data) ? data : data.listarRoles || []
        setRoles(list)

        if (list.length > 0) {
          setUser((prev) => ({
            ...prev,
            rol: list[0]._id,
          }))
        }
      } catch (err) {
        console.error(err)
      }
    }
    fetchRoles()
  }, [apiEndpoint])

  const validateUser = () => {
    const errs = {}
    if (!user.nombreUsuario) errs.nombreUsuario = 'Usuario es requerido'
    if (!user.emailUser) {
      errs.emailUser = 'Email es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.emailUser)) {
      errs.emailUser = 'Debe ser un correo válido'
    }
    if (!user.passwordUser) {
      errs.passwordUser = 'Contraseña es requerida'
    } else if (user.passwordUser.length < 7) {
      errs.passwordUser = 'La contraseña debe tener al menos 7 caracteres'
    } 

    if (!user.confirmPassword) errs.confirmPassword = 'Confirmar contraseña es requerida'
    else if (user.passwordUser !== user.confirmPassword)
      errs.confirmPassword = 'Las contraseñas no coinciden'
    if (!user.rol) errs.rol = 'Rol es requerido'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const validateClient = () => {
    const errs = {}
    if (!client.nombre) errs.nombre = 'Nombre es requerido'
    if (!client.documento) errs.documento = 'Documento es requerido'
    if (!client.telefono) errs.telefono = 'Teléfono es requerido'
    if (!client.nacimiento) errs.nacimiento = 'Fecha de nacimiento es requerida'
    if (!client.eps) errs.eps = 'EPS es requerido'
    if (!client.estadoCivil) errs.estadoCivil = 'Estado civil es requerido'
    if (!client.sexo) errs.sexo = 'Sexo es requerido'
    if (!client.direccion) errs.direccion = 'Dirección es requerida'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const userRes = await fetch(`${apiEndpoint}user/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombreUsuario: user.nombreUsuario,
          emailUser: user.emailUser,
          passwordUser: user.passwordUser,
          rol: user.rol,
        }),
      })

      if (!userRes.ok) {
        const msg = await userRes.text()
        throw new Error(`Error al crear usuario: ${msg}`)
      }

      const userData = await userRes.json()
      const idUsuario = userData._id || userData.id || (userData.data && userData.data._id)
      if (!idUsuario) throw new Error('No se obtuvo idUsuario del servicio')

      const clientPayload = { ...client, idUsuario }
      const clientRes = await fetch(`${apiEndpoint}patient/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientPayload),
      })

      if (!clientRes.ok) {
        const msg = await clientRes.text()
        throw new Error(`Error al crear paciente: ${msg}`)
      }

      await clientRes.json()

      Swal.fire('Éxito', 'Usuario y paciente creados correctamente', 'success')
      setVisible(false)
      setStep(1)
      setClient(initialClient)
      setUser(initialUser)
      setErrors({})
    } catch (error) {
      const mensaje = error.message || 'Error desconocido'
      Swal.fire('Error', mensaje, 'error')

      if (mensaje.includes('usuario')) {
        setStep(1)
      } else if (mensaje.includes('paciente')) {
        setStep(2)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleNext = () => {
    if (step === 1 && validateUser()) setStep(2)
    else if (step === 2 && validateClient()) handleSubmit()
  }

  const handlePrev = () => setStep((s) => Math.max(1, s - 1))

  return (
    <CModal visible={visible} onClose={() => setVisible(false)} size="xl">
      <CModalHeader className="bg-primary text-light">
        <CModalTitle>{step === 1 ? 'Crear Usuario' : 'Registrar Paciente'}</CModalTitle>
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
              <Lock size={24} />
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
              <User size={24} />
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
          <div
            className="d-flex flex-column align-items-center"
            style={{ width: '48px', marginLeft: '22.7%' }}
          >
            <small className={`${step >= 1 ? 'text-primary' : 'text-muted'}`}>Usuario</small>
          </div>

          <div
            className="d-flex flex-column align-items-center"
            style={{ width: '48px', marginRight: '22.7%' }}
          >
            <small className={`${step >= 2 ? 'text-primary' : 'text-muted'}`}>Paciente</small>
          </div>
        </div>

        <CForm className="px-4">
          {step === 1 && (
            <CRow>
              <CCol md={5} className="mb-3">
                <CFormLabel htmlFor="validationServerUsername">Usuario</CFormLabel>
                <CInputGroup className="has-validation">
                  <CInputGroupText id="inputGroupPrepend03">@</CInputGroupText>
                  <CFormInput
                    type="text"
                    value={user.nombreUsuario}
                    id="validationServerUsername"
                    invalid={!!errors.nombreUsuario}
                    aria-describedby="inputGroupPrepend03"
                    valid={!errors.nombreUsuario && user.nombreUsuario}
                    onChange={(e) => setUser({ ...user, nombreUsuario: e.target.value })}
                  />
                </CInputGroup>
                <CFormFeedback invalid>{errors.nombreUsuario}</CFormFeedback>
              </CCol>
              <CCol md={7} className="mb-3">
                <CFormLabel>Email</CFormLabel>
                <CFormInput
                  type="email"
                  value={user.emailUser}
                  invalid={!!errors.emailUser}
                  valid={!errors.emailUser && user.emailUser}
                  onChange={(e) => setUser({ ...user, emailUser: e.target.value })}
                />
                <CFormFeedback invalid>{errors.emailUser}</CFormFeedback>
              </CCol>
              <CCol md={6} className="mb-3">
                <CFormLabel>Contraseña</CFormLabel>
                <CFormInput
                  type="password"
                  value={user.passwordUser}
                  invalid={!!errors.passwordUser}
                  valid={!errors.passwordUser && user.passwordUser}
                  onChange={(e) => setUser({ ...user, passwordUser: e.target.value })}
                />
                <CFormFeedback invalid>{errors.passwordUser}</CFormFeedback>
              </CCol>
              <CCol md={6} className="mb-3">
                <CFormLabel>Confirmar Contraseña</CFormLabel>
                <CFormInput
                  type="password"
                  value={user.confirmPassword}
                  invalid={!!errors.confirmPassword}
                  valid={!errors.confirmPassword && user.confirmPassword}
                  onChange={(e) => setUser({ ...user, confirmPassword: e.target.value })}
                />
                <CFormFeedback invalid>{errors.confirmPassword}</CFormFeedback>
              </CCol>
            </CRow>
          )}

          {step === 2 && (
            <CRow>
              <CCol md={4} className="mb-3">
                <CFormLabel>Nombre completo</CFormLabel>
                <CFormInput
                  type="text"
                  value={client.nombre}
                  invalid={!!errors.nombre}
                  valid={!errors.nombre && client.nombre}
                  onChange={(e) => setClient({ ...client, nombre: e.target.value })}
                />
                {errors.nombre ? (
                  <CFormFeedback invalid>{errors.nombre}</CFormFeedback>
                ) : (
                  <CFormFeedback valid>Correcto</CFormFeedback>
                )}
              </CCol>
              <CCol md={4} className="mb-3">
                <CFormLabel>Documento</CFormLabel>
                <CFormInput
                  type="number"
                  value={client.documento}
                  invalid={!!errors.documento}
                  valid={!errors.documento && client.documento}
                  onChange={(e) => setClient({ ...client, documento: e.target.value })}
                />
                {errors.documento ? (
                  <CFormFeedback invalid>{errors.documento}</CFormFeedback>
                ) : (
                  <CFormFeedback valid>Correcto</CFormFeedback>
                )}
              </CCol>
              <CCol md={4} className="mb-3">
                <CFormLabel>Teléfono</CFormLabel>
                <CFormInput
                  value={client.telefono}
                  invalid={!!errors.telefono}
                  valid={!errors.telefono && client.telefono}
                  onChange={(e) => setClient({ ...client, telefono: e.target.value })}
                />
                {errors.telefono ? (
                  <CFormFeedback invalid>{errors.telefono}</CFormFeedback>
                ) : (
                  <CFormFeedback valid>Correcto</CFormFeedback>
                )}
              </CCol>
              <CCol md={5} className="mb-3">
                <CFormLabel>Fecha de Nacimiento</CFormLabel>
                <CFormInput
                  type="date"
                  value={client.nacimiento}
                  invalid={!!errors.nacimiento}
                  valid={!errors.nacimiento && client.nacimiento}
                  onChange={(e) => setClient({ ...client, nacimiento: e.target.value })}
                />
                {errors.nacimiento ? (
                  <CFormFeedback invalid>{errors.nacimiento}</CFormFeedback>
                ) : (
                  <CFormFeedback valid>Correcto</CFormFeedback>
                )}
              </CCol>
              <CCol md={3} className="mb-3">
                <CFormLabel>EPS</CFormLabel>
                <CFormInput
                  value={client.eps}
                  invalid={!!errors.eps}
                  valid={!errors.eps && client.eps}
                  onChange={(e) => setClient({ ...client, eps: e.target.value })}
                />
                {errors.eps ? (
                  <CFormFeedback invalid>{errors.eps}</CFormFeedback>
                ) : (
                  <CFormFeedback valid>Correcto</CFormFeedback>
                )}
              </CCol>
              <CCol md={4} className="mb-3">
                <CFormLabel>Estado Civil</CFormLabel>
                <CFormSelect
                  value={client.estadoCivil}
                  invalid={!!errors.estadoCivil}
                  valid={!errors.estadoCivil && client.estadoCivil}
                  onChange={(e) => setClient({ ...client, estadoCivil: e.target.value })}
                >
                  <option value="" disabled>
                    Seleccione...
                  </option>
                  <option value="soltero">Soltero</option>
                  <option value="casado">Casado</option>
                  <option value="viudo">Viudo</option>
                </CFormSelect>
                {errors.estadoCivil ? (
                  <CFormFeedback invalid>{errors.estadoCivil}</CFormFeedback>
                ) : (
                  <CFormFeedback valid>Correcto</CFormFeedback>
                )}
              </CCol>

              <CCol xs={7} className="mb-3">
                <CFormLabel>Dirección</CFormLabel>
                <CFormInput
                  value={client.direccion}
                  invalid={!!errors.direccion}
                  valid={!errors.direccion && client.direccion}
                  onChange={(e) => setClient({ ...client, direccion: e.target.value })}
                />
                {errors.direccion ? (
                  <CFormFeedback invalid>{errors.direccion}</CFormFeedback>
                ) : (
                  <CFormFeedback valid>Correcto</CFormFeedback>
                )}
              </CCol>
              <CCol md={5} className="mb-3">
                <CFormLabel>Sexo</CFormLabel>
                <CFormSelect
                  value={client.sexo}
                  invalid={!!errors.sexo}
                  valid={!errors.sexo && client.sexo}
                  onChange={(e) => setClient({ ...client, sexo: e.target.value })}
                >
                  <option value="" disabled>
                    Seleccione...
                  </option>
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                  <option value="otro">Otro</option>
                </CFormSelect>
                {errors.sexo ? (
                  <CFormFeedback invalid>{errors.sexo}</CFormFeedback>
                ) : (
                  <CFormFeedback valid>Correcto</CFormFeedback>
                )}
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

        <CButton color="secondary" onClick={handleNext} disabled={submitting}>
          {submitting ? 'Procesando...' : step === 2 ? 'Guardar' : 'Siguiente'}
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default PacienteTimelineModal
