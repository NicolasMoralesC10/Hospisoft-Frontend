// src/helpers/pdfService.js
import { jsPDF } from 'jspdf'

/**
 * Genera y descarga un PDF con una tabla de citas.
 * @param {Array} data - Array de objetos con las citas.
 * @param {string} fileName - Nombre del archivo PDF a descargar.
 */
export const exportToPdf = (data, fileName = 'ultimas_citas.pdf') => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  doc.setFontSize(16)
  doc.text('Últimas Citas', pageWidth / 2, 15, { align: 'center' })

  doc.setFontSize(12)
  const startY = 25
  const rowHeight = 10
  const colWidths = [50, 50, 40, 40]
  const headers = ['Paciente', 'Médico', 'Fecha', 'Estado']

  // Dibujar encabezados
  let x = 10
  headers.forEach((header, i) => {
    doc.text(header, x + 2, startY)
    x += colWidths[i]
  })

  // Dibujar filas
  let y = startY + 7
  data.forEach((item) => {
    let x = 10
    doc.text(item.pacienteNombre || '', x + 2, y)
    x += colWidths[0]
    doc.text(item.medicoNombre || '', x + 2, y)
    x += colWidths[1]
    doc.text(new Date(item.fecha).toLocaleString(), x + 2, y)
    x += colWidths[2]
    doc.text(item.estado || '', x + 2, y)
    y += rowHeight
    if (y > 280) {
      doc.addPage()
      y = 20
    }
  })

  doc.save(fileName)
}
