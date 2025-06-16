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
  CFormFeedback,
  CRow,
  CCol,
  CSpinner,
} from '@coreui/react'
import { Pill, DollarSign, Upload, Calendar, Package, FileText } from 'lucide-react'
import Flatpickr from 'react-flatpickr'
import 'flatpickr/dist/flatpickr.css'
import 'flatpickr/dist/themes/material_blue.css'
import { apiFetch } from '../../../helpers/apiFetch.js'
import { useFetchImage } from '../hooks/useFetchImage'

// Configuración de pasos
const STEPS = {
  BASIC_INFO: 1,
  STOCK_PRICING: 2,
  TOTAL: 2,
}

// Valores iniciales
const INITIAL_VALUES = {
  nombre: '',
  codigo: '',
  presentacion: '',
  concentracion: '',
  viaAdminist: '',
  imagenFile: null,
  imagenPreview: '',
  stockDisponible: '',
  fechaVencimiento: '',
  precioCompra: '',
  precioVenta: '',
}

// Configuración de campos por paso
const STEP_FIELDS = {
  [STEPS.BASIC_INFO]: [
    {
      label: 'Nombre del Medicamento',
      key: 'nombre',
      type: 'text',
      placeholder: 'Ej: Acetaminofén',
      icon: Pill,
      required: true,
      colSize: 6,
    },
    {
      label: 'Código de Barras/SKU',
      key: 'codigo',
      type: 'text',
      placeholder: 'Ej: 12345678901',
      icon: FileText,
      required: true,
      colSize: 6,
    },
    {
      label: 'Presentación',
      key: 'presentacion',
      type: 'text',
      placeholder: 'Ej: Tabletas, Jarabe, Cápsulas',
      icon: Package,
      required: true,
      colSize: 6,
    },
    {
      label: 'Concentración',
      key: 'concentracion',
      type: 'text',
      placeholder: 'Ej: 500mg, 250mg/5ml',
      icon: Pill,
      required: true,
      colSize: 6,
    },
    {
      label: 'Vía de Administración',
      key: 'viaAdminist',
      type: 'text',
      placeholder: 'Ej: Oral, Tópica, Intramuscular',
      icon: FileText,
      required: true,
      colSize: 12,
    },
  ],
  [STEPS.STOCK_PRICING]: [
    {
      label: 'Stock Disponible',
      key: 'stockDisponible',
      type: 'number',
      placeholder: '0',
      icon: Package,
      required: true,
      colSize: 6,
      min: 0,
    },
    {
      label: 'Precio de Compra',
      key: 'precioCompra',
      type: 'number',
      placeholder: '0.00',
      icon: DollarSign,
      required: true,
      colSize: 6,
      min: 0,
      step: 0.01,
    },
    {
      label: 'Precio de Venta',
      key: 'precioVenta',
      type: 'number',
      placeholder: '0.00',
      icon: DollarSign,
      required: true,
      colSize: 6,
      min: 0,
      step: 0.01,
    },
  ],
}

