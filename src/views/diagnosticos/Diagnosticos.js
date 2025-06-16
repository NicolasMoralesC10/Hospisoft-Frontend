import React, { useState, useEffect, useMemo } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CInputGroup,
  CFormInput,
  CButton,
  CBadge,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CSpinner,
  CAlert,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CPagination,
  CPaginationItem,
  CFormSelect,
  CButtonGroup,
  CNav,
  CNavItem,
  CNavLink,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilSearch,
  cilEyedropper,
  cilUser,
  cilCalendar,
  cilMedicalCross,
  cilHeart,
  cilNotes,
  cilPlus,
  cilFilter,
  cilSortAlphaDown,
  cilSortAlphaUp,
  cilX,
  cilClipboard,
  cilDescription,
  cilList,
  cilPrint,
  cilHistory,
  cilThumbUp,
  cilSpeedometer,
  cilMediaPlay,
  cilClock,
} from '@coreui/icons'
import { apiFetch } from '../../helpers/apiFetch.js'
import DiagnosticTimelineModal from './components/DiagnosticTimelineModal.jsx'

const VistaDiagnosticos = () => {
  // Estados para la funcionalidad
  const [documento, setDocumento] = useState('')
  const [diagnosticos, setDiagnosticos] = useState([])
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedDiagnostic, setSelectedDiagnostic] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [activeTab, setActiveTab] = useState('diagnosticos')

  // Estados para filtros y paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [filters, setFilters] = useState({
    status: '',
    prioridad: '',
    medico: '',
    fechaDesde: '',
    fechaHasta: '',
  })
  const [sortConfig, setSortConfig] = useState({
    key: 'prioridad',
    direction: 'desc',
  })

  // URL de la API para diagnósticos
  const API_URL = 'http://127.0.0.1:3000/api/diagnostico'

  // Función para obtener valor numérico de prioridad para ordenamiento
  const getPriorityValue = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'alta':
        return 3
      case 'media':
        return 2
      case 'baja':
        return 1
      default:
        return 0
    }
  }

  // Función para filtrar y ordenar diagnósticos
  const filteredAndSortedDiagnostics = useMemo(() => {
    let filtered = [...diagnosticos]

    // Aplicar filtros
    if (filters.status) {
      // CAMBIO: El status viene como "1", "0", etc. Mapearlo correctamente
      const statusMap = {
        activo: '1',
        inactivo: '0',
        'en seguimiento': '2',
        'en tratamiento': '3',
        resuelto: '4',
        completado: '5',
      }
      const statusValue = statusMap[filters.status.toLowerCase()] || filters.status
      filtered = filtered.filter((d) => d.status === statusValue)
    }

    if (filters.prioridad) {
      filtered = filtered.filter(
        (d) => d.prioridad?.toLowerCase() === filters.prioridad.toLowerCase(),
      )
    }

    if (filters.medico) {
      // CAMBIO: Ahora usar medico.nombre que viene populado
      filtered = filtered.filter((d) =>
        d.medico?.nombre?.toLowerCase().includes(filters.medico.toLowerCase()),
      )
    }

    if (filters.fechaDesde) {
      filtered = filtered.filter((d) => new Date(d.fecha) >= new Date(filters.fechaDesde))
    }

    if (filters.fechaHasta) {
      filtered = filtered.filter((d) => new Date(d.fecha) <= new Date(filters.fechaHasta))
    }

    // Aplicar ordenamiento
    filtered.sort((a, b) => {
      let aValue, bValue

      switch (sortConfig.key) {
        case 'prioridad':
          aValue = getPriorityValue(a.prioridad)
          bValue = getPriorityValue(b.prioridad)
          break
        case 'fecha':
          aValue = new Date(a.fecha)
          bValue = new Date(b.fecha)
          break
        case 'status':
          aValue = a.status || ''
          bValue = b.status || ''
          break
        case 'medico':
          // CAMBIO: Usar medico.nombre que viene populado
          aValue = a.medico?.nombre || ''
          bValue = b.medico?.nombre || ''
          break
        default:
          aValue = a[sortConfig.key] || ''
          bValue = b[sortConfig.key] || ''
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })

    return filtered
  }, [diagnosticos, filters, sortConfig])

  // Calcular paginación
  const totalItems = filteredAndSortedDiagnostics.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = filteredAndSortedDiagnostics.slice(startIndex, endIndex)

  const handleEditDiagnostic = (diagnostic) => {
    setSelectedDiagnostic(diagnostic)
    setShowEditModal(true)
    setShowModal(false)
  }

  // Función para buscar diagnósticos por documento
  const handleSearch = async () => {
    if (!documento.trim()) {
      setError('Por favor ingrese un número de documento')
      return
    }

    setIsLoading(true)
    setError('')
    setHasSearched(true)
    setCurrentPage(1)

    try {
      const response = await apiFetch(`${API_URL}/list/${documento}`)

      // CAMBIO: Verificar la estructura correcta de la respuesta
      if (response && response.estado === false) {
        setDiagnosticos([])
        setError(response.mensaje || 'El paciente no existe en el sistema')
        return
      }

      // CAMBIO: Acceder correctamente a los datos
      const data = response?.data || response
      setDiagnosticos(Array.isArray(data) ? data : [])

      if (Array.isArray(data) && data.length === 0) {
        setError('No se encontraron diagnósticos para este documento')
      }
    } catch (err) {
      console.error('Error:', err)
      setError(err.message || 'Error al conectar con el servidor')
      setDiagnosticos([])
    } finally {
      setIsLoading(false)
    }
  }

  // Función para manejar cambios en filtros
  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }))
    setCurrentPage(1) // Resetear página cuando cambie filtro
  }

  // Función para limpiar filtros
  const clearFilters = () => {
    setFilters({
      status: '',
      prioridad: '',
      medico: '',
      fechaDesde: '',
      fechaHasta: '',
    })
    setCurrentPage(1)
  }

  // Función para manejar ordenamiento
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  // Función para obtener el color del badge según el estado
  const getStatusBadgeColor = (status) => {
    // CAMBIO: Mapear status numérico a texto
    const statusMap = {
      1: 'activo',
      0: 'inactivo',
      2: 'en seguimiento',
      3: 'en tratamiento',
      4: 'resuelto',
      5: 'completado',
    }

    const statusText = statusMap[status] || status

    switch (statusText?.toLowerCase()) {
      case 'activo':
        return 'success'
      case 'en seguimiento':
        return 'warning'
      case 'en tratamiento':
        return 'info'
      case 'resuelto':
        return 'success'
      case 'completado':
        return 'success'
      default:
        return 'secondary'
    }
  }
  const getStatusText = (status) => {
    const statusMap = {
      1: 'Activo',
      0: 'Inactivo',
      2: 'En Seguimiento',
      3: 'En Tratamiento',
      4: 'Resuelto',
      5: 'Completado',
    }
    return statusMap[status] || status
  }

  // Función para obtener el color del badge según la prioridad
  const getPriorityBadgeColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'alta':
        return 'danger'
      case 'media':
        return 'warning'
      case 'baja':
        return 'success'
      default:
        return 'secondary'
    }
  }

  // Función para ver detalles del diagnóstico
  const handleViewDetails = (diagnostic) => {
    setSelectedDiagnostic(diagnostic)
    setShowModal(true)
  }

  // Función para abrir modal de crear diagnóstico
  const handleCreateDiagnostic = () => {
    setShowCreateModal(true)
  }

  // Función para refrescar la lista después de crear/editar
  const handleRefreshList = () => {
    if (documento.trim()) {
      handleSearch()
    }
  }

  // Función para formatear fecha
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // Función para manejar Enter en el input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  // Función para generar páginas de paginación
  const generatePaginationItems = () => {
    const items = []
    const maxVisiblePages = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <CPaginationItem key={i} active={i === currentPage} onClick={() => setCurrentPage(i)}>
          {i}
        </CPaginationItem>,
      )
    }
    return items
  }

  return (
    <div>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h4 className="mb-0">
                    <CIcon icon={cilMedicalCross} className="me-2" />
                    Consulta de Diagnósticos
                  </h4>
                  <small className="text-muted">
                    Busque los diagnósticos de un paciente por su número de documento
                  </small>
                </div>
                <div className="d-flex align-items-center gap-2">
                  {totalItems > 0 && (
                    <CBadge color="info">
                      {totalItems} diagnóstico{totalItems !== 1 ? 's' : ''}
                      {totalItems !== diagnosticos.length && ` (de ${diagnosticos.length})`}
                    </CBadge>
                  )}
                  <CButton
                    color="primary"
                    onClick={handleCreateDiagnostic}
                    className="d-flex align-items-center"
                  >
                    <CIcon icon={cilPlus} className="me-1" />
                    Nuevo Diagnóstico
                  </CButton>
                </div>
              </div>
            </CCardHeader>
            <CCardBody>
              {/* Buscador por documento */}
              <CRow className="mb-4">
                <CCol md={12}>
                  <CInputGroup>
                    <CFormInput
                      placeholder="Ingrese el número de documento del paciente..."
                      value={documento}
                      onChange={(e) => setDocumento(e.target.value)}
                      onKeyPress={handleKeyPress}
                    />
                    <CButton color="primary" onClick={handleSearch} disabled={isLoading}>
                      {isLoading ? (
                        <CSpinner size="sm" className="me-1" />
                      ) : (
                        <CIcon icon={cilSearch} className="me-1" />
                      )}
                      Buscar
                    </CButton>
                  </CInputGroup>
                </CCol>
              </CRow>

              {/* Filtros */}
              {diagnosticos.length > 0 && (
                <CCard className="mb-4">
                  <CCardHeader className="py-2">
                    <div className="d-flex justify-content-between align-items-center">
                      <h6 className="mb-0">
                        <CIcon icon={cilFilter} className="me-2" />
                        Filtros
                      </h6>
                      <CButton color="outline-secondary" size="sm" onClick={clearFilters}>
                        Limpiar Filtros
                      </CButton>
                    </div>
                  </CCardHeader>
                  <CCardBody className="py-3">
                    <CRow>
                      <CCol md={2}>
                        <CFormSelect
                          size="sm"
                          value={filters.prioridad}
                          onChange={(e) => handleFilterChange('prioridad', e.target.value)}
                        >
                          <option value="">Todas las prioridades</option>
                          <option value="alta">Alta</option>
                          <option value="media">Media</option>
                          <option value="baja">Baja</option>
                        </CFormSelect>
                      </CCol>
                      <CCol md={2}>
                        <CFormSelect
                          size="sm"
                          value={filters.status}
                          onChange={(e) => handleFilterChange('status', e.target.value)}
                        >
                          <option value="">Todos los estados</option>
                          <option value="activo">Activo</option>
                          <option value="en seguimiento">En Seguimiento</option>
                          <option value="en tratamiento">En Tratamiento</option>
                          <option value="resuelto">Resuelto</option>
                          <option value="completado">Completado</option>
                        </CFormSelect>
                      </CCol>
                      <CCol md={2}>
                        <CFormInput
                          size="sm"
                          placeholder="Buscar médico..."
                          value={filters.medico}
                          onChange={(e) => handleFilterChange('medico', e.target.value)}
                        />
                      </CCol>
                      <CCol md={2}>
                        <CFormInput
                          size="sm"
                          type="date"
                          placeholder="Fecha desde"
                          value={filters.fechaDesde}
                          onChange={(e) => handleFilterChange('fechaDesde', e.target.value)}
                        />
                      </CCol>
                      <CCol md={2}>
                        <CFormInput
                          size="sm"
                          type="date"
                          placeholder="Fecha hasta"
                          value={filters.fechaHasta}
                          onChange={(e) => handleFilterChange('fechaHasta', e.target.value)}
                        />
                      </CCol>
                      <CCol md={2}>
                        <CFormSelect
                          size="sm"
                          value={itemsPerPage}
                          onChange={(e) => {
                            setItemsPerPage(Number(e.target.value))
                            setCurrentPage(1)
                          }}
                        >
                          <option value={5}>5 por página</option>
                          <option value={10}>10 por página</option>
                          <option value={25}>25 por página</option>
                          <option value={50}>50 por página</option>
                        </CFormSelect>
                      </CCol>
                    </CRow>
                  </CCardBody>
                </CCard>
              )}

              {/* Mensajes de error */}
              {error && (
                <CAlert color="danger" className="mb-4">
                  {error}
                </CAlert>
              )}

              {/* Loading */}
              {isLoading && (
                <div className="text-center py-4">
                  <CSpinner color="primary" />
                  <p className="mt-2">Buscando diagnósticos...</p>
                </div>
              )}

              {/* Tabla de diagnósticos */}
              {!isLoading && currentItems.length > 0 && (
                <>
                  <CTable responsive striped hover>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell
                          scope="col"
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleSort('prioridad')}
                        >
                          Prioridad
                          <CIcon
                            icon={
                              sortConfig.key === 'prioridad' && sortConfig.direction === 'asc'
                                ? cilSortAlphaUp
                                : cilSortAlphaDown
                            }
                            className="ms-1"
                            size="sm"
                          />
                        </CTableHeaderCell>
                        <CTableHeaderCell
                          scope="col"
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleSort('fecha')}
                        >
                          Fecha
                          <CIcon
                            icon={
                              sortConfig.key === 'fecha' && sortConfig.direction === 'asc'
                                ? cilSortAlphaUp
                                : cilSortAlphaDown
                            }
                            className="ms-1"
                            size="sm"
                          />
                        </CTableHeaderCell>
                        <CTableHeaderCell scope="col">Paciente</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Motivo de Consulta</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Diagnóstico Principal</CTableHeaderCell>
                        <CTableHeaderCell
                          scope="col"
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleSort('status')}
                        >
                          Estado
                          <CIcon
                            icon={
                              sortConfig.key === 'status' && sortConfig.direction === 'asc'
                                ? cilSortAlphaUp
                                : cilSortAlphaDown
                            }
                            className="ms-1"
                            size="sm"
                          />
                        </CTableHeaderCell>
                        <CTableHeaderCell
                          scope="col"
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleSort('medico')}
                        >
                          Médico
                          <CIcon
                            icon={
                              sortConfig.key === 'medico' && sortConfig.direction === 'asc'
                                ? cilSortAlphaUp
                                : cilSortAlphaDown
                            }
                            className="ms-1"
                            size="sm"
                          />
                        </CTableHeaderCell>
                        <CTableHeaderCell scope="col">Medicamentos</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Acciones</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {currentItems.map((diagnostico, index) => (
                        <CTableRow key={diagnostico._id || index}>
                          <CTableDataCell>
                            <CBadge color={getPriorityBadgeColor(diagnostico.prioridad)}>
                              {diagnostico.prioridad || 'N/A'}
                            </CBadge>
                          </CTableDataCell>
                          <CTableDataCell>
                            <small>{formatDate(diagnostico.fecha)}</small>
                          </CTableDataCell>
                          <CTableDataCell>
                            <div>
                              <small className="text-primary">
                                {diagnostico.patient?.nombrePaciente || 'N/A'}
                              </small>
                            </div>
                          </CTableDataCell>
                          <CTableDataCell>
                            <div style={{ maxWidth: '200px' }}>
                              <small>{diagnostico.motivoConsulta}</small>
                            </div>
                          </CTableDataCell>
                          <CTableDataCell>
                            <div style={{ maxWidth: '200px' }}>
                              <small>{diagnostico.diagPrincipal}</small>
                            </div>
                          </CTableDataCell>
                          <CTableDataCell>
                            <CBadge color={getStatusBadgeColor(diagnostico.status)}>
                              {getStatusText(diagnostico.status)}
                            </CBadge>
                          </CTableDataCell>
                          <CTableDataCell>
                            <small>Dr. {diagnostico.medico?.nombre || 'N/A'}</small>
                          </CTableDataCell>
                          <CTableDataCell>
                            {diagnostico.medicamentos && diagnostico.medicamentos.length > 0 && (
                              <CBadge color="info">{diagnostico.medicamentos.length}</CBadge>
                            )}
                          </CTableDataCell>
                          <CTableDataCell>
                            <CButton
                              color="primary"
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(diagnostico)}
                            >
                              <CIcon icon={cilEyedropper} className="me-1" />
                              Ver
                            </CButton>
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>

                  {/* Paginación */}
                  {totalPages > 1 && (
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <div>
                        <small className="text-muted">
                          Mostrando {startIndex + 1} a {Math.min(endIndex, totalItems)} de{' '}
                          {totalItems} registros
                        </small>
                      </div>
                      <CPagination>
                        <CPaginationItem
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(1)}
                        >
                          Primera
                        </CPaginationItem>
                        <CPaginationItem
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(currentPage - 1)}
                        >
                          Anterior
                        </CPaginationItem>
                        {generatePaginationItems()}
                        <CPaginationItem
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(currentPage + 1)}
                        >
                          Siguiente
                        </CPaginationItem>
                        <CPaginationItem
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(totalPages)}
                        >
                          Última
                        </CPaginationItem>
                      </CPagination>
                    </div>
                  )}
                </>
              )}

              {/* Mensaje cuando no hay diagnósticos después del filtrado */}
              {!isLoading &&
                hasSearched &&
                diagnosticos.length > 0 &&
                currentItems.length === 0 && (
                  <div className="text-center py-4">
                    <CIcon icon={cilFilter} size="xl" className="mb-2 text-muted" />
                    <p className="text-muted">
                      No se encontraron diagnósticos con los filtros aplicados
                    </p>
                    <CButton color="outline-secondary" onClick={clearFilters}>
                      Limpiar Filtros
                    </CButton>
                  </div>
                )}

              {/* Mensaje cuando no hay diagnósticos y ya se buscó */}
              {!isLoading && hasSearched && diagnosticos.length === 0 && !error && (
                <div className="text-center py-4">
                  <CIcon icon={cilUser} size="xl" className="mb-2 text-muted" />
                  <p className="text-muted">No se encontraron diagnósticos para este documento</p>
                </div>
              )}

              {/* Mensaje inicial */}
              {!hasSearched && !isLoading && (
                <div className="text-center py-4">
                  <CIcon icon={cilSearch} size="xl" className="mb-2 text-muted" />
                  <p className="text-muted">
                    Ingrese un número de documento para buscar diagnósticos
                  </p>
                </div>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Modal de detalles del diagnóstico */}
      <CModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        size="xl"
        className="diagnostic-modal"
      >
        <CModalHeader className="border-bottom">
          <div className="d-flex align-items-center justify-content-between w-100">
            <div className="d-flex align-items-center">
              <div className="modal-icon me-3">
                <CIcon icon={cilMedicalCross} size="lg" />
              </div>
              <div>
                <CModalTitle className="h4 mb-1 text-dark fw-bold">
                  Registro Médico - Diagnóstico
                </CModalTitle>
                {selectedDiagnostic && (
                  <small className="text-muted">
                    Expediente: {selectedDiagnostic._id?.slice(-8) || 'N/A'}
                  </small>
                )}
              </div>
            </div>
            {selectedDiagnostic?.prioridad && (
              <CBadge
                color={getPriorityBadgeColor(selectedDiagnostic.prioridad)}
                className="priority-badge"
              >
                {selectedDiagnostic.prioridad}
              </CBadge>
            )}
          </div>
        </CModalHeader>

        <CModalBody className="p-4">
          {selectedDiagnostic && (
            <div>
              {/* Información del Paciente */}
              <div className="patient-info mb-4">
                <CRow>
                  <CCol md={4}>
                    <div className="info-item">
                      <label className="info-label">Paciente</label>
                      <p className="info-value">
                        {selectedDiagnostic.patient?.nombrePaciente || 'N/A'}
                      </p>
                    </div>
                  </CCol>
                  <CCol md={4}>
                    <div className="info-item">
                      <label className="info-label">Médico Tratante</label>
                      <p className="info-value">
                        Dr.{' '}
                        {selectedDiagnostic.medico?.nombre ||
                          selectedDiagnostic.medicalId?.nombre ||
                          'N/A'}
                      </p>
                    </div>
                  </CCol>
                  <CCol md={4}>
                    <div className="info-item">
                      <label className="info-label">Fecha</label>
                      <p className="info-value">{formatDate(selectedDiagnostic.fecha)}</p>
                    </div>
                  </CCol>
                </CRow>
              </div>

              {/* Diagnósticos */}
              <div className="section mb-4">
                <h5 className="section-title">Diagnósticos</h5>
                <div className="section-content">
                  <div className="diagnosis-item primary">
                    <strong>Principal:</strong> {selectedDiagnostic.diagPrincipal}
                  </div>
                  {selectedDiagnostic.diagSecundario?.length > 0 && (
                    <div className="mt-2">
                      <strong>Secundarios:</strong>
                      <ul className="diagnosis-list">
                        {selectedDiagnostic.diagSecundario.map((diag, idx) => (
                          <li key={idx}>{diag}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Motivo de Consulta */}
              <div className="section mb-4">
                <h5 className="section-title">Motivo de Consulta</h5>
                <div className="section-content">
                  <p>{selectedDiagnostic.motivoConsulta}</p>
                </div>
              </div>

              {/* Historia Clínica */}
              {(selectedDiagnostic.historia || selectedDiagnostic.evoClinica) && (
                <div className="section mb-4">
                  <h5 className="section-title">Historia Clínica</h5>
                  <div className="section-content">
                    {selectedDiagnostic.historia && (
                      <div className="mb-3">
                        <h6 className="subsection-title">Antecedentes</h6>
                        <p>{selectedDiagnostic.historia}</p>
                      </div>
                    )}
                    {selectedDiagnostic.evoClinica && (
                      <div>
                        <h6 className="subsection-title">Evolución</h6>
                        <p>{selectedDiagnostic.evoClinica}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Examen Físico */}
              {selectedDiagnostic.examenFisico?.length > 0 && (
                <div className="section mb-4">
                  <h5 className="section-title">Examen Físico</h5>
                  <div className="section-content">
                    {selectedDiagnostic.examenFisico.map((examen, idx) => (
                      <div key={idx}>
                        <div className="vitals-grid mb-3">
                          <div className="vital-item">
                            <span className="vital-label">PA:</span>
                            <span className="vital-value">{examen.presionArterial}</span>
                          </div>
                          <div className="vital-item">
                            <span className="vital-label">FC:</span>
                            <span className="vital-value">{examen.frecuenciaCardiaca}</span>
                          </div>
                          <div className="vital-item">
                            <span className="vital-label">FR:</span>
                            <span className="vital-value">{examen.frecuenciaRespiratoria}</span>
                          </div>
                          <div className="vital-item">
                            <span className="vital-label">T°:</span>
                            <span className="vital-value">{examen.temperatura}</span>
                          </div>
                        </div>
                        {examen.observaciones && (
                          <div>
                            <h6 className="subsection-title">Observaciones</h6>
                            <p>{examen.observaciones}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Prescripción */}
              {selectedDiagnostic.medicamentos?.length > 0 && (
                <div className="section mb-4">
                  <h5 className="section-title">Prescripción Médica</h5>
                  <div className="section-content">
                    <div className="medications-list">
                      {selectedDiagnostic.medicamentos.map((med, idx) => (
                        <div key={idx} className="medication-item">
                          <div className="med-name">
                            {med.nombre || 'Medicamento no especificado'}
                          </div>
                          <div className="med-details">
                            <span>Dosis: {med.dosis || 'N/A'}</span> |
                            <span> Frecuencia: {med.frecuencia || 'N/A'}</span> |
                            <span> Duración: {med.duracion || 'N/A'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Plan de Tratamiento */}
              {(selectedDiagnostic.planManejo || selectedDiagnostic.recomendaciones) && (
                <div className="section mb-4">
                  <h5 className="section-title">Plan de Tratamiento</h5>
                  <div className="section-content">
                    {selectedDiagnostic.planManejo && (
                      <div className="mb-3">
                        <h6 className="subsection-title">Plan de Manejo</h6>
                        <p>{selectedDiagnostic.planManejo}</p>
                      </div>
                    )}
                    {selectedDiagnostic.recomendaciones && (
                      <div>
                        <h6 className="subsection-title">Recomendaciones</h6>
                        <p>{selectedDiagnostic.recomendaciones}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Próxima Cita */}
              {selectedDiagnostic.proximaCita && (
                <div className="section mb-4">
                  <h5 className="section-title">Seguimiento</h5>
                  <div className="section-content">
                    <p>
                      <strong>Próxima cita:</strong> {formatDate(selectedDiagnostic.proximaCita)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CModalBody>

        <CModalFooter className="border-top bg-light">
          <div className="d-flex justify-content-between w-100">
            <div className="d-flex gap-2">
              <CButton
                color="primary"
                variant="outline"
                onClick={() => handleEditDiagnostic(selectedDiagnostic)}
              >
                <CIcon icon={cilNotes} className="me-1" />
                Editar
              </CButton>
              <CButton color="secondary" variant="outline" onClick={() => window.print()}>
                <CIcon icon={cilPrint} className="me-1" />
                Imprimir
              </CButton>
            </div>
            <CButton color="secondary" onClick={() => setShowModal(false)}>
              Cerrar
            </CButton>
          </div>
        </CModalFooter>

        {/* Estilos CSS Profesionales */}
        <style jsx>{`
          .diagnostic-modal {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          }

          .modal-icon {
            width: 40px;
            height: 40px;
            background: #2c5aa0;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
          }

          .priority-badge {
            font-size: 0.75rem;
            font-weight: 600;
            padding: 0.4rem 0.8rem;
            border-radius: 4px;
          }

          .patient-info {
            background: #f8f9fa;
            border-radius: 6px;
            padding: 1.5rem;
            border-left: 4px solid #2c5aa0;
          }

          .info-item {
            margin-bottom: 0.5rem;
          }

          .info-label {
            display: block;
            font-size: 0.875rem;
            color: #6c757d;
            font-weight: 500;
            margin-bottom: 0.25rem;
          }

          .info-value {
            font-size: 1rem;
            color: #212529;
            font-weight: 600;
            margin: 0;
          }

          .section {
            border-bottom: 1px solid #e9ecef;
            padding-bottom: 1rem;
          }

          .section:last-child {
            border-bottom: none;
          }

          .section-title {
            color: #2c5aa0;
            font-size: 1.1rem;
            font-weight: 700;
            margin-bottom: 0.75rem;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid #e9ecef;
          }

          .subsection-title {
            color: #495057;
            font-size: 0.95rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
          }

          .section-content {
            color: #495057;
            line-height: 1.6;
          }

          .diagnosis-item.primary {
            background: #e3f2fd;
            padding: 0.75rem;
            border-radius: 4px;
            border-left: 4px solid #2c5aa0;
          }

          .diagnosis-list {
            margin: 0.5rem 0 0 1rem;
            padding: 0;
          }

          .vitals-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 1rem;
            background: #f8f9fa;
            padding: 1rem;
            border-radius: 4px;
          }

          .vital-item {
            text-align: center;
          }

          .vital-label {
            display: block;
            font-size: 0.8rem;
            color: #6c757d;
            font-weight: 600;
          }

          .vital-value {
            display: block;
            font-size: 1.1rem;
            color: #212529;
            font-weight: 700;
          }

          .medications-list {
            background: #f8f9fa;
            border-radius: 4px;
            padding: 1rem;
          }

          .medication-item {
            padding: 0.75rem 0;
            border-bottom: 1px solid #e9ecef;
          }

          .medication-item:last-child {
            border-bottom: none;
          }

          .med-name {
            font-weight: 600;
            color: #212529;
            margin-bottom: 0.25rem;
          }

          .med-details {
            font-size: 0.875rem;
            color: #6c757d;
          }

          .med-details span {
            margin-right: 0.5rem;
          }

          @media (max-width: 768px) {
            .vitals-grid {
              grid-template-columns: repeat(2, 1fr);
            }

            .patient-info {
              padding: 1rem;
            }
          }

          @media print {
            .modal-icon,
            .btn,
            .modal-footer {
              display: none !important;
            }

            .section-title {
              color: #000 !important;
            }
          }
        `}</style>
      </CModal>
      {/* Modal para crear nuevo diagnóstico */}
      {showCreateModal && (
        <DiagnosticTimelineModal
          visible={showCreateModal}
          setVisible={setShowCreateModal}
          mode="create"
          data={null}
          apiEndpoint={API_URL}
          onSuccess={handleRefreshList}
          patientDocument={documento}
        />
      )}
      {/* Modal para editar diagnóstico */}
      {showEditModal && selectedDiagnostic && (
        <DiagnosticTimelineModal
          visible={showEditModal}
          setVisible={setShowEditModal}
          mode="edit"
          data={selectedDiagnostic}
          apiEndpoint={API_URL}
          onSuccess={handleRefreshList}
          patientDocument={documento}
        />
      )}
    </div>
  )
}

export default VistaDiagnosticos
