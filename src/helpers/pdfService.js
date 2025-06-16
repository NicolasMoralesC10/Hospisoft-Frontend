// src/helpers/pdfService.js
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

/**
 * Genera y descarga un PDF con una tabla de datos.
 * @param {Array} data - Array de objetos con los datos.
 * @param {Object} options - Opciones de exportación.
 *   @param {string} options.fileName - Nombre del archivo PDF a descargar.
 *   @param {string} options.title - Título del reporte.
 *   @param {Array} options.columns - Array de objetos { key, header } para mapear columnas.
 */
export const exportToPdf = (
  data,
  { fileName = 'reporte.pdf', title = 'Reporte', columns = [] },
) => {
  const doc = new jsPDF()

  // Título centrado
  doc.setFontSize(16)
  doc.text(title, doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' })

  // Preparar columnas y filas para autoTable
  const headers = columns.length > 0 ? columns.map((col) => col.header) : Object.keys(data[0] || {})
  const keys = columns.length > 0 ? columns.map((col) => col.key) : Object.keys(data[0] || {})
  const rows = data.map((item) => keys.map((key) => (item[key] !== undefined ? item[key] : '')))

  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 25,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [41, 128, 185] }, // Azul
    alternateRowStyles: { fillColor: [240, 240, 240] },
  })

  doc.save(fileName)
}
