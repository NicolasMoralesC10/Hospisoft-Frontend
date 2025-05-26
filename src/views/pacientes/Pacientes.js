import { useState } from 'react'
import { CRow, CButton, CCol } from '@coreui/react'
import PacienteTable from './components/PacientesTable'

const VistaPacientes = () => {
  return (
    <CRow>
      <CCol xs={12} className="mb-4">
        <PacienteTable apiEndpoint="https://185.254.206.90:4080/api/" />
      </CCol>
    </CRow>
  )
}

export default VistaPacientes
