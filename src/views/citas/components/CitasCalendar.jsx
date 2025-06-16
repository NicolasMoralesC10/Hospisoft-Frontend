import React, { useRef, useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import esLocale from '@fullcalendar/core/locales/es'

import CitaModal from './CitaModal'

import { apiFetch } from '../../../helpers/apiFetch.js'
import { exportToExcel } from '../../../helpers/excelService.js'
import { exportToPdf } from '../../../helpers/pdfService.js'
import ExcelIcon from '../../icons/svg/ExcelIcon.js'
import PdfIcon from '../../icons/svg/PdfIcon.js'
import { CButton } from '@coreui/react'

const CitasCalendar = ({ apiEndpoint, userId, userRol }) => {
  const calendarRef = useRef(null)

  // Estados para controlar la modal
  const [modalVisible, setModalVisible] = useState(false)
  const [modalModo, setModalModo] = useState('agregar') // 'agregar' o 'editar'
  const [citaActual, setCitaActual] = useState(null)
  const [pacientes, setPacientes] = useState([])
  const [medicos, setMedicos] = useState([])

  // Estado para eventos (citas)
  const [eventos, setEventos] = useState([])

  // Columnas para exportación
  const exportColumns = [
    { key: 'pacienteNombre', header: 'Paciente' },
    { key: 'medicoNombre', header: 'Médico' },
    { key: 'fecha', header: 'Fecha' },
    { key: 'descripcion', header: 'Descripción' },
    { key: 'status', header: 'Estado' },
  ]

  // Cargar selects, pacientes y medicos
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!['medico', 'paciente'].includes(userRol)) {
          const [dataPacientes, dataMedicos] = await Promise.all([
            apiFetch('http://127.0.0.1:3000/api/patient/list'),
            apiFetch('http://127.0.0.1:3000/api/medico/list'),
          ])

          if (dataPacientes.estado && Array.isArray(dataPacientes.data)) {
            setPacientes(dataPacientes.data)
          } else {
            setPacientes([])
            console.error('Respuesta inesperada de pacientes:', dataPacientes)
          }

          if (dataMedicos.estado && Array.isArray(dataMedicos.data)) {
            setMedicos(dataMedicos.data)
          } else {
            setMedicos([])
            console.error('Respuesta inesperada de médicos:', dataMedicos)
          }
        } else {
          setPacientes([])
          setMedicos([])
        }
      } catch (error) {
        console.error('Error cargando datos:', error)
        setPacientes([])
        setMedicos([])
      }
    }

    fetchData()
  }, [userRol])

  // Renderizar citas en el calendario
  const fetchEvents = async () => {
    try {
      const response = await apiFetch(`${apiEndpoint}/list?rol=${userRol}&userId=${userId}`)

        if (response.estado && Array.isArray(response.data)) {
          setEventos(response.data) // Eventos adaptados para FullCalendar desde el back
        } else {
          setEventos([])
          console.error('Respuesta inesperada de citas:', response)
        }
      } catch (error) {
        console.error('Error al cargar las citas:', error)
        setEventos([])
      }
    }

  useEffect(() => {
    fetchEvents()
  }, [apiEndpoint, userRol, userId])

  // Prepara los datos para exportar (formatear fechas y estado)
  const exportData = eventos.map((evt) => ({
    pacienteNombre: evt.extendedProps?.paciente?.nombrePaciente || '',
    medicoNombre: evt.extendedProps?.medico?.nombre || '',
    fecha: evt.start ? new Date(evt.start).toLocaleString() : '',
    descripcion: evt.title || '',
    status:
      evt.extendedProps?.status === 1
        ? 'Activa'
        : evt.extendedProps?.status === 0
          ? 'Cancelada'
          : 'Desconocido',
  }))

  // Funciones para exportar
  const handleExportExcel = () => {
    exportToExcel(exportData, {
      fileName: 'citas.xlsx',
      columns: exportColumns,
      sheetName: 'Citas',
    })
  }

  const handleExportPdf = () => {
    exportToPdf(exportData, {
      fileName: 'citas.pdf',
      title: 'Reporte de Citas',
      columns: exportColumns,
    })
  }

  // Al hacer clic en una fecha para agregar cita
  const handleDateClick = (arg) => {
    if (!['superuser', 'admin', 'secretaria'].includes(userRol)) return // Solo roles permitidos
    const clickedDate = new Date(arg.dateStr)
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Solo fecha, sin hora

    if (clickedDate >= today) {
      setModalModo('agregar')
      setCitaActual({
        fecha: arg.dateStr + 'T09:00', // fecha en formato datetime-local
        descripcion: '',
        idPaciente: '',
        idMedico: '',
        status: 1,
      })
      setModalVisible(true)
    }
  }

  // Al hacer clic en un evento para editar cita
  const handleEventClick = (clickInfo) => {
    const event = clickInfo.event
    const props = event.extendedProps || {}

    if (['superuser', 'admin', 'secretaria'].includes(userRol)) {
      // Permitir editar
      setModalModo('editar')
      setCitaActual({
        id: event.id,
        fecha: event.startStr ? event.startStr.slice(0, 16) : '',
        descripcion: event.title,
        idPaciente: props.paciente?._id || '',
        idMedico: props.medico?._id || '',
        status: props.status || 1,
      })
      setModalVisible(true)
    } else if (['paciente', 'medico'].includes(userRol)) {
      // Recordatorio
      let extraInfo
      if (userRol === 'paciente' && props.medico?.nombre) {
        extraInfo = `<br/><b>Médico:</b> ${props.medico.nombre}`
      } else if (userRol === 'medico' && props.paciente?.nombrePaciente) {
        extraInfo = `<br/><b>Paciente:</b> ${props.paciente.nombrePaciente}`
      }

      Swal.fire({
        icon: 'info',
        title: 'Recordatorio de cita',
        html: `<b>Descripción:</b> ${event.title}<br/>
               <b>Fecha:</b> ${event.start.toLocaleString()}
               ${extraInfo}`,
        confirmButtonText: 'Cerrar',
      })
    }
  }

  // Guardar cita (agregar o editar)
  const handleSaveCita = async (data) => {
    try {
      let response
      if (modalModo === 'agregar') {
        response = await apiFetch(`${apiEndpoint}/create`, {
          method: 'POST',
          body: JSON.stringify(data),
        })
      } else if (modalModo === 'editar') {
        response = await apiFetch(`${apiEndpoint}/update`, {
          method: 'PUT',
          body: JSON.stringify(data),
        })
      }

      if (
        !response.estado &&
        ['duplicado', 'duplicado_paciente', 'duplicado_medico'].includes(response.tipoError)
      ) {
        Swal.fire({
          icon: 'error',
          title: '¡Cita duplicada!',
          text: response.mensaje,
        })
        return
      }

      await fetchEvents()

      Swal.fire({
        icon: 'success',
        title: modalModo === 'agregar' ? '¡Cita agendada!' : '¡Cita actualizada!',
        text: response.mensaje,
        timer: 2000,
        showConfirmButton: false,
      })

      setModalVisible(false)
    } catch (error) {
      alert('Error: ' + error.message)
    }
  }

  // Cancelar cita
  const handleCancelCita = async (id) => {
    if (!id) return
    const confirm = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción cancelará la cita y no podrá revertirse.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No, volver',
    })

    if (confirm.isConfirmed) {
      try {
        const response = await apiFetch(`${apiEndpoint}/cancel`, {
          method: 'PUT',
          body: JSON.stringify({ id }),
        })

        if (!response.estado) throw new Error(response.mensaje)

        await fetchEvents()

        Swal.fire({
          icon: 'success',
          title: '¡Cita cancelada!',
          text: response.mensaje,
          timer: 2000,
          showConfirmButton: false,
        })

        setModalVisible(false)
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message,
        })
      }
    }
  }

  // Cerrar modal sin guardar
  const handleCloseModal = () => {
    setModalVisible(false)
  }

  return (
    <>
      {/* Botones de exportación */}
      <div
        style={{ marginBottom: '1rem', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}
      >
        <CButton color="outline-success" onClick={handleExportExcel}>
          <ExcelIcon className="me-2" />
          Excel
        </CButton>
        <CButton color="outline-danger" onClick={handleExportPdf}>
          <PdfIcon className="me-2" />
          PDF
        </CButton>
      </div>

      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        editable={true}
        selectable={true}
        events={eventos}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        locales={[esLocale]}
        locale="es"
      />

      <CitaModal
        visible={modalVisible}
        onClose={handleCloseModal}
        onSave={handleSaveCita}
        onCancel={handleCancelCita}
        initialData={citaActual}
        modo={modalModo}
        pacientes={pacientes}
        medicos={medicos}
      />
    </>
  )
}

export default CitasCalendar
