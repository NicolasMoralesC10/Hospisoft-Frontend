import React, { useEffect, useState } from 'react'
import {
  CRow,
  CCol,
  CButton,
  CModal,
  CModalHeader,
  CModalBody,
  CModalTitle,
  CModalFooter,
  CForm,
  CFormLabel,
  CFormInput,
  CFormFeedback,
  CSpinner,
} from '@coreui/react'
import Swal from 'sweetalert2'
import MedicationCard from '../components/MedicationCard'

const VistaMedicamentos = () => {
  const [modalVisible, setModalVisible] = useState(false)
  const [modalMode, setModalMode] = useState('create') // 'create' | 'edit' | 'details'
  const [selected, setSelected] = useState(null)
  const [medications, setMedications] = useState([])
  const [loading, setLoading] = useState(true)
  const [formValues, setFormValues] = useState({
    nombreMedicamento: '',
    dosis: '',
    frecuencia: '',
    fechaInicio: '',
  })
  const [errors, setErrors] = useState({})

  const fetchMedications = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/medications') // Ajusta tu ruta real
      const json = await res.json()
      setMedications(json.data || [])
    } catch (err) {
      console.error('Error al cargar medicamentos:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMedications()
  }, [])

  const openModal = (mode, med = null) => {
    setModalMode(mode)
    setSelected(med)
    if (med) {
      setFormValues({
        nombreMedicamento: med.nombreMedicamento,
        dosis: med.dosis,
        frecuencia: med.frecuencia,
        fechaInicio: med.fechaInicio.split('T')[0],
      })
    } else {
      setFormValues({
        nombreMedicamento: '',
        dosis: '',
        frecuencia: '',
        fechaInicio: '',
      })
    }
    setErrors({})
    setModalVisible(true)
  }

  const validateForm = () => {
    const errs = {}
    if (!formValues.nombreMedicamento) errs.nombreMedicamento = 'Requerido'
    if (!formValues.dosis) errs.dosis = 'Requerido'
    if (!formValues.frecuencia) errs.frecuencia = 'Requerido'
    if (!formValues.fechaInicio) errs.fechaInicio = 'Requerido'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    try {
      const method = modalMode === 'edit' ? 'PUT' : 'POST'
      const url = modalMode === 'edit' ? `/api/medications/${selected._id}` : `/api/medications`

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formValues),
      })

      if (!res.ok) throw new Error('Error al guardar')

      Swal.fire('Éxito', 'Medicamento guardado', 'success')
      setModalVisible(false)
      fetchMedications()
    } catch (err) {
      Swal.fire('Error', err.message, 'error')
    }
  }

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Eliminar?',
      text: 'Esto no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
    })
    if (result.isConfirmed) {
      try {
        await fetch(`/api/medications/${id}`, { method: 'DELETE' })
        fetchMedications()
        Swal.fire('Eliminado', 'Medicamento eliminado', 'success')
      } catch (err) {
        Swal.fire('Error', 'No se pudo eliminar', 'error')
      }
    }
  }

  return (
    <>
      <CRow className="mb-4">
        <CCol>
          <CButton color="light" onClick={() => openModal('create')}>
            + Agregar Medicamento
          </CButton>
        </CCol>
      </CRow>

      {loading ? (
        <div className="text-center">
          <CSpinner />
        </div>
      ) : (
        <CRow xs={{ cols: 1 }} md={{ cols: 2 }} xl={{ cols: 3 }}>
          {medications.map((med) => (
            <CCol key={med._id}>
              <MedicationCard
                medication={med}
                onEdit={() => openModal('edit', med)}
                onDelete={handleDelete}
                onDetails={() => openModal('details', med)}
              />
            </CCol>
          ))}
        </CRow>
      )}

      <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <CModalHeader>
          <CModalTitle>
            {modalMode === 'create'
              ? 'Nuevo Medicamento'
              : modalMode === 'edit'
                ? 'Editar Medicamento'
                : 'Detalles del Medicamento'}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {modalMode === 'details' && selected ? (
            <>
              <p>
                <strong>Nombre:</strong> {selected.nombreMedicamento}
              </p>
              <p>
                <strong>Dosis:</strong> {selected.dosis}
              </p>
              <p>
                <strong>Frecuencia:</strong> {selected.frecuencia}
              </p>
              <p>
                <strong>Inicio:</strong> {new Date(selected.fechaInicio).toLocaleDateString()}
              </p>
            </>
          ) : (
            <CForm>
              <CFormLabel>Nombre</CFormLabel>
              <CFormInput
                value={formValues.nombreMedicamento}
                onChange={(e) =>
                  setFormValues({ ...formValues, nombreMedicamento: e.target.value })
                }
                invalid={!!errors.nombreMedicamento}
              />
              <CFormFeedback invalid>{errors.nombreMedicamento}</CFormFeedback>

              <CFormLabel className="mt-3">Dosis</CFormLabel>
              <CFormInput
                value={formValues.dosis}
                onChange={(e) => setFormValues({ ...formValues, dosis: e.target.value })}
                invalid={!!errors.dosis}
              />
              <CFormFeedback invalid>{errors.dosis}</CFormFeedback>

              <CFormLabel className="mt-3">Frecuencia</CFormLabel>
              <CFormInput
                value={formValues.frecuencia}
                onChange={(e) => setFormValues({ ...formValues, frecuencia: e.target.value })}
                invalid={!!errors.frecuencia}
              />
              <CFormFeedback invalid>{errors.frecuencia}</CFormFeedback>

              <CFormLabel className="mt-3">Fecha de Inicio</CFormLabel>
              <CFormInput
                type="date"
                value={formValues.fechaInicio}
                onChange={(e) => setFormValues({ ...formValues, fechaInicio: e.target.value })}
                invalid={!!errors.fechaInicio}
              />
              <CFormFeedback invalid>{errors.fechaInicio}</CFormFeedback>
            </CForm>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>
            Cerrar
          </CButton>
          {(modalMode === 'create' || modalMode === 'edit') && (
            <CButton color="primary" onClick={handleSave}>
              Guardar
            </CButton>
          )}
        </CModalFooter>
      </CModal>
    </>
  )
}

export default VistaMedicamentos
