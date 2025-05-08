import React, { useState } from 'react'
import {
  CButton,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormCheck,
  CFormFeedback,
  CInputGroup,
  CInputGroupText,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
} from '@coreui/react'

const ModalUsuario = ({ user, isModalVisible, setModalVisible, handleSubmitUser }) => {
  const [formData, setFormData] = useState(user)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (event.currentTarget.checkValidity() === false) {
      event.stopPropagation()
    } else {
      handleSubmitUser(formData) // Enviar los datos al componente padre
    }
  }

  return (
    <CModal
      backdrop="static"
      size="xl"
      visible={isModalVisible}
      onClose={() => setModalVisible(false)}
      aria-labelledby="ModalUsuarioLabel"
    >
      <CModalHeader>
        <CModalTitle id="ModalUsuarioLabel">Crear/Actualizar Usuario</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CForm
          className="row g-3 needs-validation"
          noValidate
          validated={false}
          onSubmit={handleSubmit}
        >
          <CCol md={4}>
            <CFormInput
              type="text"
              id="validationServer01"
              label="Email"
              feedback="Looks good!"
              defaultValue="name@surname.com"
              valid
              required
            />
          </CCol>
          <CCol md={4}>
            <CFormInput
              type="text"
              id="validationServer02"
              label="Repeat email"
              feedback="Looks good!"
              defaultValue="name@surname.com"
              valid
              required
            />
          </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="validationServerUsername">Username</CFormLabel>
            <CInputGroup className="has-validation">
              <CInputGroupText id="inputGroupPrepend03">@</CInputGroupText>
              <CFormInput
                type="text"
                id="validationServerUsername"
                feedback="Please choose a username."
                defaultValue=""
                aria-describedby="inputGroupPrepend03"
                invalid
                required
              />
            </CInputGroup>
          </CCol>
          <CCol md={6}>
            <CFormInput
              type="text"
              id="validationServer03"
              label="City"
              feedback="Please provide a valid city."
              invalid
              required
            />
          </CCol>
          <CCol md={3}>
            <CFormSelect
              id="validationServer04"
              label="State"
              feedback="Please provide a valid city."
              invalid
            >
              <option disabled>Choose...</option>
              <option>...</option>
            </CFormSelect>
          </CCol>
          <CCol md={3}>
            <CFormInput
              type="text"
              id="validationServer05"
              label="zip"
              feedback="Please provide a valid zip."
              invalid
              required
            />
          </CCol>
          <CCol xs={12}>
            <CFormCheck
              type="checkbox"
              id="invalidCheck"
              label="Agree to terms and conditions"
              invalid
              required
            />
            <CFormFeedback invalid>You must agree before submitting.</CFormFeedback>
          </CCol>
          <CCol xs={12}>
            <CButton color="primary" type="submit">
              Submit form
            </CButton>
          </CCol>
        </CForm>
      </CModalBody>
    </CModal>
  )
}

export default ModalUsuario
