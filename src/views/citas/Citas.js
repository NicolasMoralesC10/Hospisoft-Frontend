import { useState } from 'react'
import { CRow, CButton, CCol } from '@coreui/react'
import CitasCalendar from './components/CitasCalendar'
import { useAuth } from '../../context/AuthContext.jsx'

const VistaCitas = () => {
  const { user, rol } = useAuth()
  return (
    <CRow>
      <CCol xs={12} className="mb-4">
        <CitasCalendar
          apiEndpoint="https://185.254.206.90:4080/api/cita"
          userId={user.id}
          userRol={rol}
        />
      </CCol>
    </CRow>
  )
}

export default VistaCitas
