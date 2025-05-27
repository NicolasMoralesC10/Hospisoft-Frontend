import React, { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import Select from 'react-select'
import {
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CFormLabel,
  CFormTextarea,
} from '@coreui/react'

const initialCita = {
  fecha: '', // solo fecha YYYY-MM-DD
  hora: '09:00', // hora por defecto HH:mm
  descripcion: '',
  idPaciente: '',
  idMedico: '',
  status: 1,
}

const CitaModal = ({
  visible,
  onClose,
  onSave,
  onCancel,
  initialData = {},
  modo = 'agregar',
  pacientes = [],
  medicos = [],
}) => {
  const [cita, setCita] = useState(initialCita)

  // Cargar React Select
  const opcionesPacientes = pacientes.map((pac) => ({
    value: pac._id,
    label: pac.nombrePaciente,
  }))

  const opcionesMedicos = medicos.map((med) => ({
    value: med._id,
    label: med.nombre,
  }))

  // Estados para paciente y médico seleccionados (objetos con value y label)
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null)
  const [medicoSeleccionado, setMedicoSeleccionado] = useState(null)

  useEffect(() => {
    if (initialData) {
      let fecha = ''
      let hora = '09:00'
      if (initialData.fecha) {
        fecha = initialData.fecha.slice(0, 10)
        hora = initialData.fecha.slice(11, 16)
      }

      setCita({
        fecha,
        hora,
        descripcion: initialData.descripcion || '',
        idPaciente: initialData.idPaciente || '',
        idMedico: initialData.idMedico || '',
        status: typeof initialData.status === 'number' ? initialData.status : 1,
      })

      // Set paciente seleccionado
      const pacienteSel =
        opcionesPacientes.find((opt) => opt.value === initialData.idPaciente) || null
      setPacienteSeleccionado(pacienteSel)

      // Set médico seleccionado
      const medicoSel = opcionesMedicos.find((opt) => opt.value === initialData.idMedico) || null
      setMedicoSeleccionado(medicoSel)
    }
  }, [initialData, visible, pacientes, medicos])

  // Manejo de cambios para inputs
  const handleChange = (e) => {
    const { name, value } = e.target
    setCita((prev) => ({
      ...prev, // Copia las propiedades del estado anterior
      [name]: value, // Sobrescribe la propiedad cuyo nombre es [name] con el nuevo value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!pacienteSeleccionado || !medicoSeleccionado) {
      Swal.fire({
        icon: 'error',
        title: '¡Error!',
        text: 'Debe seleccionar paciente y médico.',
      })
    } else {
      // Combinar fecha y hora en un solo campo ISO
      const fechaCompleta = new Date(`${cita.fecha}T${cita.hora}:00`).toISOString()

      // Construir payload sin 'hora'
      const payload = {
        fecha: fechaCompleta,
        descripcion: cita.descripcion,
        idPaciente: pacienteSeleccionado.value,
        idMedico: medicoSeleccionado.value,
      }
      if (modo === 'editar' && initialData?.id) {
        payload.id = initialData.id
      }
      onSave(payload)
    }
  }

  return (
    <CModal visible={visible} onClose={onClose}>
      <CModalHeader onClose={onClose} className="bg-primary text-light">
        <CModalTitle>{modo === 'agregar' ? 'Agregar Cita' : 'Editar Cita'}</CModalTitle>
      </CModalHeader>
      <CForm onSubmit={handleSubmit}>
        <CModalBody>
          <CFormLabel>Fecha</CFormLabel>
          <CFormInput type="date" name="fecha" value={cita.fecha} readOnly />

          <CFormLabel className="mt-2">Hora</CFormLabel>
          <CFormInput type="time" name="hora" value={cita.hora} onChange={handleChange} required />

          <CFormLabel className="mt-2">Descripción</CFormLabel>
          <CFormTextarea
            name="descripcion"
            value={cita.descripcion}
            onChange={handleChange}
            rows={3}
            required
          />

          <CFormLabel className="mt-2">Paciente</CFormLabel>
          <Select
            options={opcionesPacientes}
            value={pacienteSeleccionado}
            onChange={setPacienteSeleccionado}
            placeholder="Seleccione un paciente"
            isClearable
          />

          <CFormLabel className="mt-2">Médico</CFormLabel>
          <Select
            options={opcionesMedicos}
            value={medicoSeleccionado}
            onChange={setMedicoSeleccionado}
            placeholder="Seleccione un médico"
            isClearable
          />
        </CModalBody>

        <CModalFooter className="bg-primary">
          <CButton color="secondary" onClick={onClose}>
            Cerrar
          </CButton>
          {modo === 'editar' && (
            <CButton color="danger" onClick={() => onCancel(initialData?.id)}>
              Cancelar cita
            </CButton>
          )}
          <CButton color="light" variant="outline" type="submit">
            {modo === 'agregar' ? 'Agregar' : 'Guardar'}
          </CButton>
        </CModalFooter>
      </CForm>
    </CModal>
  )
}

export default CitaModal
