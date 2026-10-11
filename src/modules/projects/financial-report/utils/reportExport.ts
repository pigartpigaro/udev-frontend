import type { FinancialProjectRow, FinancialReportFilters, FinancialReportSummary } from '../types/financialReport'

const money = (value: string) => Number(value || 0)
const escapeXml = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;')

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff
  for (const byte of bytes) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
  }
  return (crc ^ 0xffffffff) >>> 0
}

function makeZip(files: Array<{ name: string; content: string }>): Blob {
  const encoder = new TextEncoder()
  const localParts: Uint8Array[] = []; const centralParts: Uint8Array[] = []
  let offset = 0
  for (const file of files) {
    const name = encoder.encode(file.name); const data = encoder.encode(file.content); const crc = crc32(data)
    const local = new Uint8Array(30 + name.length + data.length); const lv = new DataView(local.buffer)
    lv.setUint32(0, 0x04034b50, true); lv.setUint16(4, 20, true); lv.setUint16(6, 0x0800, true); lv.setUint16(8, 0, true)
    lv.setUint32(14, crc, true); lv.setUint32(18, data.length, true); lv.setUint32(22, data.length, true); lv.setUint16(26, name.length, true)
    local.set(name, 30); local.set(data, 30 + name.length); localParts.push(local)
    const central = new Uint8Array(46 + name.length); const cv = new DataView(central.buffer)
    cv.setUint32(0, 0x02014b50, true); cv.setUint16(4, 20, true); cv.setUint16(6, 20, true); cv.setUint16(8, 0x0800, true)
    cv.setUint32(16, crc, true); cv.setUint32(20, data.length, true); cv.setUint32(24, data.length, true); cv.setUint16(28, name.length, true); cv.setUint32(42, offset, true)
    central.set(name, 46); centralParts.push(central); offset += local.length
  }
  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0)
  const end = new Uint8Array(22); const ev = new DataView(end.buffer)
  ev.setUint32(0, 0x06054b50, true); ev.setUint16(8, files.length, true); ev.setUint16(10, files.length, true)
  ev.setUint32(12, centralSize, true); ev.setUint32(16, offset, true)
  return new Blob([...localParts, ...centralParts, end], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}

function cell(value: string | number, column: string, row: number): string {
  const ref = `${column}${row}`
  return typeof value === 'number'
    ? `<c r="${ref}"><v>${Number.isFinite(value) ? value : 0}</v></c>`
    : `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(value)}</t></is></c>`
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob); const anchor = document.createElement('a')
  anchor.href = url; anchor.download = filename; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export async function downloadFinancialReportPdf(element: HTMLElement, filters: FinancialReportFilters): Promise<void> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')])
  const margin = 28; const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4', compress: true })
  const pageWidth = pdf.internal.pageSize.getWidth(); const pageHeight = pdf.internal.pageSize.getHeight()
  const contentWidth = pageWidth - margin * 2; const contentHeight = pageHeight - margin * 2
  const canvas = await html2canvas(element, { backgroundColor: '#ffffff', scale: 1.5, windowWidth: 1100, onclone: (doc) => {
    const renderer = doc.querySelector<HTMLElement>('.pdf-renderer'); if (renderer) { renderer.style.left = '0'; renderer.style.top = '0'; renderer.style.opacity = '1' }
  } })
  const sliceHeight = Math.floor(canvas.width * contentHeight / contentWidth); let sourceY = 0
  while (sourceY < canvas.height) {
    const height = Math.min(sliceHeight, canvas.height - sourceY); const part = document.createElement('canvas'); part.width = canvas.width; part.height = height
    const context = part.getContext('2d'); if (!context) throw new Error('PDF laporan tidak dapat dibuat.')
    context.drawImage(canvas, 0, sourceY, canvas.width, height, 0, 0, canvas.width, height)
    if (sourceY) pdf.addPage()
    pdf.addImage(part.toDataURL('image/jpeg', 0.92), 'JPEG', margin, margin, contentWidth, height * contentWidth / canvas.width)
    sourceY += height
  }
  pdf.save(`laporan-keuangan-${filters.dateFrom || 'semua'}-${filters.dateTo || 'tanggal'}.pdf`)
}

export function downloadFinancialReportExcel(rows: FinancialProjectRow[], summary: FinancialReportSummary, filters: FinancialReportFilters): void {
  const values: Array<Array<string | number>> = [
    ['Laporan Keuangan UDev'], ['Periode', filters.dateFrom || 'Semua tanggal', 's.d.', filters.dateTo || 'Semua tanggal'],
    ['Project ID', filters.projectId || 'Semua project'], [],
    ['Ringkasan', 'Nilai (IDR)'], ['Invoice terbit', money(summary.invoice_issued)], ['Penerimaan', money(summary.received)],
    ['Pengeluaran project', money(summary.project_expenses)], ['Pengeluaran operasional', money(summary.operational_expenses)],
    ['Total pengeluaran', money(summary.expenses)], ['Pencairan kasbon tim', money(summary.team_loans_issued)], ['Cicilan kasbon tim', money(summary.team_loan_repayments)],
    ['Arus kas bersih', money(summary.cash_flow)], ['Saldo kas saat ini', money(summary.cash_available)], ['Sisa tagihan saat ini', money(summary.outstanding)], ['Sisa kasbon saat ini', money(summary.team_loans_outstanding)], [],
    ['Rincian per project'], ['Kode project', 'Nama project', 'Invoice terbit', 'Penerimaan', 'Pengeluaran', 'Arus kas bersih', 'Sisa tagihan saat ini'],
    ...rows.map((row) => [row.code, row.name, money(row.invoice_issued), money(row.received), money(row.expenses), money(row.cash_flow), money(row.outstanding)]),
  ]
  const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G']
  const sheetRows = values.map((row, index) => `<row r="${index + 1}">${row.map((value, col) => cell(value, cols[col], index + 1)).join('')}</row>`).join('')
  const sheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${sheetRows}</sheetData></worksheet>`
  const blob = makeZip([
    { name: '[Content_Types].xml', content: '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>' },
    { name: '_rels/.rels', content: '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>' },
    { name: 'xl/workbook.xml', content: '<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Laporan Keuangan" sheetId="1" r:id="rId1"/></sheets></workbook>' },
    { name: 'xl/_rels/workbook.xml.rels', content: '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>' },
    { name: 'xl/worksheets/sheet1.xml', content: sheet },
  ])
  download(blob, `laporan-keuangan-${filters.dateFrom || 'semua'}-${filters.dateTo || 'tanggal'}.xlsx`)
}
