import React, { useState, useEffect, useCallback } from 'react'
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
  CFormTextarea,
  CFormSelect,
  CFormFeedback,
  CRow,
  CCol,
  CSpinner,
  CCard,
  CCardBody,
  CCardHeader,
  CInputGroup,
  CInputGroupText,
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilTrash, cilSearch } from '@coreui/icons'
import {
  FileText,
  User,
  Calendar,
  Stethoscope,
  Heart,
  Pill,
  AlertTriangle,
  Activity,
  ClipboardList,
} from 'lucide-react'
import Flatpickr from 'react-flatpickr'
import 'flatpickr/dist/flatpickr.css'
import 'flatpickr/dist/themes/material_blue.css'
import { Spanish } from 'flatpickr/dist/l10n/es.js'
import { apiFetch } from '../../../helpers/apiFetch.js'

// Configuración de pasos
const STEPS = {
  BASIC_INFO: 1,
  CLINICAL_EXAM: 2,
  MEDICATION: 3,
  TOTAL: 3,
}

// Valores iniciales
const INITIAL_VALUES = {
  fecha: '',
  medicoId: '',
  pacienteId: '',
  motivoConsulta: '',
  diagPrincipal: '',
  diagSecundario: '',
  historia: '',
  examenFisico: [
    {
      presionArterial: '',
      frecuenciaCardiaca: '',
      frecuenciaRespiratoria: '',
      temperatura: '',
      observaciones: '',
    },
  ],
  evoClinica: '',
  medicamentos: [
    {
      _id: '', // Agregado el _id requerido
      nombre: '',
      dosis: '',
      frecuencia: '',
      duracion: '',
      codigo: '',
    },
  ],
  prioridad: 'Media',
}

// Configuración de campos por paso
const STEP_FIELDS = {
  [STEPS.BASIC_INFO]: [
    {
      label: 'Fecha de Consulta',
      key: 'fecha',
      type: 'date',
      icon: Calendar,
      required: true,
      colSize: 6,
    },
    {
      label: 'Médico Responsable',
      key: 'medicoId',
      type: 'select-medico',
      placeholder: 'Seleccione un médico',
      icon: User,
      required: true,
      colSize: 6,
    },
    {
      label: 'Paciente',
      key: 'pacienteId',
      type: 'select-paciente',
      placeholder: 'Seleccione un paciente',
      icon: User,
      required: true,
      colSize: 6,
    },
    {
      label: 'Prioridad',
      key: 'prioridad',
      type: 'select',
      options: ['Alta', 'Media', 'Baja'],
      icon: AlertTriangle,
      required: true,
      colSize: 6,
    },
    {
      label: 'Motivo de Consulta',
      key: 'motivoConsulta',
      type: 'textarea',
      placeholder: 'Describa el motivo de la consulta...',
      icon: FileText,
      required: true,
      colSize: 12,
    },
    {
      label: 'Diagnóstico Principal',
      key: 'diagPrincipal',
      type: 'textarea',
      placeholder: 'Diagnóstico principal del paciente...',
      icon: Stethoscope,
      required: true,
      colSize: 6,
    },
    {
      label: 'Diagnósticos Secundarios',
      key: 'diagSecundario',
      type: 'textarea',
      placeholder: 'Diagnósticos secundarios (separados por comas)...',
      icon: ClipboardList,
      required: true,
      colSize: 6,
    },
    {
      label: 'Historia Clínica',
      key: 'historia',
      type: 'textarea',
      placeholder: 'Historia clínica detallada del paciente...',
      icon: FileText,
      required: true,
      colSize: 12,
    },
  ],
}

