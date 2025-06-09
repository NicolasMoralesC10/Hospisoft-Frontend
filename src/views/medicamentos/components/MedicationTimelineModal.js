import React, { useState, useEffect } from 'react'
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
import { Pill, DollarSign } from 'lucide-react'
import Flatpickr from 'react-flatpickr'
import 'flatpickr/dist/flatpickr.css'
import 'flatpickr/dist/themes/material_blue.css'
import { apiFetch } from '../../../helpers/apiFetch.js'

const initialValues = {
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

const fieldsStep1 = [
  { label: 'Nombre', key: 'nombre' },
  { label: 'Código', key: 'codigo' },
  { label: 'Presentación', key: 'presentacion' },
  { label: 'Concentración', key: 'concentracion' },
  { label: 'Vía de Administración', key: 'viaAdminist' },
]

const MedicationTimelineModal = ({ visible, setVisible, mode, data, apiEndpoint, onSuccess }) => {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!visible) return
    setStep(1)
    setErrors({})
    if (mode === 'edit' && data) {
      setForm({
        nombre: data.nombre || '',
        codigo: data.codigo || '',
        presentacion: data.presentacion || '',
        concentracion: data.concentracion || '',
        viaAdminist: data.viaAdminist || '',
        imagenFile: null,
        imagenPreview: data.imagen
          ? `http://127.0.0.1:3000/api/medicaments/image/${data.imagen}`
          : '',
        stockDisponible: data.stockDisponible || '',
        fechaVencimiento: data.fechaVencimiento?.split('T')[0] || '',
        precioCompra: data.precioCompra || '',
        precioVenta: data.precioVenta || '',
      })
    } else {
      setForm(initialValues)
    }
  }, [visible, mode, data])

  const validateStep = () => {
    const errs = {}
    if (step === 1) {
      if (!form.nombre) errs.nombre = 'Nombre es requerido'
      if (!form.codigo) errs.codigo = 'Código es requerido'
      if (!form.presentacion) errs.presentacion = 'Presentación es requerida'
      if (!form.concentracion) errs.concentracion = 'Concentración es requerida'
      if (!form.viaAdminist) errs.viaAdminist = 'Vía de administración es requerida'
      if (!form.imagenFile && !form.imagenPreview) errs.imagenFile = 'Imagen es requerida'
    } else {
      if (form.stockDisponible === '' || form.stockDisponible < 0)
        errs.stockDisponible = 'Stock debe ser >= 0'
      if (!form.fechaVencimiento) errs.fechaVencimiento = 'Fecha de vencimiento es requerida'
      if (form.precioCompra === '' || form.precioCompra < 0)
        errs.precioCompra = 'Precio debe ser >= 0'
      if (form.precioVenta === '' || form.precioVenta < 0) errs.precioVenta = 'Precio debe ser >= 0'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleNext = () => {
    if (validateStep()) setStep(2)
  }
  const handlePrev = () => setStep(1)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) =>
        setForm((prev) => ({ ...prev, imagenFile: file, imagenPreview: ev.target.result }))
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    if (step === 1) {
      handleNext()
      return
    }
    if (!validateStep()) return
    setSubmitting(true)
    try {
      const url = mode === 'edit' ? `${apiEndpoint}/update/${data._id}` : `${apiEndpoint}/create`
      const method = mode === 'edit' ? 'PUT' : 'POST'
      const formData = new FormData()

      // Nombres EXACTOS que espera tu backend (Joi)
      formData.append('nombre', form.nombre)
      formData.append('codigo', form.codigo)
      formData.append('presentacion', form.presentacion)
      formData.append('concentracion', form.concentracion)
      formData.append('administracion', form.viaAdminist)
      formData.append('stock', form.stockDisponible)
      formData.append('vencimiento', form.fechaVencimiento)
      formData.append('prCompra', form.precioCompra)
      formData.append('prVenta', form.precioVenta)
      if (form.imagenFile) formData.append('img', form.imagenFile)

      await apiFetch(url, { method, body: formData })

      Swal.fire('Éxito', 'Medicamento guardado', 'success')
      setVisible(false)
      onSuccess && onSuccess()
    } catch (err) {
      Swal.fire('Error', err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <CModal visible={visible} onClose={() => setVisible(false)} size="lg" backdrop="static">
      <CModalHeader className="bg-primary text-white">
        <CModalTitle>{step === 1 ? 'Información del Medicamento' : 'Stock y Precio'}</CModalTitle>
      </CModalHeader>
      <CModalBody>
        {/* Timeline */}
        <div className="d-flex align-items-center justify-content-around mb-4 px-4">
          <div
            className="flex-grow-1"
            style={{ height: '4px', backgroundColor: step >= 1 ? '#0d6efd' : '#dee2e6' }}
          />
          <div
            className={`rounded-circle p-2 ${step >= 1 ? 'bg-primary text-white' : 'bg-light text-muted'}`}
          >
            <Pill size={24} />
          </div>
          <div
            className="flex-grow-1"
            style={{ height: '4px', backgroundColor: step >= 2 ? '#0d6efd' : '#dee2e6' }}
          />
          <div
            className={`rounded-circle p-2 ${step === 2 ? 'bg-primary text-white' : 'bg-light text-muted'}`}
          >
            <DollarSign size={24} />
          </div>
          <div className="flex-grow-1" style={{ height: '4px', backgroundColor: '#dee2e6' }} />
        </div>
        <CForm className="px-4">
          {step === 1 && (
            <CRow>
              {fieldsStep1.map(({ label, key }, idx) => (
                <CCol md={6} className="mb-3" key={idx}>
                  <CFormLabel>{label}</CFormLabel>
                  <CFormInput
                    value={form[key]}
                    invalid={!!errors[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  />
                  <CFormFeedback invalid>{errors[key]}</CFormFeedback>
                </CCol>
              ))}
              <CCol md={6} className="mb-3">
                <CFormLabel>Imagen</CFormLabel>
                <CFormInput type="file" invalid={!!errors.imagenFile} onChange={handleFileChange} />
                <CFormFeedback invalid>{errors.imagenFile}</CFormFeedback>
              </CCol>
              {form.imagenPreview && (
                <CCol md={12} className="text-center mb-3">
                  <img
                    src={form.imagenPreview}
                    alt="Preview"
                    className="img-fluid rounded"
                    style={{ maxHeight: '200px' }}
                  />
                </CCol>
              )}
            </CRow>
          )}
          {step === 2 && (
            <CRow>
              <CCol md={3} className="mb-3">
                <CFormLabel>Stock Disponible</CFormLabel>
                <CFormInput
                  type="number"
                  min="0"
                  value={form.stockDisponible}
                  invalid={!!errors.stockDisponible}
                  onChange={(e) => setForm({ ...form, stockDisponible: e.target.value })}
                />
                <CFormFeedback invalid>{errors.stockDisponible}</CFormFeedback>
              </CCol>
              <CCol md={3} className="mb-3">
                <CFormLabel>Fecha Vencimiento</CFormLabel>
                <Flatpickr
                  data-enable-time={false}
                  value={form.fechaVencimiento}
                  options={{ dateFormat: 'Y-m-d' }}
                  onChange={([d]) =>
                    setForm({ ...form, fechaVencimiento: d.toISOString().split('T')[0] })
                  }
                  className={`form-control ${errors.fechaVencimiento ? 'is-invalid' : ''}`}
                />
                {errors.fechaVencimiento && (
                  <div className="invalid-feedback">{errors.fechaVencimiento}</div>
                )}
              </CCol>
              <CCol md={3} className="mb-3">
                <CFormLabel>Precio Compra</CFormLabel>
                <CFormInput
                  type="number"
                  min="0"
                  value={form.precioCompra}
                  invalid={!!errors.precioCompra}
                  onChange={(e) => setForm({ ...form, precioCompra: e.target.value })}
                />
                <CFormFeedback invalid>{errors.precioCompra}</CFormFeedback>
              </CCol>
              <CCol md={3} className="mb-3">
                <CFormLabel>Precio Venta</CFormLabel>
                <CFormInput
                  type="number"
                  min="0"
                  value={form.precioVenta}
                  invalid={!!errors.precioVenta}
                  onChange={(e) => setForm({ ...form, precioVenta: e.target.value })}
                />
                <CFormFeedback invalid>{errors.precioVenta}</CFormFeedback>
              </CCol>
            </CRow>
          )}
        </CForm>
      </CModalBody>
      <CModalFooter className="bg-light">
        {step === 2 && (
          <CButton color="secondary" onClick={handlePrev} disabled={submitting}>
            Atrás
          </CButton>
        )}
        <CButton color="primary" onClick={handleSubmit} disabled={submitting}>
          {step === 1 ? 'Siguiente' : submitting ? 'Guardando...' : 'Guardar'}
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default MedicationTimelineModal
