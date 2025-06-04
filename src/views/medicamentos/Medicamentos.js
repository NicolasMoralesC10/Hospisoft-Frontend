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
  CBadge
} from '@coreui/react'
import Swal from 'sweetalert2'
import MedicationCard from './components/MedicationCard'

const VistaMedicamentos = () => {
  const [modalVisible, setModalVisible] = useState(false)
  const [modalMode, setModalMode] = useState('create') // 'create' | 'edit' | 'details'
  const [selected, setSelected] = useState(null)
  const [medications, setMedications] = useState([])
  const [loading, setLoading] = useState(true)
  const API_URL = 'http://127.0.0.1:3000/api/medicaments' // Ruta base reutilizable
  const [formValues, setFormValues] = useState({
    nombre: '',
    codigo: '',
    presentacion: '',
    concentracion: '',
    formaFarmaceutica: '',
    viaAdminist: '',
    uniEnvase: '',
    uniMedida: '',
    stockDisponible: '',
    fechaVencimiento: '',
    precioCompra: '',
    precioVenta: '',
    descripcion: '',
    imgen: '',
  })
  const [errors, setErrors] = useState({})

  const fetchMedications = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/list`) // Ajusta tu ruta
      if (!res.ok) throw new Error(res.statusText)
      const json = await res.json()
      setMedications(json.data || [])
    } catch (err) {
      console.error(err)
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
        nombre: med.nombre || '',
        codigo: med.codigo || '',
        presentacion: med.presentacion || '',
        concentracion: med.concentracion || '',
        formaFarmaceutica: med.formaFarmaceutica || '',
        viaAdminist: med.viaAdminist || '',
        uniEnvase: med.uniEnvase || '',
        uniMedida: med.uniMedida || '',
        stockDisponible: med.stockDisponible || '',
        fechaVencimiento: med.fechaVencimiento?.split('T')[0] || '',
        precioCompra: med.precioCompra || '',
        precioVenta: med.precioVenta || '',
        descripcion: med.descripcion || '',
        imgen: med.imgen || '',
      })
    } else {
      setFormValues({
        nombre: '',
        codigo: '',
        presentacion: '',
        concentracion: '',
        formaFarmaceutica: '',
        viaAdminist: '',
        uniEnvase: '',
        uniMedida: '',
        stockDisponible: '',
        fechaVencimiento: '',
        precioCompra: '',
        precioVenta: '',
        descripcion: '',
        imgen: '',
      })
    }
    setErrors({})
    setModalVisible(true)
  }

  const validateForm = () => {
    const errs = {}
    if (!formValues.nombre) errs.nombre = 'Requerido'
    if (!formValues.codigo) errs.codigo = 'Requerido'
    if (!formValues.stockDisponible) errs.stockDisponible = 'Requerido'
    if (!formValues.fechaVencimiento) errs.fechaVencimiento = 'Requerido'
    if (!formValues.precioVenta) errs.precioVenta = 'Requerido'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    try {
      let res
      if (modalMode === 'edit') {
        res = await fetch(`${API_URL}/${selected._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formValues),
        })
      } else {
        res = await fetch(`${API_URL}/list`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formValues),
        })
      }
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
        const res = await fetch(`${API_URL}${id}`, { method: 'DELETE' })
        if (!res.ok) throw new Error('Error al eliminar')
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

      <CModal visible={modalVisible} onClose={() => setModalVisible(false)} size="lg">
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
                <strong>Nombre:</strong> {selected.nombre}
              </p>
              <p>
                <strong>Código:</strong> {selected.codigo}
              </p>
              <p>
                <strong>Presentación:</strong> {selected.presentacion}
              </p>
              <p>
                <strong>Concentración:</strong> {selected.concentracion}
              </p>
              <p>
                <strong>Forma Farmacéutica:</strong> {selected.formaFarmaceutica}
              </p>
              <p>
                <strong>Vía de Administración:</strong> {selected.viaAdminist}
              </p>
              <p>
                <strong>Unidad por Envase:</strong> {selected.uniEnvase}
              </p>
              <p>
                <strong>Unidad de Medida:</strong> {selected.uniMedida}
              </p>
              <p>
                <strong>Stock Disponible:</strong>{' '}
                <CBadge color={selected.stockDisponible > 0 ? 'success' : 'danger'}>
                  {selected.stockDisponible}
                </CBadge>
              </p>
              <p>
                <strong>Vencimiento:</strong>{' '}
                {new Date(selected.fechaVencimiento).toLocaleDateString()}
              </p>
              <p>
                <strong>Precio Compra:</strong> ${selected.precioCompra.toLocaleString()}
              </p>
              <p>
                <strong>Precio Venta:</strong> ${selected.precioVenta.toLocaleString()}
              </p>
              <p>
                <strong>Descripción:</strong> {selected.descripcion || 'N/A'}
              </p>
            </>
          ) : (
            <CForm>
              <CFormLabel>Nombre</CFormLabel>
              <CFormInput
                value={formValues.nombre}
                onChange={(e) => setFormValues({ ...formValues, nombre: e.target.value })}
                invalid={!!errors.nombre}
              />
              <CFormFeedback invalid>{errors.nombre}</CFormFeedback>

              <CFormLabel className="mt-3">Código</CFormLabel>
              <CFormInput
                value={formValues.codigo}
                onChange={(e) => setFormValues({ ...formValues, codigo: e.target.value })}
                invalid={!!errors.codigo}
              />
              <CFormFeedback invalid>{errors.codigo}</CFormFeedback>

              <CFormLabel className="mt-3">Presentación</CFormLabel>
              <CFormInput
                value={formValues.presentacion}
                onChange={(e) => setFormValues({ ...formValues, presentacion: e.target.value })}
              />

              <CFormLabel className="mt-3">Concentración</CFormLabel>
              <CFormInput
                value={formValues.concentracion}
                onChange={(e) => setFormValues({ ...formValues, concentracion: e.target.value })}
              />

              <CFormLabel className="mt-3">Forma Farmacéutica</CFormLabel>
              <CFormInput
                value={formValues.formaFarmaceutica}
                onChange={(e) =>
                  setFormValues({ ...formValues, formaFarmaceutica: e.target.value })
                }
              />

              <CFormLabel className="mt-3">Vía de Administración</CFormLabel>
              <CFormInput
                value={formValues.viaAdminist}
                onChange={(e) => setFormValues({ ...formValues, viaAdminist: e.target.value })}
              />

              <CFormLabel className="mt-3">Unidad por Envase</CFormLabel>
              <CFormInput
                value={formValues.uniEnvase}
                onChange={(e) => setFormValues({ ...formValues, uniEnvase: e.target.value })}
              />

              <CFormLabel className="mt-3">Unidad de Medida</CFormLabel>
              <CFormInput
                value={formValues.uniMedida}
                onChange={(e) => setFormValues({ ...formValues, uniMedida: e.target.value })}
              />

              <CFormLabel className="mt-3">Stock Disponible</CFormLabel>
              <CFormInput
                type="number"
                value={formValues.stockDisponible}
                onChange={(e) => setFormValues({ ...formValues, stockDisponible: e.target.value })}
                invalid={!!errors.stockDisponible}
              />
              <CFormFeedback invalid>{errors.stockDisponible}</CFormFeedback>

              <CFormLabel className="mt-3">Fecha de Vencimiento</CFormLabel>
              <CFormInput
                type="date"
                value={formValues.fechaVencimiento}
                onChange={(e) => setFormValues({ ...formValues, fechaVencimiento: e.target.value })}
                invalid={!!errors.fechaVencimiento}
              />
              <CFormFeedback invalid>{errors.fechaVencimiento}</CFormFeedback>

              <CFormLabel className="mt-3">Precio Compra</CFormLabel>
              <CFormInput
                type="number"
                value={formValues.precioCompra}
                onChange={(e) => setFormValues({ ...formValues, precioCompra: e.target.value })}
              />

              <CFormLabel className="mt-3">Precio Venta</CFormLabel>
              <CFormInput
                type="number"
                value={formValues.precioVenta}
                onChange={(e) => setFormValues({ ...formValues, precioVenta: e.target.value })}
                invalid={!!errors.precioVenta}
              />
              <CFormFeedback invalid>{errors.precioVenta}</CFormFeedback>

              <CFormLabel className="mt-3">Descripción</CFormLabel>
              <CFormInput
                value={formValues.descripcion}
                onChange={(e) => setFormValues({ ...formValues, descripcion: e.target.value })}
              />

              <CFormLabel className="mt-3">Imagen (URL)</CFormLabel>
              <CFormInput
                value={formValues.imgen}
                onChange={(e) => setFormValues({ ...formValues, imgen: e.target.value })}
              />
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
