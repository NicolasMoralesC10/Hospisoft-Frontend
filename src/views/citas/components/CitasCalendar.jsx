import React, { useRef, useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import esLocale from '@fullcalendar/core/locales/es'

import CitaModal from './CitaModal'

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
      const res = await fetch(`${apiEndpoint}/list`)
      const response = await res.json()
      if (response.estado && Array.isArray(response.data)) {
        setEventos(response.data)
      } else {
        setEventos([])
        console.error('Respuesta inesperada de citas:', response)
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
        const [resPacientes, resMedicos] = await Promise.all([
          fetch('https://185.254.206.90:4080/api/patient/list'),
          fetch('https://185.254.206.90:4080/api/medico/list'),
        ])

        const [dataPacientes, dataMedicos] = await Promise.all([
          resPacientes.json(),
          resMedicos.json(),
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
        const res = await fetch(`${apiEndpoint}/list`)
        const response = await res.json()

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
      if (modalModo === 'agregar') {
        const res = await fetch(`${apiEndpoint}/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })

        const response = await res.json()

        // Si la cita ya existe, muestra el mensaje del back
        if (
          !response.estado &&
          (response.tipoError === 'duplicado' ||
            response.tipoError === 'duplicado_paciente' ||
            response.tipoError === 'duplicado_medico')
        ) {
          Swal.fire({
            icon: 'error',
            title: '¡Cita duplicada!',
            text: response.mensaje,
          })
          return // return para no cerrar el modal, ni recargar eventos
        }

        if (!res.ok) throw new Error('Error al crear la cita.')

        await loadEvents()

        Swal.fire({
          icon: 'success',
          title: '¡Cita agendada!',
          text: response.mensaje,
          timer: 2000,
          showConfirmButton: false,
        })
      } else if (modalModo === 'editar') {
        const res = await fetch(`${apiEndpoint}/update`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })

        const response = await res.json()

        // Si la cita ya existe, muestra el mensaje del back
        if (
          !response.estado &&
          (response.tipoError === 'duplicado' ||
            response.tipoError === 'duplicado_paciente' ||
            response.tipoError === 'duplicado_medico')
        ) {
          Swal.fire({
            icon: 'error',
            title: '¡Cita duplicada!',
            text: response.mensaje,
          })
          return // return para no cerrar el modal, ni recargar eventos
        }
        if (!res.ok) throw new Error('Error al actualizar la cita.')

        await loadEvents()
        Swal.fire({
          icon: 'success',
          title: '¡Cita actualizada!',
          text: response.mensaje,
          timer: 2000,
          showConfirmButton: false,
        })
      }
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
        const res = await fetch(`${apiEndpoint}/cancel`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        })
        const response = await res.json()

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
