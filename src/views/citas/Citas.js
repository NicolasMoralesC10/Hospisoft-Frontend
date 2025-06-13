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
          apiEndpoint="http://127.0.0.1:3000/api/cita"
          userId={user.id}
          userRol={rol}
        />
      </CCol>
    </CRow>
  )
}

export default VistaCitas
