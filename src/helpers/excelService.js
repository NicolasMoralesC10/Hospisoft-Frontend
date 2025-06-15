import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

/**
 * Exporta un array de objetos a un archivo Excel (.xlsx)
 * @param {Array} data - Array de objetos con los datos a exportar
 * @param {string} fileName - Nombre del archivo Excel a descargar
 */
export const exportToExcel = (data, fileName = 'ultimas_citas.xlsx') => {
  // Mapea los datos para la exportación (ajusta campos y nombres si quieres)
  const exportData = data.map((item) => ({
    Paciente: item.pacienteNombre,
    Médico: item.medicoNombre,
    Fecha: new Date(item.fecha).toLocaleString(),
    Estado: item.estado,
  }))

  const worksheet = XLSX.utils.json_to_sheet(exportData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Últimas Citas')

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
  saveAs(blob, fileName)
}
