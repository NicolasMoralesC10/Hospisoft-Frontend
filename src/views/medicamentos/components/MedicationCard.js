import React from 'react'
import { CCard, CCardHeader, CCardBody, CCardFooter, CButton, CBadge } from '@coreui/react'

const MedicationCard = ({ medication, onEdit, onDelete, onDetails }) => {
  const vencimiento = new Date(medication.fechaVencimiento).toLocaleDateString()
  const imagenUrl = medication.imagen?.trim()
    ? medication.imagen
    : 'https://via.placeholder.com/300x180.png?text=Sin+Imagen'

  return (
    <CCard className="mb-4 shadow-sm border-0">
      {/* Imagen (si existe) */}
      <img
        src={`http://127.0.0.1:3000/api/medicaments/image/${imagenUrl}`}
        alt={medication.nombre}
        className="card-img-top"
        style={{ height: '140px', objectFit: 'cover' }}
      />

      <CCardHeader className="bg-primary text-white d-flex justify-content-between align-items-center">
        <strong>{medication.nombre}</strong>
        <CBadge color="light" textColor="dark">
          {medication.codigo}
        </CBadge>
      </CCardHeader>

      <CCardBody>
        {/* Solo campos mínimos */}
        <p className="mb-2">
          <strong>Stock:</strong>{' '}
          <CBadge color={medication.stockDisponible > 0 ? 'success' : 'danger'}>
            {medication.stockDisponible}
          </CBadge>
        </p>
        <p className="mb-2">
          <strong>Vence:</strong> {vencimiento}
        </p>
      </CCardBody>

      <CCardFooter className="d-flex justify-content-between">
        <CButton size="sm" color="info" onClick={() => onDetails(medication)}>
          Detalles
        </CButton>
        <div>
          <CButton size="sm" color="warning" className="me-2" onClick={() => onEdit(medication)}>
            Editar
          </CButton>
          <CButton size="sm" color="danger" onClick={() => onDelete(medication._id)}>
            Eliminar
          </CButton>
        </div>
      </CCardFooter>
    </CCard>
  )
}

export default MedicationCard
