import { CRow, CCol, CButton } from '@coreui/react'
import React, { useEffect, useState } from 'react'

const VistaMedicamentos = () => {
  const [modalVisible, setModalVisible] = useState(false)

  return (
    <CRow>
      <CCol>
        <CButton
          color="light"
          onClick={() => {
            setModalVisible(true)
          }}
        >
          + Agregar Medicamento
        </CButton>
      </CCol>
    </CRow>
  )
}

export default VistaMedicamentos
