import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import { useAuth } from '../../../context/AuthContext'
import { apiFetch } from '../../../helpers/apiFetch.js'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const data = await apiFetch('https://185.254.206.90:4080/api/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })

      login(data.token, data.user, data.rol)
      switch (data.rol) {
        case 'superuser':
          navigate('/dashboard')
          break
        case 'admin':
          navigate('/dashboard')
          break
        case 'secretaria':
          navigate('/citas')
          break
        case 'medico':
          navigate('/citas')
          break
        case 'paciente':
          navigate('/citas')
          break
        case 'dispensario':
          navigate('/medicamentos')
          break
        default:
          break
      }
    } catch (err) {
      if (err.message === 'Bad Request') {
        setError('Correo electronico no valido')
      } else {
        setError(err.message || 'Error de conexión')
      }
    }
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm onSubmit={handleSubmit}>
                    <h1>Iniciar sesión</h1>
                    <p className="text-body-secondary">Ingrese a su cuenta</p>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        placeholder="Correo electrónico"
                        autoComplete="username"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </CInputGroup>
                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Contraseña"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </CInputGroup>
                    <CRow>
                      <CCol xs={6}>
                        <CButton color="primary" className="px-4" type="submit">
                          Iniciar sesión
                        </CButton>
                      </CCol>
                      <CCol xs={6} className="text-right">
                        <CButton color="link" className="px-0">
                          ¿Olvidó su contraseña?
                        </CButton>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
              <CCard className="text-white bg-primary py-5" style={{ width: '44%' }}>
                <CCardBody className="text-center d-flex flex-column justify-content-center h-100">
                  <h2>Bienvenido a Hospisoft</h2>
                  <p>
                    Accede con tus credenciales para administrar pacientes, médicos, citas y más.
                  </p>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
