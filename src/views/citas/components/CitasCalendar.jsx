import React, { useRef, useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'

import CitaModal from './CitaModal'

const CitasCalendar = ({ apiEndpoint }) => {
  const calendarRef = useRef(null)

  // Estado para la controlar modal
  const [modalVisible, setModalVisible] = useState(false)
  const [modalModo, setModalModo] = useState('agregar') // 'agregar' o 'editar'
  const [citaActual, setCitaActual] = useState(null)
  const [pacientes, setPacientes] = useState([])
  const [medicos, setMedicos] = useState([])

  // Estado para eventos (citas)
  const [eventos, setEventos] = useState([])

  const cargarEventos = async () => {
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
    cargarEventos()
  }, [apiEndpoint])

  /* Cargar selects, pacientes y medicos */
  useEffect(() => {
    fetch('https://185.254.206.90:4080/api/patient/list')
      .then((res) => res.json())
      .then((response) => {
        if (response.estado && Array.isArray(response.data)) {
          setPacientes(response.data)
        } else {
          setPacientes([])
          console.error('Respuesta inesperada de pacientes:', response)
        }
      })
      .catch((error) => {
        console.error('Error cargando pacientes:', error)
        setPacientes([])
      })

    fetch('https://185.254.206.90:4080/api/medico/list')
      .then((res) => res.json())
      .then((response) => {
        if (response.estado && Array.isArray(response.data)) {
          setMedicos(response.data)
        } else {
          setMedicos([])
          console.error('Respuesta inesperada de médicos:', response)
        }
      })
      .catch((error) => {
        console.error('Error cargando médicos:', error)
        setMedicos([])
      })
  }, [])

  /* Renderizar citas en el calendario */
  useEffect(() => {
    fetch(`${apiEndpoint}/list`)
      .then((res) => res.json())
      .then((response) => {
        if (response.estado && Array.isArray(response.data)) {
          setEventos(response.data) // Eventos ya adaptados para FullCalendar desde el back
        } else {
          setEventos([])
          console.error('Respuesta inesperada de citas:', response)
        }
      })
      .catch((error) => {
        console.error('Error cargando citas:', error)
        setEventos([])
      })
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
  /* const handleEventClick = (clickInfo) => {
    const event = clickInfo.event
    const props = event.extendedProps || {}

    setModalModo('editar')
    setCitaActual({
      id: event.id,
      fecha: event.startStr ? event.startStr.slice(0, 16) : '',
      descripcion: props.descripcion || '',
      idPaciente: props.idPaciente || '',
      idMedico: props.idMedico || '',
      status: typeof props.status === 'number' ? props.status : 1,
    })
    setModalVisible(true)
  } */
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

        // Si la cita ya existe, muestra el mensaje del backend
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

        if (!res.ok) throw new Error('Error al crear la cita')

        await cargarEventos()

        Swal.fire({
          icon: 'success',
          title: '¡Cita creada!',
          text: 'La cita se ha registrado correctamente.',
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

        // Si la cita ya existe, muestra el mensaje del backend
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
        if (!res.ok) throw new Error('Error al actualizar la cita')

        await cargarEventos()
        Swal.fire({
          icon: 'success',
          title: '¡Cita actualizada!',
          text: 'La cita se ha actualizado correctamente.',
          timer: 2000,
          showConfirmButton: false,
        })
      }
      setModalVisible(false)
    } catch (error) {
      alert(error.message)
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
      />

      <CitaModal
        visible={modalVisible}
        onClose={handleCloseModal}
        onSave={handleSaveCita}
        initialData={citaActual}
        modo={modalModo}
        pacientes={pacientes}
        medicos={medicos}
      />
    </>
  )
}

export default CitasCalendar
