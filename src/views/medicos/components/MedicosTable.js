import React, { useEffect, useState } from 'react'
import { UserRoundX, UserRoundPen } from 'lucide-react'
import Swal from 'sweetalert2'
import MedicoTimelineModal from './MedicoTimelineModal'
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
  CAlert,
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
  { accessorKey: 'nombre', header: 'Nombre' },
  { accessorKey: 'documento', header: 'Documento' },
  { accessorKey: 'telefono', header: 'Teléfono' },
  { accessorKey: 'especialidad', header: 'Especialidad' },
  {
    accessorKey: 'idUsuario.username',
    header: 'Usuario',
    cell: (info) => info.row.original.idUsuario?.username || 'N/A',
  },
  {
    accessorKey: 'idUsuario.email',
    header: 'Email',
    cell: (info) => info.row.original.idUsuario?.email || 'N/A',
  },
  {
    accessorKey: 'status',
    header: 'Estado',
    cell: (info) => {
      const status = info.getValue()
      const map = {
        0: ['secondary', 'Inactivo'],
        1: ['success', 'Activo'],
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
          onClick={() => table.options.meta.handleEdit(row.original)}
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

const MedicosTable = ({ apiEndpoint }) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingMedico, setEditingMedico] = useState(null)

  // Fetch de datos
  const fetchMedicos = async () => {
    try {
      const res = await fetch(apiEndpoint)
      if (!res.ok) throw new Error(res.statusText)
      const json = await res.json()
      setData(json.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    /* async function fetchMedicos() {
      try {
        const res = await fetch(apiEndpoint)
        if (!res.ok) throw new Error(res.statusText)
        const json = await res.json()
        setData(json.data || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    } */
    fetchMedicos()
  }, [apiEndpoint])

  const handleCreate = ({ client, user }) => {
    // Aquí envías a tu API:
    // POST /medicos con client, luego POST /usuarios con user y se relacionan ambos
    console.log('Cliente:', client)
    console.log('Usuario:', user)
  }

  const handleEdit = async (medico) => {
    // spread operator: pasa las propiedades del objeto 'medico' directamente dentro de uno nuevo.
    setEditingMedico({ ...medico })
    setModalVisible(true)
  }

  // Función de eliminar
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará al medico permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    })
    if (result.isConfirmed) {
      const apiEndpointDelete = apiEndpoint.replace('list', 'delete')
      try {
        const res = await fetch(`${apiEndpointDelete}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        })
        if (!res.ok) throw new Error('Error al eliminar')
        setData((prev) => prev.filter((p) => p._id !== id))
        Swal.fire('Eliminado', 'Medico eliminado correctamente', 'success')
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
          <strong>Medicos</strong>
          <CButton
            color="light"
            onClick={() => {
              setModalVisible(true)
              setEditingMedico(null)
            }}
          >
            + Nuevo Medico
          </CButton>
        </CCardHeader>
        <CCardBody>
          {/* Búsqueda global y select de filas */}
          <div className="d-flex justify-content-between mb-2">
            <input
              className="form-control w-25"
              placeholder="Buscar medico..."
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
                      ? 'No hay medicos registrados.'
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
      <MedicoTimelineModal
        visible={modalVisible}
        setVisible={setModalVisible}
        apiEndpoint="http://127.0.0.1:3000/api/"
        medico={editingMedico}
        isEdit={!!editingMedico}
        onSuccess={fetchMedicos}
      />
    </>
  )
}

export default MedicosTable
