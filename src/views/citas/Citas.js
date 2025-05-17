import { useState } from 'react'
import { CRow, CButton, CCol } from '@coreui/react'
import CitasCalendar from './components/CitasCalendar'

const VistaCitas = () => {
  return (
    <CRow>
      <CCol xs={12} className="mb-4">
        <CitasCalendar />
      </CCol>
    </CRow>
  )
}

export default VistaCitas
