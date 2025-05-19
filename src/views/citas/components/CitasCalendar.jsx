import React, { useRef, useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'

import CitaModal from './CitaModal'

const CitasCalendar = ({ apiEndpoint }) => {
  const calendarRef = useRef(null)

  // Estado para controlar modal
  const [modalVisible, setModalVisible] = useState(false)
  const [modalModo, setModalModo] = useState('agregar') // 'agregar' o 'editar'
  const [citaActual, setCitaActual] = useState(null)

  // Estado para eventos (citas)
  const [eventos, setEventos] = useState([])

  /* const fetchCitas = async () => {
    try {
      const res = await fetch(`${apiEndpoint}/list`)
      if (!res.ok) throw new Error(res.statusText)
      const json = await res.json()
      setData(json.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  } */

  useEffect(() => {
    fetch(`${apiEndpoint}/list`) // Ajusta la URL a tu endpoint real
      .then((res) => res.json())
      .then((data) => {
        // data debe ser un array de eventos ya adaptados (id, title, start, extendedProps)
        setEventos(data)
      })
      .catch((error) => {
        console.error('Error cargando citas:', error)
      })
    /* fetchCitas() */
  }, [])

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
  const handleSaveCita = async (data) => {
    try {
      if (modalModo === 'agregar') {
        // Llamada POST a backend para crear cita
        const res = await fetch(`${apiEndpoint}/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error('Error al crear la cita')
        const nuevaCita = await res.json()
        setEventos((prev) => [...prev, nuevaCita])

        // Crear nuevo ID simple (en producción usar UUID o backend)
        /* const newId = (eventos.length + 1).toString()
      setEventos((prev) => [
        ...prev,
        { id: newId, title: data.title, date: data.date, description: data.description },
      ]) */
      } else if (modalModo === 'editar') {
        // Llamada PUT/PATCH para actualizar cita (debes implementar endpoint)
        const res = await fetch(`${apiEndpoint}/update`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error('Error al actualizar la cita')
        const citaActualizada = await res.json()
        setEventos((prev) => prev.map((evt) => (evt.id === citaActual.id ? citaActualizada : evt)))

        setEventos((prev) =>
          prev.map((evt) =>
            evt.id === citaActual.id
              ? { ...evt, title: data.title, date: data.date, description: data.description }
              : evt,
          ),
        )
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
      />
    </>
  )
}

export default CitasCalendar
