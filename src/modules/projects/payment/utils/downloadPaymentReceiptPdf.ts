import type { ProjectPayment } from '../types/payment'

export async function downloadPaymentReceiptPdf(payment: ProjectPayment, element: HTMLElement): Promise<void> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')])
  const margin = 14 * 72 / 25.4
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4', compress: true })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const contentWidth = pageWidth - margin * 2
  const contentHeight = pageHeight - margin * 2
  const canvas = await html2canvas(element, {
    backgroundColor: '#ffffff', scale: 2, useCORS: true, windowWidth: 800,
    onclone: (documentClone) => {
      const renderer = documentClone.querySelector<HTMLElement>('.pdf-renderer')
      if (renderer) { renderer.style.left = '0'; renderer.style.top = '0'; renderer.style.zIndex = '1'; renderer.style.opacity = '1' }
      const sheet = documentClone.querySelector<HTMLElement>('.receipt-sheet')
      if (sheet) { sheet.style.width = '688px'; sheet.style.minHeight = '0'; sheet.style.margin = '0'; sheet.style.padding = '0'; sheet.style.boxShadow = 'none' }
    },
  })
  const scale = Math.min(contentWidth / canvas.width, contentHeight / canvas.height)
  const imageWidth = canvas.width * scale
  const imageHeight = canvas.height * scale
  pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', (pageWidth - imageWidth) / 2, margin, imageWidth, imageHeight)
  pdf.save(`${payment.code}-kuitansi.pdf`)
}
