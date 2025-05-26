import React, { useState } from 'react'
import classNames from 'classnames'

import {
  CAvatar,
  CButton,
  CButtonGroup,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCol,
  CProgress,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cibCcAmex,
  cibCcMastercard,
  cibCcPaypal,
  cibCcVisa,
  cibGoogle,
  cibFacebook,
  cibLinkedin,
  cilPeople,
} from '@coreui/icons'

import avatar1 from 'src/assets/images/avatars/1.jpg'
import avatar2 from 'src/assets/images/avatars/2.jpg'
import avatar3 from 'src/assets/images/avatars/3.jpg'
import avatar4 from 'src/assets/images/avatars/4.jpg'
import avatar5 from 'src/assets/images/avatars/5.jpg'
import avatar6 from 'src/assets/images/avatars/6.jpg'

import WidgetsDropdown from '../widgets/WidgetsDropdown'
import ModalUsuario from '../../components/ModalUsuario'

const Usuarios = () => {
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    username: '',
    city: '',
    state: '',
    zip: '',
  })

  const [isModalVisible, setModalVisible] = useState(false)

  // Datos para la tabla de usuarios (Simulando datos, en un caso real se traería desde una API)
  const tableExample = [
    {
      avatar: { src: avatar1, status: 'success' },
      user: {
        name: 'Yiorgos Avraamu',
        new: true,
        registered: 'Jan 1, 2023',
      },
      country: { name: 'USA', flag: cilPeople },
      usage: {
        value: 50,
        period: 'Jun 11, 2023 - Jul 10, 2023',
        color: 'success',
      },
      payment: { name: 'Mastercard', icon: cibCcMastercard },
      activity: '10 sec ago',
    },
    // Más usuarios...
  ]

  // Función para abrir el modal para crear un nuevo usuario
  const openModalForCreate = () => {
    setUser({
      firstName: '',
      lastName: '',
      username: '',
      city: '',
      state: '',
      zip: '',
    }) // Limpiar los datos si estamos creando un nuevo usuario
    setModalVisible(true)
  }

  // Función para abrir el modal para editar un usuario
  const openModalForEdit = (userData) => {
    setUser(userData) // Cargar los datos del usuario si estamos editando
    setModalVisible(true)
  }

  // Función que maneja el envío del formulario
  const handleSubmitUser = (formData) => {
    // Aquí puedes agregar la lógica para enviar los datos a tu API, ya sea para crear o editar el usuario
    console.log('Datos enviados al backend: ', formData)
    // Cerrar el modal después de guardar
    setModalVisible(false)
  }

  return (
    <>
      <WidgetsDropdown className="mb-4" />
      <CCard className="mb-4">
        <CCardBody>
          <CRow>
            <CCol sm={5}>
              <h4 id="traffic" className="card-title mb-0">
                Usuarios
              </h4>
            </CCol>
            <CCol sm={7} className="d-none d-md-block">
              <CButton color="primary" onClick={openModalForCreate} className="float-end">
                Crear Usuario
              </CButton>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>

      <CRow>
        <CCol xs>
          <CCard className="mb-4">
            <CCardHeader>Usuarios Actuales</CCardHeader>
            <CCardBody>
              <CTable align="middle" className="mb-0 border" hover responsive>
                <CTableHead className="text-nowrap">
                  <CTableRow>
                    <CTableHeaderCell className="bg-body-tertiary text-center">
                      <CIcon icon={cilPeople} />
                    </CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary">Usuario</CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary text-center">
                      País
                    </CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary">Uso</CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary text-center">
                      Método de Pago
                    </CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary">
                      Última Actividad
                    </CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {tableExample.map((item, index) => (
                    <CTableRow key={index}>
                      <CTableDataCell className="text-center">
                        <CAvatar size="md" src={item.avatar.src} status={item.avatar.status} />
                      </CTableDataCell>
                      <CTableDataCell>
                        <div>{item.user.name}</div>
                        <div className="small text-body-secondary text-nowrap">
                          <span>{item.user.new ? 'Nuevo' : 'Recurrencia'}</span> | Registrado:{' '}
                          {item.user.registered}
                        </div>
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        <CIcon size="xl" icon={item.country.flag} title={item.country.name} />
                      </CTableDataCell>
                      <CTableDataCell>
                        <div className="d-flex justify-content-between text-nowrap">
                          <div className="fw-semibold">{item.usage.value}%</div>
                          <div className="ms-3">
                            <small className="text-body-secondary">{item.usage.period}</small>
                          </div>
                        </div>
                        <CProgress thin color={item.usage.color} value={item.usage.value} />
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        <CIcon size="xl" icon={item.payment.icon} />
                      </CTableDataCell>
                      <CTableDataCell>
                        <div className="small text-body-secondary text-nowrap">Último login</div>
                        <div className="fw-semibold text-nowrap">{item.activity}</div>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Aquí agregamos el modal que ya creamos */}
      <ModalUsuario
        user={user}
        isModalVisible={isModalVisible}
        setModalVisible={setModalVisible}
        handleSubmitUser={handleSubmitUser}
      />
    </>
  )
}

export default Usuarios
