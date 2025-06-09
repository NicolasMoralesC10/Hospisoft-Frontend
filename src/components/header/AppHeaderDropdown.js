import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  useColorModes,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CAvatar,
  CButton,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilAccountLogout } from '@coreui/icons'
import avatarImg from '../../assets/images/avatars/default-avatar.jpg'

const UserDropdown = () => {
  const { user, logout } = useAuth()
  const [dropdownVisible, setDropdownVisible] = useState(false)

  const { colorMode } = useColorModes('coreui-free-react-admin-template-theme')

  if (!user) return null

  const nombreUsuario = user.nombre || user.username || 'Usuario'
  const rolUsuario = user.rol || 'Rol no asignado'
  const avatarSrc = avatarImg

  const buttonColor = colorMode === 'dark' ? 'dark' : 'light'
  const buttonVariant = colorMode === 'dark' ? 'solid' : 'solid'

  return (
    <CDropdown
      variant="nav-item"
      visible={dropdownVisible}
      onToggle={(visible) => setDropdownVisible(visible)}
    >
      <CDropdownToggle placement="bottom-end" className="py-0" caret={false}>
        <CAvatar src={avatarSrc} size="md" status="success" />
      </CDropdownToggle>

      <CDropdownMenu className="pt-0" placement="bottom-end">
        <div className="px-3 py-2" style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: '600', fontSize: '1rem' }}>{nombreUsuario}</div>
          <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>{rolUsuario}</div>
        </div>
        <CDropdownItem>
          <CButton
            color={buttonColor}
            variant={buttonVariant}
            className="w-100 d-flex align-items-center justify-content-center"
            onClick={logout}
          >
            <CIcon icon={cilAccountLogout} className="me-2" />
            Cerrar sesión
          </CButton>
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default UserDropdown
