import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilBell,
  cilCalculator,
  cilChartPie,
  cilCursor,
  cilDescription,
  cilDrop,
  cilExternalLink,
  cilNotes,
  cilPencil,
  cilPuzzle,
  cilSpeedometer,
  cilUser,
  cilStar,
  cilUserFollow,
  cilMedicalCross,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    badge: {
      color: 'info',
      text: 'NEW',
    },
  },
  {
    component: CNavItem,
    name: 'Pacientes',
    to: '/pacientes',
    icon: <CIcon icon={cilUserFollow} customClassName="nav-icon" />,
    /*     badge: {
      color: 'info',
      text: 'NEW',
    }, */
  },
  {
    component: CNavItem,
    name: 'Medicamentos',
    to: '/medicamentos',
    icon: <CIcon icon={cilMedicalCross} customClassName="nav-icon" />,
    /*     badge: {
      color: 'info',
      text: 'NEW',
    }, */
  },
  {
    component: CNavItem,
    name: 'Medicos',
    to: '/medicos',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Citas',
    to: '/citas',
    icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Diagnosticos',
    to: '/diagnosticos',
    icon: <CIcon icon={cilDescription} customClassName="nav-icon" />,
  },
]

export default _nav
