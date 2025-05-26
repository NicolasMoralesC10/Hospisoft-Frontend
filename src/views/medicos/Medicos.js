import { useState } from 'react'
import { CRow, CButton, CCol } from '@coreui/react'
import MedicoTable from './components/MedicosTable'

const VistaMedicos = () => {
  return (
    <CRow>
      <CCol xs={12} className="mb-4">
        <MedicoTable apiEndpoint="https://185.254.206.90:4080/api/medico/list" />
      </CCol>
    </CRow>
  )
}

export default VistaMedicos
