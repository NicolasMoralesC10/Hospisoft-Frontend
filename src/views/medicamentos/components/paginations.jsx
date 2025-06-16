// components/Pagination.jsx - Versión moderna y profesional
import React from 'react'
import { CButton, CButtonGroup } from '@coreui/react'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from 'lucide-react'

const modernPaginationStyles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    padding: '2rem 1rem',
    background: 'white',
    borderRadius: '1rem',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    border: '1px solid rgba(226, 232, 240, 0.8)',
    flexWrap: 'wrap',
  },
  buttonBase: {
    border: '1px solid #e2e8f0',
    borderRadius: '0.5rem',
    padding: '0.5rem 0.75rem',
    minWidth: '2.5rem',
    height: '2.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    background: 'white',
    color: '#475569',
  },
  activeButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: '1px solid transparent',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
    transform: 'translateY(-1px)',
  },
  hoverButton: {
    background: '#f1f5f9',
    borderColor: '#cbd5e1',
    transform: 'translateY(-1px)',
  },
  disabledButton: {
    background: '#f8fafc',
    color: '#cbd5e1',
    cursor: 'not-allowed',
    border: '1px solid #f1f5f9',
  },
  navButton: {
    padding: '0.5rem 1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  info: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    fontSize: '0.875rem',
    color: '#64748b',
    fontWeight: '500',
  },
  infoLabel: {
    background: '#f1f5f9',
    padding: '0.375rem 0.75rem',
    borderRadius: '0.5rem',
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#475569',
  },
  separator: {
    width: '1px',
    height: '1.5rem',
    background: '#e2e8f0',
    margin: '0 0.5rem',
  },
  mobileInfo: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    marginTop: '1rem',
    fontSize: '0.8rem',
    color: '#64748b',
  },
}

const Pagination = ({ totalItems, currentPage, pageSize, onPageChange, showInfo = true }) => {
  const totalPages = Math.ceil(totalItems / pageSize)

  // No mostrar paginación si hay una página o menos
  if (totalPages <= 1) return null

  // Calcular rango de elementos mostrados
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  // Generar números de página a mostrar
  const getVisiblePages = () => {
    const delta = 2 // Número de páginas a mostrar a cada lado de la actual
    const range = []
    const rangeWithDots = []

    // Siempre incluir la primera página
    range.push(1)

    // Páginas alrededor de la actual
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i)
    }

    // Siempre incluir la última página (si hay más de una)
    if (totalPages > 1) {
      range.push(totalPages)
    }

    // Añadir puntos suspensivos donde sea necesario
    let prev = 0
    for (const i of range) {
      if (i - prev === 2) {
        rangeWithDots.push(prev + 1)
      } else if (i - prev !== 1) {
        rangeWithDots.push('...')
      }
      rangeWithDots.push(i)
      prev = i
    }

    return rangeWithDots
  }

  const visiblePages = getVisiblePages()

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page)
    }
  }

  const PageButton = ({ page, isActive = false, isDisabled = false, onClick, children }) => {
    const buttonStyle = {
      ...modernPaginationStyles.buttonBase,
      ...(isActive ? modernPaginationStyles.activeButton : {}),
      ...(isDisabled ? modernPaginationStyles.disabledButton : {}),
    }

    return (
      <button
        style={buttonStyle}
        onClick={onClick}
        disabled={isDisabled}
        onMouseEnter={(e) => {
          if (!isActive && !isDisabled) {
            Object.assign(e.target.style, modernPaginationStyles.hoverButton)
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive && !isDisabled) {
            Object.assign(e.target.style, modernPaginationStyles.buttonBase)
          }
        }}
        className="border-0"
      >
        {children || page}
      </button>
    )
  }

  const NavButton = ({ direction, onClick, isDisabled, children }) => {
    const buttonStyle = {
      ...modernPaginationStyles.buttonBase,
      ...modernPaginationStyles.navButton,
      ...(isDisabled ? modernPaginationStyles.disabledButton : {}),
    }

    return (
      <button
        style={buttonStyle}
        onClick={onClick}
        disabled={isDisabled}
        onMouseEnter={(e) => {
          if (!isDisabled) {
            Object.assign(e.target.style, { ...buttonStyle, ...modernPaginationStyles.hoverButton })
          }
        }}
        onMouseLeave={(e) => {
          if (!isDisabled) {
            Object.assign(e.target.style, buttonStyle)
          }
        }}
        className="border-0"
      >
        {children}
      </button>
    )
  }

  return (
    <div style={modernPaginationStyles.container}>
      {/* Información de elementos (desktop) */}
      {showInfo && (
        <div className="d-none d-md-flex" style={modernPaginationStyles.info}>
          <span style={modernPaginationStyles.infoLabel}>
            {startItem}-{endItem} de {totalItems}
          </span>
        </div>
      )}

      {/* Separador */}
      {showInfo && <div className="d-none d-md-block" style={modernPaginationStyles.separator} />}

      {/* Controles de navegación */}
      <div className="d-flex align-items-center gap-2 flex-wrap justify-content-center">
        {/* Primera página */}
        <NavButton
          direction="first"
          onClick={() => handlePageChange(1)}
          isDisabled={currentPage === 1}
        >
          <ChevronsLeft size={16} />
          <span className="d-none d-sm-inline">Primera</span>
        </NavButton>

        {/* Página anterior */}
        <NavButton
          direction="prev"
          onClick={() => handlePageChange(currentPage - 1)}
          isDisabled={currentPage === 1}
        >
          <ChevronLeft size={16} />
          <span className="d-none d-sm-inline">Anterior</span>
        </NavButton>

        {/* Números de página */}
        <div className="d-flex align-items-center gap-1">
          {visiblePages.map((page, index) => {
            if (page === '...') {
              return (
                <div key={`dots-${index}`} style={modernPaginationStyles.buttonBase}>
                  <MoreHorizontal size={16} />
                </div>
              )
            }

            return (
              <PageButton
                key={page}
                page={page}
                isActive={page === currentPage}
                onClick={() => handlePageChange(page)}
              />
            )
          })}
        </div>

        {/* Página siguiente */}
        <NavButton
          direction="next"
          onClick={() => handlePageChange(currentPage + 1)}
          isDisabled={currentPage === totalPages}
        >
          <span className="d-none d-sm-inline">Siguiente</span>
          <ChevronRight size={16} />
        </NavButton>

        {/* Última página */}
        <NavButton
          direction="last"
          onClick={() => handlePageChange(totalPages)}
          isDisabled={currentPage === totalPages}
        >
          <span className="d-none d-sm-inline">Última</span>
          <ChevronsRight size={16} />
        </NavButton>
      </div>

      {/* Información de elementos (mobile) */}
      {showInfo && (
        <div className="d-md-none" style={modernPaginationStyles.mobileInfo}>
          Página {currentPage} de {totalPages} • {totalItems} elementos
        </div>
      )}
    </div>
  )
}

export default Pagination
