import React, { useRef, useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import esLocale from '@fullcalendar/core/locales/es'

import CitaModal from './CitaModal'

import { apiFetch } from '../../../helpers/apiFetch.js'

const CitasCalendar = ({ apiEndpoint }) => {
  const calendarRef = useRef(null)

  // Estados para controlar la modal
  const [modalVisible, setModalVisible] = useState(false)
  const [modalModo, setModalModo] = useState('agregar') // 'agregar' o 'editar'
  const [citaActual, setCitaActual] = useState(null)
  const [pacientes, setPacientes] = useState([])
  const [medicos, setMedicos] = useState([])

  // Estado para eventos (citas)
  const [eventos, setEventos] = useState([])

  const loadEvents = async () => {
    try {
      const payload = await apiFetch(`${apiEndpoint}/list`)
      if (payload.estado && Array.isArray(payload.data)) {
        setEventos(payload.data)
      } else {
        setEventos([])
        console.error('Respuesta inesperada de citas:', payload)
      }
    } catch (error) {
      console.error('Error cargando citas:', error)
      setEventos([])
    }
  }

  useEffect(() => {
    loadEvents()
  }, [apiEndpoint])

  // Cargar selects, pacientes y medicos
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Ejecuta ambas peticiones en paralelo
        const [dataPacientes, dataMedicos] = await Promise.all([
          apiFetch('https://185.254.206.90:4080/api/patient/list'),
          apiFetch('https://185.254.206.90:4080/api/medico/list'),
        ])

        // Valida y actualiza estados
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
      } catch (error) {
        console.error('Error cargando datos:', error)
        setPacientes([])
        setMedicos([])
      }
    }

    fetchData()
  }, [])

  // Renderizar citas en el calendario
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await apiFetch(`${apiEndpoint}/list`)

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

    fetchEvents()
  }, [apiEndpoint])

  // Al hacer clic en una fecha para agregar cita
  const handleDateClick = (arg) => {
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

      await loadEvents()

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

        await loadEvents()

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