// Validaciones
const validateField = (key, value, allValues = {}) => {
  const rules = {
    nombre: {
      required: 'El nombre es requerido',
      minLength: { value: 2, message: 'Mínimo 2 caracteres' },
      maxLength: { value: 100, message: 'Máximo 100 caracteres' },
    },
    codigo: {
      required: 'El código es requerido',
      pattern: { value: /^[A-Za-z0-9]+$/, message: 'Solo letras y números' },
    },
    presentacion: {
      required: 'La presentación es requerida',
      minLength: { value: 2, message: 'Mínimo 2 caracteres' },
    },
    concentracion: {
      required: 'La concentración es requerida',
      minLength: { value: 2, message: 'Mínimo 2 caracteres' },
    },
    viaAdminist: {
      required: 'La vía de administración es requerida',
    },
    stockDisponible: {
      required: 'El stock es requerido',
      min: { value: 0, message: 'Debe ser mayor o igual a 0' },
    },
    fechaVencimiento: {
      required: 'La fecha de vencimiento es requerida',
      custom: (val) => {
        const today = new Date()
        const expiryDate = new Date(val)
        if (expiryDate <= today) {
          return 'La fecha debe ser futura'
        }
        return null
      },
    },
    precioCompra: {
      required: 'El precio de compra es requerido',
      min: { value: 0, message: 'Debe ser mayor o igual a 0' },
    },
    precioVenta: {
      required: 'El precio de venta es requerido',
      min: { value: 0, message: 'Debe ser mayor o igual a 0' },
      custom: (val, allVals) => {
        const compra = parseFloat(allVals.precioCompra || 0)
        const venta = parseFloat(val || 0)
        if (venta > 0 && compra > 0 && venta <= compra) {
          return 'El precio de venta debe ser mayor al de compra'
        }
        return null
      },
    },
  }

  const fieldRules = rules[key]
  if (!fieldRules) return null

  const strValue = String(value).trim()

  // Required
  if (fieldRules.required && !strValue) {
    return fieldRules.required
  }

  if (!strValue) return null // No validar si está vacío y no es requerido

  // Min length
  if (fieldRules.minLength && strValue.length < fieldRules.minLength.value) {
    return fieldRules.minLength.message
  }

  // Max length
  if (fieldRules.maxLength && strValue.length > fieldRules.maxLength.value) {
    return fieldRules.maxLength.message
  }

  // Pattern
  if (fieldRules.pattern && !fieldRules.pattern.value.test(strValue)) {
    return fieldRules.pattern.message
  }

  // Min value
  if (fieldRules.min && parseFloat(value) < fieldRules.min.value) {
    return fieldRules.min.message
  }

  // Custom validation
  if (fieldRules.custom) {
    return fieldRules.custom(value, allValues)
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
    top: '12px', // Posición fija desde arriba
    color: '#6c757d',
    zIndex: 2,
    pointerEvents: 'none',
  },
  fieldInput: {
    paddingLeft: '40px',
  },
  imagePreview: {
    maxHeight: '200px',
    maxWidth: '100%',
    objectFit: 'contain',
    borderRadius: '8px',
    border: '2px solid #e9ecef',
  },
  imageUpload: {
    border: '2px dashed #dee2e6',
    borderRadius: '8px',
    padding: '2rem',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backgroundColor: '#f8f9fa',
  },
  imageUploadHover: {
    borderColor: '#0d6efd',
    backgroundColor: '#f0f8ff',
  },
}

