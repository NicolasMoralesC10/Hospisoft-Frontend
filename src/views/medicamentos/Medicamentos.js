// VistaMedicamentos.jsx - Versión con diseño moderno
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
  CFormInput,
  CInputGroup,
  CInputGroupText,
} from '@coreui/react'
import { Info, Search, Plus, Package, Activity, AlertCircle } from 'lucide-react'
import Swal from 'sweetalert2'
import MedicationCard from './components/MedicationCard'
import MedicationTimelineModal from './components/MedicationTimelineModal'
import Pagination from './components/paginations'
import { useFetchImage } from './hooks/useFetchImage.js'
import { apiFetch } from '../../helpers/apiFetch.js'

// Estilos modernos mejorados
const modernStyles = {
  headerSection: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '1.5rem',
    padding: '2.5rem',
    marginBottom: '3rem',
    boxShadow: '0 20px 40px rgba(102, 126, 234, 0.15)',
    position: 'relative',
    overflow: 'hidden',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="rgba(255,255,255,0.05)" fill-opacity="0.4"%3E%3Cpath d="M20 20c0 5.5-4.5 10-10 10s-10-4.5-10-10 4.5-10 10-10 10 4.5 10 10zm10 0c0 5.5-4.5 10-10 10s-10-4.5-10-10 4.5-10 10-10 10 4.5 10 10z"/%3E%3C/g%3E%3C/svg%3E")',
    zIndex: 1,
  },
  headerContent: {
    position: 'relative',
    zIndex: 2,
  },
  headerTitle: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: 'white',
    marginBottom: '0.5rem',
    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  headerSubtitle: {
    fontSize: '1.1rem',
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '400',
    marginBottom: '2rem',
  },
  statsContainer: {
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: '1rem',
    padding: '1.5rem',
    border: '1px solid rgba(255,255,255,0.2)',
  },
  statItem: {
    textAlign: 'center',
    color: 'white',
  },
  statNumber: {
    fontSize: '2rem',
    fontWeight: '700',
    display: 'block',
    marginBottom: '0.25rem',
  },
  statLabel: {
    fontSize: '0.9rem',
    opacity: 0.9,
    fontWeight: '500',
  },
  searchSection: {
    marginBottom: '3rem',
  },
  searchContainer: {
    background: 'white',
    borderRadius: '1rem',
    padding: '2rem',
    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
    border: '1px solid rgba(226, 232, 240, 0.8)',
  },
  searchInput: {
    border: '2px solid #e2e8f0',
    borderRadius: '0.75rem',
    padding: '1rem 1.25rem',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    background: '#f8fafc',
  },
  actionButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '1rem',
    padding: '1rem 2rem',
    fontSize: '1rem',
    fontWeight: '600',
    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
    transition: 'all 0.3s ease',
    color: 'white',
  },
  cardsContainer: {
    marginBottom: '3rem',
  },
  imageContainerStyle: {
    width: '100%',
    aspectRatio: '16/10',
    background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '1rem',
    overflow: 'hidden',
    marginBottom: '1.5rem',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    border: '1px solid rgba(226, 232, 240, 0.5)',
  },
  imageStyle: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
    background: 'transparent',
    borderRadius: '0.75rem',
  },
  modalHeader: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '1rem 1rem 0 0',
  },
  modalBody: {
    background: '#f8fafc',
    padding: '2rem',
  },
  detailCard: {
    background: 'white',
    borderRadius: '1rem',
    border: 'none',
    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
  },
  labelStyle: {
    fontWeight: '600',
    color: '#475569',
    fontSize: '0.9rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '0.25rem',
    display: 'block',
  },
  valueStyle: {
    fontWeight: '500',
    color: '#1e293b',
    fontSize: '1.1rem',
    marginBottom: '1rem',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '300px',
    background: 'white',
    borderRadius: '1rem',
    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
  },
  emptyState: {
    textAlign: 'center',
    padding: '4rem 2rem',
    background: 'white',
    borderRadius: '1rem',
    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
  },
  emptyIcon: {
    fontSize: '4rem',
    color: '#cbd5e1',
    marginBottom: '1rem',
  },
  emptyTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#475569',
    marginBottom: '0.5rem',
  },
  emptyText: {
    color: '#64748b',
    fontSize: '1rem',
  },
}

