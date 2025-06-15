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
        return 'danger'
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
                              <small className='text-primary'>{diagnostico.patient?.nombrePaciente || 'N/A'}</small>
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
        <CModalHeader className="border-0 pb-0">
          <div className="d-flex align-items-center justify-content-between w-100">
            <div className="d-flex align-items-center">
              <div className="modal-icon-wrapper me-3">
                <CIcon icon={cilMedicalCross} size="lg" className="text-white" />
              </div>
              <div>
                <CModalTitle className="mb-1 fs-4 fw-bold text-dark">
                  Detalles del Diagnóstico Médico
                </CModalTitle>
                {selectedDiagnostic && (
                  <small className="text-muted">
                    ID: {selectedDiagnostic._id?.slice(-8) || 'N/A'}
                  </small>
                )}
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              {selectedDiagnostic?.prioridad && (
                <CBadge
                  color={getPriorityBadgeColor(selectedDiagnostic.prioridad)}
                  className="px-3 py-2 fs-6 fw-semibold priority-badge"
                >
                  {selectedDiagnostic.prioridad}
                </CBadge>
              )}
            </div>
          </div>
        </CModalHeader>

        <CModalBody className="px-4 py-3">
          {selectedDiagnostic && (
            <div>
              {/* Header Cards - Información Principal */}
              <CRow className="mb-4">
                <CCol lg={4} md={6} className="mb-3">
                  <CCard className="h-100 border-0 info-card">
                    <CCardBody className="p-3">
                      <div className="d-flex align-items-center mb-2">
                        <CIcon icon={cilUser} className="text-medical-primary me-2" />
                        <h6 className="text-medical-primary mb-0 fw-semibold">Paciente</h6>
                      </div>
                      <p className="fs-5 fw-bold mb-1 text-dark">
                        {selectedDiagnostic.patient?.nombrePaciente || 'N/A'}
                      </p>
                      <small className="text-muted">
                        <CIcon icon={cilCalendar} className="me-1" />
                        {formatDate(selectedDiagnostic.fecha)}
                      </small>
                    </CCardBody>
                  </CCard>
                </CCol>

                <CCol lg={4} md={6} className="mb-3">
                  <CCard className="h-100 border-0 info-card">
                    <CCardBody className="p-3">
                      <div className="d-flex align-items-center mb-2">
                        <CIcon icon={cilMedicalCross} className="text-medical-secondary me-2" />
                        <h6 className="text-medical-secondary mb-0 fw-semibold">Médico Tratante</h6>
                      </div>
                      <p className="fs-5 fw-bold mb-0 text-dark">
                        Dr.{' '}
                        {selectedDiagnostic.medico?.nombre ||
                          selectedDiagnostic.medicalId?.nombre ||
                          'N/A'}
                      </p>
                    </CCardBody>
                  </CCard>
                </CCol>

                <CCol lg={4} md={12} className="mb-3">
                  <CCard className="h-100 border-0 info-card">
                    <CCardBody className="p-3">
                      <div className="d-flex align-items-center mb-2">
                        <CIcon icon={cilNotes} className="text-medical-accent me-2" />
                        <h6 className="text-medical-accent mb-0 fw-semibold">Motivo de Consulta</h6>
                      </div>
                      <p className="mb-0 text-dark fw-medium">
                        {selectedDiagnostic.motivoConsulta}
                      </p>
                    </CCardBody>
                  </CCard>
                </CCol>
              </CRow>

              {/* Tabs Navigation */}
              <CNav variant="pills" className="mb-4 nav-pills-medical">
                <CNavItem>
                  <CNavLink
                    active={activeTab === 'diagnosticos'}
                    onClick={() => setActiveTab('diagnosticos')}
                    className="nav-link-medical"
                  >
                    <CIcon icon={cilClipboard} className="me-2" />
                    Diagnósticos
                  </CNavLink>
                </CNavItem>

                {(selectedDiagnostic.historia || selectedDiagnostic.evoClinica) && (
                  <CNavItem>
                    <CNavLink
                      active={activeTab === 'historia'}
                      onClick={() => setActiveTab('historia')}
                      className="nav-link-medical"
                    >
                      <CIcon icon={cilDescription} className="me-2" />
                      Historia Clínica
                    </CNavLink>
                  </CNavItem>
                )}

                {selectedDiagnostic.examenFisico && selectedDiagnostic.examenFisico.length > 0 && (
                  <CNavItem>
                    <CNavLink
                      active={activeTab === 'examen'}
                      onClick={() => setActiveTab('examen')}
                      className="nav-link-medical"
                    >
                      <CIcon icon={cilHeart} className="me-2" />
                      Examen Físico
                    </CNavLink>
                  </CNavItem>
                )}

                {selectedDiagnostic.medicamentos && selectedDiagnostic.medicamentos.length > 0 && (
                  <CNavItem>
                    <CNavLink
                      active={activeTab === 'medicamentos'}
                      onClick={() => setActiveTab('medicamentos')}
                      className="nav-link-medical"
                    >
                      <CIcon icon={cilMedicalCross} className="me-2" />
                      Prescripción
                    </CNavLink>
                  </CNavItem>
                )}

                {(selectedDiagnostic.planManejo || selectedDiagnostic.recomendaciones) && (
                  <CNavItem>
                    <CNavLink
                      active={activeTab === 'plan'}
                      onClick={() => setActiveTab('plan')}
                      className="nav-link-medical"
                    >
                      <CIcon icon={cilTask} className="me-2" />
                      Plan Terapéutico
                    </CNavLink>
                  </CNavItem>
                )}
              </CNav>

              {/* Tab Content */}
              <div className="tab-content-wrapper">
                {/* Diagnósticos Tab */}
                {activeTab === 'diagnosticos' && (
                  <CCard className="border-0 content-card">
                    <CCardBody className="p-4">
                      <div className="diagnosis-section">
                        <div className="mb-4">
                          <div className="d-flex align-items-center mb-3">
                            <div className="diagnosis-icon primary me-3">
                              <CIcon icon={cilClipboard} />
                            </div>
                            <h5 className="fw-bold text-medical-primary mb-0">
                              Diagnóstico Principal
                            </h5>
                          </div>
                          <div className="diagnosis-card primary">
                            <p className="fs-5 mb-0 fw-medium">
                              {selectedDiagnostic.diagPrincipal}
                            </p>
                          </div>
                        </div>

                        {selectedDiagnostic.diagSecundario &&
                          selectedDiagnostic.diagSecundario.length > 0 && (
                            <div>
                              <div className="d-flex align-items-center mb-3">
                                <div className="diagnosis-icon secondary me-3">
                                  <CIcon icon={cilList} />
                                </div>
                                <h5 className="fw-bold text-medical-secondary mb-0">
                                  Diagnósticos Secundarios
                                </h5>
                              </div>
                              <div className="secondary-diagnoses">
                                {selectedDiagnostic.diagSecundario.map((diag, idx) => (
                                  <div key={idx} className="diagnosis-card secondary mb-2">
                                    <p className="mb-0 fw-medium">{diag}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                    </CCardBody>
                  </CCard>
                )}

                {/* Historia Clínica Tab */}
                {activeTab === 'historia' && (
                  <CCard className="border-0 content-card">
                    <CCardBody className="p-4">
                      {selectedDiagnostic.historia && (
                        <div className="mb-4">
                          <h5 className="fw-bold text-medical-primary mb-3">
                            <CIcon icon={cilDescription} className="me-2" />
                            Historia Clínica
                          </h5>
                          <div className="content-box">
                            <p className="mb-0 lh-lg">{selectedDiagnostic.historia}</p>
                          </div>
                        </div>
                      )}

                      {selectedDiagnostic.evoClinica && (
                        <div>
                          <h5 className="fw-bold text-medical-secondary mb-3">
                            <CIcon icon={cilThumbUp} className="me-2" />
                            Evolución Clínica
                          </h5>
                          <div className="content-box">
                            <p className="mb-0 lh-lg">{selectedDiagnostic.evoClinica}</p>
                          </div>
                        </div>
                      )}
                    </CCardBody>
                  </CCard>
                )}

                {/* Examen Físico Tab */}
                {activeTab === 'examen' && selectedDiagnostic.examenFisico && (
                  <CCard className="border-0 content-card">
                    <CCardBody className="p-4">
                      <h5 className="fw-bold text-medical-primary mb-4">
                        <CIcon icon={cilHeart} className="me-2" />
                        Signos Vitales y Examen Físico
                      </h5>
                      {selectedDiagnostic.examenFisico.map((examen, idx) => (
                        <div key={idx} className="exam-section mb-4">
                          <div className="vital-signs-grid">
                            <div className="vital-sign-card">
                              <div className="vital-icon pressure">
                                <CIcon icon={cilSpeedometer} />
                              </div>
                              <div>
                                <small className="text-muted d-block">Presión Arterial</small>
                                <strong className="fs-5">{examen.presionArterial}</strong>
                              </div>
                            </div>

                            <div className="vital-sign-card">
                              <div className="vital-icon heart">
                                <CIcon icon={cilHeart} />
                              </div>
                              <div>
                                <small className="text-muted d-block">Frecuencia Cardíaca</small>
                                <strong className="fs-5">{examen.frecuenciaCardiaca}</strong>
                              </div>
                            </div>

                            <div className="vital-sign-card">
                              <div className="vital-icon respiratory">
                                <CIcon icon={cilMediaPlay} />
                              </div>
                              <div>
                                <small className="text-muted d-block">
                                  Frecuencia Respiratoria
                                </small>
                                <strong className="fs-5">{examen.frecuenciaRespiratoria}</strong>
                              </div>
                            </div>

                            <div className="vital-sign-card">
                              <div className="vital-icon temperature">
                                <span>°C</span>
                              </div>
                              <div>
                                <small className="text-muted d-block">Temperatura</small>
                                <strong className="fs-5">{examen.temperatura}</strong>
                              </div>
                            </div>
                          </div>

                          {examen.observaciones && (
                            <div className="mt-3">
                              <h6 className="fw-bold text-medical-secondary mb-2">
                                Observaciones Clínicas
                              </h6>
                              <div className="content-box">
                                <p className="mb-0">{examen.observaciones}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </CCardBody>
                  </CCard>
                )}

                {/* Medicamentos Tab */}
                {activeTab === 'medicamentos' && selectedDiagnostic.medicamentos && (
                  <CCard className="border-0 content-card">
                    <CCardBody className="p-4">
                      <h5 className="fw-bold text-medical-primary mb-4">
                        <CIcon icon={cilMedicalCross} className="me-2" />
                        Prescripción Médica
                      </h5>
                      <div className="medications-grid">
                        {selectedDiagnostic.medicamentos.map((medicamento, idx) => (
                          <div key={idx} className="medication-card">
                            <div className="medication-header">
                              <h6 className="fw-bold text-dark mb-1">
                                {medicamento.nombre || 'Medicamento no especificado'}
                              </h6>
                              {medicamento.codigo && (
                                <small className="text-muted">Código: {medicamento.codigo}</small>
                              )}
                            </div>
                            <div className="medication-details">
                              <div className="detail-item">
                                <CIcon icon={cilMedicalCross} className="detail-icon" />
                                <div>
                                  <small className="text-muted">Dosis</small>
                                  <p className="mb-0 fw-medium">{medicamento.dosis || 'N/A'}</p>
                                </div>
                              </div>
                              <div className="detail-item">
                                <CIcon icon={cilClock} className="detail-icon" />
                                <div>
                                  <small className="text-muted">Frecuencia</small>
                                  <p className="mb-0 fw-medium">
                                    {medicamento.frecuencia || 'N/A'}
                                  </p>
                                </div>
                              </div>
                              <div className="detail-item">
                                <CIcon icon={cilCalendar} className="detail-icon" />
                                <div>
                                  <small className="text-muted">Duración</small>
                                  <p className="mb-0 fw-medium">{medicamento.duracion || 'N/A'}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CCardBody>
                  </CCard>
                )}

                {/* Plan y Recomendaciones Tab */}
                {activeTab === 'plan' && (
                  <CCard className="border-0 content-card">
                    <CCardBody className="p-4">
                      {selectedDiagnostic.planManejo && (
                        <div className="mb-4">
                          <h5 className="fw-bold text-medical-primary mb-3">
                            <CIcon icon={cilTask} className="me-2" />
                            Plan de Tratamiento
                          </h5>
                          <div className="content-box">
                            <p className="mb-0 lh-lg">{selectedDiagnostic.planManejo}</p>
                          </div>
                        </div>
                      )}

                      {selectedDiagnostic.recomendaciones && (
                        <div className="mb-4">
                          <h5 className="fw-bold text-medical-secondary mb-3">
                            <CIcon icon={cilBullhorn} className="me-2" />
                            Recomendaciones Médicas
                          </h5>
                          <div className="content-box">
                            <p className="mb-0 lh-lg">{selectedDiagnostic.recomendaciones}</p>
                          </div>
                        </div>
                      )}

                      {selectedDiagnostic.observaciones && (
                        <div className="mb-4">
                          <h5 className="fw-bold text-medical-accent mb-3">
                            <CIcon icon={cilNotes} className="me-2" />
                            Observaciones Adicionales
                          </h5>
                          <div className="content-box">
                            <p className="mb-0 lh-lg">{selectedDiagnostic.observaciones}</p>
                          </div>
                        </div>
                      )}

                      {selectedDiagnostic.proximaCita && (
                        <div className="next-appointment">
                          <div className="d-flex align-items-center">
                            <div className="appointment-icon me-3">
                              <CIcon icon={cilCalendar} />
                            </div>
                            <div>
                              <h6 className="fw-bold text-medical-primary mb-1">
                                Próxima Cita Médica
                              </h6>
                              <p className="fs-5 fw-bold text-dark mb-0">
                                {formatDate(selectedDiagnostic.proximaCita)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </CCardBody>
                  </CCard>
                )}
              </div>
            </div>
          )}
        </CModalBody>

        <CModalFooter className="border-0 pt-0 bg-light">
          <div className="d-flex justify-content-between w-100 align-items-center">
            <div className="d-flex gap-2">
              {selectedDiagnostic && selectedDiagnostic._id && (
                <>
                  <CButton
                    color="primary"
                    variant="outline"
                    className="btn-medical"
                    onClick={() => {
                      console.log('Editar diagnóstico:', selectedDiagnostic._id)
                    }}
                  >
                    <CIcon icon={cilNotes} className="me-2" />
                    Editar
                  </CButton>
                  <CButton
                    color="secondary"
                    variant="outline"
                    className="btn-medical"
                    onClick={() => window.print()}
                  >
                    <CIcon icon={cilPrint} className="me-2" />
                    Imprimir
                  </CButton>
                  <CButton
                    color="info"
                    variant="outline"
                    className="btn-medical"
                    onClick={() => {
                      setShowModal(false)
                    }}
                  >
                    <CIcon icon={cilHistory} className="me-2" />
                    Historial
                  </CButton>
                </>
              )}
            </div>

            <CButton
              color="secondary"
              onClick={() => setShowModal(false)}
              className="btn-close-medical"
            >
              <CIcon icon={cilX} className="me-2" />
              Cerrar
            </CButton>
          </div>
        </CModalFooter>

        {/* Estilos CSS profesionales para hospital */}
        <style jsx>{`
          :root {
            --medical-primary: #2c5aa0;
            --medical-secondary: #34495e;
            --medical-accent: #5a67d8;
            --medical-success: #27ae60;
            --medical-info: #3498db;
            --medical-warning: #f39c12;
            --medical-danger: #e74c3c;
            --medical-light: #f8fafc;
            --medical-border: #e2e8f0;
            --medical-shadow: 0 2px 8px rgba(45, 90, 160, 0.1);
          }

          .diagnostic-modal .modal-icon-wrapper {
            width: 48px;
            height: 48px;
            background: var(--medical-primary);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .text-medical-primary {
            color: var(--medical-primary) !important;
          }
          .text-medical-secondary {
            color: var(--medical-secondary) !important;
          }
          .text-medical-accent {
            color: var(--medical-accent) !important;
          }

          .info-card {
            background: white;
            box-shadow: var(--medical-shadow);
            border: 1px solid var(--medical-border);
            border-radius: 8px;
            transition: all 0.2s ease;
          }

          .info-card:hover {
            box-shadow: 0 4px 12px rgba(45, 90, 160, 0.15);
          }

          .content-card {
            background: white;
            box-shadow: var(--medical-shadow);
            border: 1px solid var(--medical-border);
            border-radius: 8px;
          }

          .status-badge,
          .priority-badge {
            border-radius: 6px;
            font-size: 0.75rem;
            letter-spacing: 0.5px;
          }

          .nav-pills-medical .nav-link-medical {
            border-radius: 6px;
            padding: 0.6rem 1.2rem;
            margin-right: 0.5rem;
            border: 1px solid var(--medical-border);
            background: white;
            color: var(--medical-secondary);
            transition: all 0.2s ease;
            font-weight: 500;
          }

          .nav-pills-medical .nav-link-medical:hover {
            background: var(--medical-light);
            border-color: var(--medical-primary);
            color: var(--medical-primary);
          }

          .nav-pills-medical .nav-link-medical.active {
            background: var(--medical-primary);
            border-color: var(--medical-primary);
            color: white;
          }

          .diagnosis-icon {
            width: 40px;
            height: 40px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
          }

          .diagnosis-icon.primary {
            background: var(--medical-primary);
          }

          .diagnosis-icon.secondary {
            background: var(--medical-secondary);
          }

          .diagnosis-card {
            padding: 1.2rem 1.5rem;
            border-radius: 8px;
            border-left: 4px solid;
            background: white;
            border: 1px solid var(--medical-border);
            box-shadow: var(--medical-shadow);
            transition: all 0.2s ease;
          }

          .diagnosis-card:hover {
            box-shadow: 0 4px 12px rgba(45, 90, 160, 0.15);
          }

          .diagnosis-card.primary {
            border-left-color: var(--medical-primary);
          }

          .diagnosis-card.secondary {
            border-left-color: var(--medical-secondary);
          }

          .content-box {
            background: var(--medical-light);
            border-radius: 8px;
            padding: 1.5rem;
            border: 1px solid var(--medical-border);
            border-left: 4px solid var(--medical-primary);
          }

          .vital-signs-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 1rem;
            margin-bottom: 1rem;
          }

          .vital-sign-card {
            background: white;
            border-radius: 8px;
            padding: 1rem;
            display: flex;
            align-items: center;
            box-shadow: var(--medical-shadow);
            border: 1px solid var(--medical-border);
            transition: all 0.2s ease;
          }

          .vital-sign-card:hover {
            box-shadow: 0 4px 12px rgba(45, 90, 160, 0.15);
          }

          .vital-icon {
            width: 40px;
            height: 40px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 1rem;
            color: white;
            font-weight: bold;
            font-size: 0.9rem;
          }

          .vital-icon.pressure {
            background: var(--medical-danger);
          }
          .vital-icon.heart {
            background: var(--medical-primary);
          }
          .vital-icon.respiratory {
            background: var(--medical-info);
          }
          .vital-icon.temperature {
            background: var(--medical-warning);
          }

          .medications-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1rem;
          }

          .medication-card {
            background: white;
            border-radius: 8px;
            padding: 1.5rem;
            box-shadow: var(--medical-shadow);
            border: 1px solid var(--medical-border);
            transition: all 0.2s ease;
          }

          .medication-card:hover {
            box-shadow: 0 4px 12px rgba(45, 90, 160, 0.15);
          }

          .medication-header {
            border-bottom: 1px solid var(--medical-border);
            padding-bottom: 0.75rem;
            margin-bottom: 1rem;
          }

          .medication-details {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
          }

          .detail-item {
            display: flex;
            align-items: center;
          }

          .detail-icon {
            margin-right: 0.75rem;
            color: var(--medical-primary);
          }

          .next-appointment {
            background: var(--medical-light);
            border-radius: 8px;
            padding: 1.5rem;
            border: 1px solid var(--medical-border);
          }

          .appointment-icon {
            width: 48px;
            height: 48px;
            background: var(--medical-primary);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
          }

          .btn-medical {
            border-radius: 6px;
            padding: 0.5rem 1rem;
            font-weight: 500;
            transition: all 0.2s ease;
            border-width: 1px;
          }

          .btn-medical:hover {
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
          }

          .btn-close-medical {
            border-radius: 6px;
            padding: 0.5rem 1.5rem;
            font-weight: 500;
            background: var(--medical-secondary);
            border-color: var(--medical-secondary);
            color: white;
          }

          .btn-close-medical:hover {
            background: #2c3e50;
            border-color: #2c3e50;
          }

          .tab-content-wrapper {
            min-height: 300px;
          }

          @media (max-width: 768px) {
            .vital-signs-grid {
              grid-template-columns: 1fr;
            }

            .medications-grid {
              grid-template-columns: 1fr;
            }

            .nav-pills-medical {
              flex-wrap: wrap;
            }

            .nav-pills-medical .nav-link-medical {
              margin-bottom: 0.5rem;
              font-size: 0.875rem;
              padding: 0.5rem 1rem;
            }
          }

          @media print {
            .modal-icon-wrapper,
            .btn-medical,
            .btn-close-medical,
            .nav-pills-medical {
              display: none !important;
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
    </div>
  )
}

export default VistaDiagnosticos
