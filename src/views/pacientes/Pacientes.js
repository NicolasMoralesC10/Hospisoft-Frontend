import { useState } from 'react'
import { CRow, CButton, CCol } from '@coreui/react'
import PacienteModal from './components/PacientesModal'
import PacienteTable from './components/PacientesTable'

const VistaPacientes = () => {
  const [visible, setVisible] = useState(false)

  return (
    <CRow>
      <CCol xs={12} className="mb-4">
        <CButton color="primary" onClick={() => setVisible(true)}>
          Registrar paciente
        </CButton>

        <PacienteModal visible={visible} setVisible={setVisible} />
      </CCol>
      <CCol xs={12} className="mb-4">
        
        <PacienteTable apiEndpoint="http://127.0.0.1:3000/api/patient/list" />
      </CCol>
    </CRow>
  )
}

export default VistaPacientes
