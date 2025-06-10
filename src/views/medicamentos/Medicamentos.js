import React, { useEffect, useState } from 'react'
import {
  CRow,
  CCol,
  CButton,
  CSpinner,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CCard,
  CCardBody,
  CCardHeader,
  CBadge,
} from '@coreui/react'
import { Info } from 'lucide-react'
import Swal from 'sweetalert2'
import MedicationCard from './components/MedicationCard'
import MedicationTimelineModal from './components/MedicationTimelineModal'
import { useFetchImage } from './hooks/useFetchImage.js'
import { apiFetch } from '../../helpers/apiFetch.js'

const imageContainerStyle = {
  width: '100%',
  aspectRatio: '16/10',
  background: 'linear-gradient(135deg, #e0e7ef 0%, #f8fafc 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '1rem',
  overflow: 'hidden',
  marginBottom: '1.5rem',
  boxShadow: '0 2px 12px rgba(44,62,80,.10)',
}

const imageStyle = {
  maxWidth: '100%',
  maxHeight: '100%',
  objectFit: 'contain',
  background: 'transparent',
  borderRadius: '0.75rem',
  boxShadow: '0 1.5px 6px rgba(44,62,80,.09)',
}

const labelStyle = {
  fontWeight: 600,
  color: '#2c3e50',
  fontSize: '1rem',
}

const valueStyle = {
  fontWeight: 400,
  color: '#34495e',
  fontSize: '1rem',
}

const VistaMedicamentos = () => {
  const [medications, setMedications] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [detailVisible, setDetailVisible] = useState(false)
  const [selected, setSelected] = useState(null)
  const { fetchImage } = useFetchImage()
  const [imageUrl, setImageUrl] = useState('')

  const API_URL = 'http://127.0.0.1:3000/api/medicaments'

  const fetchMedications = async () => {
    setLoading(true)
    try {
      const json = await apiFetch(`${API_URL}/list`)
      setMedications(json.data || [])
    } catch (err) {
      console.error(err)
      Swal.fire('Error', 'No se pudo cargar los medicamentos', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMedications()
  }, [])

  useEffect(() => {
    if (selected?.imagen) {
      fetchImage(selected.imagen).then(setImageUrl)
    }
  }, [selected])

  const openModal = (mode, med = null) => {
    setModalMode(mode)
    setSelected(med)
    setModalVisible(true)
  }

  const openDetail = (med) => {
    setSelected(med)
    setDetailVisible(true)
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
        await apiFetch(`${API_URL}/delet`, {
          method: 'POST',
          body: JSON.stringify({ id }),
        })
        Swal.fire('Eliminado', 'Medicamento eliminado', 'success')
        fetchMedications()
      } catch (err) {
        Swal.fire('Error', 'No se pudo eliminar', 'error')
      }
    }
  }

  const vencimiento = selected?.fechaVencimiento
    ? new Date(selected.fechaVencimiento).toLocaleDateString()
    : '—'

  return (
    <>
      <CRow className="mb-4">
        <CCol>
          <CButton color="info" className="text-white" onClick={() => openModal('create')}>
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
                onDetails={() => openDetail(med)}
              />
            </CCol>
          ))}
        </CRow>
      )}

      {/* Timeline Modal para creación/edición */}
      <MedicationTimelineModal
        visible={modalVisible}
        setVisible={setModalVisible}
        mode={modalMode}
        data={selected}
        apiEndpoint={API_URL}
        onSuccess={fetchMedications}
      />

      {/* Detalles Modal mejorado */}
      <CModal
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
        size="lg"
        backdrop="static"
      >
        <CModalHeader className="bg-primary text-white">
          <CModalTitle>
            <Info size={22} className="me-2 mb-1" />
            Detalles del Medicamento
          </CModalTitle>
        </CModalHeader>
        <CModalBody className="bg-light">
          {selected && (
            <CCard className="border-0 shadow-none bg-transparent">
              <CCardBody>
                <CRow>
                  <CCol
                    md={5}
                    className="mb-4 mb-md-0 d-flex flex-column align-items-center justify-content-center"
                  >
                    <div style={imageContainerStyle}>
                      <img src={imageUrl} alt={selected?.nombre} style={imageStyle} />
                    </div>
                    <CBadge
                      color={selected.stockDisponible > 0 ? 'success' : 'danger'}
                      className="fs-6 px-4 py-2 rounded-pill mb-2"
                    >
                      {selected.stockDisponible > 0 ? 'Disponible' : 'Agotado'}
                    </CBadge>
                  </CCol>
                  <CCol md={7}>
                    <CRow className="mb-2">
                      <CCol xs={6}>
                        <span style={labelStyle}>Nombre:</span>
                        <div style={valueStyle}>{selected.nombre}</div>
                      </CCol>
                      <CCol xs={6}>
                        <span style={labelStyle}>Código:</span>
                        <div style={valueStyle}>{selected.codigo}</div>
                      </CCol>
                    </CRow>
                    <CRow className="mb-2">
                      <CCol xs={6}>
                        <span style={labelStyle}>Presentación:</span>
                        <div style={valueStyle}>{selected.presentacion}</div>
                      </CCol>
                      <CCol xs={6}>
                        <span style={labelStyle}>Concentración:</span>
                        <div style={valueStyle}>{selected.concentracion}</div>
                      </CCol>
                    </CRow>
                    <CRow className="mb-2">
                      <CCol xs={6}>
                        <span style={labelStyle}>Vía de Administración:</span>
                        <div style={valueStyle}>{selected.viaAdminist}</div>
                      </CCol>
                      <CCol xs={6}>
                        <span style={labelStyle}>Vencimiento:</span>
                        <div style={valueStyle}>{vencimiento}</div>
                      </CCol>
                    </CRow>
                    <CRow className="mb-2">
                      <CCol xs={6}>
                        <span style={labelStyle}>Stock Disponible:</span>
                        <div style={valueStyle}>{selected.stockDisponible}</div>
                      </CCol>
                      <CCol xs={6}>
                        <span style={labelStyle}>Precio Venta:</span>
                        <div style={valueStyle}>
                          ${selected.precioVenta?.toLocaleString() || '—'}
                        </div>
                      </CCol>
                    </CRow>
                    <CRow className="mb-2">
                      <CCol xs={6}>
                        <span style={labelStyle}>Precio Compra:</span>
                        <div style={valueStyle}>
                          ${selected.precioCompra?.toLocaleString() || '—'}
                        </div>
                      </CCol>
                    </CRow>
                  </CCol>
                </CRow>
              </CCardBody>
            </CCard>
          )}
        </CModalBody>
        <CModalFooter className="bg-light">
          <CButton color="secondary" onClick={() => setDetailVisible(false)}>
            Cerrar
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default VistaMedicamentos
