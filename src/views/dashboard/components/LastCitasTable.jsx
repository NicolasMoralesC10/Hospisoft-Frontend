import React, { useEffect, useState } from 'react'
import {
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CCard,
  CCardHeader,
  CCardBody,
  CButton,
} from '@coreui/react'

import ExcelIcon from '../../icons/svg/ExcelIcon.js'
import PdfIcon from '../../icons/svg/PdfIcon.js'

import { apiFetch } from '../../../helpers/apiFetch.js'
import { exportToExcel } from '../../../helpers/excelService'
import { exportToPdf } from '../../../helpers/pdfService.js'

const LastCitasTable = ({ apiEndpoint }) => {
  const [citas, setCitas] = useState([])

  useEffect(() => {
    const fetchCitas = async () => {
      try {
        const res = await apiFetch(`${apiEndpoint}/ultimas-citas`)
        setCitas(res.data || [])
      } catch (error) {
        console.error('Error cargando últimas citas:', error)
      }
    }
    fetchCitas()
  }, [apiEndpoint])

  return (
    <CCard className="mb-4">
      <CCardHeader
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h4 style={{ margin: 0 }}>Últimas Citas</h4>
        <div style={{ display: 'flex', gap: '8px' }}>
          <CButton
            className="text-white"
            color="outline-success"
            onClick={() => exportToExcel(citas)}
          >
            <ExcelIcon className="me-2" />
            Excel
          </CButton>
          <CButton className="text-white" color="outline-danger" onClick={() => exportToPdf(citas)}>
            <PdfIcon className="me-2" />
            PDF
          </CButton>
        </div>
      </CCardHeader>

      <CCardBody>
        <CTable striped hover responsive>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell scope="col">Paciente</CTableHeaderCell>
              <CTableHeaderCell scope="col">Médico</CTableHeaderCell>
              <CTableHeaderCell scope="col">Fecha</CTableHeaderCell>
              <CTableHeaderCell scope="col">Estado</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {citas.length === 0 ? (
              <CTableRow>
                <CTableDataCell colSpan={4} className="text-center">
                  No hay citas para mostrar
                </CTableDataCell>
              </CTableRow>
            ) : (
              citas.map((cita) => (
                <CTableRow key={cita._id}>
                  <CTableDataCell>{cita.pacienteNombre}</CTableDataCell>
                  <CTableDataCell>{cita.medicoNombre}</CTableDataCell>
                  <CTableDataCell>{new Date(cita.fecha).toLocaleString()}</CTableDataCell>
                  <CTableDataCell>{cita.estado}</CTableDataCell>
                </CTableRow>
              ))
            )}
          </CTableBody>
        </CTable>
      </CCardBody>
    </CCard>
  )
}

export default LastCitasTable
