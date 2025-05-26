import { useState } from 'react'
import { CRow, CButton, CCol } from '@coreui/react'
import PacienteTable from './components/PacientesTable'


const VistaPacientes = () => {
  return (
    <CRow>
      <CCol xs={12} className="mb-4">
        <PacienteTable apiEndpoint="http://127.0.0.1:3000/api/patient/list" />
      </CCol>
    </CRow>
  )
}

export default VistaPacientes
