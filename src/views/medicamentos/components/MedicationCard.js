import React from 'react'
import { CCard, CCardHeader, CCardBody, CCardFooter, CImage, CButton, CBadge } from '@coreui/react'
import { Info, Edit, Trash2 } from 'lucide-react'

const cardShadow = {
  boxShadow: '0 6px 32px 0 rgba(44,62,80,.12), 0 1.5px 6px 0 rgba(44,62,80,.06)',
  border: 'none',
}

const imgContainerStyle = {
  width: '100%',
  aspectRatio: '16/9',
  background: 'linear-gradient(135deg, #e0e7ef 0%, #f8fafc 100%)',
  position: 'relative',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const imgStyle = {
  maxWidth: '100%',
  maxHeight: '100%',
  width: '100%',
  height: '100%',
  objectFit: 'contain', // Muestra la imagen completa sin recortes
  transition: 'transform 0.25s cubic-bezier(.4,2,.6,1), box-shadow 0.2s',
  background: 'transparent',
}

const MedicationCard = ({ medication, onEdit, onDelete, onDetails }) => {
  const vencimiento = new Date(medication.fechaVencimiento).toLocaleDateString()
  const imagenUrl = medication.imagen?.trim()
    ? `http://127.0.0.1:3000/api/medicaments/image/${medication.imagen}`
    : 'https://via.placeholder.com/400x225.png?text=Sin+Imagen'

  const [isHover, setIsHover] = React.useState(false)

  return (
    <CCard
      className="mb-4 rounded-4 overflow-hidden"
      style={{
        ...cardShadow,
        transform: isHover ? 'translateY(-4px) scale(1.02)' : 'none',
        boxShadow: isHover
          ? '0 12px 32px 0 rgba(44,62,80,.18), 0 2px 8px 0 rgba(44,62,80,.10)'
          : cardShadow.boxShadow,
        transition: 'all 0.23s cubic-bezier(.4,2,.6,1)',
        cursor: 'pointer',
      }}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      {/* Imagen responsiva con aspecto 16:9 y fondo elegante */}
      <div style={imgContainerStyle}>
        <CImage src={imagenUrl} alt={medication.nombre} style={imgStyle} />
        {/* Badge de stock */}
        <CBadge
          color={medication.stockDisponible > 0 ? 'success' : 'danger'}
          shape="rounded-pill"
          className="position-absolute"
          style={{
            top: '0.75rem',
            right: '0.75rem',
            padding: '0.4rem 0.9rem',
            fontSize: '0.95rem',
            zIndex: 10,
            boxShadow: '0 2px 8px rgba(44,62,80,.12)',
          }}
        >
          {medication.stockDisponible > 0 ? 'Disponible' : 'Agotado'}
        </CBadge>
      </div>

      <CCardHeader className="bg-primary text-white d-flex justify-content-between align-items-center px-4 py-3">
        <div className="d-flex flex-column">
          <span className="fs-5 fw-semibold text-truncate" title={medication.nombre}>
            {medication.nombre}
          </span>
          <span className="fs-7 fw-normal opacity-75 text-truncate" title={medication.presentacion}>
            {medication.presentacion}
          </span>
        </div>
        <CBadge
          color="light"
          textColor="dark"
          shape="rounded-pill"
          className="fs-7"
          style={{ padding: '0.3rem 0.7rem' }}
        >
          Stock: {medication.stockDisponible}
        </CBadge>
      </CCardHeader>

      <CCardBody className="px-4 py-3">
        <div className="d-flex flex-wrap gap-2 mb-2">
          <CBadge color="info" className="fw-medium">
            Vence: {vencimiento}
          </CBadge>
          {medication.concentracion && (
            <CBadge color="secondary" className="fw-medium">
              {medication.concentracion}
            </CBadge>
          )}
          {medication.viaAdminist && (
            <CBadge color="primary" className="fw-medium">
              {medication.viaAdminist}
            </CBadge>
          )}
        </div>
        <div className="d-flex flex-wrap gap-2">
          <CBadge color="warning" className="fw-medium">
            Compra: ${medication.precioCompra}
          </CBadge>
          <CBadge color="success" className="fw-medium">
            Venta: ${medication.precioVenta}
          </CBadge>
        </div>
      </CCardBody>

      <CCardFooter className="d-flex justify-content-between align-items-center bg-light px-4 py-3">
        <CButton
          size="sm"
          color="info"
          variant="outline"
          className="fw-medium d-flex align-items-center gap-1"
          onClick={() => onDetails(medication)}
        >
          <Info size={16} /> Detalles
        </CButton>
        <div className="d-flex gap-2">
          <CButton
            size="sm"
            color="warning"
            variant="outline"
            className="fw-medium d-flex align-items-center gap-1"
            onClick={() => onEdit(medication)}
          >
            <Edit size={16} /> Editar
          </CButton>
          <CButton
            size="sm"
            color="danger"
            variant="outline"
            className="fw-medium d-flex align-items-center gap-1"
            onClick={() => onDelete(medication._id)}
          >
            <Trash2 size={16} /> Eliminar
          </CButton>
        </div>
      </CCardFooter>
    </CCard>
  )
}

export default MedicationCard
