import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CCardFooter,
  CImage,
  CButton,
  CBadge,
  CTooltip,
} from '@coreui/react'
import {
  Info,
  Edit,
  Trash2,
  Calendar,
  Package,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  ShoppingCart,
} from 'lucide-react'
import { useFetchImage } from '../hooks/useFetchImage.js'

// Estilos modernos mejorados
const modernCardStyles = {
  card: {
    border: 'none',
    borderRadius: '1.25rem',
    overflow: 'hidden',
    background: 'white',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
  },
  cardHover: {
    transform: 'translateY(-8px)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: '16/10',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
    transition: 'transform 0.3s ease',
    borderRadius: '0.5rem',
  },
  imageHover: {
    transform: 'scale(1.05)',
  },
  header: {
    background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
    border: 'none',
    padding: '1.25rem',
    position: 'relative',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      'url("data:image/svg+xml,%3Csvg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="rgba(255,255,255,0.03)"%3E%3Cpath d="M0 0h20v20H0z"/%3E%3C/g%3E%3C/svg%3E")',
  },
  headerContent: {
    position: 'relative',
    zIndex: 2,
  },
  title: {
    fontSize: '1.125rem',
    fontWeight: '700',
    color: 'white',
    marginBottom: '0.25rem',
    lineHeight: '1.3',
  },
  subtitle: {
    fontSize: '0.875rem',
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '400',
  },
  body: {
    padding: '1.25rem',
    background: '#fefefe',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  infoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0.75rem',
    background: '#f8fafc',
    borderRadius: '0.5rem',
    border: '1px solid #e2e8f0',
  },
  infoIcon: {
    color: '#64748b',
    flexShrink: 0,
  },
  infoText: {
    fontSize: '0.8rem',
    fontWeight: '500',
    color: '#475569',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  priceContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '0.5rem',
    marginTop: '0.75rem',
  },
  priceItem: {
    flex: 1,
    textAlign: 'center',
    padding: '0.5rem',
    borderRadius: '0.5rem',
    fontSize: '0.8rem',
    fontWeight: '600',
  },
  buyPrice: {
    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
    color: '#92400e',
    border: '1px solid #f59e0b',
  },
  sellPrice: {
    background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
    color: '#065f46',
    border: '1px solid #10b981',
  },
  footer: {
    background: '#f8fafc',
    padding: '1rem 1.25rem',
    borderTop: '1px solid #e2e8f0',
  },
  actionButton: {
    borderRadius: '0.5rem',
    padding: '0.5rem 1rem',
    fontSize: '0.8rem',
    fontWeight: '600',
    border: '1px solid',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
  },
  stockBadge: {
    position: 'absolute',
    top: '0.75rem',
    right: '0.75rem',
    zIndex: 10,
    borderRadius: '0.5rem',
    padding: '0.375rem 0.75rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    backdropFilter: 'blur(8px)',
  },
  availableBadge: {
    background: 'rgba(34, 197, 94, 0.9)',
    color: 'white',
    border: '1px solid rgba(34, 197, 94, 0.3)',
  },
  unavailableBadge: {
    background: 'rgba(239, 68, 68, 0.9)',
    color: 'white',
    border: '1px solid rgba(239, 68, 68, 0.3)',
  },
  lowStockBadge: {
    background: 'rgba(245, 158, 11, 0.9)',
    color: 'white',
    border: '1px solid rgba(245, 158, 11, 0.3)',
  },
  expiryWarning: {
    position: 'absolute',
    top: '0.75rem',
    left: '0.75rem',
    zIndex: 10,
    background: 'rgba(239, 68, 68, 0.9)',
    color: 'white',
    borderRadius: '0.5rem',
    padding: '0.25rem 0.5rem',
    fontSize: '0.7rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
  },
}