const VistaMedicamentos = () => {
  const [medications, setMedications] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [detailVisible, setDetailVisible] = useState(false)
  const [selected, setSelected] = useState(null)
  const { fetchImage } = useFetchImage()
  const [imageUrl, setImageUrl] = useState('')

  const [page, setPage] = useState(1)
  const pageSize = 6

  const API_URL = 'https://185.254.206.90:4080/api/medicaments'

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

  useEffect(() => {
    const filteredResults = medications.filter((med) =>
      med.nombre?.toLowerCase().includes(search.toLowerCase()),
    )
    setFiltered(filteredResults)
    setPage(1)
  }, [search, medications])

  const currentData = filtered.slice((page - 1) * pageSize, page * pageSize)

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
      cancelButtonText: 'Cancelar',
      customClass: {
        confirmButton: 'btn btn-danger',
        cancelButton: 'btn btn-secondary',
      },
    })

    if (result.isConfirmed) {
      try {
        await apiFetch(`${API_URL}/delet`, {
          method: 'POST',
          body: JSON.stringify({ id }),
        })
        Swal.fire('Eliminado', 'Medicamento eliminado exitosamente', 'success')
        fetchMedications()
      } catch (err) {
        Swal.fire('Error', 'No se pudo eliminar el medicamento', 'error')
      }
    }
  }

  // Estadísticas calculadas
  const totalMedications = medications.length
  const availableMedications = medications.filter((med) => med.stockDisponible > 0).length
  const expiringSoon = medications.filter((med) => {
    const expDate = new Date(med.fechaVencimiento)
    const today = new Date()
    const diffTime = expDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 30 && diffDays > 0
  }).length

  const vencimiento = selected?.fechaVencimiento
    ? new Date(selected.fechaVencimiento).toLocaleDateString()
    : '—'

  return (
    <div /* style={modernStyles.pageContainer} */>
      {/* Header Section Moderno */}
      <div style={modernStyles.headerSection}>
        <div style={modernStyles.headerOverlay}></div>
        <div style={modernStyles.headerContent}>
          <CRow className="align-items-center">
            <CCol lg={8}>
              <h1 style={modernStyles.headerTitle}>
                <Package className="me-3 mb-1" size={40} />
                Gestión de Medicamentos
              </h1>
              <p style={modernStyles.headerSubtitle}>
                Administra tu inventario farmacéutico de forma eficiente y profesional
              </p>
            </CCol>
            <CCol lg={4}>
              <div style={modernStyles.statsContainer}>
                <CRow>
                  <CCol xs={4}>
                    <div style={modernStyles.statItem}>
                      <span style={modernStyles.statNumber}>{totalMedications}</span>
                      <span style={modernStyles.statLabel}>Total</span>
                    </div>
                  </CCol>
                  <CCol xs={4}>
                    <div style={modernStyles.statItem}>
                      <span style={modernStyles.statNumber}>{availableMedications}</span>
                      <span style={modernStyles.statLabel}>Disponibles</span>
                    </div>
                  </CCol>
                  <CCol xs={4}>
                    <div style={modernStyles.statItem}>
                      <span style={modernStyles.statNumber}>{expiringSoon}</span>
                      <span style={modernStyles.statLabel}>Por vencer</span>
                    </div>
                  </CCol>
                </CRow>
              </div>
            </CCol>
          </CRow>
        </div>
      </div>

      {/* Search Section */}
      <div style={modernStyles.searchSection}>
        <div style={modernStyles.searchContainer}>
          <CRow className="align-items-center">
            <CCol lg={8}>
              <div className="position-relative">
                <Search
                  size={20}
                  className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
                  style={{ zIndex: 10 }}
                />
                <CFormInput
                  style={{ ...modernStyles.searchInput, paddingLeft: '3rem' }}
                  placeholder="Buscar medicamentos por nombre..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="shadow-sm"
                />
              </div>
            </CCol>
            <CCol lg={4} className="text-end">
              <CButton
                style={modernStyles.actionButton}
                onClick={() => openModal('create')}
                className="d-inline-flex align-items-center"
              >
                <Plus size={20} className="me-2" />
                Nuevo Medicamento
              </CButton>
            </CCol>
          </CRow>
        </div>
      </div>

      {/* Content Section */}
      {loading ? (
        <div style={modernStyles.loadingContainer}>
          <div className="text-center">
            <CSpinner color="primary" size="lg" className="mb-3" />
            <div className="h5 text-muted">Cargando medicamentos...</div>
          </div>
        </div>
      ) : currentData.length === 0 ? (
        <div style={modernStyles.emptyState}>
          <Package style={modernStyles.emptyIcon} />
          <h3 style={modernStyles.emptyTitle}>
            {search ? 'No se encontraron medicamentos' : 'No hay medicamentos registrados'}
          </h3>
          <p style={modernStyles.emptyText}>
            {search
              ? `No se encontraron medicamentos que coincidan con "${search}"`
              : 'Comienza agregando tu primer medicamento al inventario'}
          </p>
          {!search && (
            <CButton
              style={modernStyles.actionButton}
              onClick={() => openModal('create')}
              className="mt-3 d-inline-flex align-items-center"
            >
              <Plus size={18} className="me-2" />
              Agregar Primer Medicamento
            </CButton>
          )}
        </div>
      ) : (
        <div style={modernStyles.cardsContainer}>
          <CRow xs={{ cols: 1 }} md={{ cols: 2 }} xl={{ cols: 3 }} className="g-4">
            {currentData.map((med) => (
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
          <div className="mt-5 d-flex justify-content-center">
            <Pagination
              totalItems={filtered.length}
              currentPage={page}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          </div>
        </div>
      )}

      {/* Modal de Timeline */}
      <MedicationTimelineModal
        visible={modalVisible}
        setVisible={setModalVisible}
        mode={modalMode}
        data={selected}
        apiEndpoint={API_URL}
        onSuccess={fetchMedications}
      />

      {/* Modal de Detalle Mejorado */}
      <CModal
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
        size="lg"
        backdrop="static"
      >
        <CModalHeader style={modernStyles.modalHeader}>
          <CModalTitle className="text-white d-flex align-items-center">
            <Info size={24} className="me-2" />
            Información del Medicamento
          </CModalTitle>
        </CModalHeader>
        <CModalBody style={modernStyles.modalBody}>
          {selected && (
            <CCard style={modernStyles.detailCard}>
              <CCardBody className="p-4">
                <CRow>
                  <CCol md={5} className="mb-4 mb-md-0">
                    <div style={modernStyles.imageContainerStyle}>
                      <img src={imageUrl} alt={selected?.nombre} style={modernStyles.imageStyle} />
                    </div>
                    <div className="text-center">
                      <CBadge
                        color={selected.stockDisponible > 0 ? 'success' : 'danger'}
                        className="fs-6 px-4 py-2 rounded-pill"
                        style={{ fontSize: '1rem' }}
                      >
                        {selected.stockDisponible > 0 ? (
                          <>
                            <Activity size={16} className="me-2" />
                            Disponible
                          </>
                        ) : (
                          <>
                            <AlertCircle size={16} className="me-2" />
                            Agotado
                          </>
                        )}
                      </CBadge>
                    </div>
                  </CCol>
                  <CCol md={7}>
                    <CRow className="g-4">
                      <CCol xs={6}>
                        <span style={modernStyles.labelStyle}>Nombre</span>
                        <div style={modernStyles.valueStyle}>{selected.nombre}</div>
                      </CCol>
                      <CCol xs={6}>
                        <span style={modernStyles.labelStyle}>Código</span>
                        <div style={modernStyles.valueStyle}>{selected.codigo}</div>
                      </CCol>
                      <CCol xs={6}>
                        <span style={modernStyles.labelStyle}>Presentación</span>
                        <div style={modernStyles.valueStyle}>{selected.presentacion}</div>
                      </CCol>
                      <CCol xs={6}>
                        <span style={modernStyles.labelStyle}>Concentración</span>
                        <div style={modernStyles.valueStyle}>{selected.concentracion}</div>
                      </CCol>
                      <CCol xs={6}>
                        <span style={modernStyles.labelStyle}>Vía Administración</span>
                        <div style={modernStyles.valueStyle}>{selected.viaAdminist}</div>
                      </CCol>
                      <CCol xs={6}>
                        <span style={modernStyles.labelStyle}>Vencimiento</span>
                        <div style={modernStyles.valueStyle}>{vencimiento}</div>
                      </CCol>
                      <CCol xs={6}>
                        <span style={modernStyles.labelStyle}>Stock Disponible</span>
                        <div style={modernStyles.valueStyle}>
                          {selected.stockDisponible} unidades
                        </div>
                      </CCol>
                      <CCol xs={6}>
                        <span style={modernStyles.labelStyle}>Precio Venta</span>
                        <div style={modernStyles.valueStyle}>
                          ${selected.precioVenta?.toLocaleString() || '—'}
                        </div>
                      </CCol>
                      <CCol xs={12}>
                        <span style={modernStyles.labelStyle}>Precio Compra</span>
                        <div style={modernStyles.valueStyle}>
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
        <CModalFooter style={{ background: '#f8fafc', border: 'none' }}>
          <CButton color="secondary" onClick={() => setDetailVisible(false)} className="px-4 py-2">
            Cerrar
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}

export default VistaMedicamentos