// Validaciones
const validateField = (key, value, allValues = {}) => {
  const rules = {
    fecha: {
      required: 'La fecha es requerida',
    },
    medicoId: {
      required: 'El médico es requerido',
    },
    pacienteId: {
      required: 'El paciente es requerido',
    },
    motivoConsulta: {
      required: 'El motivo de consulta es requerido',
      minLength: { value: 10, message: 'Mínimo 10 caracteres' },
    },
    diagPrincipal: {
      required: 'El diagnóstico principal es requerido',
      minLength: { value: 5, message: 'Mínimo 5 caracteres' },
    },
    diagSecundario: {
      required: 'Los diagnósticos secundarios son requeridos',
      minLength: { value: 3, message: 'Mínimo 3 caracteres' },
    },
    historia: {
      required: 'La historia clínica es requerida',
      minLength: { value: 20, message: 'Mínimo 20 caracteres' },
    },
    evoClinica: {
      required: 'La evolución clínica es requerida',
      minLength: { value: 10, message: 'Mínimo 10 caracteres' },
    },
    prioridad: {
      required: 'La prioridad es requerida',
    },
  }

  const fieldRules = rules[key]
  if (!fieldRules) return null

  const strValue = String(value).trim()

  // Required
  if (fieldRules.required && !strValue) {
    return fieldRules.required
  }

  if (!strValue) return null

  // Min length
  if (fieldRules.minLength && strValue.length < fieldRules.minLength.value) {
    return fieldRules.minLength.message
  }

  return null
}

// Estilos
const styles = {
  fieldContainer: {
    position: 'relative',
  },
  fieldIcon: {
    position: 'absolute',
    left: '12px',
    top: '12px',
    color: '#6c757d',
    zIndex: 2,
    pointerEvents: 'none',
  },
  fieldInput: {
    paddingLeft: '40px',
  },
  priorityBadge: {
    Alta: 'danger',
    Media: 'warning',
    Baja: 'success',
  },
}

