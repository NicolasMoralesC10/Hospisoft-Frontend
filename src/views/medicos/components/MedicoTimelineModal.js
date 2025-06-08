// src/components/MedicoTimelineModal.jsx
import React, { use, useEffect, useState } from 'react'
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
  CRow,
  CCol,
} from '@coreui/react'
import { User, Lock } from 'lucide-react'

import { apiFetch } from '../../../apiFetch.js'

const initialClient = {
  nombre: '',
  documento: '',
  telefono: '',
  especialidad: '',
}
const initialUser = {
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  rol: '',
}

const MedicoTimelineModal = ({ visible, setVisible, apiEndpoint, medico, isEdit, onSuccess }) => {
  const [step, setStep] = useState(1)
  const [client, setClient] = useState(initialClient)
  const [user, setUser] = useState(initialUser)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [roles, setRoles] = useState([])

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        /* const res = await apiFetch(`${apiEndpoint}roles/listarmedicos`)
        if (!res.ok) throw new Error('Error al cargar roles.')
        const data = await res.json() */

        const payload = await apiFetch(`${apiEndpoint}roles/listarmedicos`)
        const list = Array.isArray(payload) ? payload : payload.listarRoles || []

        if (list.length === 0) {
          throw new Error('No se encontro el rol de médico.')
        }
        setRoles(list)

        // Establece el rol SIEMPRE, no solo si no existe
        setUser((prev) => ({
          ...prev,
          rol: list[0]._id, // Setea el primer rol encontrado
        }))
      } catch (err) {
        console.error(err)
        Swal.fire('Error', 'No se pudo cargar el rol de médico.', 'error')
        setVisible(false) // Cierra el modal si no hay roles
      }
    }

    // Solo carga roles cuando el modal está visible
    if (visible) {
      fetchRoles()
    }
  }, [apiEndpoint, visible])

  useEffect(() => {
    if (!visible) {
      // Si la modal se cerró, se limpian los estados
      setClient(initialClient)
      setUser(initialUser)
      setErrors({})
      setStep(1)
    }
  }, [visible])

  useEffect(() => {
    if (medico) {
      setClient({
        nombre: medico.nombre,
        documento: medico.documento,
        telefono: medico.telefono,
        especialidad: medico.especialidad,
        email: medico.email,
        status: medico.status,
      })
      if (medico.idUsuario) {
        setUser({
          username: medico.idUsuario.username,
          email: medico.idUsuario.email,
          password: '', // Por seguridad, no mostrar la password
          confirmPassword: '',
          rol: medico.idUsuario.rol,
        })
      }
    } else {
      // Si es creación, se limpian los formularios
      setClient(initialClient)
      setUser(initialUser)
    }
    setStep(1)
  }, [medico])

  const validateClient = () => {
    const errs = {}

    if (!client.nombre || client.nombre.trim() === '') {
      errs.nombre = 'Nombre es requerido'
    } else if (client.nombre.length < 3) {
      errs.nombre = 'El nombre debe tener al menos 3 caracteres'
    }

    if (!client.documento) {
      errs.documento = 'Documento es requerido'
    } else if (client.documento < 0) {
      errs.documento = 'Debe ser un documento valido'
    } else if (client.documento.length > 0 && client.documento.length < 6) {
      errs.documento = 'El documento debe tener al menos 6 caracteres'
    }

    if (!client.telefono) {
      errs.telefono = 'Teléfono es requerido'
    } else if (client.telefono.length < 6 || client.telefono.length > 10) {
      errs.telefono = 'Debe ser un teléfono valido'
    }

    if (!client.especialidad || client.especialidad.trim() === '') {
      errs.especialidad = 'Especialidad es requerida'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const validateUser = () => {
    const errs = {}

    // Validar username y email siempre
    if (!user.username || user.username.trim() === '') {
      errs.username = 'Usuario es requerido'
    } else if (user.username.length < 3) {
      errs.username = 'El nombre de usuario debe tener al menos 3 caracteres'
    }
    if (!user.email || user.email.trim() === '') {
      errs.email = 'Email es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
      errs.email = 'Debe ser un correo válido'
    }

    if (!isEdit) {
      // En creación, password y confirmPassword son obligatorios
      if (!user.password || user.password.trim() === '') {
        errs.password = 'Contraseña es requerida'
      }
      if (user.password.length < 6) {
        errs.password = 'La contraseña debe tener al menos 6 caracteres'
      }
      if (!user.confirmPassword || user.confirmPassword.trim() === '') {
        errs.confirmPassword = 'Confirmar contraseña es requerida'
      }
      if (user.password && user.confirmPassword && user.password !== user.confirmPassword) {
        errs.confirmPassword = 'Las contraseñas no coinciden'
      }
    } else {
      // En edición, password y confirmPassword son opcionales
      // Pero si uno de los dos está lleno, ambos deben coincidir y no estar vacíos
      const passwordFilled = user.password && user.password.trim() !== ''
      const confirmFilled = user.confirmPassword && user.confirmPassword.trim() !== ''
      if (passwordFilled || confirmFilled) {
        if (!passwordFilled) {
          errs.password = 'Contraseña es requerida si desea cambiarla'
        }
        if (!confirmFilled) {
          errs.confirmPassword = 'Debe confirmar la contraseña si desea cambiarla'
        }
        if (passwordFilled && confirmFilled && user.password !== user.confirmPassword) {
          errs.confirmPassword = 'Las contraseñas no coinciden'
        }
      }
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  /* --------------------------------------------------------------- */

  const handleSubmit = async () => {
    setSubmitting(true)
    let userCreatedId = null // Para manejar el rollback si falla la creación del médico

    try {
      // 1. Crear o actualizar usuario
      const { userId, userData } = await handleUserCreation()
      userCreatedId = userId // Se guarda el ID por si necesitamos hacer rollback

      // 2. Crear o actualizar médico
      const medicoData = await handleMedicoCreation(userId)

      showSuccess()
      resetForm()
    } catch (error) {
      await handleError(error, userCreatedId)
    } finally {
      setSubmitting(false)
    }
  }

  const handleUserCreation = async () => {
    // Operador de encadenamiento opcional (?.)
    const userId = medico?.idUsuario?._id || medico?.idUsuario || null

    const userPayload = {
      // Si (isEdit === true) y userId es válido,
      // la propiedad id con el valor userId se añade al objeto. Si no, no se agrega nada.
      ...(isEdit && userId && { id: userId }),
      username: user.username,
      email: user.email,
      rol: user.rol,
      ...(user.password?.trim() && { password: user.password }),
    }

    const endpoint = isEdit && userId ? 'user/update' : 'user/create'
    const method = isEdit && userId ? 'PUT' : 'POST'

    /* const userRes = await apiFetch(`${apiEndpoint}${endpoint}`, {
      method,
      body: JSON.stringify(userPayload),
    })

    if (!userRes.ok) {
      const msg = await userRes.text()
      throw new Error(`Error al crear/actualizar el usuario: ${msg}`)
    }

    const userData = await userRes.json()

    const extractedUserId = extractUserId(userData, userId)

    if (!userData.estado) {
      throw new Error(userData.mensaje || 'Error al procesar usuario')
    }

    return { userId: extractedUserId, userData } */

    try {
      // apiFetch retorna el JSON parseado o lanza error si la respuesta no es ok
      const userData = await apiFetch(`${apiEndpoint}${endpoint}`, {
        method,
        body: JSON.stringify(userPayload),
      })

      const extractedUserId = extractUserId(userData, userId)

      if (!userData.estado) {
        throw new Error(userData.mensaje || 'Error al procesar usuario')
      }

      return { userId: extractedUserId, userData }
    } catch (error) {
      throw new Error(error.message || 'Error al crear/actualizar el usuario')
    }
  }

  const handleMedicoCreation = async (userId) => {
    const payload = {
      // Si (isEdit === true) y medico._id es válido,
      // la propiedad id con el valor medico._id se añade al objeto. Si no, no se agrega nada.
      ...(isEdit && medico?._id && { id: medico._id }),
      nombre: client.nombre,
      documento: Number(client.documento),
      telefono: Number(client.telefono),
      especialidad: client.especialidad,
      ...(!isEdit && { idUsuario: userId }),
    }

    const endpoint = isEdit && medico?._id ? 'medico/update' : 'medico/create'
    const method = isEdit && medico?._id ? 'PUT' : 'POST'

    /* const res = await apiFetch(`${apiEndpoint}${endpoint}`, {
      method,
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.message || errorData.error || 'Error al crear/actualizar médico')
    }

    const data = await res.json()
    if (!data.estado) {
      throw new Error(data.mensaje || 'Error al procesar médico')
    }

    return data */

    try {
      // apiFetch ya retorna el JSON parseado o lanza error si no es ok
      const data = await apiFetch(`${apiEndpoint}${endpoint}`, {
        method,
        body: JSON.stringify(payload),
      })

      if (!data.estado) {
        throw new Error(data.mensaje || 'Error al procesar médico')
      }

      return data
    } catch (error) {
      // Puedes manejar o relanzar el error para que lo capture quien llame a esta función
      throw new Error(error.message || 'Error al crear/actualizar médico')
    }
  }

  const handleError = async (error, userId) => {
    console.error('Error completo:', error)

    // Si hay un usuario creado pero falló al crear el médico, se hace el rollback
    if (userId && !isEdit) {
      try {
        await apiFetch(`${apiEndpoint}user/delete`, {
          method: 'DELETE',
          body: JSON.stringify({ id: userId }),
        })
      } catch (rollbackError) {
        console.error('Error en rollback:', rollbackError)
      }
    }

    const errorMessage = error.message || '¡Error desconocido!'
    Swal.fire('Error', errorMessage, 'error')

    // Mostrar error
    if (errorMessage.toLowerCase().includes('usuario')) {
      setStep(1)
    } else if (
      errorMessage.toLowerCase().includes('médico') ||
      errorMessage.toLowerCase().includes('medico')
    ) {
      setStep(2)
    }
  }

  const extractUserId = (userData, fallbackId) => {
    return (
      userData.data?._id ||
      userData._id ||
      userData.id ||
      (userData.usuario && userData.usuario._id) ||
      fallbackId
    )
  }

  const showSuccess = () => {
    Swal.fire(
      'Éxito',
      `Información ${isEdit ? 'actualizada' : 'registrada'} correctamente`,
      'success',
    )
    onSuccess()
  }

  const resetForm = () => {
    setVisible(false)
    setStep(1)
    setClient(initialClient)
    setUser(initialUser)
    setErrors({})
  }

  /* --------------------------------------------------------------- */

  /*  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      let userId = medico?.idUsuario?._id || medico?.idUsuario || null

      // 1. Crear o actualizar usuario
      let userRes
      if (isEdit && userId) {
        // Actualizar usuario (PUT)
        const userPayload = {
          id: userId,
          username: user.username,
          email: user.email,
          rol: user.rol,
        }
        // Solo incluir password si no está vacío ni es solo espacios
        if (user.password && user.password.trim() !== '') {
          userPayload.password = user.password
        }
        userRes = await apiFetch(`${apiEndpoint}user/update`, {
          method: 'PUT',
          body: JSON.stringify(userPayload),
        })
      } else {
        // Crear usuario (POST)
        userRes = await apiFetch(`${apiEndpoint}user/create`, {
          method: 'POST',
          body: JSON.stringify({
            username: user.username,
            email: user.email,
            password: user.password,
            rol: user.rol,
          }),
        })
      }

      if (!userRes.ok) {
        const msg = await userRes.text()
        throw new Error(`Error al crear/actualizar el usuario: ${msg}`)
      }

      const userData = await userRes.json()
      console.log(userData)
      const idUsuario =
        userData.data?._id ||
        userData.id ||
        userData._id ||
        (userData.usuario && userData.usuario?._id) ||
        userId

      if (!userData.estado) {
        throw new Error(`${userData.mensaje}`)
      } else if (!idUsuario) {
        throw new Error('No se obtuvo el idUsuario del medico.' + idUsuario)
      }

      // 2. Crear o actualizar medico
      let clientRes
      if (isEdit && medico?._id) {
        // Actualizar medico (PUT)
        const clientPayload = {
          id: medico._id,
          nombre: client.nombre,
          documento: Number(client.documento),
          telefono: Number(client.telefono),
          especialidad: client.especialidad,
        }
        clientRes = await apiFetch(`${apiEndpoint}medico/update`, {
          method: 'PUT',
          body: JSON.stringify(clientPayload),
        })
      } else {
        // Crear medico (POST)
        const clientPayload = {
          nombre: client.nombre,
          documento: Number(client.documento),
          telefono: Number(client.telefono),
          especialidad: client.especialidad,
          idUsuario,
        }
        clientRes = await apiFetch(`${apiEndpoint}medico/create`, {
          method: 'POST',
          body: JSON.stringify(clientPayload),
        })
      }

      if (!clientRes.ok) {
        const msg = await clientRes.text()
        throw new Error(`Error al crear/actualizar el medico: ${msg}`)
      }

      const clientData = await clientRes.json()
      console.log(clientData)

      if (!clientData.estado) {
        throw new Error(`${clientData.mensaje}`)
      }

      Swal.fire(
        'Éxito',
        `Información ${isEdit ? 'actualizada' : 'registrada'} correctamente`,
        'success',
      )
      onSuccess()
      setVisible(false)
      setStep(1)
      setClient(initialClient)
      setUser(initialUser)
      setErrors({})
    } catch (error) {
      const mensaje = error.message || '¡Error desconocido!'
      Swal.fire('Error', mensaje, 'error')

      if (mensaje.includes('usuario')) {
        setStep(1)
      } else if (mensaje.includes('medico')) {
        setStep(2)
      }
    } finally {
      setSubmitting(false)
    }
  } */

  const handleNext = () => {
    if (step === 1 && validateClient()) setStep(2)
    else if (step === 2 && validateUser()) handleSubmit()
  }

  const handlePrev = () => setStep((s) => Math.max(1, s - 1))

  return (
    <CModal visible={visible} onClose={() => setVisible(false)} size="lg">
      <CModalHeader className="bg-primary text-light">
        <CModalTitle>{step === 1 ? 'Registrar Medico' : 'Crear Usuario'}</CModalTitle>
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
          <div
            className="d-flex flex-column align-items-center"
            style={{ width: '48px', marginLeft: '21.5%' }}
          >
            <small className={`${step >= 1 ? 'text-primary' : 'text-muted'}`}>Medico</small>
          </div>

          <div
            className="d-flex flex-column align-items-center"
            style={{ width: '48px', marginRight: '21.5%' }}
          >
            <small className={`${step >= 2 ? 'text-primary' : 'text-muted'}`}>Usuario</small>
          </div>
        </div>

        <CForm className="px-4">
          {step === 1 && (
            <CRow>
              <CCol md={6} className="mb-3">
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
              <CCol md={6} className="mb-3">
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
              <CCol md={6} className="mb-3">
                <CFormLabel>Teléfono</CFormLabel>
                <CFormInput
                  type="number"
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
              <CCol md={6} className="mb-3">
                <CFormLabel>Especialidad</CFormLabel>
                <CFormInput
                  type="text"
                  value={client.especialidad}
                  invalid={!!errors.especialidad}
                  valid={!errors.especialidad && client.especialidad}
                  onChange={(e) => setClient({ ...client, especialidad: e.target.value })}
                />
                {errors.especialidad ? (
                  <CFormFeedback invalid>{errors.especialidad}</CFormFeedback>
                ) : (
                  <CFormFeedback valid>Correcto</CFormFeedback>
                )}
              </CCol>
            </CRow>
          )}

          {step === 2 && (
            <CRow>
              <CCol md={6} className="mb-3">
                <CFormLabel>Usuario</CFormLabel>
                <CFormInput
                  type="text"
                  value={user.username}
                  invalid={!!errors.username}
                  valid={!errors.username && user.username}
                  onChange={(e) => setUser({ ...user, username: e.target.value })}
                />
                {errors.username ? (
                  <CFormFeedback invalid>{errors.username}</CFormFeedback>
                ) : (
                  <CFormFeedback valid>Correcto</CFormFeedback>
                )}
              </CCol>
              <CCol md={6} className="mb-3">
                <CFormLabel>Email</CFormLabel>
                <CFormInput
                  type="email"
                  value={user.email}
                  invalid={!!errors.email}
                  valid={!errors.email && user.email}
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
                />
                {errors.email ? (
                  <CFormFeedback invalid>{errors.email}</CFormFeedback>
                ) : (
                  <CFormFeedback valid>Correcto</CFormFeedback>
                )}
              </CCol>
              <CCol md={6} className="mb-3">
                <CFormLabel>Contraseña</CFormLabel>
                <CFormInput
                  type="password"
                  value={user.password}
                  invalid={!!errors.password}
                  valid={!errors.password && user.password}
                  onChange={(e) => setUser({ ...user, password: e.target.value })}
                />
                {errors.password ? (
                  <CFormFeedback invalid>{errors.password}</CFormFeedback>
                ) : (
                  <CFormFeedback valid>Correcto</CFormFeedback>
                )}
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
                {errors.confirmPassword ? (
                  <CFormFeedback invalid>{errors.confirmPassword}</CFormFeedback>
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

export default MedicoTimelineModal
