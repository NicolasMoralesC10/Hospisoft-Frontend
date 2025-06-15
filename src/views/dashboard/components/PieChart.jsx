import React, { useState, useEffect } from 'react'
import { CCard, CCardHeader, CCardBody, CButton, CSpinner, CAlert } from '@coreui/react'
import { CChart } from '@coreui/react-chartjs'
import ExcelIcon from '../../icons/svg/ExcelIcon.js'
import PdfIcon from '../../icons/svg/PdfIcon.js'
import { exportToExcel } from '../../../helpers/excelService.js'
import { exportToPdf } from '../../../helpers/pdfService.js'
import apiFetch from '../../../helpers/apiFetch.js'

const PieChart = ({ apiEndpoint }) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const json = await apiFetch(`${apiEndpoint}/medicos-mas-consultas-mes`)
      setData(json.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5 * 60 * 1000) // actualizar cada 5 minutos
    return () => clearInterval(interval)
  }, [])

  const handleExportExcel = () => {
    exportToExcel(data, 'medicos_consultas.xlsx')
  }

  const handleExportPdf = () => {
    exportToPdf(data, 'medicos_consultas.pdf')
  }

  const chartData = {
    labels: data.map((d) => d.name),
    datasets: [
      {
        data: data.map((d) => d.consultas),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 20, // ancho del cuadro de color 'switch'
          generateLabels: (chart) => {
            const data = chart.data
            if (!data.labels.length) return []
            return data.labels.map((label, i) => {
              return {
                text: `${label}`,
                fillStyle: data.datasets[0].backgroundColor[i],
                strokeStyle: 'white', // borde alrededor del cuadro
                lineWidth: 2,
                fontColor: 'white',
                index: i,
              }
            })
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || ''
            const value = context.parsed || 0
            const texto = value === 1 ? 'consulta' : 'consultas'
            return `${value} ${texto}`
          },
        },
      },
    },
  }

  return (
    <CCard className="mb-4">
      <CCardHeader
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <h4 style={{ margin: 0 }}>Médicos con más consultas mensuales</h4>
        <div style={{ display: 'flex', gap: '8px' }}>
          <CButton className="text-white" color="outline-success" onClick={handleExportExcel}>
            <ExcelIcon className="me-2" />
            Excel
          </CButton>
          <CButton className="text-white" color="outline-danger" onClick={handleExportPdf}>
            <PdfIcon className="me-2" />
            PDF
          </CButton>
        </div>
      </CCardHeader>

      <div style={{ width: '400px', height: '400px', margin: '0 auto' }}>
        <CCardBody>
          {loading ? (
            <CSpinner color="primary" />
          ) : error ? (
            <CAlert color="danger" dismissible>
              {error}
            </CAlert>
          ) : data.length === 0 ? (
            <p>No hay datos disponibles para mostrar.</p>
          ) : (
            <CChart type="doughnut" data={chartData} options={chartOptions} />
          )}
        </CCardBody>
      </div>
    </CCard>
  )
}

export default PieChart
