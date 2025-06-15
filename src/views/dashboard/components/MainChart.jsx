import React, { useEffect, useState } from 'react'
import { CChartLine } from '@coreui/react-chartjs'
import { apiFetch } from '../../../helpers/apiFetch.js'

const endpointPorRango = {
  Dia: '/pacientes-por-dia',
  Semana: '/pacientes-por-semana',
  Mes: '/pacientes-por-mes',
}

const PacientesPorMesChart = ({ apiEndpoint, range = 'Mes' }) => {
  const [chartData, setChartData] = useState({ data: [], labels: [] })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiFetch(`${apiEndpoint}${endpointPorRango[range]}`)
        setChartData({
          data: res.data || [],
          labels: res.labels || [], // etiquetas dinámicas desde backend
        })
      } catch (error) {
        console.error(`Error cargando datos para rango ${range}:`, error)
      }
    }
    fetchData()
  }, [apiEndpoint, range])

  const data = {
    labels: chartData.labels.length ? chartData.labels : ['Cargando...'],
    datasets: [
      {
        label: 'Pacientes atendidos',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        pointBackgroundColor: 'rgba(54, 162, 235, 1)',
        data: chartData.data,
        fill: true,
        tension: 0.4,
      },
    ],
  }

  const options = {
    plugins: { legend: { display: true } },
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true },
    },
  }

  return <CChartLine data={data} options={options} />
}

export default PacientesPorMesChart
