import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CCol,
  CFormInput,
  CFormLabel,
  CInputGroup,
  CInputGroupText,
  CFormSelect,
  CFormCheck,
  CFormFeedback,
  CButton,
} from '@coreui/react'

const PacienteModal = ({ visible, setVisible }) => {
  return (
    <CModal
      size="lg"
      visible={visible}
      onClose={() => setVisible(false)}
      aria-labelledby="PacienteModalTitle"
    >
      <CModalHeader className="bg-primary text-light">
        <CModalTitle id="PacienteModalTitle">Registrar paciente</CModalTitle>
      </CModalHeader>

      <CModalBody>
        <CForm className="row g-3">
          <CCol md={4}>
            <CFormInput
              type="email"
              id="email"
              label="Email"
              feedback="Looks good!"
              defaultValue="name@surname.com"
              valid
              required
            />
          </CCol>
          <CCol md={4}>
            <CFormInput
              type="email"
              id="repeatEmail"
              label="Repetir Email"
              feedback="Looks good!"
              defaultValue="name@surname.com"
              valid
              required
            />
          </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="username">Username</CFormLabel>
            <CInputGroup className="has-validation">
              <CInputGroupText id="inputGroupPrepend">@</CInputGroupText>
              <CFormInput
                type="text"
                id="username"
                feedback="Please choose a username."
                defaultValue=""
                aria-describedby="inputGroupPrepend"
                invalid
                required
              />
            </CInputGroup>
          </CCol>
          <CCol md={6}>
            <CFormInput
              type="text"
              id="city"
              label="Ciudad"
              feedback="Please provide a valid city."
              invalid
              required
            />
          </CCol>
          <CCol md={3}>
            <CFormSelect id="state" label="Estado" feedback="Please provide a valid city." invalid>
              <option disabled>Choose...</option>
              <option>...</option>
            </CFormSelect>
          </CCol>
          <CCol md={3}>
            <CFormInput
              type="text"
              id="zip"
              label="Código Postal"
              feedback="Please provide a valid zip."
              invalid
              required
            />
          </CCol>
       
        </CForm>
      </CModalBody>

      <CModalFooter className="bg-primary">
        <CButton color="secondary" onClick={() => setVisible(false)}>
          Cancelar
        </CButton>
        <CButton color="info text-light">Guardar</CButton>
      </CModalFooter>
    </CModal>
  )
}

export default PacienteModal
