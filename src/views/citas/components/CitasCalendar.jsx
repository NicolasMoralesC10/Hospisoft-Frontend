import React, { useRef, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'

import CitaModal from './CitaModal'

const CitasCalendar = () => {
  const calendarRef = useRef(null)

  // Estado para controlar modal
  const [modalVisible, setModalVisible] = useState(false)
  const [modalModo, setModalModo] = useState('agregar') // 'agregar' o 'editar'
  const [citaActual, setCitaActual] = useState(null)

  // Estado para eventos (citas)
  const [eventos, setEventos] = useState([
    { id: '1', title: 'Cita 1', date: '2025-05-20', description: 'Descripción 1' },
    { id: '2', title: 'Cita 2', date: '2025-05-22', description: 'Descripción 2' },
  ])

  // Al hacer clic en una fecha para agregar cita
  const handleDateClick = (arg) => {
    setModalModo('agregar')
    setCitaActual({
      title: '',
      date: arg.dateStr + 'T09:00', // Puedes ajustar la hora por defecto
      description: '',
    })
    setModalVisible(true)
  }

  // Al hacer clic en un evento para editar cita
  const handleEventClick = (clickInfo) => {
    const event = clickInfo.event
    setModalModo('editar')
    setCitaActual({
      id: event.id,
      title: event.title,
      date: event.startStr,
      description: event.extendedProps.description || '',
    })
    setModalVisible(true)
  }

  // Guardar cita (agregar o editar)
  const handleSaveCita = (data) => {
    if (modalModo === 'agregar') {
      // Crear nuevo ID simple (en producción usar UUID o backend)
      const newId = (eventos.length + 1).toString()
      setEventos((prev) => [
        ...prev,
        { id: newId, title: data.title, date: data.date, description: data.description },
      ])
    } else if (modalModo === 'editar') {
      setEventos((prev) =>
        prev.map((evt) =>
          evt.id === citaActual.id
            ? { ...evt, title: data.title, date: data.date, description: data.description }
            : evt,
        ),
      )
    }
    setModalVisible(false)
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
      />
    </>
  )
}

export default CitasCalendar
