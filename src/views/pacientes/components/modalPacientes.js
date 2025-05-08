// src/components/ModalPaciente.jsx
import React from 'react'
import {
  CModal,
  CModalBody,
  CModalHeader,
  CModalTitle,
  CModalFooter,
  CForm,
  CFormInput,
  CFormLabel,
  CInputGroup,
  CInputGroupText,
  CFormSelect,
  CFormCheck,
  CFormFeedback,
  CButton,
  CCol,
} from '@coreui/react'

const ModalPaciente = ({ visible, onClose }) => {
  return (
    <CModal size="xl" visible={visible} onClose={onClose} aria-labelledby="modalPacienteTitle">
      <CModalHeader>
        <CModalTitle id="modalPacienteTitle">Extra large modal</CModalTitle>
      </CModalHeader>
      <CForm className="row g-3">
        <CModalBody>
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
              label="Zip"
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
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={onClose}>
            Cancelar
          </CButton>
          <CButton color="primary" type="submit">
            Submit form
          </CButton>
        </CModalFooter>
      </CForm>
    </CModal>
  )
}

export default ModalPaciente
