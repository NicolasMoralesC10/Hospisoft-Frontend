// src/components/PacientesTable.jsx
import React, { useEffect, useState } from 'react'
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
import PacienteModal from './PacientesModal'

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
  { accessorKey: 'sexo', header: 'Sexo' },
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
    cell: ({ row }) => (
      <>
        <CButton
          size="sm"
          color="info"
          className="me-2"
          onClick={() => console.log('Editar', row.original._id)}
        >
          Editar
        </CButton>
        <CButton size="sm" color="danger" onClick={() => console.log('Eliminar', row.original._id)}>
          Eliminar
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

  // Fetch de datos
  useEffect(() => {
    async function fetchPacientes() {
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
    fetchPacientes()
  }, [apiEndpoint])

  // Instancia de la tabla en modo no controlado
  const table = useReactTable({
    data,
    columns,
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
          <CButton color="light" onClick={() => setModalVisible(true)}>
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

          {/* Mensaje cuando no hay resultados */}
          {rows.length === 0 ? (
            <CAlert color="info" className="text-center mt-5 mx-5">
              {data.length === 0
                ? 'No hay pacientes registrados.'
                : 'No se encontraron pacientes que coincidan.'}
            </CAlert>
          ) : (
            <>
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
                  {rows.map((row) => (
                    <CTableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <CTableDataCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </CTableDataCell>
                      ))}
                    </CTableRow>
                  ))}
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
            </>
          )}
        </CCardBody>
      </CCard>
      <PacienteModal visible={modalVisible} setVisible={setModalVisible} />
    </>
  )
}

export default PacientesTable
