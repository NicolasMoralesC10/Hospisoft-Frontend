// src/components/MedicationCard.jsx
import React from 'react'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CCardFooter,
  CButton,
} from '@coreui/react'
import PropTypes from 'prop-types'

const MedicationCard = ({ medication, onEdit, onDelete, onDetails }) => {
  return (
    <CCard className="mb-4 shadow-sm">
      <CCardHeader className="bg-primary text-white">
        <strong>{medication.nombreMedicamento}</strong>
      </CCardHeader>
      <CCardBody>
        <p>
          <strong>Dosis:</strong> {medication.dosis}
        </p>
        <p>
          <strong>Frecuencia:</strong> {medication.frecuencia}
        </p>
        <p>
          <strong>Fecha inicio:</strong>{' '}
          {new Date(medication.fechaInicio).toLocaleDateString()}
        </p>
        {/* Agrega otros campos importantes según tu modelo */}
      </CCardBody>
      <CCardFooter className="d-flex justify-content-between">
        <CButton color="info" size="sm" onClick={() => onDetails(medication)}>
          Detalles
        </CButton>
        <div>
          <CButton
            color="warning"
            size="sm"
            className="me-2"
            onClick={() => onEdit(medication)}
          >
            Editar
          </CButton>
          <CButton
            color="danger"
            size="sm"
            onClick={() => onDelete(medication._id)}
          >
            Eliminar
          </CButton>
        </div>
      </CCardFooter>
    </CCard>
  )
}

MedicationCard.propTypes = {
  medication: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    nombreMedicamento: PropTypes.string.isRequired,
    dosis: PropTypes.string.isRequired,
    frecuencia: PropTypes.string.isRequired,
    fechaInicio: PropTypes.string.isRequired,
    // agrega otros campos si los necesitas
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onDetails: PropTypes.func.isRequired,
}

export default MedicationCard
