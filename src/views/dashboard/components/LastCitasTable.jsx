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

const columns = [
  { key: 'pacienteNombre', header: 'Paciente' },
  { key: 'medicoNombre', header: 'Médico' },
  { key: 'fecha', header: 'Fecha' },
  { key: 'estado', header: 'Estado' },
]

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

  // Prepara los datos para exportar (formatea la fecha)
  const exportData = citas.map((cita) => ({
    ...cita,
    fecha: new Date(cita.fecha).toLocaleString(),
  }))

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
            /* className="text-white" */
            color="outline-success"
            onClick={() =>
              exportToExcel(exportData, {
                fileName: 'ultimas_citas.xlsx',
                columns,
                sheetName: 'Últimas Citas',
              })
            }
          >
            <ExcelIcon className="me-2" />
            Excel
          </CButton>
          <CButton
            /* className="text-white" */
            color="outline-danger"
            onClick={() =>
              exportToPdf(exportData, {
                fileName: 'ultimas_citas.pdf',
                title: 'Últimas Citas',
                columns,
              })
            }
          >
            <PdfIcon className="me-2" />
            PDF
          </CButton>
        </div>
      </CCardHeader>

      <CCardBody>
        <CTable striped hover responsive>
          <CTableHead>
            <CTableRow>
              {columns.map((col) => (
                <CTableHeaderCell key={col.key} scope="col">
                  {col.header}
                </CTableHeaderCell>
              ))}
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {citas.length === 0 ? (
              <CTableRow>
                <CTableDataCell colSpan={columns.length} className="text-center">
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