const MedicationTimelineModal = ({ visible, setVisible, mode, data, apiEndpoint, onSuccess }) => {
  const [step, setStep] = useState(STEPS.BASIC_INFO)
  const [form, setForm] = useState(INITIAL_VALUES)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const { fetchImage } = useFetchImage()

  // Resetear estado al abrir/cerrar modal
  useEffect(() => {
    if (!visible) {
      setStep(STEPS.BASIC_INFO)
      setErrors({})
      setForm(INITIAL_VALUES)
      return
    }

    if (mode === 'edit' && data) {
      loadEditData()
    }
  }, [visible, mode, data])

  // Cargar datos para edición
  const loadEditData = useCallback(async () => {
    try {
      const previewUrl = data.imagen ? await fetchImage(data.imagen) : ''
      setForm({
        nombre: data.nombre || '',
        codigo: data.codigo || '',
        presentacion: data.presentacion || '',
        concentracion: data.concentracion || '',
        viaAdminist: data.viaAdminist || '',
        imagenFile: null,
        imagenPreview: previewUrl,
        stockDisponible: data.stockDisponible || '',
        fechaVencimiento: data.fechaVencimiento?.split('T')[0] || '',
        precioCompra: data.precioCompra || '',
        precioVenta: data.precioVenta || '',
      })
    } catch (error) {
      console.error('Error loading edit data:', error)
    }
  }, [data, fetchImage])

  // Validar paso actual
  const validateCurrentStep = useCallback(() => {
    const stepFields = STEP_FIELDS[step] || []
    const newErrors = {}

    stepFields.forEach((field) => {
      const error = validateField(field.key, form[field.key], form)
      if (error) {
        newErrors[field.key] = error
      }
    })

    // Validación especial para imagen en paso 1
    if (step === STEPS.BASIC_INFO && !form.imagenFile && !form.imagenPreview) {
      newErrors.imagenFile = 'La imagen es requerida'
    }

    // Validación especial para fecha de vencimiento
    if (step === STEPS.STOCK_PRICING && form.fechaVencimiento) {
      const error = validateField('fechaVencimiento', form.fechaVencimiento, form)
      if (error) {
        newErrors.fechaVencimiento = error
      }
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

  // Manejar subida de archivo
  const handleFileChange = useCallback(async (file) => {
    if (!file) return

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({ ...prev, imagenFile: 'Formato no válido. Use JPG, PNG, WebP o GIF' }))
      return
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, imagenFile: 'La imagen debe ser menor a 5MB' }))
      return
    }

    setImageUploading(true)
    try {
      const reader = new FileReader()
      reader.onload = (e) => {
        setForm((prev) => ({
          ...prev,
          imagenFile: file,
          imagenPreview: e.target.result,
        }))
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors.imagenFile
          return newErrors
        })
        setImageUploading(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      setErrors((prev) => ({ ...prev, imagenFile: 'Error al procesar la imagen' }))
      setImageUploading(false)
    }
  }, [])

  // Manejar drag & drop
  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) {
        handleFileChange(file)
      }
    },
    [handleFileChange],
  )

  // Navegación
  const handleNext = useCallback(() => {
    if (validateCurrentStep()) {
      setStep(step + 1)
    }
  }, [step, validateCurrentStep])

  const handlePrev = useCallback(() => {
    setStep(step - 1)
  }, [step])

  // Envío del formulario
  const handleSubmit = useCallback(async () => {
    if (step < STEPS.TOTAL) {
      handleNext()
      return
    }

    if (!validateCurrentStep()) return

    setSubmitting(true)
    try {
      const url = mode === 'edit' ? `${apiEndpoint}/update/${data._id}` : `${apiEndpoint}/create`
      const method = mode === 'edit' ? 'PUT' : 'POST'
      const formData = new FormData()

      // Mapear campos al formato del backend
      formData.append('nombre', form.nombre)
      formData.append('codigo', form.codigo)
      formData.append('presentacion', form.presentacion)
      formData.append('concentracion', form.concentracion)
      formData.append('administracion', form.viaAdminist)
      formData.append('stock', form.stockDisponible)
      formData.append('vencimiento', form.fechaVencimiento)
      formData.append('prCompra', form.precioCompra)
      formData.append('prVenta', form.precioVenta)

      if (form.imagenFile) {
        formData.append('img', form.imagenFile)
      }

      await apiFetch(url, { method, body: formData })

      await Swal.fire({
        title: '¡Éxito!',
        text: `Medicamento ${mode === 'edit' ? 'actualizado' : 'creado'} correctamente`,
        icon: 'success',
        confirmButtonColor: '#0d6efd',
        timer: 3000,
        timerProgressBar: true,
      })

      setVisible(false)
      onSuccess?.()
    } catch (err) {
      await Swal.fire({
        title: 'Error',
        text: err.message || 'Ocurrió un error inesperado',
        icon: 'error',
        confirmButtonColor: '#dc3545',
      })
    } finally {
      setSubmitting(false)
    }
  }, [step, form, mode, data, apiEndpoint, validateCurrentStep, onSuccess, setVisible, handleNext])

  // Cerrar modal
  const handleClose = useCallback(() => {
    if (submitting) return
    setVisible(false)
  }, [submitting, setVisible])

  // Render del timeline
  const renderTimeline = () => (
    <>
      {/* Barra y pasos */}
      <div
        className="d-flex align-items-center justify-content-between mb-1 px-4"
        style={{ width: '100%' }}
      >
        {/* Tramo izquierdo */}
        <div
          style={{ flex: 1, height: '6px', backgroundColor: step >= 1 ? '#0d6efd' : '#dee2e6' }}
        />
        {/* Paso 1 */}
        <div
          className={`d-flex align-items-center justify-content-center rounded-circle mx-2 ${step >= 1 ? 'bg-primary text-white' : 'bg-light text-muted'}`}
          style={{ width: '48px', height: '48px' }}
        >
          <Pill size={24} />
        </div>
        {/* Tramo central */}
        <div
          style={{ flex: 1, height: '6px', backgroundColor: step >= 2 ? '#0d6efd' : '#dee2e6' }}
        />
        {/* Paso 2 */}
        <div
          className={`d-flex align-items-center justify-content-center rounded-circle mx-2 ${step >= 2 ? 'bg-primary text-white' : 'bg-light text-muted'}`}
          style={{ width: '48px', height: '48px' }}
        >
          <DollarSign size={24} />
        </div>
        {/* Tramo derecho */}
        <div style={{ flex: 1, height: '6px', backgroundColor: '#dee2e6' }} />
      </div>

      {/* Etiquetas */}
      <div className="d-flex justify-content-between px-4 mb-4" style={{ width: '100%' }}>
        <div style={{ flex: 1 }} />
        <div style={{ width: '48px', textAlign: 'center' }}>
          <small className={step >= 1 ? 'text-primary' : 'text-muted'}>Información</small>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ width: '48px', textAlign: 'center' }}>
          <small className={step >= 2 ? 'text-primary' : 'text-muted'}>Stock</small>
        </div>
        <div style={{ flex: 1 }} />
      </div>
    </>
  )

  // Renderizar campo
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
            <CFormInput
              type={field.type}
              value={value}
              placeholder={field.placeholder}
              invalid={!!error}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              style={styles.fieldInput}
              min={field.min}
              step={field.step}
            />
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

  // Renderizar subida de imagen
  const renderImageUpload = () => (
    <CCol md={12} className="mb-3">
      <CFormLabel className="fw-semibold">
        Imagen del Medicamento
        <span className="text-danger ms-1">*</span>
      </CFormLabel>

      <div
        style={{
          ...styles.imageUpload,
          ...(dragOver ? styles.imageUploadHover : {}),
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('imageInput').click()}
      >
        {imageUploading ? (
          <div>
            <CSpinner size="sm" className="mb-2" />
            <p className="mb-0">Procesando imagen...</p>
          </div>
        ) : form.imagenPreview ? (
          <div>
            <img
              src={form.imagenPreview}
              alt="Preview"
              style={styles.imagePreview}
              className="mb-2"
            />
            <p className="mb-0 text-muted">Haz clic o arrastra una nueva imagen para cambiar</p>
          </div>
        ) : (
          <div>
            <Upload size={48} className="mb-3 text-muted" />
            <p className="mb-2">Arrastra una imagen aquí o haz clic para seleccionar</p>
            <small className="text-muted">Formatos: JPG, PNG, WebP, GIF (máx. 5MB)</small>
          </div>
        )}
      </div>

      <input
        id="imageInput"
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => handleFileChange(e.target.files[0])}
      />

      {errors.imagenFile && (
        <CFormFeedback invalid className="d-block">
          {errors.imagenFile}
        </CFormFeedback>
      )}
    </CCol>
  )

  // Renderizar campo de fecha
  const renderDateField = () => (
    <CCol md={6} className="mb-3">
      <div style={styles.fieldContainer}>
        <CFormLabel className="fw-semibold">
          Fecha de Vencimiento
          <span className="text-danger ms-1">*</span>
        </CFormLabel>
        <div className="position-relative">
          <Calendar size={16} style={styles.fieldIcon} />
          <Flatpickr
            data-enable-time={false}
            value={form.fechaVencimiento}
            options={{
              dateFormat: 'Y-m-d',
              minDate: 'today',
              locale: 'es',
            }}
            onChange={([date]) => {
              if (date) {
                handleFieldChange('fechaVencimiento', date.toISOString().split('T')[0])
              }
            }}
            className={`form-control ${errors.fechaVencimiento ? 'is-invalid' : ''}`}
            style={styles.fieldInput}
            placeholder="Selecciona una fecha"
          />
        </div>
        {errors.fechaVencimiento && (
          <CFormFeedback invalid className="d-block">
            {errors.fechaVencimiento}
          </CFormFeedback>
        )}
      </div>
    </CCol>
  )

  return (
    <CModal
      visible={visible}
      onClose={handleClose}
      size="lg"
      backdrop="static"
      keyboard={!submitting}
    >
      <CModalHeader className="bg-primary text-white border-0">
        <CModalTitle className="d-flex align-items-center gap-2">
          <Pill size={24} />
          {mode === 'edit' ? 'Editar Medicamento' : 'Nuevo Medicamento'}
        </CModalTitle>
      </CModalHeader>

      <CModalBody className="p-4">
        {renderTimeline()}

        <CForm>
          {step === STEPS.BASIC_INFO && (
            <div>
              <CRow>
                {STEP_FIELDS[STEPS.BASIC_INFO].map(renderField)}
                {renderImageUpload()}
              </CRow>
            </div>
          )}

          {step === STEPS.STOCK_PRICING && (
            <div>
              <CRow>
                {STEP_FIELDS[STEPS.STOCK_PRICING].map(renderField)}
                {renderDateField()}
              </CRow>
            </div>
          )}
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

export default MedicationTimelineModal
