import React, { useEffect, useState } from 'react'
import { CRow, CCol, CWidgetStatsA } from '@coreui/react'
import { CChartLine, CChartBar } from '@coreui/react-chartjs'
import CIcon from '@coreui/icons-react'
import { cilArrowBottom, cilArrowTop } from '@coreui/icons'
import { getStyle } from '@coreui/utils'
import { apiFetch } from '../../../helpers/apiFetch.js'

const chartOptions = {
  plugins: { legend: { display: false } },
  maintainAspectRatio: false,
  scales: { x: { display: false }, y: { display: false } },
  elements: { line: { borderWidth: 2 }, point: { radius: 4, hoverRadius: 6 } },
}

const WidgetsDropdown = ({ apiEndpoint }) => {
  const [stats, setStats] = useState({
    pacientes: 0,
    medicos: 0,
    citasHoy: 0,
    facturacionMes: 0,
    variacionPacientes: 0,
    variacionFacturacion: 0,
  })

  const [pacientesPorMes, setPacientesPorMes] = useState([])
  const [facturacionPorMes, setFacturacionPorMes] = useState([])
  const [citasPorDia, setCitasPorDia] = useState([])
  const [nuevosMedicos, setNuevosMedicos] = useState([])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [
          pacientesRes,
          medicosRes,
          citasHoyRes,
          facturacionMesRes,
          pacientesMesRes,
          facturacionMesChartRes,
          citasDiaRes,
          nuevosMedicosRes,
        ] = await Promise.all([
          apiFetch(`${apiEndpoint}/total-pacientes`),
          apiFetch(`${apiEndpoint}/total-medicos`),
          apiFetch(`${apiEndpoint}/citas-hoy`),
          apiFetch(`${apiEndpoint}/facturacion-mes`),
          apiFetch(`${apiEndpoint}/pacientes-por-mes`), // endpoint para gráfica
          apiFetch(`${apiEndpoint}/facturacion-por-mes`), // endpoint para gráfica
          apiFetch(`${apiEndpoint}/citas-por-dia`), // endpoint para gráfica
          apiFetch(`${apiEndpoint}/nuevos-medicos-por-mes`), // endpoint para gráfica
        ])

        setStats({
          pacientes: pacientesRes.total || 0,
          medicos: medicosRes.total || 0,
          citasHoy: citasHoyRes.total || 0,
          facturacionMes: facturacionMesRes.total || 0,
          variacionPacientes: pacientesRes.variacion || 0,
          variacionFacturacion: facturacionMesRes.variacion || 0,
        })

        setPacientesPorMes(pacientesMesRes.data || [])
        setFacturacionPorMes(facturacionMesChartRes.data || [])
        setCitasPorDia(citasDiaRes.data || [])
        setNuevosMedicos(nuevosMedicosRes.data || [])
      } catch (error) {
        console.error('Error al cargar estadísticas:', error)
      }
    }
    fetchStats()
  }, [apiEndpoint])

  const renderVariation = (value) => (
    <span className="fs-6 fw-normal">
      ({value >= 0 ? '+' : ''}
      {value}% <CIcon icon={value >= 0 ? cilArrowTop : cilArrowBottom} />)
    </span>
  )

  const gradients = {
    gradientDefault: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
    gradientInfo: 'linear-gradient(135deg,rgb(15, 125, 199) 0%,rgb(11, 194, 235) 100%)',
    gradientWarning: 'linear-gradient(135deg, #FFC107 0%,rgb(192, 123, 19) 100%)',
    gradientDanger: 'linear-gradient(135deg,rgb(209, 99, 25) 0%,rgb(151, 14, 14) 100%)',
  }

  return (
    <CRow className="mb-4" xs={{ gutter: 4 }}>
      <CCol sm={6} xl={3}>
        <CWidgetStatsA
          value={
            <>
              {stats.pacientes} {renderVariation(stats.variacionPacientes)}
            </>
          }
          title="Pacientes registrados"
          style={{ background: gradients.gradientDefault, color: 'white' }}
          chart={
            <CChartLine
              className="mt-3 mx-3"
              style={{ height: '70px' }}
              data={{
                labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul'],
                datasets: [
                  {
                    label: 'Pacientes',
                    backgroundColor: 'transparent',
                    borderColor: 'rgba(255,255,255,.55)',
                    pointBackgroundColor: getStyle('--cui-white'),
                    data: pacientesPorMes,
                  },
                ],
              }}
              options={chartOptions}
            />
          }
        />
      </CCol>

      <CCol sm={6} xl={3}>
        <CWidgetStatsA
          value={stats.medicos}
          title="Médicos activos"
          className="shadow-sm"
          style={{ background: gradients.gradientInfo, color: 'white' }}
          chart={
            <CChartLine
              className="mt-3 mx-3"
              style={{ height: '70px' }}
              data={{
                labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul'],
                datasets: [
                  {
                    label: 'Nuevos Médicos',
                    backgroundColor: 'transparent',
                    borderColor: 'rgba(255,255,255,.55)',
                    pointBackgroundColor: getStyle('--cui-white'),
                    data: nuevosMedicos,
                  },
                ],
              }}
              options={chartOptions}
            />
          }
        />
      </CCol>

      <CCol sm={6} xl={3}>
        <CWidgetStatsA
          value={stats.citasHoy}
          title="Citas agendadas para hoy"
          style={{ background: gradients.gradientWarning, color: 'white' }}
          chart={
            <CChartBar
              className="mt-3 mx-3"
              style={{ height: '70px' }}
              data={{
                labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
                datasets: [
                  {
                    label: 'Citas',
                    backgroundColor: 'rgba(255,255,255,.2)',
                    borderColor: 'rgba(255,255,255,.55)',
                    data: citasPorDia,
                  },
                ],
              }}
              options={{
                plugins: { legend: { display: false } },
                maintainAspectRatio: false,
                scales: { x: { display: false }, y: { display: false } },
              }}
            />
          }
        />
      </CCol>

      <CCol sm={6} xl={3}>
        <CWidgetStatsA
          value={
            <>
              {stats.facturacionMes} {renderVariation(stats.variacionFacturacion)}
            </>
          }
          title="Total citas mensuales"
          style={{ background: gradients.gradientDanger, color: 'white' }}
          chart={
            <CChartLine
              className="mt-3 mx-3"
              style={{ height: '70px' }}
              data={{
                labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul'],
                datasets: [
                  {
                    label: 'Facturación',
                    backgroundColor: 'transparent',
                    borderColor: 'rgba(255,255,255,.55)',
                    pointBackgroundColor: getStyle('--cui-white'),
                    data: facturacionPorMes,
                  },
                ],
              }}
              options={chartOptions}
            />
          }
        />
      </CCol>
    </CRow>
  )
}

export default WidgetsDropdown