const DiagnosticTimelineModal = ({ visible, setVisible, mode, apiEndpoint, data, onSuccess }) => {
  const [step, setStep] = useState(STEPS.BASIC_INFO)
  const [form, setForm] = useState(INITIAL_VALUES)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  // Estados para medicamentos
  const [medicamentosDisponibles, setMedicamentosDisponibles] = useState([])
  const [loadingMedicamentos, setLoadingMedicamentos] = useState(false)
  const [searchMedicamento, setSearchMedicamento] = useState({})

  // Estados para médicos y pacientes
  const [medicosDisponibles, setMedicosDisponibles] = useState([])
  const [pacientesDisponibles, setPacientesDisponibles] = useState([])
  const [loadingMedicos, setLoadingMedicos] = useState(false)
  const [loadingPacientes, setLoadingPacientes] = useState(false)

  // Cargar medicamentos disponibles
  const loadMedicamentos = useCallback(async () => {
    setLoadingMedicamentos(true)
    try {
      // Verifica que la URL sea correcta - ajusta según tu configuración
      const baseUrl = 'https://185.254.206.90:4080'
      const fullUrl = `${baseUrl}/api/medicaments/list`

      console.log('Cargando medicamentos desde:', fullUrl) // Para debugging

      const response = await apiFetch(`${fullUrl}`, {
        method: 'GET',
      })

      console.log('Respuesta completa:', response) // Para debugging

      // Corregir la estructura de la respuesta
      if (response && response.estado === true && Array.isArray(response.data)) {
        setMedicamentosDisponibles(response.data)
        console.log('Medicamentos cargados exitosamente:', response.data.length, 'medicamentos')
      } else if (response && Array.isArray(response)) {
        // Por si la respuesta viene directamente como array
        setMedicamentosDisponibles(response)
        console.log('Medicamentos cargados como array directo:', response.length, 'medicamentos')
      } else {
        console.warn('Estructura de respuesta inesperada:', response)
        setMedicamentosDisponibles([])
      }
    } catch (error) {
      console.error('Error completo loading medications:', error)
      setMedicamentosDisponibles([])

      // Mostrar error más específico
      let errorMessage = 'No se pudieron cargar los medicamentos disponibles'
      if (error.message.includes('HTML')) {
        errorMessage =
          'Error en el endpoint de medicamentos. Verifica la configuración del servidor.'
      }

      Swal.fire({
        title: 'Error de Conexión',
        text: errorMessage,
        icon: 'error',
        confirmButtonColor: '#0d6efd',
        footer: 'Revisa la consola para más detalles',
      })
    } finally {
      setLoadingMedicamentos(false)
    }
  }, [])

  // Cargar médicos disponibles
  const loadMedicos = useCallback(async () => {
    setLoadingMedicos(true)
    try {
      const baseUrl = 'https://185.254.206.90:4080'
      const response = await apiFetch(`${baseUrl}/api/medico/list`, {
        method: 'GET',
      })

      if (response && response.estado === true && Array.isArray(response.data)) {
        setMedicosDisponibles(response.data)
        console.log('Médicos cargados exitosamente:', response.data.length, 'médicos')
      } else if (response && Array.isArray(response)) {
        setMedicosDisponibles(response)
        console.log('Médicos cargados como array directo:', response.length, 'médicos')
      } else {
        setMedicosDisponibles([])
      }
    } catch (error) {
      console.error('Error loading medicos:', error)
      setMedicosDisponibles([])
      Swal.fire({
        title: 'Error',
        text: 'No se pudieron cargar los médicos disponibles',
        icon: 'error',
        confirmButtonColor: '#0d6efd',
      })
    } finally {
      setLoadingMedicos(false)
    }
  }, [])

  // Cargar pacientes disponibles
  const loadPacientes = useCallback(async () => {
    setLoadingPacientes(true)
    try {
      const baseUrl = 'https://185.254.206.90:4080'
      const response = await apiFetch(`${baseUrl}/api/patient/list`, {
        method: 'GET',
      })

      if (response && response.estado === true && Array.isArray(response.data)) {
        setPacientesDisponibles(response.data)
        console.log('Pacientes cargados exitosamente:', response.data.length, 'pacientes')
      } else if (response && Array.isArray(response)) {
        setPacientesDisponibles(response)
        console.log('Pacientes cargados como array directo:', response.length, 'pacientes')
      } else {
        setPacientesDisponibles([])
      }
    } catch (error) {
      console.error('Error loading pacientes:', error)
      setPacientesDisponibles([])
      Swal.fire({
        title: 'Error',
        text: 'No se pudieron cargar los pacientes disponibles',
        icon: 'error',
        confirmButtonColor: '#0d6efd',
      })
    } finally {
      setLoadingPacientes(false)
    }
  }, [])

  // Resetear estado al abrir/cerrar modal
  useEffect(() => {
    if (!visible) {
      setStep(STEPS.BASIC_INFO)
      setErrors({})
      setForm(INITIAL_VALUES)
      setSearchMedicamento({})
      return
    }

    // Cargar todos los datos cuando se abre el modal
    const initializeModal = async () => {
      await Promise.all([loadMedicamentos(), loadMedicos(), loadPacientes()])

      // Solo después de cargar los datos, cargar los datos de edición
      if (mode === 'edit' && data) {
        loadEditData()
      }
    }

    initializeModal()
  }, [visible, mode, data, loadMedicamentos, loadMedicos, loadPacientes])

  // Cargar datos para edición
  const loadEditData = useCallback(async () => {
    try {
      setForm({
        fecha: data.fecha?.split('T')[0] || '',
        medicoId: data.medicoId || '',
        pacienteId: data.pacienteId || '',
        motivoConsulta: data.motivoConsulta || '',
        diagPrincipal: data.diagPrincipal || '',
        diagSecundario: data.diagSecundario || '',
        historia: data.historia || '',
        examenFisico:
          data.examenFisico?.length > 0 ? data.examenFisico : INITIAL_VALUES.examenFisico,
        evoClinica: data.evoClinica || '',
        medicamentos:
          data.medicamentos?.length > 0 ? data.medicamentos : INITIAL_VALUES.medicamentos,
        prioridad: data.prioridad || 'Media',
      })
    } catch (error) {
      console.error('Error loading edit data:', error)
    }
  }, [data]) 

  // Validar paso actual
  const validateCurrentStep = useCallback(() => {
    const newErrors = {}

    if (step === STEPS.BASIC_INFO) {
      const stepFields = STEP_FIELDS[step] || []
      stepFields.forEach((field) => {
        const error = validateField(field.key, form[field.key], form)
        if (error) {
          newErrors[field.key] = error
        }
      })
    } else if (step === STEPS.CLINICAL_EXAM) {
      // Validar examen físico
      form.examenFisico.forEach((examen, index) => {
        if (
          !examen.presionArterial ||
          !examen.frecuenciaCardiaca ||
          !examen.frecuenciaRespiratoria ||
          !examen.temperatura
        ) {
          newErrors[`examenFisico_${index}`] = 'Todos los campos del examen físico son requeridos'
        }
      })

      // Validar evolución clínica
      const evoError = validateField('evoClinica', form.evoClinica, form)
      if (evoError) {
        newErrors.evoClinica = evoError
      }
    } else if (step === STEPS.MEDICATION) {
      // Validar medicamentos
      form.medicamentos.forEach((med, index) => {
        if (!med._id || !med.nombre || !med.dosis || !med.frecuencia || !med.duracion) {
          newErrors[`medicamento_${index}`] =
            'Debe seleccionar un medicamento y completar todos los campos'
        }
      })
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [step, form])

  // Manejar cambio de campo
  const handleFieldChange = useCallback(
    (key, value) => {
      setForm((prev) => ({ ...prev, [key]: value }))

      // Limpiar error del campo
      if (errors[key]) {
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors[key]
          return newErrors
        })
      }
    },
    [errors],
  )

  // Renderizar campo básico
  const renderField = (field) => {
    const Icon = field.icon
    const error = errors[field.key]
    const value = form[field.key]

    return (
      <CCol md={field.colSize} key={field.key} className="mb-3">
        <div style={styles.fieldContainer}>
          <CFormLabel className="fw-semibold">
            {field.label}
            {field.required && <span className="text-danger ms-1">*</span>}
          </CFormLabel>
          <div className="position-relative">
            <Icon size={16} style={styles.fieldIcon} />
            {field.type === 'textarea' ? (
              <CFormTextarea
                value={value}
                placeholder={field.placeholder}
                invalid={!!error}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                style={styles.fieldInput}
                rows={3}
              />
            ) : field.type === 'select' ? (
              <CFormSelect
                value={value}
                invalid={!!error}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                style={styles.fieldInput}
              >
                {field.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </CFormSelect>
            ) : field.type === 'select-medico' ? (
              <CFormSelect
                value={value}
                invalid={!!error}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                style={styles.fieldInput}
                disabled={loadingMedicos}
              >
                <option value="">
                  {loadingMedicos ? 'Cargando médicos...' : 'Seleccione un médico'}
                </option>
                {medicosDisponibles.map((medico) => (
                  <option key={medico._id} value={medico._id}>
                    {medico.nombre} {medico.apellido} - {medico.especialidad || 'General'}
                  </option>
                ))}
              </CFormSelect>
            ) : field.type === 'select-paciente' ? (
              <CFormSelect
                value={value}
                invalid={!!error}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                style={styles.fieldInput}
                disabled={loadingPacientes}
              >
                <option value="">
                  {loadingPacientes ? 'Cargando pacientes...' : 'Seleccione un paciente'}
                </option>
                {pacientesDisponibles.map((paciente) => (
                  <option key={paciente._id} value={paciente._id}>
                    {paciente.nombrePaciente} - {paciente.documento || paciente.cedula}
                  </option>
                ))}
              </CFormSelect>
            ) : field.type === 'date' ? (
              <Flatpickr
                value={value}
                options={{
                  dateFormat: 'Y-m-d',
                  maxDate: 'today',
                  locale: 'es',
                }}
                onChange={([date]) => {
                  if (date) {
                    handleFieldChange(field.key, date.toISOString().split('T')[0])
                  }
                }}
                className={`form-control ${error ? 'is-invalid' : ''}`}
                style={styles.fieldInput}
                placeholder="Selecciona una fecha"
              />
            ) : (
              <CFormInput
                type={field.type}
                value={value}
                placeholder={field.placeholder}
                invalid={!!error}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                style={styles.fieldInput}
              />
            )}
          </div>
          {error && (
            <CFormFeedback invalid className="d-block">
              {error}
            </CFormFeedback>
          )}
        </div>
      </CCol>
    )
  }

  // Renderizar examen físico
  const renderExamenFisico = () => (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="mb-0">
          <Activity size={20} className="me-2" />
          Examen Físico
        </h6>
        <CButton color="primary" variant="outline" size="sm" onClick={addExamenFisico}>
          <CIcon icon={cilPlus} size="sm" className="me-1" />
          Agregar Examen
        </CButton>
      </div>

      {form.examenFisico.map((examen, index) => (
        <CCard key={index} className="mb-3">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <small className="fw-semibold">Examen #{index + 1}</small>
            {form.examenFisico.length > 1 && (
              <CButton
                color="danger"
                variant="outline"
                size="sm"
                onClick={() => removeExamenFisico(index)}
              >
                <CIcon icon={cilTrash} size="sm" />
              </CButton>
            )}
          </CCardHeader>
          <CCardBody>
            <CRow>
              <CCol md={6} className="mb-3">
                <CFormLabel>Presión Arterial</CFormLabel>
                <CFormInput
                  value={examen.presionArterial}
                  placeholder="120/80"
                  onChange={(e) =>
                    handleExamenFisicoChange(index, 'presionArterial', e.target.value)
                  }
                />
              </CCol>
              <CCol md={6} className="mb-3">
                <CFormLabel>Frecuencia Cardíaca</CFormLabel>
                <CInputGroup>
                  <CFormInput
                    value={examen.frecuenciaCardiaca}
                    placeholder="80"
                    onChange={(e) =>
                      handleExamenFisicoChange(index, 'frecuenciaCardiaca', e.target.value)
                    }
                  />
                  <CInputGroupText>lpm</CInputGroupText>
                </CInputGroup>
              </CCol>
              <CCol md={6} className="mb-3">
                <CFormLabel>Frecuencia Respiratoria</CFormLabel>
                <CInputGroup>
                  <CFormInput
                    value={examen.frecuenciaRespiratoria}
                    placeholder="16"
                    onChange={(e) =>
                      handleExamenFisicoChange(index, 'frecuenciaRespiratoria', e.target.value)
                    }
                  />
                  <CInputGroupText>rpm</CInputGroupText>
                </CInputGroup>
              </CCol>
              <CCol md={6} className="mb-3">
                <CFormLabel>Temperatura</CFormLabel>
                <CInputGroup>
                  <CFormInput
                    value={examen.temperatura}
                    placeholder="36.5"
                    onChange={(e) => handleExamenFisicoChange(index, 'temperatura', e.target.value)}
                  />
                  <CInputGroupText>°C</CInputGroupText>
                </CInputGroup>
              </CCol>
              <CCol md={12} className="mb-3">
                <CFormLabel>Observaciones</CFormLabel>
                <CFormTextarea
                  value={examen.observaciones}
                  placeholder="Observaciones adicionales del examen físico..."
                  onChange={(e) => handleExamenFisicoChange(index, 'observaciones', e.target.value)}
                  rows={2}
                />
              </CCol>
            </CRow>
            {errors[`examenFisico_${index}`] && (
              <CFormFeedback invalid className="d-block">
                {errors[`examenFisico_${index}`]}
              </CFormFeedback>
            )}
          </CCardBody>
        </CCard>
      ))}

      <CCol md={12} className="mb-3">
        <CFormLabel className="fw-semibold">
          Evolución Clínica
          <span className="text-danger ms-1">*</span>
        </CFormLabel>
        <CFormTextarea
          value={form.evoClinica}
          placeholder="Describa la evolución clínica del paciente..."
          invalid={!!errors.evoClinica}
          onChange={(e) => handleFieldChange('evoClinica', e.target.value)}
          rows={4}
        />
        {errors.evoClinica && (
          <CFormFeedback invalid className="d-block">
            {errors.evoClinica}
          </CFormFeedback>
        )}
      </CCol>
    </div>
  )

  // Renderizar medicamentos
  const renderMedicamentos = () => (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="mb-0">
          <Pill size={20} className="me-2" />
          Medicamentos Prescritos
        </h6>
        <CButton color="primary" variant="outline" size="sm" onClick={addMedicamento}>
          <CIcon icon={cilPlus} size="sm" className="me-1" />
          Agregar Medicamento
        </CButton>
      </div>

      {form.medicamentos.map((medicamento, index) => {
        const medicamentosFiltrados = getMedicamentosFiltrados(index)

        return (
          <CCard key={index} className="mb-3">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <small className="fw-semibold">Medicamento #{index + 1}</small>
              {form.medicamentos.length > 1 && (
                <CButton
                  color="danger"
                  variant="outline"
                  size="sm"
                  onClick={() => removeMedicamento(index)}
                >
                  <CIcon icon={cilTrash} size="sm" />
                </CButton>
              )}
            </CCardHeader>
            <CCardBody>
              <CRow>
                <CCol md={12} className="mb-3">
                  <CFormLabel>Buscar y Seleccionar Medicamento</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText>
                      <CIcon icon={cilSearch} size="sm" />
                    </CInputGroupText>
                    <CFormInput
                      value={searchMedicamento[index] || ''}
                      placeholder="Buscar por nombre o código..."
                      onChange={(e) =>
                        setSearchMedicamento((prev) => ({
                          ...prev,
                          [index]: e.target.value,
                        }))
                      }
                    />
                  </CInputGroup>

                  {/* Lista de medicamentos filtrados */}
                  {searchMedicamento[index] && medicamentosFiltrados.length > 0 && (
                    <div
                      className="border rounded mt-2"
                      style={{ maxHeight: '200px', overflowY: 'auto' }}
                    >
                      {medicamentosFiltrados.slice(0, 10).map((med) => (
                        <div
                          key={med._id}
                          className="p-2 border-bottom cursor-pointer hover-bg-light"
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            handleMedicamentoSelect(index, med._id)
                            setSearchMedicamento((prev) => ({
                              ...prev,
                              [index]: '',
                            }))
                          }}
                          onMouseEnter={(e) => (e.target.style.backgroundColor = '#f8f9fa')}
                          onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
                        >
                          <div className="fw-semibold">{med.nombre}</div>
                          <small className="text-muted">Código: {med.codigo}</small>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Mostrar si no hay resultados */}
                  {searchMedicamento[index] && medicamentosFiltrados.length === 0 && (
                    <div className="text-muted mt-2 p-2 border rounded">
                      No se encontraron medicamentos
                    </div>
                  )}

                  {/* Mostrar loading */}
                  {loadingMedicamentos && (
                    <div className="text-center mt-2 p-2">
                      <CSpinner size="sm" className="me-2" />
                      Cargando medicamentos...
                    </div>
                  )}
                </CCol>

                <CCol md={6} className="mb-3">
                  <CFormLabel>Nombre del Medicamento Seleccionado</CFormLabel>
                  <CFormInput
                    value={medicamento.nombre}
                    placeholder="Seleccione un medicamento de la lista"
                    readOnly
                    className="bg-light"
                  />
                </CCol>
                <CCol md={6} className="mb-3">
                  <CFormLabel>Código</CFormLabel>
                  <CFormInput
                    value={medicamento.codigo}
                    placeholder="Código del medicamento"
                    readOnly
                    className="bg-light"
                  />
                </CCol>
                <CCol md={4} className="mb-3">
                  <CFormLabel>Dosis *</CFormLabel>
                  <CFormInput
                    value={medicamento.dosis}
                    placeholder="Ej: 500mg"
                    onChange={(e) => handleMedicamentoChange(index, 'dosis', e.target.value)}
                    invalid={errors[`medicamento_${index}`] && !medicamento.dosis}
                  />
                </CCol>
                <CCol md={4} className="mb-3">
                  <CFormLabel>Frecuencia *</CFormLabel>
                  <CFormInput
                    value={medicamento.frecuencia}
                    placeholder="Ej: Cada 8 horas"
                    onChange={(e) => handleMedicamentoChange(index, 'frecuencia', e.target.value)}
                    invalid={errors[`medicamento_${index}`] && !medicamento.frecuencia}
                  />
                </CCol>
                <CCol md={4} className="mb-3">
                  <CFormLabel>Duración *</CFormLabel>
                  <CFormInput
                    value={medicamento.duracion}
                    placeholder="Ej: 7 días"
                    onChange={(e) => handleMedicamentoChange(index, 'duracion', e.target.value)}
                    invalid={errors[`medicamento_${index}`] && !medicamento.duracion}
                  />
                </CCol>
              </CRow>
              {errors[`medicamento_${index}`] && (
                <CFormFeedback invalid className="d-block">
                  {errors[`medicamento_${index}`]}
                </CFormFeedback>
              )}
            </CCardBody>
          </CCard>
        )
      })}
    </div>
  )

  // Agregar estas funciones antes del return del componente DiagnosticTimelineModal

  // Función para cerrar el modal
  const handleClose = useCallback(() => {
    setVisible(false)
    setStep(STEPS.BASIC_INFO)
    setForm(INITIAL_VALUES)
    setErrors({})
    setSearchMedicamento({})
  }, [setVisible])

  // Función para renderizar la timeline de pasos
  const renderTimeline = () => (
    <div className="mb-4">
      <div className="d-flex justify-content-between align-items-center">
        {[
          { step: STEPS.BASIC_INFO, label: 'Información Básica', icon: FileText },
          { step: STEPS.CLINICAL_EXAM, label: 'Examen Clínico', icon: Activity },
          { step: STEPS.MEDICATION, label: 'Medicamentos', icon: Pill },
        ].map(({ step: stepNumber, label, icon: Icon }) => (
          <div key={stepNumber} className="d-flex flex-column align-items-center">
            <div
              className={`rounded-circle d-flex align-items-center justify-content-center ${
                step >= stepNumber ? 'bg-primary text-white' : 'bg-light text-muted'
              }`}
              style={{ width: '40px', height: '40px' }}
            >
              <Icon size={20} />
            </div>
            <small
              className={`mt-1 ${step >= stepNumber ? 'text-primary fw-semibold' : 'text-muted'}`}
            >
              {label}
            </small>
          </div>
        ))}
      </div>
      <div className="progress mt-2" style={{ height: '4px' }}>
        <div
          className="progress-bar bg-primary"
          style={{ width: `${((step - 1) / (STEPS.TOTAL - 1)) * 100}%` }}
        />
      </div>
    </div>
  )

  // Funciones para manejar examen físico
  const addExamenFisico = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      examenFisico: [
        ...prev.examenFisico,
        {
          presionArterial: '',
          frecuenciaCardiaca: '',
          frecuenciaRespiratoria: '',
          temperatura: '',
          observaciones: '',
        },
      ],
    }))
  }, [])

  const removeExamenFisico = useCallback((index) => {
    setForm((prev) => ({
      ...prev,
      examenFisico: prev.examenFisico.filter((_, i) => i !== index),
    }))
  }, [])

  const handleExamenFisicoChange = useCallback(
    (index, field, value) => {
      setForm((prev) => ({
        ...prev,
        examenFisico: prev.examenFisico.map((examen, i) =>
          i === index ? { ...examen, [field]: value } : examen,
        ),
      }))

      // Limpiar error si existe
      const errorKey = `examenFisico_${index}`
      if (errors[errorKey]) {
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors[errorKey]
          return newErrors
        })
      }
    },
    [errors],
  )

  // Funciones para manejar medicamentos
  const addMedicamento = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      medicamentos: [
        ...prev.medicamentos,
        {
          _id: '',
          nombre: '',
          dosis: '',
          frecuencia: '',
          duracion: '',
          codigo: '',
        },
      ],
    }))
  }, [])

  const removeMedicamento = useCallback((index) => {
    setForm((prev) => ({
      ...prev,
      medicamentos: prev.medicamentos.filter((_, i) => i !== index),
    }))
  }, [])

  const getMedicamentosFiltrados = useCallback(
    (index) => {
      const searchTerm = searchMedicamento[index] || ''
      if (!searchTerm.trim()) return []

      return medicamentosDisponibles.filter(
        (med) =>
          med.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          med.codigo.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    },
    [searchMedicamento, medicamentosDisponibles],
  )

  const handleMedicamentoSelect = useCallback(
    (index, medicamentoId) => {
      const medicamento = medicamentosDisponibles.find((med) => med._id === medicamentoId)
      if (!medicamento) return

      setForm((prev) => ({
        ...prev,
        medicamentos: prev.medicamentos.map((med, i) =>
          i === index
            ? {
                ...med,
                _id: medicamento._id,
                nombre: medicamento.nombre,
                codigo: medicamento.codigo,
              }
            : med,
        ),
      }))
    },
    [medicamentosDisponibles],
  )

  const handleMedicamentoChange = useCallback(
    (index, field, value) => {
      setForm((prev) => ({
        ...prev,
        medicamentos: prev.medicamentos.map((med, i) =>
          i === index ? { ...med, [field]: value } : med,
        ),
      }))

      // Limpiar error si existe
      const errorKey = `medicamento_${index}`
      if (errors[errorKey]) {
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors[errorKey]
          return newErrors
        })
      }
    },
    [errors],
  )

  // Funciones para navegación
  const handlePrev = useCallback(() => {
    if (step > 1) {
      setStep((prev) => prev - 1)
    }
  }, [step])

  const handleNext = useCallback(() => {
    if (validateCurrentStep()) {
      if (step < STEPS.TOTAL) {
        setStep((prev) => prev + 1)
      }
    }
  }, [step, validateCurrentStep])

  // Función para enviar el formulario
  const handleSubmit = useCallback(async () => {
    if (step < STEPS.TOTAL) {
      handleNext()
      return
    }

    if (!validateCurrentStep()) {
      return
    }

    setSubmitting(true)
    try {
      const endpoint = mode === 'edit' ? `${apiEndpoint}/edit/${data._id}` : `${apiEndpoint}/create`
      const method = mode === 'edit' ? 'PUT' : 'POST'

      const response = await apiFetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      if (response.estado === true || response.success) {
        Swal.fire({
          title: '¡Éxito!',
          text:
            mode === 'edit'
              ? 'Diagnóstico actualizado correctamente'
              : 'Diagnóstico creado correctamente',
          icon: 'success',
          confirmButtonColor: '#0d6efd',
        })

        handleClose()
        if (onSuccess) onSuccess()
      } else {
        throw new Error(response.mensaje || 'Error al guardar el diagnóstico')
      }
    } catch (error) {
      console.error('Error saving diagnostic:', error)
      Swal.fire({
        title: 'Error',
        text: error.message || 'Error al guardar el diagnóstico',
        icon: 'error',
        confirmButtonColor: '#0d6efd',
      })
    } finally {
      setSubmitting(false)
    }
  }, [step, validateCurrentStep, form, mode, apiEndpoint, data, handleClose, onSuccess, handleNext])

  return (
    <CModal
      visible={visible}
      onClose={handleClose}
      size="xl"
      backdrop="static"
      keyboard={!submitting}
    >
      <CModalHeader className="bg-primary text-white border-0">
        <CModalTitle className="d-flex align-items-center gap-2">
          <Stethoscope size={24} />
          {mode === 'edit' ? 'Editar Diagnóstico' : 'Nuevo Diagnóstico'}
          {form.prioridad && (
            <CBadge color={styles.priorityBadge[form.prioridad]} className="ms-2">
              {form.prioridad}
            </CBadge>
          )}
        </CModalTitle>
      </CModalHeader>

      <CModalBody className="p-4">
        {renderTimeline()}

        <CForm>
          {step === STEPS.BASIC_INFO && (
            <CRow>{STEP_FIELDS[STEPS.BASIC_INFO].map(renderField)}</CRow>
          )}

          {step === STEPS.CLINICAL_EXAM && renderExamenFisico()}

          {step === STEPS.MEDICATION && renderMedicamentos()}
        </CForm>
      </CModalBody>

      <CModalFooter className="bg-light border-0">
        <div className="d-flex justify-content-between w-100">
          <div>
            {step > 1 && (
              <CButton
                color="secondary"
                variant="outline"
                onClick={handlePrev}
                disabled={submitting}
              >
                Atrás
              </CButton>
            )}
          </div>

          <div className="d-flex gap-2">
            <CButton
              color="secondary"
              variant="outline"
              onClick={handleClose}
              disabled={submitting}
            >
              Cancelar
            </CButton>
            <CButton color="primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <CSpinner size="sm" className="me-2" />
                  Guardando...
                </>
              ) : step === STEPS.TOTAL ? (
                'Guardar'
              ) : (
                'Siguiente'
              )}
            </CButton>
          </div>
        </div>
      </CModalFooter>
    </CModal>
  )
}

export default DiagnosticTimelineModal