const MedicationCard = ({ medication, onEdit, onDelete, onDetails }) => {
  const [imageUrl, setImageUrl] = useState('')
  const [isHover, setIsHover] = useState(false)
  const [imageHover, setImageHover] = useState(false)
  const { fetchImage } = useFetchImage()

  useEffect(() => {
    if (medication?.imagen) {
      fetchImage(medication.imagen).then(setImageUrl)
    }
  }, [medication])

  // Calcular días hasta vencimiento
  const getDaysUntilExpiry = () => {
    if (!medication.fechaVencimiento) return null
    const today = new Date()
    const expiryDate = new Date(medication.fechaVencimiento)
    const diffTime = expiryDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const daysUntilExpiry = getDaysUntilExpiry()
  const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 30 && daysUntilExpiry > 0
  const isExpired = daysUntilExpiry !== null && daysUntilExpiry <= 0

  // Determinar estado del stock
  const getStockStatus = () => {
    if (medication.stockDisponible === 0) return 'unavailable'
    if (medication.stockDisponible <= 10) return 'low'
    return 'available'
  }

  const stockStatus = getStockStatus()

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'No definida'
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const cardStyle = {
    ...modernCardStyles.card,
    ...(isHover ? modernCardStyles.cardHover : {}),
  }

  const getBadgeStyle = () => {
    switch (stockStatus) {
      case 'available':
        return modernCardStyles.availableBadge
      case 'low':
        return modernCardStyles.lowStockBadge
      case 'unavailable':
        return modernCardStyles.unavailableBadge
      default:
        return modernCardStyles.unavailableBadge
    }
  }

  const getBadgeIcon = () => {
    switch (stockStatus) {
      case 'available':
        return <CheckCircle size={12} />
      case 'low':
        return <AlertTriangle size={12} />
      case 'unavailable':
        return <XCircle size={12} />
      default:
        return <XCircle size={12} />
    }
  }

  const getBadgeText = () => {
    switch (stockStatus) {
      case 'available':
        return 'Disponible'
      case 'low':
        return 'Stock Bajo'
      case 'unavailable':
        return 'Agotado'
      default:
        return 'Sin Stock'
    }
  }

  return (
    <CCard
      style={cardStyle}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      className="h-100"
    >
      {/* Contenedor de imagen */}
      <div
        style={modernCardStyles.imageContainer}
        onMouseEnter={() => setImageHover(true)}
        onMouseLeave={() => setImageHover(false)}
      >
        <CImage
          src={imageUrl || '/api/placeholder/400/300'}
          alt={medication.nombre}
          style={{
            ...modernCardStyles.image,
            ...(imageHover ? modernCardStyles.imageHover : {}),
          }}
        />

        {/* Badge de stock */}
        <div style={{ ...modernCardStyles.stockBadge, ...getBadgeStyle() }}>
          {getBadgeIcon()}
          <span className="ms-1">{getBadgeText()}</span>
        </div>

        {/* Alerta de vencimiento */}
        {(isExpiringSoon || isExpired) && (
          <div style={modernCardStyles.expiryWarning}>
            <AlertTriangle size={12} />
            {isExpired ? 'Vencido' : `${daysUntilExpiry}d`}
          </div>
        )}
      </div>

      {/* Header */}
      <CCardHeader style={modernCardStyles.header}>
        <div style={modernCardStyles.headerOverlay}></div>
        <div style={modernCardStyles.headerContent}>
          <div style={modernCardStyles.title}>{medication.nombre}</div>
          <div style={modernCardStyles.subtitle}>
            {medication.presentacion || 'Sin presentación'}
          </div>
        </div>
      </CCardHeader>

      {/* Body */}
      <CCardBody style={modernCardStyles.body}>
        {/* Grid de información */}
        <div style={modernCardStyles.infoGrid}>
          <div style={modernCardStyles.infoItem}>
            <Calendar size={14} style={modernCardStyles.infoIcon} />
            <span style={modernCardStyles.infoText}>{formatDate(medication.fechaVencimiento)}</span>
          </div>
          <div style={modernCardStyles.infoItem}>
            <Package size={14} style={modernCardStyles.infoIcon} />
            <span style={modernCardStyles.infoText}>{medication.stockDisponible} unidades</span>
          </div>
        </div>

        {/* Información adicional */}
        {medication.concentracion && (
          <div style={modernCardStyles.infoItem}>
            <span style={modernCardStyles.infoText}>
              <strong>Concentración:</strong> {medication.concentracion}
            </span>
          </div>
        )}

        {medication.viaAdminist && (
          <div style={{ ...modernCardStyles.infoItem, marginTop: '0.5rem' }}>
            <span style={modernCardStyles.infoText}>
              <strong>Vía:</strong> {medication.viaAdminist}
            </span>
          </div>
        )}

        {/* Precios */}
        <div style={modernCardStyles.priceContainer}>
          <div style={{ ...modernCardStyles.priceItem, ...modernCardStyles.buyPrice }}>
            <div>Compra</div>
            <div>${medication.precioCompra?.toLocaleString() || '0'}</div>
          </div>
          <div style={{ ...modernCardStyles.priceItem, ...modernCardStyles.sellPrice }}>
            <div>Venta</div>
            <div>${medication.precioVenta?.toLocaleString() || '0'}</div>
          </div>
        </div>
      </CCardBody>

      {/* Footer */}
      <CCardFooter style={modernCardStyles.footer}>
        <div className="d-flex justify-content-between align-items-center">
          <CTooltip content="Ver información detallada">
            <CButton
              size="sm"
              color="info"
              variant="outline"
              style={modernCardStyles.actionButton}
              onClick={() => onDetails(medication)}
            >
              <Eye size={14} />
              Detalles
            </CButton>
          </CTooltip>

          <div className="d-flex gap-2">
            <CTooltip content="Editar medicamento">
              <CButton
                size="sm"
                color="warning"
                variant="outline"
                style={modernCardStyles.actionButton}
                onClick={() => onEdit(medication)}
              >
                <Edit size={14} />
              </CButton>
            </CTooltip>

            <CTooltip content="Eliminar medicamento">
              <CButton
                size="sm"
                color="danger"
                variant="outline"
                style={modernCardStyles.actionButton}
                onClick={() => onDelete(medication._id)}
              >
                <Trash2 size={14} />
              </CButton>
            </CTooltip>
          </div>
        </div>
      </CCardFooter>
    </CCard>
  )
}

export default MedicationCard
