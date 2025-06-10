import React, { useEffect, useState } from 'react'
import { UserRoundX, UserRoundPen } from 'lucide-react'
import Swal from 'sweetalert2'
import PacienteTimelineModal from './PacienteTimelineModal'
import { apiFetch } from '../../../helpers/apiFetch.js'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CButton,
  CBadge,
  CSpinner,
} from '@coreui/react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table'

// columnas de la tabla :: acessorKey es el nombre de la propiedad en el Json
const columns = [
  { accessorKey: 'nombrePaciente', header: 'Nombre' },
  { accessorKey: 'documento', header: 'Documento' },
  { accessorKey: 'telefonoPaciente', header: 'Teléfono' },
  {
    accessorKey: 'fechaNacimiento',
    header: 'Nacimiento',
    cell: (info) => new Date(info.getValue()).toLocaleDateString(),
  },
  { accessorKey: 'epsPaciente', header: 'EPS' },
  { accessorKey: 'estadoCivil', header: 'Estado Civil' },
  { accessorKey: 'idUsuario.email', header: 'correo' },
  { accessorKey: 'direccion', header: 'Dirección' },
  {
    accessorKey: 'status',
    header: 'Estado',
    cell: (info) => {
      const status = info.getValue()
      const map = {
        1: ['success', 'Activo'],
        0: ['secondary', 'Inactivo'],
        2: ['warning', 'Pendiente'],
      }
      const [color, text] = map[status] || ['dark', 'Desconocido']
      return <CBadge color={color}>{text}</CBadge>
    },
  },
  {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row, table }) => (
      <>
        <CButton
          size="sm"
          color="info"
          className="me-2 text-light rounded-pill"
          onClick={() => {
            console.log('Editar', row.original)
            table.options.meta.handleEdit(row.original)
          }}
        >
          <UserRoundPen />
        </CButton>
        <CButton
          size="sm"
          color="danger"
          className="text-light rounded-pill"
          onClick={() => table.options.meta.handleDelete(row.original._id)}
        >
          <UserRoundX />
        </CButton>
      </>
    ),
  },
]

const PacientesTable = ({ apiEndpoint }) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingPaciente, setEditingPaciente] = useState(null)

  const fetchPacientes = async () => {
    try {
      const json = await apiFetch(apiEndpoint + 'patient/list')
      setData(json.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async (paciente) => {
    // spread operator: pasa las propiedades del objeto 'Paciente' directamente dentro de uno nuevo.
    setEditingPaciente({ ...paciente })
    setModalVisible(true)
  }

  // Fetch de datos
  useEffect(() => {
    fetchPacientes()
  }, [apiEndpoint])

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará al paciente permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    })
    if (result.isConfirmed) {
      try {
        await apiFetch(apiEndpoint + 'patient/delet', {
          method: 'PUT',
          body: JSON.stringify({ id }),
        })
        await fetchPacientes()
        Swal.fire('Eliminado!', 'El paciente ha sido eliminado.', 'success')
      } catch (err) {
        Swal.fire('Error', `No se pudo eliminar: ${err.message}`, 'error')
      }
    }
  }

  // Instancia de la tabla en modo no controlado
  const table = useReactTable({
    data,
    columns,
    meta: { handleDelete, handleEdit },
    initialState: {
      pagination: { pageIndex: 0, pageSize: 5 },
      globalFilter: '',
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: 'includesString',
  })

  if (loading)
    return (
      <div className="text-center my-5">
        <CSpinner />
      </div>
    )
  if (error) return <p className="text-danger text-center">Error: {error}</p>

  const {
    getHeaderGroups,
    getRowModel,
    nextPage,
    previousPage,
    setPageSize,
    getState,
    getCanPreviousPage,
    getCanNextPage,
    setGlobalFilter,
  } = table

  const {
    pagination: { pageIndex, pageSize },
  } = getState()

  const rows = getRowModel().rows

  return (
    <>
      <CCard className="mb-4 shadow-sm">
        <CCardHeader className="d-flex justify-content-between align-items-center bg-primary text-white">
          <strong>Pacientes</strong>
          <CButton
            color="light"
            onClick={() => {
              setModalVisible(true)
              setEditingPaciente(null)
            }}
          >
            + Nuevo Paciente
          </CButton>
        </CCardHeader>
        <CCardBody>
          {/* Búsqueda global y select de filas */}
          <div className="d-flex justify-content-between mb-2">
            <input
              className="form-control w-25"
              placeholder="Buscar paciente..."
              onChange={(e) => setGlobalFilter(e.target.value)}
            />
            <select
              className="form-select w-auto"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              {[5, 10, 20].map((size) => (
                <option key={size} value={size}>
                  {size} filas
                </option>
              ))}
            </select>
          </div>

          {/* Tabla */}
          <CTable hover striped bordered responsive>
            <CTableHead>
              {getHeaderGroups().map((headerGroup) => (
                <CTableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <CTableHeaderCell
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default' }}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === 'asc'
                        ? ' 🔼'
                        : header.column.getIsSorted() === 'desc'
                          ? ' 🔽'
                          : ''}
                    </CTableHeaderCell>
                  ))}
                </CTableRow>
              ))}
            </CTableHead>
            <CTableBody>
              {rows.length === 0 ? (
                <CTableRow>
                  <CTableDataCell colSpan={columns.length} className="text-center py-3">
                    {data.length === 0
                      ? 'No hay pacientes registrados.'
                      : 'No se encontraron coincidencias.'}
                  </CTableDataCell>
                </CTableRow>
              ) : (
                rows.map((row) => (
                  <CTableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <CTableDataCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </CTableDataCell>
                    ))}
                  </CTableRow>
                ))
              )}
            </CTableBody>
          </CTable>

          {/* Controles de paginación */}
          <div className="d-flex justify-content-between mt-2">
            <CButton size="sm" onClick={previousPage} disabled={!getCanPreviousPage()}>
              Anterior
            </CButton>
            <span>
              Página {pageIndex + 1} de {Math.ceil(data.length / pageSize)}
            </span>
            <CButton size="sm" onClick={nextPage} disabled={!getCanNextPage()}>
              Siguiente
            </CButton>
          </div>
        </CCardBody>
      </CCard>
      <PacienteTimelineModal
        visible={modalVisible}
        setVisible={setModalVisible}
        paciente={editingPaciente}
        isEdit={!!editingPaciente}
        apiEndpoint="http://127.0.0.1:3000/api/"
        onSuccess={fetchPacientes}
      />
    </>
  )
}

export default PacientesTable
