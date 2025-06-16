// src/helpers/excelService.js
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

/**
 * Exporta datos a un archivo Excel (.xlsx) de forma flexible.
 * @param {Array} data - Array de objetos con los datos a exportar.
 * @param {Object} options - Opciones de exportación.
 *   @param {string} options.fileName - Nombre del archivo Excel a descargar.
 *   @param {Array} options.columns - Array de objetos { key, header } para mapear columnas.
 *   @param {string} options.sheetName - Nombre de la hoja (opcional).
 */
export const exportToExcel = (
  data,
  { fileName = 'reporte.xlsx', columns = [], sheetName = 'Datos' },
) => {
  // Si no se pasan columnas, usar todas las claves del primer objeto
  const keys = columns.length > 0 ? columns.map((col) => col.key) : Object.keys(data[0] || {})
  const headers = columns.length > 0 ? columns.map((col) => col.header) : keys

  // Preparar los datos con los encabezados
  const exportData = data.map((item) =>
    keys.reduce((obj, key, i) => {
      obj[headers[i]] = item[key] !== undefined ? item[key] : ''
      return obj
    }, {}),
  )

  const worksheet = XLSX.utils.json_to_sheet(exportData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
  saveAs(blob, fileName)
}
